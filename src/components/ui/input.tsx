import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, icon, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-all duration-200',
            'placeholder:text-slate-400',
            'focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };
