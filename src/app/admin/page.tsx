// /app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { UserManagement } from '@/components/admin/UserManagement';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
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
      setUsers(data.users);
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
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスするには管理者権限が必要です。</p>
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
        <p className="text-gray-600 text-sm">ユーザー管理とシステム設定を行えます</p>
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
        loading={loading}
      />
    </>
  );
}
