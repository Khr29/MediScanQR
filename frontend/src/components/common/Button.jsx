import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand-500 text-white border border-brand-500 hover:bg-brand-600 hover:border-brand-600 shadow-sm',
  secondary: 'bg-white text-ink-900 border border-ink-100 hover:bg-slate-50',
  accent: 'bg-accent-500 text-white border border-accent-500 hover:bg-accent-600 hover:border-accent-600 shadow-sm',
  ghost: 'bg-transparent text-ink-900 border border-transparent hover:bg-slate-100',
  danger: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

// Shared CTA used throughout the app in place of hand-typed
// `bg-sky-600 hover:bg-sky-700` buttons. Keep new primary actions on this
// component so brand-pink usage stays centralized and doesn't creep.
const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  bracket = false,
  className = '',
  children,
  ...rest
}) => {
  return (
    <Component
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${fullWidth ? 'w-full' : ''} ${bracket ? 'corner-bracket' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </Component>
  );
};

export default Button;
