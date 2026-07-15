import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/auth.api';
import { extractErrorMessage } from '@/lib/api';

const schema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Include uppercase, lowercase, and a number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await authApi.resetPassword(token, values.newPassword);
      navigate('/login', { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This password reset link is missing or invalid.</p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Choose a new password</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Make it something you haven&rsquo;t used before.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}
        <Input label="New password" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
        <Input label="Confirm new password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>Reset password</Button>
      </form>
    </div>
  );
}
