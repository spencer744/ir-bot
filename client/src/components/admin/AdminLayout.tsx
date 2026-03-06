import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminSidebar from './AdminSidebar';

// Map route segments to display names for the top bar
function getPageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    deals: 'Deals',
    kb: 'Knowledge Base',
    investors: 'Investors',
    settings: 'Settings',
  };
  return titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export default function AdminLayout() {
  const { isAuthenticated, loading, email } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gc-bg flex items-center justify-center">
        <div className="text-gc-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-gc-bg">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Top Bar */}
      <header className="h-14 bg-gc-surface border-b border-gc-border flex items-center justify-between px-6 ml-60 fixed top-0 right-0 left-60 z-10">
        <h2 className="text-sm font-medium text-gc-text">{pageTitle}</h2>
        <div className="text-sm text-gc-text-secondary">
          {email}
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-60 pt-14 p-6">
        <Outlet />
      </main>
    </div>
  );
}
