// /components/UserNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';

interface UserNavbarProps {
  currentPage?: string;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ currentPage = 'dashboard' }) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', href: '/protected/dashboard', icon: '🏠' },
    { id: 'courses', label: '履修管理', href: '/protected/courses', icon: '📚' },
    { id: 'schedule', label: '時間割', href: '/protected/schedule', icon: '📅' },
    { id: 'profile', label: 'プロフィール', href: '/protected/profile', icon: '👤' },
  ];

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
            <Link href="/protected/dashboard" className="flex items-center space-x-3">
              <div className="w-[36.8px] h-[36.8px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/unicred-icon.svg" 
                  alt="Unicred Logo" 
                  className="w-8 h-8 filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Unicred</h1>
                <p className="text-xs text-gray-500">大阪大学履修支援システム</p>
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
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
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
                {isAdmin ? '管理者' : '学生'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  管理者
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
