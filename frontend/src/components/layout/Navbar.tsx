import { useState } from 'react';
import { Bell, Moon, Sun, LogOut, User, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/store/AuthContext';
import { useTheme } from '@/store/ThemeContext';
import { notificationsApi } from '@/lib/notifications.api';
import { useNavigate } from 'react-router-dom';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 60_000,
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-surface-dark-elevated/80 backdrop-blur px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden btn-ghost -ml-2">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="btn-ghost" aria-label="Toggle dark mode">
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        <button onClick={() => navigate('/notifications')} className="btn-ghost relative" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-600" />
          )}
        </button>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-semibold">
              {user?.fullName?.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-200">{user?.fullName}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark-elevated shadow-card dark:shadow-card-dark py-1 animate-slide-up">
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <button
                onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
