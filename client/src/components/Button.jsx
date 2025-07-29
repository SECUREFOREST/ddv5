import React from 'react';

/**
 * Button component (Tailwind refactor)
 * @param {string} variant - 'primary' | 'default' | 'danger' | etc.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className
 * @param {function} onClick
 * @param {React.ReactNode} children
 */
const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-lg shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
};
const variantClasses = {
  primary: 'bg-gradient-to-r from-primary to-primary-dark text-primary-contrast hover:from-primary-dark hover:to-primary focus:ring-primary shadow-primary/25',
  danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-red-500/25',
  success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-green-500/25',
  info: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 shadow-blue-500/25',
  warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 focus:ring-yellow-500 shadow-yellow-500/25',
  default: 'bg-gradient-to-r from-neutral-700 to-neutral-800 text-neutral-100 hover:from-neutral-800 hover:to-neutral-900 focus:ring-neutral-500 shadow-neutral-500/25',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-contrast focus:ring-primary',
  ghost: 'text-neutral-300 hover:text-white hover:bg-neutral-800/50 focus:ring-neutral-500',
};

export default function Button({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '', 
  ...props 
}) {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = variantClasses[variant] || variantClasses.default;
  
  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 