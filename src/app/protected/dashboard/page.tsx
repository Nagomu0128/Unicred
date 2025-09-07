// /app/protected/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const stats = [
    { label: '登録済み科目', value: '12', icon: '📚', color: 'blue' },
    { label: '今学期の単位数', value: '18', icon: '🎓', color: 'green' },
    { label: 'GPA', value: '3.2', icon: '⭐', color: 'yellow' },
    { label: '卒業まで', value: '2年', icon: '🎯', color: 'purple' },
  ];

  const recentActivities = [
    { title: '情報科学概論を履修登録しました', time: '2時間前', type: 'course' },
    { title: 'データ構造とアルゴリズムの課題を提出しました', time: '1日前', type: 'assignment' },
    { title: '線形代数の成績が更新されました', time: '3日前', type: 'grade' },
    { title: '来学期の履修計画を作成しました', time: '1週間前', type: 'plan' },
  ];

  const quickActions = [
    { title: '履修登録', description: '新しい科目を登録', href: '/protected/courses', icon: '📝' },
    { title: '時間割確認', description: '今学期の時間割', href: '/protected/schedule', icon: '📅' },
    { title: '成績確認', description: '過去の成績を確認', href: '/protected/grades', icon: '📊' },
    { title: 'プロフィール編集', description: '個人情報を更新', href: '/protected/profile', icon: '👤' },
  ];

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
          ようこそ、{user?.displayName || user?.email}さん
        </h1>
        <p className="text-gray-600 text-sm">
          {isAdmin ? '管理者ダッシュボード' : '履修管理ダッシュボード'}
        </p>
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
            最近のアクティビティ
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
            <span className="mr-2">⚡</span>
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
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-lg">{action.icon}</span>
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
