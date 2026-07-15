import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { useDebounce } from '@/hooks/useDebounce';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { LeaveRequestFilters, type LeaveFilterState } from '@/components/leave/LeaveRequestFilters';
import { ReviewModal } from '@/components/leave/ReviewModal';
import type { LeaveRequest } from '@/types';

const emptyFilters: LeaveFilterState = { search: '', status: '', leaveTypeId: '', fromDate: '', toDate: '' };

export default function AdminLeaveRequestsPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<LeaveFilterState>(emptyFilters);
  const debouncedSearch = useDebounce(filters.search);
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leave-requests', 'all', page, debouncedSearch, filters.status, filters.leaveTypeId, filters.fromDate, filters.toDate],
    queryFn: () => leaveRequestsApi.searchAll({
      page, size: 10,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      leaveTypeId: filters.leaveTypeId ? Number(filters.leaveTypeId) : undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      sort: 'createdAt,desc',
    }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">All Leave Requests</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every leave request across the organization.</p>

      <Card className="mt-6">
        <LeaveRequestFilters filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />

        <div className="mt-5">
          {isLoading && <Spinner />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && (
            <>
              <LeaveRequestsTable
                requests={data.content}
                showEmployee
                canReview
                onReview={(req) => setReviewTarget(req)}
              />
              <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>

      <ReviewModal open={!!reviewTarget} request={reviewTarget} onClose={() => setReviewTarget(null)} />
    </div>
  );
}
