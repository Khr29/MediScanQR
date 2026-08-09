import React from 'react';

// Small loading primitives shared by Table's row skeletons and StatCard's
// loading state, instead of each hand-rolling its own pulse markup.
export const SkeletonBar = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

export const SkeletonCircle = ({ className = '' }) => (
  <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />
);

export default SkeletonBar;
