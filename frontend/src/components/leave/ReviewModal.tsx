import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { extractErrorMessage } from '@/lib/api';
import type { LeaveRequest } from '@/types';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
}

export function ReviewModal({ open, onClose, request }: ReviewModalProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (approve: boolean) => leaveRequestsApi.review(request!.id, approve, comment || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setComment('');
      onClose();
    },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  if (!request) return null;

  return (
    <Modal open={open} onClose={onClose} title="Review leave request">
      <div className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-4 text-sm">
          <p className="font-medium text-slate-900 dark:text-white">{request.employeeName}</p>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            {request.leaveTypeName} &middot; {request.startDate} to {request.endDate} &middot; {request.totalDays} day(s)
          </p>
          {request.reason && <p className="mt-2 text-slate-600 dark:text-slate-300">&ldquo;{request.reason}&rdquo;</p>}
        </div>

        <Textarea label="Comment (optional)" placeholder="Add a note for the employee…" value={comment} onChange={(e) => setComment(e.target.value)} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="danger" onClick={() => mutation.mutate(false)} isLoading={mutation.isPending && mutation.variables === false}>
            Reject
          </Button>
          <Button variant="primary" onClick={() => mutation.mutate(true)} isLoading={mutation.isPending && mutation.variables === true}>
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  );
}
