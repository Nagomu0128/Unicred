// /app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { usePresence } from '@/context/PresenceContext';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isOnline, onlineUsers } = usePresence();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('管理者権限がありません');
          return;
        }
        throw new Error('ユーザー情報の取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('Admin page - received users data:', data.users);
      console.log('Admin page - sample user data:', data.users[0]);
      
      // ISO文字列をDateオブジェクトに変換
      const usersWithDates = data.users.map((user: any) => ({
        ...user,
        createdAt: user.createdAt ? new Date(user.createdAt) : null,
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
      }));
      
      console.log('Admin page - converted users with dates:', usersWithDates);
      console.log('Admin page - sample converted user:', usersWithDates[0]);
      
      setUsers(usersWithDates);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdminStatus = async (uid: string, isAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUid: uid,
          isAdmin: isAdmin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '管理者権限の更新に失敗しました');
      }

      // ユーザーリストを更新
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.uid === uid ? { ...user, isAdmin, updatedAt: new Date() } : user
        )
      );
    } catch (err) {
      console.error('Error updating admin status:', err);
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      alert(`管理者権限の更新に失敗しました: ${errorMessage}`);
      
      // ユーザーリストを再取得して最新状態に更新
      await fetchUsers();
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUid: uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'ユーザーの削除に失敗しました');
      }

      // ユーザーリストを更新
      setUsers(prevUsers => prevUsers.filter(user => user.uid !== uid));
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      alert(`ユーザーの削除に失敗しました: ${errorMessage}`);
      
      // ユーザーリストを再取得して最新状態に更新
      await fetchUsers();
      throw err; // UserManagementコンポーネントにエラーを伝播
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // 管理者権限チェック
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">権限を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-11/12 border border-red-200">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">アクセス拒否</h1>
          <p className="text-red-600 mb-6">このページにアクセスするには管理者権限が必要です。</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            ダッシュボードに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ヘッダー */}
      <div className="mb-8 text-center">
        <div className="w-[73.6px] h-[73.6px] bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <img 
            src="/unicred-icon.svg" 
            alt="Unicred Logo" 
            className="w-16 h-16 filter brightness-0 invert"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">管理者ダッシュボード</h1>
        <div className="flex items-center justify-center space-x-4">
          <p className="text-gray-600 text-sm">ユーザー管理とシステム設定を行えます</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isOnline ? 'オンライン' : 'オフライン'} ({onlineUsers.length}人がオンライン)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 className="text-sm font-medium text-red-800">エラー</h3>
          </div>
          <div className="text-sm text-red-700 mb-3">{error}</div>
          <Button onClick={fetchUsers} variant="outline" size="sm" className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300">
            再試行
          </Button>
        </div>
      )}

      <UserManagement
        users={users}
        onUpdateAdminStatus={handleUpdateAdminStatus}
        onDeleteUser={handleDeleteUser}
        loading={loading}
      />
    </>
  );
}
