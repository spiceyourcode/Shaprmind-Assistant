import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
