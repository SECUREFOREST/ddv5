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
        child.type.displayName?.includes('Icon') ||
        child.props?.className?.includes('w-') ||
        child.props?.className?.includes('h-')
      );
    }
    return false;
  });

  // Always wrap children in flex container when there are multiple children
  const shouldWrapInFlex = React.Children.count(children) > 1;
  
  // Debug logging
  console.log('Button debug:', {
    childrenCount: React.Children.count(children),
    shouldWrapInFlex,
    hasIcons,
    children: React.Children.toArray(children).map(child => ({
      type: child.type?.name || child.type?.displayName || 'unknown',
      className: child.props?.className || 'none'
    }))
  });

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
      ) : shouldWrapInFlex ? (
        <div className="flex items-center justify-center gap-2">
          {children}
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