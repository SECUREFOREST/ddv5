import React from 'react';

/**
 * Card component (legacy panel)
 * @param {React.ReactNode} header - Optional card header
 * @param {React.ReactNode} image - Optional image at the top
 * @param {React.ReactNode} children - Card body content
 * @param {React.ReactNode} footer - Optional card footer
 * @param {string} className - Additional classes
 */
export default function Card({ header, image, children, footer, className = '', ...props }) {
  return (
    <div className={`panel panel-default ${className}`.trim()} {...props}>
      {image && (
        <div className="panel-image">{/* No legacy class, but keep for structure */}
          {typeof image === 'string' ? (
            <img src={image} alt="" style={{ width: '100%' }} />
          ) : image}
        </div>
      )}
      {header && (
        <div className="panel-heading">
          <span className="panel-title">{header}</span>
        </div>
      )}
      <div className="panel-body">{children}</div>
      {footer && (
        <div className="panel-footer">{footer}</div>
      )}
    </div>
  );
} 