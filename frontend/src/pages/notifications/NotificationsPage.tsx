import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/notifications.api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Bell } from 'lucide-react';
import clsx from 'clsx';

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.getMine({ page: 0, size: 20 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Notifications</h1>

      <div className="mt-6">
        {isLoading && <Spinner />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && data.content.length === 0 && (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll see leave request updates here." />
        )}
        {data && data.content.length > 0 && (
          <div className="space-y-2">
            {data.content.map((n) => (
              <Card key={n.id} className={clsx('!p-4', !n.read && 'border-brand-200 dark:border-brand-500/30')}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
