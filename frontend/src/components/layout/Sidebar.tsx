import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays } from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function Sidebar({ navItems }: { navItems: NavItem[] }) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-border-light dark:border-border-dark bg-white dark:bg-surface-dark-elevated">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border-light dark:border-border-dark">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <CalendarDays className="h-4.5 w-4.5" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">LeaveFlow Pro</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length <= 2}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
              )
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
