import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { ReviewModal } from '@/components/leave/ReviewModal';
import type { LeaveRequest } from '@/types';

export default function TeamApprovalsPage() {
  const [page, setPage] = useState(0);
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leave-requests', 'pending-approvals', page],
    queryFn: () => leaveRequestsApi.getPendingApprovals({ page, size: 10 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Team Approvals</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Requests from your direct reports waiting on your review.</p>

      <Card className="mt-6">
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
      </Card>

      <ReviewModal open={!!reviewTarget} request={reviewTarget} onClose={() => setReviewTarget(null)} />
    </div>
  );
}
