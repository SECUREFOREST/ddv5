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
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()} {...props}>
      {image && (
        <div className="mb-4">
          {typeof image === 'string' ? (
            <img src={image} alt="" className="w-full object-cover" />
          ) : image}
        </div>
      )}
      {header && (
        <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
          <span className="text-lg font-semibold">{header}</span>
        </div>
      )}
      <div className="mb-2">{children}</div>
      {footer && (
        <div className="bg-[#3c3c3c] text-[#888] border-t border-[#282828] px-[15px] py-[10px] -mx-[15px] mb-[-15px] mt-4 rounded-b-none text-sm">{footer}</div>
      )}
    </div>
  );
} 