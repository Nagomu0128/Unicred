// /components/admin/AdminNavbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';

interface AdminNavbarProps {
  currentPage?: string;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ currentPage = 'dashboard' }) => {
  const { user, userProfile } = useAuth();
  const { isAdmin } = useAdmin();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'ダッシュボード', 
      href: '/admin',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    { 
      id: 'add-course', 
      label: '講義を追加', 
      href: '/admin/add-course',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      id: 'contacts', 
      label: 'お問い合わせ', 
      href: '/admin/contacts',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
  ];

  // すべてのページで緑色のテーマを使用
  const isAddCoursePage = currentPage === 'add-course';
  const themeColor = 'green';

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
          <div className="flex items-center space-x-3">
            <div className="w-[36.8px] h-[36.8px] bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <img 
                  src="/unicred-icon.svg" 
                  alt="Unicred Logo" 
                  className="w-8 h-8 filter brightness-0 invert pointer-events-none select-none"
                  draggable="false"
                />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">管理者パネル</h1>
              <p className="text-xs text-gray-500">Unicred Admin</p>
            </div>
          </div>

          {/* メニューアイテム */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
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
                {userProfile?.displayName || user?.displayName || user?.email}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? '管理者' : '一般ユーザー'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
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
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center transition-all duration-200 flex flex-col items-center justify-center ${
                  currentPage === item.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
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
