import { useQuery } from '@tanstack/react-query';
import { leaveBalancesApi } from '@/lib/leaveBalances.api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export function LeaveBalanceCards({ employeeId }: { employeeId?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: employeeId ? ['leave-balances', employeeId] : ['leave-balances', 'me'],
    queryFn: () => (employeeId ? leaveBalancesApi.getForEmployee(employeeId) : leaveBalancesApi.getMine()),
  });

  if (isLoading) return <Spinner />;
  if (!data || data.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {data.map((balance) => (
        <Card key={balance.id} className="!p-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: balance.colorHex }} />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{balance.leaveTypeName}</p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {balance.remainingDays}
            <span className="text-sm font-normal text-slate-400"> / {balance.allocatedDays + balance.carriedForward}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">days remaining</p>
        </Card>
      ))}
    </div>
  );
}
