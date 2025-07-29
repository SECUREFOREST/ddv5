import React from 'react';

/**
 * LoadingSpinner component for different loading states
 * @param {string} variant - 'spinner' | 'dots' | 'pulse' | 'bars'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} color - 'primary' | 'white' | 'neutral'
 * @param {string} className - Additional classes
 */
export default function LoadingSpinner({ 
  variant = 'spinner', 
  size = 'md', 
  color = 'primary',
  className = '' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    neutral: 'text-neutral-400'
  };

  const baseClasses = `${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${baseClasses}`}>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${baseClasses} animate-pulse bg-current rounded-full`}></div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={`flex space-x-1 ${baseClasses}`}>
        <div className="w-1 h-full bg-current animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-full bg-current animate-pulse" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-full bg-current animate-pulse" style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${baseClasses}`}></div>
  );
}

/**
 * Button loading state component
 */
export function ButtonLoading({ loading, children, loadingText = 'Loading...', variant = 'spinner' }) {
  if (!loading) return children;

  return (
    <div className="flex items-center justify-center gap-2">
      <LoadingSpinner variant={variant} size="sm" color="white" />
      <span>{loadingText}</span>
    </div>
  );
}

/**
 * Form loading state component
 */
export function FormLoading({ loading, children, loadingText = 'Submitting...', variant = 'dots' }) {
  if (!loading) return children;

  return (
    <div className="flex items-center justify-center gap-2">
      <LoadingSpinner variant={variant} size="sm" color="primary" />
      <span className="text-sm text-neutral-400">{loadingText}</span>
    </div>
  );
}

/**
 * Action loading state component
 */
export function ActionLoading({ loading, children, loadingText = 'Processing...', variant = 'spinner' }) {
  if (!loading) return children;

  return (
    <div className="flex items-center justify-center gap-2">
      <LoadingSpinner variant={variant} size="sm" color="white" />
      <span className="text-sm">{loadingText}</span>
    </div>
  );
}

/**
 * Page loading overlay
 */
export function PageLoading({ loading, children, message = 'Loading...' }) {
  if (!loading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-xl p-8 border border-neutral-700 shadow-2xl">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner variant="spinner" size="lg" color="primary" />
            <p className="text-white font-medium">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoading({ loading, children, fallback = null }) {
  if (loading) {
    return fallback || <LoadingSpinner variant="dots" size="sm" color="neutral" />;
  }
  return children;
} 