import React from 'react';

/**
 * Button component (Tailwind refactor)
 * @param {string} variant - 'primary' | 'default' | 'danger' | etc.
 * @param {string} className
 * @param {function} onClick
 * @param {React.ReactNode} children
 */
const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  default: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  link: 'bg-transparent text-primary underline hover:text-primary-dark',
};

export default function Button({ children, variant = 'default', className = '', ...props }) {
  const base = 'rounded px-4 py-2 font-semibold text-sm transition-colors focus:outline-none';
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