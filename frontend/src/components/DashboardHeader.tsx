import { Moon, Sun, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function DashboardHeader() {
  const { user, theme, toggleTheme } = useAuthStore();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" title="Notifications">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Toggle theme">
          {theme === 'dark' ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <span className="text-sm text-foreground font-medium hidden sm:block">{user?.email || 'admin'}</span>
        </div>
      </div>
    </header>
  );
}
