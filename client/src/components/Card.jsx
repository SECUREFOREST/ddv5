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
    <div
      className={`bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 w-full ${className}`.trim()}
      {...props}
    >
      {image && (
        <div className="mb-6 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8">
          {typeof image === 'string' ? (
            <img
              src={image}
              alt=""
              className="w-full h-48 sm:h-64 object-cover rounded-t-2xl"
              loading="lazy"
              srcSet={image.replace(/\.(jpg|jpeg|png)$/, '.webp') + ' 800w, ' + image + ' 400w'}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : image}
        </div>
      )}
      {header && (
        <div className="bg-neutral-800/50 text-neutral-200 border-b border-neutral-700/50 px-6 py-4 -mx-6 sm:-mx-8 mt-0 mb-6 rounded-t-2xl">
          <span className="text-lg font-semibold">{header}</span>
        </div>
      )}
      <div className="space-y-4">{children}</div>
      {footer && (
        <div className="bg-neutral-800/50 text-neutral-300 border-t border-neutral-700/50 px-6 py-4 -mx-6 sm:-mx-8 mt-6 mb-0 rounded-b-2xl text-sm">
          {footer}
        </div>
      )}
    </div>
  );
} 