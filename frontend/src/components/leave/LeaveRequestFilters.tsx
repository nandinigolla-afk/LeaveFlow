import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leaveTypesApi } from '@/lib/leaveTypes.api';
import type { LeaveStatus } from '@/types';

export interface LeaveFilterState {
  search: string;
  status: LeaveStatus | '';
  leaveTypeId: string;
  fromDate: string;
  toDate: string;
}

interface LeaveRequestFiltersProps {
  filters: LeaveFilterState;
  onChange: (filters: LeaveFilterState) => void;
  showSearch?: boolean;
}

const STATUS_OPTIONS: LeaveStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export function LeaveRequestFilters({ filters, onChange, showSearch = true }: LeaveRequestFiltersProps) {
  const { data: leaveTypes } = useQuery({ queryKey: ['leave-types'], queryFn: leaveTypesApi.getAll });

  function update(patch: Partial<LeaveFilterState>) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showSearch && (
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search employee…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
      )}

      <select className="input w-auto" value={filters.status} onChange={(e) => update({ status: e.target.value as LeaveStatus | '' })}>
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select className="input w-auto" value={filters.leaveTypeId} onChange={(e) => update({ leaveTypeId: e.target.value })}>
        <option value="">All leave types</option>
        {leaveTypes?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>

      <input type="date" className="input w-auto" value={filters.fromDate} onChange={(e) => update({ fromDate: e.target.value })} />
      <span className="text-slate-400 text-sm">to</span>
      <input type="date" className="input w-auto" value={filters.toDate} onChange={(e) => update({ toDate: e.target.value })} />
    </div>
  );
}
