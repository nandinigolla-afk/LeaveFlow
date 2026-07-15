import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'brand' | 'emerald' | 'amber' | 'red' | 'slate';
}

const accentClass: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300',
};

export function StatCard({ label, value, icon: Icon, accent = 'brand' }: StatCardProps) {
  return (
    <Card className="!p-5">
      <div className="flex items-center gap-3.5">
        <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accentClass[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}
