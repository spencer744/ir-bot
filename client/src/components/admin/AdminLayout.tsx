import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, fixed on desktop */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Top Bar: full width on mobile with menu button */}
      <header className="h-14 min-h-[44px] bg-gc-surface border-b border-gc-border flex items-center justify-between px-4 sm:px-6 md:ml-60 fixed top-0 right-0 left-0 md:left-60 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-gc-text-secondary hover:text-gc-text rounded-lg touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-sm font-medium text-gc-text truncate">{pageTitle}</h2>
        </div>
        <div className="text-sm text-gc-text-secondary truncate min-w-0 max-w-[min(50%,12rem)] sm:max-w-[14rem]">
          {email}
        </div>
      </header>

      {/* Main Content: full width on mobile when sidebar is drawer */}
      <main className="md:ml-60 pt-14 p-4 sm:p-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
