// /components/admin/AdminNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';

interface AdminNavbarProps {
  currentPage?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ currentPage = 'dashboard' }) => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', href: '/admin' },
    { id: 'add-course', label: '講義を追加', href: '/admin/add-course' },
  ];

  // すべてのページで緑色のテーマを使用
  const isAddCoursePage = currentPage === 'add-course';
  const themeColor = 'green';

  // 管理者権限がない場合はメニューバーを無効化
  if (adminLoading) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-[36.8px] h-[36.8px] bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="ml-3">
                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!isAdmin) {
    return (
      <nav className="bg-red-50 shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-[36.8px] h-[36.8px] bg-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-red-900">アクセス拒否</h1>
                <p className="text-xs text-red-600">管理者権限が必要です</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href="/protected/dashboard"
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              >
                ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const handleLogout = () => {
    // ログアウト処理
    window.location.href = '/public/login';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・タイトル */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-[36.8px] h-[36.8px] bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/unicred-icon.svg" 
                  alt="Unicred Logo" 
                  className="w-8 h-8 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
                <p className="text-xs text-gray-500">Unicred Admin</p>
              </div>
            </Link>
          </div>

          {/* メニューアイテム */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* ユーザー情報・ログアウト */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? '管理者' : '一般ユーザー'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ホーム
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
