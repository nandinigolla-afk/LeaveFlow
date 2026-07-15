import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-surface-dark px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
        <ShieldAlert className="h-7 w-7 text-red-500" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">You don&rsquo;t have access to this page</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Your account role doesn&rsquo;t have permission to view this. Contact an administrator if you think this is a mistake.
      </p>
      <Link to="/redirect"><Button className="mt-6">Go to my dashboard</Button></Link>
    </div>
  );
}
