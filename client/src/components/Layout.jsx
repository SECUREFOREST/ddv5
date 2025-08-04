import React from 'react';

/**
 * Page Header component
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
export function PageHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg text-neutral-400 mb-6">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * Section Header component
 * @param {string} title - Section title
 * @param {string} subtitle - Section subtitle
 * @param {React.ReactNode} children - Header content
 * @param {string} className - Additional CSS classes
 */
export function SectionHeader({ title, subtitle, children, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-neutral-400 mb-4">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

/**
 * Content Container component
 * @param {React.ReactNode} children - Container content
 * @param {string} maxWidth - Max width class
 * @param {string} className - Additional CSS classes
 */
export function ContentContainer({ children, maxWidth = 'max-w-7xl', className = '' }) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className={`${maxWidth} mx-auto space-y-8`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Main Content component with accessibility
 * @param {React.ReactNode} children - Main content
 * @param {string} className - Additional CSS classes
 */
export function MainContent({ children, className = '' }) {
  return (
    <main 
      id="main-content" 
      tabIndex="-1" 
      role="main" 
      className={`${className}`}
    >
      {children}
    </main>
  );
}

/**
 * Grid Layout component
 * @param {number} cols - Number of columns (1-12)
 * @param {React.ReactNode} children - Grid content
 * @param {string} gap - Gap size
 * @param {string} className - Additional CSS classes
 */
export function Grid({ cols = 1, children, gap = 'gap-6', className = '' }) {
  const getGridCols = () => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 6: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6';
      case 12: return 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12';
      default: return 'grid-cols-1';
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Flex Layout component
 * @param {string} direction - Flex direction
 * @param {string} justify - Justify content
 * @param {string} align - Align items
 * @param {string} gap - Gap size
 * @param {React.ReactNode} children - Flex content
 * @param {string} className - Additional CSS classes
 */
export function Flex({ 
  direction = 'row', 
  justify = 'start', 
  align = 'start', 
  gap = 'gap-4',
  children, 
  className = '' 
}) {
  const getDirection = () => {
    switch (direction) {
      case 'col': return 'flex-col';
      case 'row-reverse': return 'flex-row-reverse';
      case 'col-reverse': return 'flex-col-reverse';
      default: return 'flex-row';
    }
  };

  const getJustify = () => {
    switch (justify) {
      case 'center': return 'justify-center';
      case 'end': return 'justify-end';
      case 'between': return 'justify-between';
      case 'around': return 'justify-around';
      case 'evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };

  const getAlign = () => {
    switch (align) {
      case 'center': return 'items-center';
      case 'end': return 'items-end';
      case 'stretch': return 'items-stretch';
      case 'baseline': return 'items-baseline';
      default: return 'items-start';
    }
  };

  return (
    <div className={`flex ${getDirection()} ${getJustify()} ${getAlign()} ${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Spacer component for consistent spacing
 * @param {string} size - Spacing size
 * @param {string} className - Additional CSS classes
 */
export function Spacer({ size = 'md', className = '' }) {
  const getSize = () => {
    switch (size) {
      case 'xs': return 'h-2';
      case 'sm': return 'h-4';
      case 'md': return 'h-8';
      case 'lg': return 'h-12';
      case 'xl': return 'h-16';
      default: return 'h-8';
    }
  };

  return <div className={`${getSize()} ${className}`} />;
} 