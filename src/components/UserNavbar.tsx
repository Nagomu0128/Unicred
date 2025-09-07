// /components/UserNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';

interface UserNavbarProps {
  currentPage?: string;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({ currentPage = 'dashboard' }) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ダッシュボード', 
      href: '/protected/dashboard', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    { 
      id: 'courses', 
      label: '履修管理', 
      href: '/protected/courses', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: 'schedule', 
      label: '時間割', 
      href: '/protected/schedule', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      label: 'プロフィール', 
      href: '/protected/profile', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const handleLogout = async () => {
    try {
      // ユーザーのisActiveをfalseに設定
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isActive: false,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    } finally {
      // ログアウト処理
      window.location.href = '/';
    }
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2 flex items-center">{item.icon}</span>
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
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 flex flex-col items-center justify-center ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mb-1 flex items-center justify-center">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
