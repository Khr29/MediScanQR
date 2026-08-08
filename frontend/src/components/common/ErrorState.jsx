import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'The data could not be loaded. Please try again.',
  onRetry = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-10 px-6 text-center ${className}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-rose-800">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs text-rose-600">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 border border-rose-300 hover:bg-rose-100 transition-colors"
        >
          <RotateCw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
