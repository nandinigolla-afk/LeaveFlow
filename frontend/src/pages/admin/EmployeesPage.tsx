import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { employeesApi } from '@/lib/employees.api';
import { departmentsApi } from '@/lib/departments.api';
import { useDebounce } from '@/hooks/useDebounce';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmployeeFormModal } from '@/components/admin/EmployeeFormModal';
import type { Employee, EmployeeStatus } from '@/types';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState<EmployeeStatus | ''>('');
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['employees', 'search', page, debouncedSearch, departmentId, status],
    queryFn: () => employeesApi.search({
      page, size: 10, search: debouncedSearch || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
      status: status || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); setDeleteTarget(null); },
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Employees</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your organization&rsquo;s people.</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setFormOpen(true); }}><UserPlus className="h-4 w-4" /> Add employee</Button>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name, email, code…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <select className="input w-auto" value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPage(0); }}>
            <option value="">All departments</option>
            {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value as EmployeeStatus | ''); setPage(0); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>

        <div className="mt-5">
          {isLoading && <Spinner />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.content.length === 0 && <EmptyState title="No employees found" description="Try adjusting your filters." />}
          {data && data.content.length > 0 && (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Designation</th>
                      <th className="py-3 pr-4">Department</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4 w-20" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark">
                    {data.content.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-semibold shrink-0">
                              {emp.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{emp.fullName}</p>
                              <p className="text-xs text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">{emp.designation}</td>
                        <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-300">{emp.departmentName ?? '—'}</td>
                        <td className="py-3.5 pr-4"><StatusBadge status={emp.status} /></td>
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-1">
                            <button className="btn-ghost !p-1.5" onClick={() => { setEditingEmployee(emp); setFormOpen(true); }}><Pencil className="h-4 w-4" /></button>
                            <button className="btn-ghost !p-1.5 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10" onClick={() => setDeleteTarget(emp)}><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />
            </>
          )}
        </div>
      </Card>

      <EmployeeFormModal open={formOpen} onClose={() => setFormOpen(false)} editingEmployee={editingEmployee} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this employee?"
        description={`This will permanently remove ${deleteTarget?.fullName} and their account. This action can't be undone.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
