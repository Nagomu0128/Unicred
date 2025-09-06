// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authAdmin, dbAdmin } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // トークンがない場合はログインページへリダイレクト
    return NextResponse.redirect(new URL('/public/login', request.url));
  }

  try {
    // トークンを検証
    const decodedToken = await authAdmin.verifyIdToken(token);
    const { uid } = decodedToken;

    // Firestoreでユーザープロファイルの存在を確認
    const userProfileDoc = await dbAdmin.collection('users').doc(uid).get();

    const isProfileExists = userProfileDoc.exists;
    const isAccessingRegisterPage = request.nextUrl.pathname.startsWith('/profile/register');

    if (!isProfileExists &&!isAccessingRegisterPage) {
      // プロフィールがなく、登録ページ以外にアクセスしようとした場合
      // -> 登録ページへ強制リダイレクト
      return NextResponse.redirect(new URL('/profile/register', request.url));
    }

    if (isProfileExists && isAccessingRegisterPage) {
      // プロフィールがあり、登録ページにアクセスしようとした場合
      // -> ホームページへリダイレクト
      return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    console.error('Middleware token verification error:', error);
    // 検証エラー時はログインページへリダイレクト
    const response = NextResponse.redirect(new URL('/public/login', request.url));
    response.cookies.delete('token'); // 無効なトークンを削除
    return response;
  }

  // 上記のどの条件にも当てはまらない場合はリクエストを続行
  return NextResponse.next();
}

// Middlewareを適用するパスを指定
export const config = {
  matcher: [
    /*
     * マッチするパス：
     * - api, _next/static, _next/image, favicon.ico を除く全てのパス
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/login|profile/register).*)',
  ],
};