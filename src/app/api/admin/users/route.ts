// /api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebase/admin';
import { isUserAdmin, getAllUsers, grantAdminRole, revokeAdminRole, deleteUser, userExists } from '@/lib/admin';

// 全ユーザーを取得
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // トークンを検証
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 管理者権限をチェック
    const isAdmin = await isUserAdmin(uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 全ユーザーを取得
    const users = await getAllUsers();
    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// 管理者権限を更新
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // トークンを検証
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 管理者権限をチェック
    const isAdmin = await isUserAdmin(uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUid, isAdmin: newAdminStatus } = await request.json();
    
    console.log('Admin status update request:', {
      requestingUser: uid,
      targetUid,
      newAdminStatus,
      timestamp: new Date().toISOString()
    });

    if (!targetUid || typeof newAdminStatus !== 'boolean') {
      console.error('Invalid parameters:', { targetUid, newAdminStatus });
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 自分自身の管理者権限を変更しようとした場合は拒否
    if (targetUid === uid) {
      console.error('Attempted self-modification:', { uid, targetUid });
      return NextResponse.json({ error: 'Cannot modify your own admin status' }, { status: 400 });
    }

    // 対象ユーザーが存在するかチェック
    const userExistsResult = await userExists(targetUid);
    if (!userExistsResult) {
      console.error('Target user does not exist:', targetUid);
      return NextResponse.json({ error: 'ユーザーが見つかりません。既に削除されている可能性があります。' }, { status: 404 });
    }

    let success: boolean;
    try {
      if (newAdminStatus) {
        console.log('Attempting to grant admin role to:', targetUid);
        success = await grantAdminRole(targetUid);
      } else {
        console.log('Attempting to revoke admin role from:', targetUid);
        success = await revokeAdminRole(targetUid);
      }
      
      console.log('Admin role operation result:', { targetUid, newAdminStatus, success });
    } catch (operationError) {
      console.error('Error during admin role operation:', operationError);
      success = false;
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      console.error('Admin role operation failed:', { targetUid, newAdminStatus });
      return NextResponse.json({ 
        error: `管理者権限の更新に失敗しました。ユーザー "${targetUid}" が見つからない可能性があります。` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating admin status:', error);
    
    // より詳細なエラーメッセージを提供
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      if (error.message.includes('No document to update')) {
        errorMessage = 'ユーザードキュメントが見つかりません。ユーザーが既に削除されている可能性があります。';
      } else if (error.message.includes('permission')) {
        errorMessage = '権限が不足しています。';
      } else {
        errorMessage = `サーバーエラー: ${error.message}`;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ユーザーを削除
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // トークンを検証
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 管理者権限をチェック
    const isAdmin = await isUserAdmin(uid);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { targetUid } = await request.json();

    if (!targetUid) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 自分自身を削除しようとした場合は拒否
    if (targetUid === uid) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const success = await deleteUser(targetUid);

    if (success) {
      return NextResponse.json({ success: true, message: 'ユーザーが正常に削除されました' });
    } else {
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
