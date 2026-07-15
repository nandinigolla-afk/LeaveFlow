import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar, type NavItem } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export function DashboardLayout({ navItems }: { navItems: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-surface-dark">
      <Sidebar navItems={navItems} />

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-surface-dark-elevated animate-slide-up">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border-light dark:border-border-dark">
              <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="btn-ghost"><X className="h-5 w-5" /></button>
            </div>
            <Sidebar navItems={navItems} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
