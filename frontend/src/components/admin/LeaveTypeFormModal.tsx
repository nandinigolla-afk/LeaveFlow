import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { leaveTypesApi } from '@/lib/leaveTypes.api';
import { extractErrorMessage } from '@/lib/api';
import type { LeaveType } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').max(10),
  defaultAnnualDays: z.coerce.number().min(0, 'Must be 0 or more'),
  colorHex: z.string().min(1, 'Pick a color'),
  requiresApproval: z.boolean().default(true),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export function LeaveTypeFormModal({ open, onClose, editingType }: { open: boolean; onClose: () => void; editingType?: LeaveType | null }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!editingType;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(editingType ?? { name: '', code: '', defaultAnnualDays: 0, colorHex: '#6366F1', requiresApproval: true, active: true });
      setServerError(null);
    }
  }, [open, editingType, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => (isEditing ? leaveTypesApi.update(editingType!.id, values) : leaveTypesApi.create(values)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-types'] }); onClose(); },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit leave type' : 'Add leave type'}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Code" placeholder="e.g. AL" error={errors.code?.message} {...register('code')} />
          <Input label="Default annual days" type="number" step="0.5" error={errors.defaultAnnualDays?.message} {...register('defaultAnnualDays')} />
        </div>
        <Input label="Color" type="color" error={errors.colorHex?.message} {...register('colorHex')} />
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" className="rounded border-border-light dark:border-border-dark" {...register('requiresApproval')} />
          Requires manager approval
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" className="rounded border-border-light dark:border-border-dark" {...register('active')} />
          Active
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>{isEditing ? 'Save changes' : 'Add leave type'}</Button>
        </div>
      </form>
    </Modal>
  );
}
