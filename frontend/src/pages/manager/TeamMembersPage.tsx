import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/lib/employees.api';
import { useAuth } from '@/store/AuthContext';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function TeamMembersPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['employees', 'search', { managerId: user?.employeeId }],
    queryFn: () => employeesApi.search({ page: 0, size: 50 }),
    enabled: !!user,
  });

  const teamMembers = data?.content.filter((e) => e.managerId === user?.employeeId) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Team Members</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">People who report directly to you.</p>

      <Card className="mt-6">
        {isLoading && <Spinner />}
        {!isLoading && teamMembers.length === 0 && (
          <EmptyState icon={Users} title="No direct reports" description="Employees assigned to you as manager will show up here." />
        )}
        {teamMembers.length > 0 && (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {teamMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-semibold">
                  {m.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{m.fullName}</p>
                  <p className="text-xs text-slate-400">{m.designation} &middot; {m.departmentName ?? 'No department'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
