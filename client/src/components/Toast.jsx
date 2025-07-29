import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const TOAST_TYPES = {
  success: {
    icon: CheckCircleIcon,
    className: 'bg-gradient-to-r from-green-600/90 to-green-700/90 border-green-500/50 text-green-100 shadow-green-500/25',
    iconClassName: 'text-green-400',
    progressColor: 'bg-green-400'
  },
  error: {
    icon: XCircleIcon,
    className: 'bg-gradient-to-r from-red-600/90 to-red-700/90 border-red-500/50 text-red-100 shadow-red-500/25',
    iconClassName: 'text-red-400',
    progressColor: 'bg-red-400'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    className: 'bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 border-yellow-500/50 text-yellow-100 shadow-yellow-500/25',
    iconClassName: 'text-yellow-400',
    progressColor: 'bg-yellow-400'
  },
  info: {
    icon: InformationCircleIcon,
    className: 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 border-blue-500/50 text-blue-100 shadow-blue-500/25',
    iconClassName: 'text-blue-400',
    progressColor: 'bg-blue-400'
  }
};

/**
 * Enhanced Toast component with progress bar and better animations
 */
export function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  className = '',
  showProgress = true
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const toastConfig = TOAST_TYPES[type] || TOAST_TYPES.info;
  const Icon = toastConfig.icon;

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + duration;
      
      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / duration) * 100;
        setProgress(newProgress);
        
        if (remaining > 0) {
          requestAnimationFrame(updateProgress);
        }
      };
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      
      requestAnimationFrame(updateProgress);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`flex items-start gap-4 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-sm max-w-sm ${toastConfig.className} ${className}`}>
        <Icon className={`w-6 h-6 ${toastConfig.iconClassName} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
          {showProgress && duration > 0 && (
            <div className="mt-3 w-full bg-white/20 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-full ${toastConfig.progressColor} transition-all duration-100 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label="Close notification"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Enhanced Toast container for managing multiple toasts
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="transform transition-all duration-300"
          style={{
            transform: `translateY(${index * 8}px)`,
            zIndex: toasts.length - index
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
            showProgress={toast.showProgress !== false}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Enhanced Hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const [nextId, setNextId] = useState(1);

  const addToast = (message, type = 'info', duration = 5000, options = {}) => {
    const id = nextId;
    setNextId(prev => prev + 1);
    
    const newToast = {
      id,
      message,
      type,
      duration,
      ...options
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration, options) => addToast(message, 'success', duration, options);
  const showError = (message, duration, options) => addToast(message, 'error', duration, options);
  const showWarning = (message, duration, options) => addToast(message, 'warning', duration, options);
  const showInfo = (message, duration, options) => addToast(message, 'info', duration, options);

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

/**
 * Toast Provider for global toast management
 */
export function ToastProvider({ children }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
} 