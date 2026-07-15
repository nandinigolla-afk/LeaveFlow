import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-surface-dark px-6 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Link to="/"><Button className="mt-6">Go home</Button></Link>
    </div>
  );
}
