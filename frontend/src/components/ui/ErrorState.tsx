import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-500/20 py-16 px-6 text-center">
      <div className="mb-4 rounded-full bg-red-100 dark:bg-red-500/10 p-3">
        <AlertTriangle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Something went wrong</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {message ?? 'We couldn\u2019t load this data. Please try again.'}
      </p>
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
