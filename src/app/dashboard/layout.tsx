import { SessionProvider } from 'next-auth/react';
import { Sidebar, Header } from '@/components/layout/sidebar';
import { Toaster } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar - Fixed Position */}
        <Sidebar />

        {/* Main Content - dengan margin kiri untuk sidebar */}
        <div className="lg:ml-72 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
          <Toaster position="top-right" />
        </div>
      </div>
    </SessionProvider>
  );
}
