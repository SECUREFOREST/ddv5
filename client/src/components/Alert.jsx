import React from 'react';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/solid';

/**
 * Unified Alert component for all alert types
 * @param {string} type - 'error' | 'success' | 'warning' | 'info'
 * @param {string} title - Alert title (optional)
 * @param {React.ReactNode} children - Alert content
 * @param {boolean} dismissible - Whether alert can be dismissed
 * @param {function} onDismiss - Dismiss callback
 * @param {string} className - Additional CSS classes
 */
export default function Alert({ 
  type = 'info', 
  title, 
  children, 
  dismissible = false, 
  onDismiss,
  className = '' 
}) {
  const getAlertConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: XCircleIcon,
          bgClass: 'bg-red-900/20 border-red-800/30 text-red-300',
          iconClass: 'text-red-400'
        };
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgClass: 'bg-green-900/20 border-green-800/30 text-green-300',
          iconClass: 'text-green-400'
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgClass: 'bg-yellow-900/20 border-yellow-800/30 text-yellow-300',
          iconClass: 'text-yellow-400'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgClass: 'bg-blue-900/20 border-blue-800/30 text-blue-300',
          iconClass: 'text-blue-400'
        };
      default:
        return {
          icon: InformationCircleIcon,
          bgClass: 'bg-neutral-900/20 border-neutral-800/30 text-neutral-300',
          iconClass: 'text-neutral-400'
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <div className={`border rounded-xl p-4 ${config.bgClass} ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconClass} flex-shrink-0`} />
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Dismiss alert"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Convenience exports for specific alert types
export function ErrorAlert({ title, children, dismissible, onDismiss, className }) {
  return (
    <Alert 
      type="error" 
      title={title} 
      dismissible={dismissible} 
      onDismiss={onDismiss} 
      className={className}
    >
      {children}
    </Alert>
  );
}

export function SuccessAlert({ title, children, dismissible, onDismiss, className }) {
  return (
    <Alert 
      type="success" 
      title={title} 
      dismissible={dismissible} 
      onDismiss={onDismiss} 
      className={className}
    >
      {children}
    </Alert>
  );
}

export function WarningAlert({ title, children, dismissible, onDismiss, className }) {
  return (
    <Alert 
      type="warning" 
      title={title} 
      dismissible={dismissible} 
      onDismiss={onDismiss} 
      className={className}
    >
      {children}
    </Alert>
  );
}

export function InfoAlert({ title, children, dismissible, onDismiss, className }) {
  return (
    <Alert 
      type="info" 
      title={title} 
      dismissible={dismissible} 
      onDismiss={onDismiss} 
      className={className}
    >
      {children}
    </Alert>
  );
} 