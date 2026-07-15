import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus } from 'lucide-react';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { useDebounce } from '@/hooks/useDebounce';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { LeaveRequestFilters, type LeaveFilterState } from '@/components/leave/LeaveRequestFilters';
import { LeaveRequestFormModal } from '@/components/leave/LeaveRequestFormModal';
import type { LeaveRequest } from '@/types';

const emptyFilters: LeaveFilterState = { search: '', status: '', leaveTypeId: '', fromDate: '', toDate: '' };

export default function LeaveHistoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<LeaveFilterState>(emptyFilters);
  const debouncedSearch = useDebounce(filters.search);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leave-requests', 'me', page, debouncedSearch, filters.status, filters.leaveTypeId, filters.fromDate, filters.toDate],
    queryFn: () => leaveRequestsApi.getMine({
      page,
      size: 10,
      status: filters.status || undefined,
      leaveTypeId: filters.leaveTypeId ? Number(filters.leaveTypeId) : undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sort: 'createdAt,desc',
    }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => leaveRequestsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      setCancelTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => leaveRequestsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setDeleteTarget(null);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Leave History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All your leave requests, past and upcoming.</p>
        </div>
        <Button onClick={() => { setEditingRequest(null); setFormOpen(true); }}>
          <CalendarPlus className="h-4 w-4" /> Request leave
        </Button>
      </div>

      <Card className="mt-6">
        <LeaveRequestFilters filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} showSearch={false} />

        <div className="mt-5">
          {isLoading && <Spinner />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && (
            <>
              <LeaveRequestsTable
                requests={data.content}
                canEditOwn
                onEdit={(req) => { setEditingRequest(req); setFormOpen(true); }}
                onCancel={(req) => setCancelTarget(req)}
                onDelete={(req) => setDeleteTarget(req)}
              />
              <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>

      <LeaveRequestFormModal open={formOpen} onClose={() => setFormOpen(false)} editingRequest={editingRequest} />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel this leave request?"
        description="Your manager will be notified. If this request was already approved, the balance will be released."
        confirmLabel="Cancel request"
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        onClose={() => setCancelTarget(null)}
        isLoading={cancelMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this leave request?"
        description="This action can't be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
