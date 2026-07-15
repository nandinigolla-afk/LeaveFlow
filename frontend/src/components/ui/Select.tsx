import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={selectId} className="label">{label}</label>}
        <select id={selectId} ref={ref} className={clsx('input', error && 'ring-2 ring-red-500 border-transparent', className)} {...props}>
          {children}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
