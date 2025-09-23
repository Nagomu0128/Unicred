import { AuthGuard } from '@/components/AuthGuard';

export default function RegistrationLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <main className="flex justify-center items-center min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
