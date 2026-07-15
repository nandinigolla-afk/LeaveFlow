import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportsApi } from '@/lib/reports.api';
import { departmentsApi } from '@/lib/departments.api';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/common/StatCard';
import { ListChecks, Clock, CheckCircle2, XCircle } from 'lucide-react';

const PIE_COLORS = ['#6366F1', '#22C55E', '#EF4444', '#0EA5E9', '#EC4899', '#F59E0B'];

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: departmentsApi.getAll });

  const { data, isLoading } = useQuery({
    queryKey: ['reports', 'leave-summary', fromDate, toDate, departmentId],
    queryFn: () => reportsApi.getLeaveSummary({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
    }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Reports</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Leave activity across the organization.</p>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <input type="date" className="input w-auto" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span className="text-slate-400 text-sm">to</span>
          <input type="date" className="input w-auto" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <select className="input w-auto" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All departments</option>
            {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </Card>

      {isLoading && <Spinner />}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total requests" value={data.totalRequests} icon={ListChecks} accent="brand" />
            <StatCard label="Pending" value={data.pendingRequests} icon={Clock} accent="amber" />
            <StatCard label="Approved" value={data.approvedRequests} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Rejected" value={data.rejectedRequests} icon={XCircle} accent="red" />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Requests by department</CardTitle></CardHeader>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.byDepartment}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-100 dark:text-white/5" />
                    <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                    <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-slate-400" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }} />
                    <Bar dataKey="totalRequests" fill="#6366F1" radius={[6, 6, 0, 0]} name="Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Requests by leave type</CardTitle></CardHeader>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.byLeaveType} dataKey="totalRequests" nameKey="leaveTypeName" cx="50%" cy="50%" outerRadius={90} label>
                      {data.byLeaveType.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 13 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
