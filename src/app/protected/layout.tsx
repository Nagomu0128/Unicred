// /app/protected/layout.tsx
import { AuthGuard } from '@/components/AuthGuard';
import { UserNavbar } from '@/components/UserNavbar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <UserNavbar />
        <div className="flex justify-center items-start py-8">
          <div className="bg-white p-12 rounded-2xl shadow-xl max-w-6xl w-11/12 border border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}