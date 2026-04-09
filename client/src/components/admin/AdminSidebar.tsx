import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, BookOpen, Users, Settings, LogOut, Eye } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Logo from '../shared/Logo';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Deals', to: '/admin/deals', icon: Building2 },
  { label: 'Knowledge Base', to: '/admin/kb', icon: BookOpen },
  { label: 'Investors', to: '/admin/investors', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = false, onClose }: AdminSidebarProps) {
  const { logout } = useAdminAuth();

  return (
    <aside
      className={`
        w-60 bg-gc-surface border-r border-gc-border h-screen fixed left-0 top-0 flex flex-col z-50
        transition-transform duration-200 ease-out
        md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <Logo variant="horizontal" theme="dark" tagline="Admin" minWidth={48} opacity={0.92} className="max-w-[140px]" />
      </div>

      <div className="border-b border-gc-border my-4 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm transition-colors touch-manipulation ${
                isActive
                  ? 'bg-gc-accent-light/10 text-gc-accent-light border-r-2 border-gc-accent-light'
                  : 'text-gc-text-secondary hover:text-gc-text hover:bg-gc-surface-elevated'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Switch to LP view + Logout */}
      <div className="px-3 pb-6 space-y-1">
        <a
          href="/deals/fairmont-apartments?lp_preview=1"
          className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm text-gc-text-secondary hover:text-gc-text hover:bg-gc-surface-elevated transition-colors w-full touch-manipulation"
        >
          <Eye className="w-4 h-4" />
          Switch to LP view
        </a>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm text-gc-text-secondary hover:text-gc-text hover:bg-gc-surface-elevated transition-colors w-full touch-manipulation"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
