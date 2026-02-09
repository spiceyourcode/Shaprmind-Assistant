import { useAuthStore } from '@/stores/authStore';
import { Moon, Sun, Save } from 'lucide-react';

export default function Profile() {
  const { user, theme, toggleTheme } = useAuthStore();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold">Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input defaultValue={user?.email || ''} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <input defaultValue={user?.phone || ''} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" type="tel" />
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" /> Save Profile
        </button>
      </div>

      {/* Business (owner only) */}
      {user?.role === 'owner' && (
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Business</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business Name</label>
              <input defaultValue="Sharp Mind AI" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Business Phone</label>
              <input defaultValue="+1 (555) 000-0000" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" type="tel" />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" /> Save Business
          </button>
        </div>
      )}

      {/* Theme */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-3">Appearance</h3>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors w-full"
        >
          {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning" />}
          <div className="text-left">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
            <p className="text-xs text-muted-foreground">Click to switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
          </div>
        </button>
      </div>
    </div>
  );
}
