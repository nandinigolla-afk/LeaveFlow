import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarPlus, Clock, CheckCircle2 } from 'lucide-react';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { LeaveRequestFormModal } from '@/components/leave/LeaveRequestFormModal';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/store/AuthContext';

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests', 'me', 'dashboard'],
    queryFn: () => leaveRequestsApi.getMine({ page: 0, size: 5, sort: 'createdAt,desc' }),
  });

  const pendingCount = data?.content.filter((r) => r.status === 'PENDING').length ?? 0;
  const approvedCount = data?.content.filter((r) => r.status === 'APPROVED').length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.fullName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&rsquo;s where things stand with your leave.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}><CalendarPlus className="h-4 w-4" /> Request leave</Button>
      </div>

      <div className="mt-6"><LeaveBalanceCards /></div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Pending requests" value={pendingCount} icon={Clock} accent="amber" />
        <StatCard label="Approved requests" value={approvedCount} icon={CheckCircle2} accent="emerald" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent requests</CardTitle></CardHeader>
        {isLoading ? <Spinner /> : (
          <LeaveRequestsTable requests={data?.content ?? []} />
        )}
      </Card>

      <LeaveRequestFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
