import { NavLink } from 'react-router-dom';
import { BarChart3, Building2, BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: BarChart3 },
  { label: 'Deals', to: '/admin/deals', icon: Building2 },
  { label: 'Knowledge Base', to: '/admin/kb', icon: BookOpen },
  { label: 'Investors', to: '/admin/investors', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const { logout } = useAdminAuth();

  return (
    <aside className="w-60 bg-gc-surface border-r border-gc-border h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-lg font-bold text-gc-text tracking-wider">GRAY CAPITAL</h1>
        <p className="text-gc-text-secondary text-xs mt-0.5">Admin</p>
      </div>

      <div className="border-b border-gc-border my-4 mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-gc-accent-light/10 text-gc-accent-light border-r-2 border-gc-accent-light'
                  : 'text-gc-text-secondary hover:text-gc-text hover:bg-gc-surface-elevated'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gc-text-secondary hover:text-gc-text hover:bg-gc-surface-elevated transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
