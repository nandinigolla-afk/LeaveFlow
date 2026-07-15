import { Outlet } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface dark:bg-surface-dark">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">LeaveFlow Pro</span>
          </div>
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative max-w-md text-white">
          <h2 className="text-3xl font-semibold tracking-tight leading-snug">
            Time off, tracked without the back-and-forth.
          </h2>
          <p className="mt-4 text-brand-100">
            Request, approve, and track leave in one place &mdash; built for teams who&rsquo;d rather spend time on the work that matters.
          </p>
        </div>
      </div>
    </div>
  );
}
