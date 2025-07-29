import React from 'react';

/**
 * Enhanced Card component with modern design patterns
 * @param {React.ReactNode} header - Optional card header
 * @param {React.ReactNode} image - Optional image at the top
 * @param {React.ReactNode} children - Card body content
 * @param {React.ReactNode} footer - Optional card footer
 * @param {string} className - Additional classes
 * @param {string} variant - 'default' | 'elevated' | 'glass' | 'bordered'
 * @param {boolean} interactive - Add hover effects
 * @param {boolean} loading - Show loading skeleton
 */
export default function Card({ 
  header, 
  image, 
  children, 
  footer, 
  className = '', 
  variant = 'default',
  interactive = false,
  loading = false,
  ...props 
}) {
  const baseClasses = 'bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl shadow-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border-neutral-700/50',
    elevated: 'bg-gradient-to-br from-neutral-900/90 to-neutral-800/70 border-neutral-600/50 shadow-xl hover:shadow-2xl',
    glass: 'bg-white/5 backdrop-blur-lg border-white/10 shadow-xl',
    bordered: 'bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border-2 border-primary/30 shadow-lg',
  };
  
  const interactiveClasses = interactive ? 'hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : '';
  const variantClass = variantClasses[variant] || variantClasses.default;
  
  if (loading) {
    return (
      <div className={`${baseClasses} ${variantClass} ${className} animate-pulse`} {...props}>
        <div className="p-6 sm:p-8">
          <div className="h-6 bg-neutral-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClass} ${interactiveClasses} ${className}`.trim()}
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
      <div className="p-6 sm:p-8 space-y-6">{children}</div>
      {footer && (
        <div className="bg-neutral-800/50 text-neutral-300 border-t border-neutral-700/50 px-6 py-4 -mx-6 sm:-mx-8 mt-6 mb-0 rounded-b-2xl text-sm">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Stats Card variant for dashboard metrics
 */
export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  className = '', 
  ...props 
}) {
  return (
    <Card className={`${className} hover:shadow-xl transition-all duration-300`} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <span className="mr-1">{trend > 0 ? '↗' : '↘'}</span>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary/20 rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Interactive Card for clickable content
 */
export function InteractiveCard({ 
  children, 
  onClick, 
  className = '', 
  ...props 
}) {
  return (
    <Card 
      className={`${className} cursor-pointer`} 
      interactive={true}
      onClick={onClick}
      {...props}
    >
      {children}
    </Card>
  );
} 