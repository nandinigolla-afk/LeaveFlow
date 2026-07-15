import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { departmentsApi } from '@/lib/departments.api';
import { employeesApi } from '@/lib/employees.api';
import { extractErrorMessage } from '@/lib/api';
import type { Employee } from '@/types';

const baseSchema = {
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().optional(),
  designation: z.string().min(1, 'Designation is required'),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
};

const createSchema = z.object({
  ...baseSchema,
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const updateSchema = z.object({
  ...baseSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']),
});

interface EmployeeFormModalProps {
  open: boolean;
  onClose: () => void;
  editingEmployee?: Employee | null;
}

export function EmployeeFormModal({ open, onClose, editingEmployee }: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!editingEmployee;
  const schema = isEditing ? updateSchema : createSchema;

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset(editingEmployee ? {
        firstName: editingEmployee.firstName,
        lastName: editingEmployee.lastName,
        email: editingEmployee.email,
        phone: editingEmployee.phone ?? '',
        designation: editingEmployee.designation,
        departmentId: editingEmployee.departmentId ? String(editingEmployee.departmentId) : '',
        managerId: editingEmployee.managerId ? String(editingEmployee.managerId) : '',
        status: editingEmployee.status,
      } : {
        firstName: '', lastName: '', email: '', phone: '', designation: '',
        departmentId: '', managerId: '', dateOfJoining: '', role: 'EMPLOYEE', initialPassword: '',
      });
      setServerError(null);
    }
  }, [open, editingEmployee, reset]);

  const mutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (values: any) => {
      const payload = {
        ...values,
        departmentId: values.departmentId ? Number(values.departmentId) : undefined,
        managerId: values.managerId ? Number(values.managerId) : undefined,
      };
      return isEditing ? employeesApi.update(editingEmployee!.id, payload) : employeesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
    onError: (err) => setServerError(extractErrorMessage(err)),
  });

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit employee' : 'Add employee'} maxWidth="max-w-xl">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form onSubmit={handleSubmit((values: any) => mutation.mutate(values))} className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" error={errors.firstName?.message as string} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message as string} {...register('lastName')} />
        </div>

        <Input label="Email" type="email" error={errors.email?.message as string} {...register('email')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" error={errors.phone?.message as string} {...register('phone')} />
          <Input label="Designation" error={errors.designation?.message as string} {...register('designation')} />
        </div>

        <Select label="Department" {...register('departmentId')}>
          <option value="">No department</option>
          {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>

        {!isEditing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date of joining" type="date" error={errors.dateOfJoining?.message as string} {...register('dateOfJoining')} />
              <Select label="Role" error={errors.role?.message as string} {...register('role')}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <Input label="Initial password" type="password" error={errors.initialPassword?.message as string} {...register('initialPassword')} />
          </>
        )}

        {isEditing && (
          <Select label="Status" error={errors.status?.message as string} {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="TERMINATED">Terminated</option>
          </Select>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting || mutation.isPending}>{isEditing ? 'Save changes' : 'Add employee'}</Button>
        </div>
      </form>
    </Modal>
  );
}
