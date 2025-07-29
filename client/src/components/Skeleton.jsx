import React from 'react';

/**
 * Skeleton component for loading states
 * @param {string} variant - 'card' | 'text' | 'avatar' | 'button'
 * @param {string} className - Additional classes
 */
export default function Skeleton({ variant = 'text', className = '', ...props }) {
  const baseClasses = 'animate-pulse bg-neutral-700/50 rounded';
  
  const variants = {
    card: 'h-48 w-full',
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    subtitle: 'h-4 w-1/2',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    badge: 'h-6 w-16',
    line: 'h-px w-full',
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant] || variants.text} ${className}`}
      {...props}
    />
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-6 sm:p-8 ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton variant="subtitle" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
      <div className="flex gap-2 mt-6">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" />
      </div>
    </div>
  );
}

/**
 * Dashboard stats skeleton
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton variant="avatar" />
            <div className="flex-1">
              <Skeleton variant="title" />
              <Skeleton variant="subtitle" className="mt-2" />
            </div>
          </div>
          <Skeleton variant="text" className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

/**
 * List skeleton for loading states
 */
export function ListSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30">
          <div className="flex items-start gap-4">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="title" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 