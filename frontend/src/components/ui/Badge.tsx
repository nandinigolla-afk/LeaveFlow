import type { LeaveStatus, EmployeeStatus } from '@/types';
import clsx from 'clsx';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  ON_LEAVE: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  TERMINATED: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export function StatusBadge({ status }: { status: LeaveStatus | EmployeeStatus }) {
  return (
    <span className={clsx('badge', statusStyles[status] ?? 'bg-slate-100 text-slate-600')}>
      {status.replace('_', ' ')}
    </span>
  );
}
