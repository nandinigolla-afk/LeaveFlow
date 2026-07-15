import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Pencil, Trash2, Plus } from 'lucide-react';
import { departmentsApi } from '@/lib/departments.api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DepartmentFormModal } from '@/components/admin/DepartmentFormModal';
import type { Department } from '@/types';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['departments'] }); setDeleteTarget(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Departments</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organize employees into departments.</p>
        </div>
        <Button onClick={() => { setEditingDepartment(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add department</Button>
      </div>

      <div className="mt-6">
        {isLoading && <Spinner />}
        {data && data.length === 0 && <EmptyState icon={Building2} title="No departments yet" description="Create your first department to start assigning employees." />}
        {data && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((dept) => (
              <Card key={dept.id} className="!p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <button className="btn-ghost !p-1.5" onClick={() => { setEditingDepartment(dept); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
                    <button className="btn-ghost !p-1.5 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10" onClick={() => setDeleteTarget(dept)}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="mt-3 font-semibold text-slate-900 dark:text-white">{dept.name}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{dept.description || 'No description'}</p>
                <p className="mt-3 text-xs font-medium text-slate-400">{dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DepartmentFormModal open={formOpen} onClose={() => setFormOpen(false)} editingDepartment={editingDepartment} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this department?"
        description={`Employees in ${deleteTarget?.name} will be unassigned. This action can't be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
