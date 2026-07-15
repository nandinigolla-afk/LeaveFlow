import { Card } from '@/components/ui/Card';
import { useAuth } from '@/store/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
      <Card className="mt-6 max-w-lg">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Name</dt><dd className="font-medium text-slate-900 dark:text-white">{user?.fullName}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Email</dt><dd className="font-medium text-slate-900 dark:text-white">{user?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Employee code</dt><dd className="font-medium text-slate-900 dark:text-white">{user?.employeeCode}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Designation</dt><dd className="font-medium text-slate-900 dark:text-white">{user?.designation}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Department</dt><dd className="font-medium text-slate-900 dark:text-white">{user?.departmentName ?? '—'}</dd></div>
        </dl>
      </Card>
      <p className="mt-3 text-xs text-slate-400">Full edit form ships in Phase 4.</p>
    </div>
  );
}
