// /api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase/admin';
import { isUserAdmin } from '@/lib/admin';

// 現在のユーザーが管理者かどうかをチェック
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ isAdmin: false });
    }

    // トークンを検証
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 管理者権限をチェック
    const isAdmin = await isUserAdmin(uid);
    
    return NextResponse.json({ isAdmin });

  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
