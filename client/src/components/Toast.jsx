import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const TOAST_TYPES = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-green-600/90 border-green-500/50 text-green-100',
    iconClassName: 'text-green-400'
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-red-600/90 border-red-500/50 text-red-100',
    iconClassName: 'text-red-400'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'bg-yellow-600/90 border-yellow-500/50 text-yellow-100',
    iconClassName: 'text-yellow-400'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-blue-600/90 border-blue-500/50 text-blue-100',
    iconClassName: 'text-blue-400'
  }
};

/**
 * Toast component
 */
export function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = toastConfig.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm min-w-[300px] max-w-[400px] ${toastConfig.className} ${className}`}>
        <Icon className={`w-5 h-5 ${toastConfig.iconClassName} flex-shrink-0`} />
        <span className="text-sm font-medium flex-1 break-words">{message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Toast container for managing multiple toasts
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => addToast(message, 'success', duration);
  const showError = (message, duration) => addToast(message, 'error', duration);
  const showWarning = (message, duration) => addToast(message, 'warning', duration);
  const showInfo = (message, duration) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
} 