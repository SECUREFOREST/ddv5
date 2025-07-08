import React from 'react';

/**
 * Button component (legacy CSS)
 * @param {string} variant - 'primary' | 'default' | 'danger' | etc.
 * @param {string} className
 * @param {function} onClick
 * @param {React.ReactNode} children
 */
export default function Button({ children, variant = 'default', className = '', ...props }) {
  // Map variant prop to legacy CSS classes
  const variantClass = variant ? `btn-${variant}` : 'btn-default';
  return (
    <button
      className={`btn ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
} 