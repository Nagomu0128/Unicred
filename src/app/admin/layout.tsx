// /app/admin/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { AdminNavbar } from '@/components/admin/AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const getCurrentPage = () => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname === '/admin/add-course') return 'add-course';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <AdminNavbar currentPage={getCurrentPage()} />
      <div className="flex justify-center items-start py-8">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-6xl w-11/12 border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
