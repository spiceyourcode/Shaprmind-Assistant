import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Phone, BookOpen, ShieldAlert, Users, BarChart3,
  UserCircle, Radio, Settings, ChevronLeft, ChevronRight, Brain, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calls', icon: Phone, label: 'Call History' },
  { to: '/live', icon: Radio, label: 'Live Monitor' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/knowledge-base', icon: BookOpen, label: 'Knowledge Base' },
  { to: '/escalation-rules', icon: ShieldAlert, label: 'Escalation Rules' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
  { to: '/profile', icon: Settings, label: 'Settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 border-r border-sidebar-border transition-all duration-300 z-30',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight whitespace-nowrap">
            Sharp Mind AI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'nav-item',
                isActive ? 'nav-item-active' : 'nav-item-inactive'
              )}
              title={item.label}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && item.to === '/live' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse-live" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-2">
        <button
          onClick={logout}
          className="nav-item nav-item-inactive w-full"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="nav-item nav-item-inactive w-full justify-center"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
