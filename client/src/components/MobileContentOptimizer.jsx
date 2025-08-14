import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * Mobile Content Optimizer Component
 * Provides mobile-first content formatting strategies for better readability and engagement
 */
export function MobileContentOptimizer({ children, variant = 'default', className = '' }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  const getMobileClasses = () => {
    const baseClasses = 'mobile-optimized';
    
    switch (variant) {
      case 'text':
        return `${baseClasses} mobile-text-optimized`;
      case 'card':
        return `${baseClasses} mobile-card-optimized`;
      case 'list':
        return `${baseClasses} mobile-list-optimized`;
      case 'form':
        return `${baseClasses} mobile-form-optimized`;
      case 'navigation':
        return `${baseClasses} mobile-nav-optimized`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={`${getMobileClasses()} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Mobile-Optimized Text Component
 * Implements mobile-first typography and spacing
 */
export function MobileText({ 
  children, 
  variant = 'body', 
  size = 'base',
  weight = 'normal',
  className = '',
  ...props 
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  const getTextClasses = () => {
    const baseClasses = 'mobile-text';
    
    // Mobile-first typography scale
    const sizeClasses = {
      xs: 'text-xs sm:text-sm',
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      '2xl': 'text-2xl sm:text-3xl',
      '3xl': 'text-3xl sm:text-4xl'
    };

    // Mobile-optimized weights
    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal sm:font-medium',
      medium: 'font-medium sm:font-semibold',
      semibold: 'font-semibold sm:font-bold',
      bold: 'font-bold'
    };

    // Variant-specific styling
    const variantClasses = {
      body: 'leading-relaxed sm:leading-relaxed',
      heading: 'leading-tight sm:leading-tight',
      caption: 'leading-snug sm:leading-snug',
      quote: 'leading-relaxed sm:leading-relaxed italic',
      code: 'leading-snug sm:leading-snug font-mono'
    };

    return `${baseClasses} ${sizeClasses[size]} ${weightClasses[weight]} ${variantClasses[variant]}`;
  };

  return (
    <div 
      className={`${getTextClasses()} ${className}`}
      style={{
        // Mobile-specific text rendering optimizations
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%',
        // Optimize for mobile reading
        wordSpacing: isMobile ? '0.025em' : 'normal',
        letterSpacing: isMobile ? '0.01em' : 'normal'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-Optimized Card Component
 * Provides mobile-first card layouts with proper spacing and touch targets
 */
export function MobileCard({ 
  children, 
  variant = 'default',
  padding = 'default',
  className = '',
  ...props 
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  const getCardClasses = () => {
    const baseClasses = 'mobile-card bg-neutral-900/80 border border-neutral-700/50 rounded-2xl shadow-lg';
    
    // Mobile-optimized padding
    const paddingClasses = {
      compact: 'p-3 sm:p-4',
      default: 'p-4 sm:p-6',
      spacious: 'p-6 sm:p-8',
      full: 'p-4 sm:p-6 md:p-8'
    };

    // Variant-specific styling
    const variantClasses = {
      default: 'hover:shadow-xl transition-all duration-300',
      interactive: 'hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95',
      elevated: 'shadow-xl hover:shadow-2xl transition-all duration-300',
      subtle: 'shadow-md hover:shadow-lg transition-all duration-300'
    };

    return `${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]}`;
  };

  return (
    <div 
      className={`${getCardClasses()} ${className}`}
      style={{
        // Mobile-specific optimizations
        minHeight: isMobile ? 'auto' : undefined,
        // Ensure proper touch targets
        minTouchTarget: isMobile ? '44px' : undefined
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-Optimized List Component
 * Provides mobile-first list layouts with proper spacing and readability
 */
export function MobileList({ 
  children, 
  variant = 'default',
  spacing = 'default',
  className = '',
  ...props 
}) {
  const getListClasses = () => {
    const baseClasses = 'mobile-list';
    
    // Mobile-optimized spacing
    const spacingClasses = {
      compact: 'space-y-2 sm:space-y-3',
      default: 'space-y-3 sm:space-y-4',
      spacious: 'space-y-4 sm:space-y-6',
      relaxed: 'space-y-6 sm:space-y-8'
    };

    // Variant-specific styling
    const variantClasses = {
      default: '',
      interactive: 'divide-y divide-neutral-700/30',
      grouped: 'space-y-4 sm:space-y-6',
      timeline: 'relative space-y-4 sm:space-y-6'
    };

    return `${baseClasses} ${spacingClasses[spacing]} ${variantClasses[variant]}`;
  };

  return (
    <div className={`${getListClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Mobile-Optimized Form Component
 * Provides mobile-first form layouts with proper input sizing and spacing
 */
export function MobileForm({ 
  children, 
  layout = 'stacked',
  spacing = 'default',
  className = '',
  ...props 
}) {
  const getFormClasses = () => {
    const baseClasses = 'mobile-form';
    
    // Mobile-optimized layouts
    const layoutClasses = {
      stacked: 'space-y-4 sm:space-y-6',
      inline: 'space-y-4 sm:space-y-6 sm:grid sm:grid-cols-2 sm:gap-4',
      compact: 'space-y-3 sm:space-y-4',
      spacious: 'space-y-6 sm:space-y-8'
    };

    return `${baseClasses} ${layoutClasses[layout]}`;
  };

  return (
    <form className={`${getFormClasses()} ${className}`} {...props}>
      {children}
    </form>
  );
}

/**
 * Mobile-Optimized Navigation Component
 * Provides mobile-first navigation with proper touch targets and spacing
 */
export function MobileNavigation({ 
  children, 
  variant = 'horizontal',
  className = '',
  ...props 
}) {
  const getNavClasses = () => {
    const baseClasses = 'mobile-navigation';
    
    // Mobile-optimized navigation layouts
    const variantClasses = {
      horizontal: 'flex items-center space-x-2 sm:space-x-4',
      vertical: 'flex flex-col space-y-2 sm:space-y-4',
      tabs: 'flex space-x-1 sm:space-x-2',
      pills: 'flex flex-wrap gap-2 sm:gap-3'
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  return (
    <nav className={`${getNavClasses()} ${className}`} {...props}>
      {children}
    </nav>
  );
}

/**
 * Mobile Content Spacing Utility
 * Provides consistent mobile-first spacing throughout the app
 */
export function MobileSpacing({ 
  children, 
  size = 'default',
  direction = 'vertical',
  className = '',
  ...props 
}) {
  const getSpacingClasses = () => {
    const spacingMap = {
      xs: 'space-y-2 sm:space-y-3',
      sm: 'space-y-3 sm:space-y-4',
      default: 'space-y-4 sm:space-y-6',
      lg: 'space-y-6 sm:space-y-8',
      xl: 'space-y-8 sm:space-y-12'
    };

    const horizontalSpacingMap = {
      xs: 'space-x-2 sm:space-x-3',
      sm: 'space-x-3 sm:space-x-4',
      default: 'space-x-4 sm:space-x-6',
      lg: 'space-x-6 sm:space-x-8',
      xl: 'space-x-8 sm:space-x-12'
    };

    return direction === 'horizontal' 
      ? horizontalSpacingMap[size] 
      : spacingMap[size];
  };

  return (
    <div className={`${getSpacingClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * Mobile Content Container
 * Provides mobile-optimized content containers with proper margins and padding
 */
export function MobileContainer({ 
  children, 
  size = 'default',
  padding = 'default',
  className = '',
  ...props 
}) {
  const getContainerClasses = () => {
    const baseClasses = 'mobile-container w-full mx-auto';
    
    // Mobile-optimized container sizes
    const sizeClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      default: 'max-w-md sm:max-w-lg',
      lg: 'max-w-lg sm:max-w-xl',
      xl: 'max-w-xl sm:max-w-2xl',
      full: 'max-w-full'
    };

    // Mobile-optimized padding
    const paddingClasses = {
      none: '',
      compact: 'px-3 sm:px-4',
      default: 'px-4 sm:px-6',
      spacious: 'px-6 sm:px-8',
      full: 'px-4 sm:px-6 md:px-8'
    };

    return `${baseClasses} ${sizeClasses[size]} ${paddingClasses[padding]}`;
  };

  return (
    <div className={`${getContainerClasses()} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default MobileContentOptimizer; 