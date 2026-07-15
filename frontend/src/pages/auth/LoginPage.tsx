import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/AuthContext';
import { extractErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await login(values);
      const from = (location.state as { from?: Location })?.from?.pathname ?? '/redirect';
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Log in to manage your leave and team requests.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>Log in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&rsquo;t have an account?{' '}
        <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Sign up</Link>
      </p>
    </div>
  );
}
