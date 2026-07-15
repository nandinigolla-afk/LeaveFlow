import { useNavigate } from 'react-router-dom';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestFormModal } from '@/components/leave/LeaveRequestFormModal';

export default function RequestLeavePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Request Leave</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check your balances, then submit a new request.</p>

      <div className="mt-6"><LeaveBalanceCards /></div>

      <LeaveRequestFormModal open onClose={() => navigate('/employee/history')} />
    </div>
  );
}
