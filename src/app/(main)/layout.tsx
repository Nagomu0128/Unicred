// /app/(main)/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { UserNavbar } from '@/components/UserNavbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // パスに基づいてcurrentPageを決定（useMemoで最適化）
  const currentPage = useMemo(() => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/courses')) return 'courses';
    if (pathname.includes('/schedule')) return 'schedule';
    if (pathname.includes('/grades')) return 'grades';
    if (pathname.includes('/grade-registration')) return 'grade-registration';
    if (pathname.includes('/profile')) return 'profile';
    return 'dashboard'; // デフォルト
  }, [pathname]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavbar currentPage={currentPage} />
        <div className="flex justify-center items-start py-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-6xl w-11/12 border border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}