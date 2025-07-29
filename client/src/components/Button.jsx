import React from 'react';

/**
 * Enhanced Button component with modern micro-interactions
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} className
 * @param {function} onClick
 * @param {React.ReactNode} children
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled
 */
const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-xl shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation';

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-3 text-base min-h-[44px]',
  lg: 'px-6 py-4 text-lg min-h-[52px]',
  xl: 'px-8 py-5 text-xl min-h-[60px]',
};

const variantClasses = {
  primary: 'bg-gradient-to-r from-primary to-primary-dark text-primary-contrast hover:from-primary-dark hover:to-primary focus:ring-primary shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-neutral-100 hover:from-neutral-800 hover:to-neutral-900 focus:ring-neutral-500 shadow-neutral-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-green-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  info: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500 shadow-yellow-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-contrast focus:ring-primary hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-neutral-300 hover:text-white hover:bg-neutral-800/50 focus:ring-neutral-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
  glass: 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '', 
  loading = false,
  disabled = false,
  ...props 
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Icon Button variant for compact actions
 */
export function IconButton({ 
  children, 
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props 
}) {
  const sizeClasses = {
    sm: 'p-2 min-h-[36px] min-w-[36px]',
    md: 'p-3 min-h-[44px] min-w-[44px]',
    lg: 'p-4 min-h-[52px] min-w-[52px]',
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.ghost;
  
  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} rounded-full ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Floating Action Button for mobile
 */
export function FAB({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) {
  const variantClass = variantClasses[variant] || variantClasses.primary;
  
  return (
    <button
      className={`${base} fixed bottom-20 right-4 z-40 p-4 rounded-full shadow-2xl hover:shadow-3xl ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 