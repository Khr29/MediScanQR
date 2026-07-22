import React from 'react';

const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div
        className={`animate-spin rounded-full border-sky-600 border-t-transparent ${
          sizeClasses[size] || sizeClasses.medium
        }`}
      ></div>
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export default Loader;