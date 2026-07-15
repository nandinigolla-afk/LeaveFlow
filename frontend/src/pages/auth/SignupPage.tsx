import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/AuthContext';
import { extractErrorMessage } from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(60),
  lastName: z.string().min(1, 'Last name is required').max(60),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(1, 'Phone number is required'),
  designation: z.string().min(1, 'Designation is required'),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Include uppercase, lowercase, and a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await signup({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        designation: values.designation,
        dateOfJoining: values.dateOfJoining,
        password: values.password,
      });
      navigate('/redirect', { replace: true });
    } catch (err) {
      setServerError(extractErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Set up your employee profile to start requesting leave.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-400">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
        </div>

        <Input label="Work email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <Input label="Designation" placeholder="e.g. Software Engineer" error={errors.designation?.message} {...register('designation')} />
        </div>

        <Input label="Date of joining" type="date" error={errors.dateOfJoining?.message} {...register('dateOfJoining')} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">Log in</Link>
      </p>
    </div>
  );
}
