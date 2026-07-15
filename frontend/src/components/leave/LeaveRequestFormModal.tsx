import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { leaveTypesApi } from '@/lib/leaveTypes.api';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { extractErrorMessage } from '@/lib/api';
import type { LeaveRequest } from '@/types';

const schema = z.object({
  leaveTypeId: z.coerce.number({ invalid_type_error: 'Select a leave type' }).min(1, 'Select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().max(1000).optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

type FormValues = z.infer<typeof schema>;

interface LeaveRequestFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRequest?: LeaveRequest | null;
}

export function LeaveRequestFormModal({ open, onClose, editingRequest }: LeaveRequestFormModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!editingRequest;

  const { data: leaveTypes } = useQuery({ queryKey: ['leave-types'], queryFn: leaveTypesApi.getAll });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(editingRequest ? {
        leaveTypeId: editingRequest.leaveTypeId,
        startDate: editingRequest.startDate,
        endDate: editingRequest.endDate,
        reason: editingRequest.reason ?? '',
      } : { leaveTypeId: undefined, startDate: '', endDate: '', reason: '' });
      setServerError(null);
    }
  }, [open, editingRequest, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEditing
        ? leaveRequestsApi.update(editingRequest!.id, values)
        : leaveRequestsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      onClose();
    },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit leave request' : 'Request leave'}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        <Select label="Leave type" error={errors.leaveTypeId?.message} {...register('leaveTypeId')}>
          <option value="">Select a leave type</option>
          {leaveTypes?.filter((t) => t.active).map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <Input label="End date" type="date" error={errors.endDate?.message} {...register('endDate')} />
        </div>

        <Textarea label="Reason (optional)" placeholder="Add context for your manager…" error={errors.reason?.message} {...register('reason')} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>
            {isEditing ? 'Save changes' : 'Submit request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
