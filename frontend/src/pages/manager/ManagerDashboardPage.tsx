import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ListChecks, Users, Clock } from 'lucide-react';
import { leaveRequestsApi } from '@/lib/leaveRequests.api';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestsTable } from '@/components/leave/LeaveRequestsTable';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/store/AuthContext';

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests', 'pending-approvals', 'dashboard'],
    queryFn: () => leaveRequestsApi.getPendingApprovals({ page: 0, size: 5 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Welcome back, {user?.fullName.split(' ')[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your team&rsquo;s leave, at a glance.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Pending approvals" value={data?.totalElements ?? 0} icon={Clock} accent="amber" />
        <Link to="/manager/team"><StatCard label="View team members" value="→" icon={Users} accent="brand" /></Link>
      </div>

      <p className="mt-8 mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Your own leave balances</p>
      <LeaveBalanceCards />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <Link to="/manager/approvals"><Button variant="secondary"><ListChecks className="h-4 w-4" /> View all</Button></Link>
        </CardHeader>
        {isLoading ? <Spinner /> : <LeaveRequestsTable requests={data?.content ?? []} showEmployee />}
      </Card>
    </div>
  );
}
