'use client';

import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg">読み込み中...</div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            ホームページ
          </h1>
          <p className="text-gray-600 mb-8">
            下のボタンをクリックしてログインページに進んでください。
          </p>
          <a
            href="/public/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            ログイン
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          ようこそ、{user.displayName || user.email}さん
        </h1>
        <p className="text-gray-600 mb-8">
          ログインが完了しました。以下のメニューからお選びください。
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/protected/dashboard"
              className="block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              ダッシュボード
            </Link>
            
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                管理者ダッシュボード
              </Link>
            )}
          </div>
          
          <div className="pt-4">
            <button
              onClick={() => {
                // ログアウト処理
                window.location.href = '/public/login';
              }}
              className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-all duration-300"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

