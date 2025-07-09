import React from 'react';

/**
 * Card component (Tailwind refactor)
 * @param {React.ReactNode} header - Optional card header
 * @param {React.ReactNode} image - Optional image at the top
 * @param {React.ReactNode} children - Card body content
 * @param {React.ReactNode} footer - Optional card footer
 * @param {string} className - Additional classes
 */
export default function Card({ header, image, children, footer, className = '', ...props }) {
  return (
    <div className={`bg-neutral-800 rounded-lg shadow p-4 mb-4 ${className}`.trim()} {...props}>
      {image && (
        <div className="mb-4">
          {typeof image === 'string' ? (
            <img src={image} alt="" className="w-full rounded-t-lg object-cover" />
          ) : image}
        </div>
      )}
      {header && (
        <div className="border-b border-neutral-900 pb-2 mb-2">
          <span className="text-lg font-semibold text-primary">{header}</span>
        </div>
      )}
      <div className="mb-2">{children}</div>
      {footer && (
        <div className="pt-2 mt-2 border-t border-neutral-900 text-sm text-neutral-400">{footer}</div>
      )}
    </div>
  );
} 