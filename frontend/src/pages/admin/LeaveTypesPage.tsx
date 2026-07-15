import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, Tag } from 'lucide-react';
import { leaveTypesApi } from '@/lib/leaveTypes.api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LeaveTypeFormModal } from '@/components/admin/LeaveTypeFormModal';
import type { LeaveType } from '@/types';

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveType | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['leave-types'], queryFn: leaveTypesApi.getAll });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => leaveTypesApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leave-types'] }); setDeleteTarget(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Leave Types</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure the leave categories available to employees.</p>
        </div>
        <Button onClick={() => { setEditingType(null); setFormOpen(true); }}><Plus className="h-4 w-4" /> Add leave type</Button>
      </div>

      <Card className="mt-6">
        {isLoading && <Spinner />}
        {data && (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {data.map((type) => (
              <div key={type.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${type.colorHex}20` }}>
                    <Tag className="h-4 w-4" style={{ color: type.colorHex }} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {type.name} <span className="text-slate-400 font-normal">({type.code})</span>
                      {!type.active && <span className="ml-2 badge bg-slate-100 text-slate-500 dark:bg-white/5">Inactive</span>}
                    </p>
                    <p className="text-xs text-slate-400">
                      {type.defaultAnnualDays} days/year &middot; {type.requiresApproval ? 'Requires approval' : 'Auto-approved'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="btn-ghost !p-1.5" onClick={() => { setEditingType(type); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
                  {type.active && (
                    <button className="btn-ghost !p-1.5 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10" onClick={() => setDeleteTarget(type)}><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <LeaveTypeFormModal open={formOpen} onClose={() => setFormOpen(false)} editingType={editingType} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deactivate this leave type?"
        description={`${deleteTarget?.name} will no longer be available for new requests. Existing requests are unaffected.`}
        confirmLabel="Deactivate"
        variant="danger"
        onConfirm={() => deleteTarget && deactivateMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}
