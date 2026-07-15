import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Building2, ListChecks, Clock } from 'lucide-react';
import { reportsApi } from '@/lib/reports.api';
import { employeesApi } from '@/lib/employees.api';
import { departmentsApi } from '@/lib/departments.api';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminDashboardPage() {
  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', 'leave-summary', 'dashboard'],
    queryFn: () => reportsApi.getLeaveSummary({}),
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'search', 'count'],
    queryFn: () => employeesApi.search({ page: 0, size: 1 }),
  });

  const { data: departments, isLoading: deptLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const isLoading = reportLoading || employeesLoading || deptLoading;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Organization-wide overview.</p>
        </div>
        <Link to="/admin/reports"><Button variant="secondary">View full reports</Button></Link>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total employees" value={employees?.totalElements ?? 0} icon={Users} accent="brand" />
          <StatCard label="Departments" value={departments?.length ?? 0} icon={Building2} accent="slate" />
          <StatCard label="Pending requests" value={report?.pendingRequests ?? 0} icon={Clock} accent="amber" />
          <StatCard label="Total requests" value={report?.totalRequests ?? 0} icon={ListChecks} accent="emerald" />
        </div>
      )}

      <Card className="mt-6">
        <CardHeader><CardTitle>Quick actions</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/employees"><Button variant="secondary">Manage employees</Button></Link>
          <Link to="/admin/departments"><Button variant="secondary">Manage departments</Button></Link>
          <Link to="/admin/leave-requests"><Button variant="secondary">Review leave requests</Button></Link>
          <Link to="/admin/leave-types"><Button variant="secondary">Configure leave types</Button></Link>
        </div>
      </Card>
    </div>
  );
}
