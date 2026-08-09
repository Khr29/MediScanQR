import React from 'react';

// Shared form field used across auth pages and forms. Wraps a labeled input
// with an optional leading icon, trailing slot (e.g. show/hide password),
// and error state — replaces hand-rolled input markup duplicated per page.
const Input = React.forwardRef(
  ({ label, icon: Icon, error, trailing, className = '', containerClassName = '', ...rest }, ref) => {
    return (
      <div className={containerClassName}>
        {label && <label className="mb-1 block text-xs font-semibold text-ink-900">{label}</label>}
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
          <input
            ref={ref}
            className={`w-full rounded-lg border bg-white py-2.5 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors ${
              Icon ? 'pl-9' : 'pl-3'
            } ${trailing ? 'pr-10' : 'pr-3'} ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-ink-100 focus:border-brand-500 focus:ring-brand-500'
            } ${className}`}
            {...rest}
          />
          {trailing && <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>}
        </div>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
