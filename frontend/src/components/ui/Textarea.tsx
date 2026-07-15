import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div>
        {label && <label htmlFor={areaId} className="label">{label}</label>}
        <textarea id={areaId} ref={ref} className={clsx('input min-h-[96px] resize-y', error && 'ring-2 ring-red-500 border-transparent', className)} {...props} />
        {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
