import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <input id={inputId} ref={ref} className={clsx('input', error && 'ring-2 ring-red-500 border-transparent', className)} {...props} />
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
