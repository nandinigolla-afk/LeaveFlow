import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { departmentsApi } from '@/lib/departments.api';
import { extractErrorMessage } from '@/lib/api';
import type { Department } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function DepartmentFormModal({ open, onClose, editingDepartment }: { open: boolean; onClose: () => void; editingDepartment?: Department | null }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!editingDepartment;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset(editingDepartment ? { name: editingDepartment.name, description: editingDepartment.description ?? '' } : { name: '', description: '' });
      setServerError(null);
    }
  }, [open, editingDepartment, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => (isEditing ? departmentsApi.update(editingDepartment!.id, values) : departmentsApi.create(values)),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); onClose(); },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit department' : 'Add department'}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Textarea label="Description (optional)" error={errors.description?.message} {...register('description')} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>{isEditing ? 'Save changes' : 'Add department'}</Button>
        </div>
      </form>
    </Modal>
  );
}
