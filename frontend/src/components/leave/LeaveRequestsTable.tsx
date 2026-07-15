import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, XCircle, CheckSquare, CalendarX } from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LeaveRequest } from '@/types';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  showEmployee?: boolean;
  canEditOwn?: boolean;
  canReview?: boolean;
  onEdit?: (request: LeaveRequest) => void;
  onCancel?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
  onReview?: (request: LeaveRequest) => void;
  onRowClick?: (request: LeaveRequest) => void;
}

export function LeaveRequestsTable({
  requests, showEmployee, canEditOwn, canReview, onEdit, onCancel, onDelete, onReview, onRowClick,
}: LeaveRequestsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  if (requests.length === 0) {
    return <EmptyState icon={CalendarX} title="No leave requests" description="Nothing to show for the current filters." />;
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark text-left text-xs font-medium uppercase tracking-wide text-slate-400">
            {showEmployee && <th className="py-3 pr-4">Employee</th>}
            <th className="py-3 pr-4">Leave Type</th>
            <th className="py-3 pr-4">Dates</th>
            <th className="py-3 pr-4">Days</th>
            <th className="py-3 pr-4">Status</th>
            <th className="py-3 pr-4">Submitted</th>
            <th className="py-3 pr-4 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light dark:divide-border-dark">
          {requests.map((req) => (
            <tr
              key={req.id}
              className="hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
              onClick={() => onRowClick?.(req)}
            >
              {showEmployee && (
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-[11px] font-semibold shrink-0">
                      {req.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{req.employeeName}</p>
                      <p className="text-xs text-slate-400">{req.employeeCode}</p>
                    </div>
                  </div>
                </td>
              )}
              <td className="py-3.5 pr-4">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: req.leaveTypeColor }} />
                  {req.leaveTypeName}
                </span>
              </td>
              <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {format(new Date(req.startDate), 'MMM d')} &ndash; {format(new Date(req.endDate), 'MMM d, yyyy')}
              </td>
              <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">{req.totalDays}</td>
              <td className="py-3.5 pr-4"><StatusBadge status={req.status} /></td>
              <td className="py-3.5 pr-4 text-slate-400 whitespace-nowrap">{format(new Date(req.createdAt), 'MMM d, yyyy')}</td>
              <td className="py-3.5 pr-2 relative" onClick={(e) => e.stopPropagation()}>
                {((canReview && req.status === 'PENDING') || (canEditOwn && req.status !== 'CANCELLED')) ? (
                  <>
                    <button
                      className="btn-ghost !p-1.5"
                      onClick={() => setOpenMenuId(openMenuId === req.id ? null : req.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuId === req.id && (
                      <div className="absolute right-2 z-10 mt-1 w-44 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark-elevated shadow-card dark:shadow-card-dark py-1 animate-slide-up">
                        {canReview && req.status === 'PENDING' && onReview && (
                          <button onClick={() => { setOpenMenuId(null); onReview(req); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5">
                            <CheckSquare className="h-4 w-4" /> Review
                          </button>
                        )}
                        {canEditOwn && req.status === 'PENDING' && onEdit && (
                          <button onClick={() => { setOpenMenuId(null); onEdit(req); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5">
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                        )}
                        {canEditOwn && (req.status === 'PENDING' || req.status === 'APPROVED') && onCancel && (
                          <button onClick={() => { setOpenMenuId(null); onCancel(req); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                            <XCircle className="h-4 w-4" /> Cancel
                          </button>
                        )}
                        {canEditOwn && req.status === 'PENDING' && onDelete && (
                          <button onClick={() => { setOpenMenuId(null); onDelete(req); }} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
