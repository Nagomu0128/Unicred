// /components/admin/UserManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AdminUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserManagementProps {
  users: AdminUser[];
  onUpdateAdminStatus: (uid: string, isAdmin: boolean) => Promise<void>;
  onDeleteUser: (uid: string) => Promise<void>;
  loading?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateAdminStatus,
  onDeleteUser,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleAdmin = async (uid: string, currentStatus: boolean) => {
    setUpdatingUsers(prev => new Set(prev).add(uid));
    
    try {
      await onUpdateAdminStatus(uid, !currentStatus);
    } catch (error) {
      console.error('Error updating admin status:', error);
    } finally {
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(uid);
        return newSet;
      });
    }
  };

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setDeletingUsers(prev => new Set(prev).add(userToDelete.uid));
    
    try {
      await onDeleteUser(userToDelete.uid);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeletingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userToDelete.uid);
        return newSet;
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '-';
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ユーザー管理</h2>
        <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200">
          <span className="text-sm font-medium">総ユーザー数: {users.length}人</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="search" className="block text-sm font-medium text-gray-800 mb-2">ユーザー検索</Label>
          <Input
            id="search"
            type="text"
            placeholder="メールアドレスまたは名前で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-red-50 to-pink-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">メールアドレス</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">表示名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">管理者</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">登録日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">最終更新</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">操作</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">削除</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.displayName || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.isAdmin 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {user.isAdmin ? '管理者' : '一般ユーザー'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => handleToggleAdmin(user.uid, user.isAdmin)}
                      disabled={updatingUsers.has(user.uid)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        user.isAdmin 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingUsers.has(user.uid) 
                        ? '処理中...' 
                        : user.isAdmin 
                          ? '管理者権限を削除' 
                          : '管理者権限を付与'
                      }
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => handleDeleteClick(user)}
                      disabled={deletingUsers.has(user.uid)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingUsers.has(user.uid) ? '削除中...' : '削除'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'ユーザーが見つかりません' : 'ユーザーが存在しません'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? '検索条件を変更してお試しください' : 'まだユーザーが登録されていません'}
            </p>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">ユーザー削除の確認</DialogTitle>
            <DialogDescription className="text-gray-600">
              この操作は取り消せません。以下のユーザーを削除しますか？
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="space-y-2">
                  <div><strong>メールアドレス:</strong> {userToDelete.email}</div>
                  <div><strong>表示名:</strong> {userToDelete.displayName || '-'}</div>
                  <div><strong>管理者:</strong> {userToDelete.isAdmin ? 'はい' : 'いいえ'}</div>
                  <div><strong>登録日:</strong> {formatDate(userToDelete.createdAt)}</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>⚠️ 警告:</strong> このユーザーのアカウントとデータが完全に削除されます。
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              onClick={handleDeleteCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deletingUsers.has(userToDelete?.uid || '')}
            >
              {deletingUsers.has(userToDelete?.uid || '') ? '削除中...' : '削除する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
