import React from 'react';

/**
 * Button component (Tailwind refactor)
 * @param {string} variant - 'primary' | 'default' | 'danger' | etc.
 * @param {string} className
 * @param {function} onClick
 * @param {React.ReactNode} children
 */
const base = 'rounded px-4 py-2 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast border-0 shadow-none';
const variantClasses = {
  primary: 'bg-primary text-primary-contrast hover:bg-primary-dark',
  danger: 'bg-danger text-danger-contrast hover:bg-danger-dark',
  default: 'bg-neutral-700 text-neutral-100 hover:bg-neutral-900',
  link: 'bg-transparent text-primary underline hover:text-primary-dark',
};

export default function Button({ children, variant = 'default', className = '', ...props }) {
  const variantClass = variantClasses[variant] || variantClasses.default;
  return (
    <button
      className={`${base} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 