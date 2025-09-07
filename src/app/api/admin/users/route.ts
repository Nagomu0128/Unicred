// /api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebase/admin';
import { isUserAdmin, getAllUsers, grantAdminRole, revokeAdminRole } from '@/lib/admin';

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

    if (!targetUid || typeof newAdminStatus !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 自分自身の管理者権限を変更しようとした場合は拒否
    if (targetUid === uid) {
      return NextResponse.json({ error: 'Cannot modify your own admin status' }, { status: 400 });
    }

    let success: boolean;
    if (newAdminStatus) {
      success = await grantAdminRole(targetUid);
    } else {
      success = await revokeAdminRole(targetUid);
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to update admin status' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
