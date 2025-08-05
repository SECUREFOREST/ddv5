import React from 'react';

/**
 * Enhanced Button component with all common variants
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'gradient-purple' | 'gradient-red' | 'gradient-blue'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} loading - Show loading state
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 * @param {object} props - Other button props
 */
export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  loading = false,
  children, 
  className = '', 
  ...props 
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary to-primary-dark text-primary-contrast hover:from-primary-dark hover:to-primary';
      case 'secondary':
        return 'bg-neutral-700 text-white hover:bg-neutral-600';
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800';
      case 'gradient-purple':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700';
      case 'gradient-red':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800';
      case 'gradient-blue':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700';
      default:
        return 'bg-gradient-to-r from-primary to-primary-dark text-primary-contrast hover:from-primary-dark hover:to-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm font-semibold';
      case 'lg':
        return 'px-8 py-4 text-lg font-bold';
      default:
        return 'px-6 py-4 font-semibold text-base';
    }
  };

  const baseClasses = `
    rounded-xl transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
    transform hover:scale-105 shadow-lg disabled:transform-none disabled:hover:scale-100
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  // Helper function to check if children contain icons
  const hasIcons = React.Children.toArray(children).some(child => {
    if (React.isValidElement(child)) {
      // Check if it's a Heroicon or any element with icon-related classes
      return child.type && (
        child.type.name?.includes('Icon') || 
        child.props?.className?.includes('w-') ||
        child.props?.className?.includes('h-')
      );
    }
    return false;
  });

  // Ensure children are properly structured for horizontal layout
  const renderChildren = () => {
    if (!hasIcons) return children;
    
    const childrenArray = React.Children.toArray(children);
    const iconElements = [];
    const textElements = [];
    
    childrenArray.forEach(child => {
      if (React.isValidElement(child) && (
        child.type.name?.includes('Icon') || 
        child.props?.className?.includes('w-') ||
        child.props?.className?.includes('h-')
      )) {
        iconElements.push(child);
      } else {
        textElements.push(child);
      }
    });
    
    return (
      <>
        {iconElements}
        {textElements}
      </>
    );
  };

  return (
    <button 
      className={baseClasses}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : hasIcons ? (
        <div className="inline-flex items-center justify-center gap-2">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child) && (
              child.type.name?.includes('Icon') || 
              child.props?.className?.includes('w-') ||
              child.props?.className?.includes('h-')
            )) {
              // Apply specific alignment for icons
              return React.cloneElement(child, {
                ...child.props,
                className: `${child.props.className || ''} flex-shrink-0`
              });
            }
            return child;
          })}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Convenience exports for specific button types
export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export function SuccessButton(props) {
  return <Button variant="success" {...props} />;
}

export function WarningButton(props) {
  return <Button variant="warning" {...props} />;
}

export function GradientPurpleButton(props) {
  return <Button variant="gradient-purple" {...props} />;
}

export function GradientRedButton(props) {
  return <Button variant="gradient-red" {...props} />;
}

export function GradientBlueButton(props) {
  return <Button variant="gradient-blue" {...props} />;
} 