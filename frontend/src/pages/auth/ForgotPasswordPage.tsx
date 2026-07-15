import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/auth.api';
import { extractErrorMessage } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/10">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Check your inbox</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          If an account exists for that email, we&rsquo;ve sent a link to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Reset your password</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Enter your email and we&rsquo;ll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}
        <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
        <Button type="submit" className="w-full" isLoading={isSubmitting}>Send reset link</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Back to login</Link>
      </p>
    </div>
  );
}
