'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証状態の確認が完了していて、かつ未ログインの場合はリダイレクト
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // 1. 認証済みの場合のみ、保護されたコンテンツを表示する
  if (user) {
    return <>{children}</>;
  }

  // 2. 上記以外（ローディング中 or リダイレクト待ち）の場合は、ローディング画面などを表示
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading...</p>
    </div>
  );
};
