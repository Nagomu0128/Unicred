// /app/protected/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { usePresence } from '@/context/PresenceContext';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const { isOnline, onlineUsers } = usePresence();

  const stats = [
    { label: '登録済み科目数', value: '12', icon: '📚', color: 'blue' },
    { label: '今期の登録単位', value: '18', icon: '🎓', color: 'green' },
    { label: '通算GPA', value: '3.2', icon: '⭐', color: 'yellow' },
    { label: '卒業まで', value: '2年', icon: '🎯', color: 'purple' },
  ];

  const recentActivities = [
    { title: 'Unicredを正式にリリースしました！', time: '2時間前', type: 'plan' },
  ];

  const quickActions = [
    { 
      title: '履修登録', 
      description: '新しい科目を登録', 
      href: '/protected/courses', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    { 
      title: '時間割確認', 
      description: '今学期の時間割', 
      href: '/protected/schedule', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      title: '成績確認', 
      description: '過去の成績を確認', 
      href: '/protected/grades', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      title: 'プロフィール編集', 
      description: '個人情報を更新', 
      href: '/protected/profile', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      title: '講義追加申請', 
      description: '新しい講義を追加', 
      href: '/protected/profile', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    { 
      title: 'お問い合わせ', 
      description: '管理者に不具合を報告', 
      href: '/protected/profile', 
      icon: (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ウェルカムセクション */}
      <div className="mb-8 text-center">
        <div className="w-[73.6px] h-[73.6px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img 
            src="/unicred-icon.svg" 
            alt="Unicred Logo" 
            className="w-16 h-16 filter brightness-0 invert"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ようこそ、{userProfile?.displayName || user?.displayName || user?.email}さん
        </h1>
        <div className="flex items-center justify-center space-x-4">
          <p className="text-gray-600 text-sm">
            {isAdmin ? '管理者ダッシュボード' : '履修管理ダッシュボード'}
          </p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isOnline ? 'オンライン' : 'オフライン'}
            </span>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近のアクティビティ */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            お知らせ
          </h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">
                    {activity.type === 'course' && '📚'}
                    {activity.type === 'assignment' && '📝'}
                    {activity.type === 'grade' && '⭐'}
                    {activity.type === 'plan' && '📅'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            クイックアクション
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 管理者向けメッセージ */}
      {isAdmin && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <img 
              src="/unicred-icon.svg" 
              alt="Unicred Logo" 
              className="w-8 h-8 mr-2"
            />
            <p className="text-sm text-yellow-800">
              管理者権限をお持ちです。詳細な管理機能は
              <a href="/admin" className="font-medium underline hover:text-yellow-900">管理者パネル</a>
              からアクセスできます。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
