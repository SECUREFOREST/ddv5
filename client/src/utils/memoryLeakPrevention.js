import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Memory leak prevention utilities
 */

// Global cleanup registry
const cleanupRegistry = new Map();
let cleanupId = 0;

/**
 * Register a cleanup function that will be called when the component unmounts
 * @param {Function} cleanupFn - Function to call for cleanup
 * @param {string} componentName - Name of the component for debugging
 * @returns {Function} - Function to unregister the cleanup
 */
export function registerCleanup(cleanupFn, componentName = 'Unknown') {
  if (typeof cleanupFn !== 'function') {
    console.warn('registerCleanup: cleanupFn must be a function');
    return () => {};
  }
  
  const id = ++cleanupId;
  cleanupRegistry.set(id, { fn: cleanupFn, component: componentName });
  
  return () => {
    cleanupRegistry.delete(id);
  };
}

/**
 * Execute all registered cleanup functions
 * This should be called when the app is shutting down
 */
export function executeAllCleanups() {
  console.log(`Executing ${cleanupRegistry.size} cleanup functions...`);
  
  for (const [id, { fn, component }] of cleanupRegistry.entries()) {
    try {
      fn();
      console.log(`Cleaned up: ${component}`);
    } catch (error) {
      console.error(`Error during cleanup for ${component}:`, error);
    }
  }
  
  cleanupRegistry.clear();
}

/**
 * Hook for managing timers with automatic cleanup
 */
export function useTimer() {
  const timersRef = useRef(new Set());
  
  const setTimeout = useCallback((callback, delay, ...args) => {
    if (typeof callback !== 'function') {
      console.warn('useTimer.setTimeout: callback must be a function');
      return null;
    }
    
    const timerId = window.setTimeout(callback, delay, ...args);
    timersRef.current.add(timerId);
    return timerId;
  }, []);
  
  const setInterval = useCallback((callback, delay, ...args) => {
    if (typeof callback !== 'function') {
      console.warn('useTimer.setInterval: callback must be a function');
      return null;
    }
    
    const timerId = window.setInterval(callback, delay, ...args);
    timersRef.current.add(timerId);
    return timerId;
  }, []);
  
  const clearTimer = useCallback((timerId) => {
    if (timersRef.current.has(timerId)) {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
      timersRef.current.delete(timerId);
    }
  }, []);
  
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timerId => {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    });
    timersRef.current.clear();
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  return {
    setTimeout,
    setInterval,
    clearTimer,
    clearAllTimers
  };
}

/**
 * Hook for managing event listeners with automatic cleanup
 */
export function useEventListener() {
  const listenersRef = useRef(new Map());
  
  const addEventListener = useCallback((element, event, handler, options) => {
    if (!element || typeof element.addEventListener !== 'function') {
      console.warn('useEventListener.addEventListener: element must be a valid DOM element');
      return;
    }
    
    if (typeof handler !== 'function') {
      console.warn('useEventListener.addEventListener: handler must be a function');
      return;
    }
    
    const key = `${element}-${event}`;
    
    // Remove existing listener if any
    if (listenersRef.current.has(key)) {
      const { element: existingElement, event: existingEvent, handler: existingHandler, options: existingOptions } = listenersRef.current.get(key);
      existingElement.removeEventListener(existingEvent, existingHandler, existingOptions);
    }
    
    // Add new listener
    element.addEventListener(event, handler, options);
    listenersRef.current.set(key, { element, event, handler, options });
  }, []);
  
  const removeEventListener = useCallback((element, event, handler, options) => {
    if (!element || typeof element.removeEventListener !== 'function') {
      return;
    }
    
    const key = `${element}-${event}`;
    if (listenersRef.current.has(key)) {
      const { element: existingElement, event: existingEvent, handler: existingHandler, options: existingOptions } = listenersRef.current.get(key);
      existingElement.removeEventListener(existingEvent, existingHandler, existingOptions);
      listenersRef.current.delete(key);
    }
  }, []);
  
  const clearAllListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, event, handler, options }) => {
      try {
        element.removeEventListener(event, handler, options);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    });
    listenersRef.current.clear();
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllListeners();
    };
  }, [clearAllListeners]);
  
  return {
    addEventListener,
    removeEventListener,
    clearAllListeners
  };
}

/**
 * Hook for managing WebSocket connections with automatic cleanup
 */
export function useWebSocket() {
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  const connect = useCallback((url, options = {}) => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;
      
      // Set up event handlers
      if (options.onOpen) socket.onopen = options.onOpen;
      if (options.onMessage) socket.onmessage = options.onMessage;
      if (options.onClose) socket.onclose = options.onClose;
      if (options.onError) socket.onerror = options.onError;
      
      return socket;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      return null;
    }
  }, []);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  const send = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(data);
      } catch (error) {
        console.error('Error sending WebSocket data:', error);
      }
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    connect,
    disconnect,
    send,
    socket: socketRef.current
  };
}

/**
 * Hook for managing intervals with automatic cleanup
 */
export function useInterval(callback, delay, enabled = true) {
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (!enabled || delay === null || delay === undefined) {
      return;
    }
    
    if (typeof callback !== 'function') {
      console.warn('useInterval: callback must be a function');
      return;
    }
    
    intervalRef.current = setInterval(callback, delay);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callback, delay, enabled]);
  
  const clearInterval = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  return { clearInterval };
}

/**
 * Hook for managing timeouts with automatic cleanup
 */
export function useTimeout(callback, delay, enabled = true) {
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    if (!enabled || delay === null || delay === undefined) {
      return;
    }
    
    if (typeof callback !== 'function') {
      console.warn('useTimeout: callback must be a function');
      return;
    }
    
    timeoutRef.current = setTimeout(callback, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [callback, delay, enabled]);
  
  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  return { clearTimeout };
}

/**
 * Hook for managing AbortController with automatic cleanup
 */
export function useAbortController() {
  const abortControllerRef = useRef(null);
  
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return abortControllerRef.current;
}

/**
 * Hook for managing subscriptions with automatic cleanup
 */
export function useSubscription() {
  const subscriptionsRef = useRef(new Set());
  
  const subscribe = useCallback((subscription) => {
    if (!subscription) {
      console.warn('useSubscription.subscribe: subscription is required');
      return () => {};
    }
    
    subscriptionsRef.current.add(subscription);
    return () => {
      subscriptionsRef.current.delete(subscription);
      if (typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    };
  }, []);
  
  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      if (typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      }
    });
    subscriptionsRef.current.clear();
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);
  
  return {
    subscribe,
    unsubscribeAll
  };
}

/**
 * Enhanced useEffect with automatic cleanup registration
 */
export function useSafeEffect(effect, dependencies = [], componentName = 'Unknown') {
  useEffect(() => {
    try {
      const cleanup = effect();
      
      if (cleanup && typeof cleanup === 'function') {
        registerCleanup(cleanup, componentName);
        return () => {
          cleanup();
        };
      }
    } catch (error) {
      console.error(`Error in useSafeEffect for ${componentName}:`, error);
    }
  }, dependencies);
}

/**
 * Hook for managing component lifecycle with cleanup
 */
export function useComponentLifecycle(componentName = 'Unknown') {
  const isMountedRef = useRef(true);
  const cleanupFunctionsRef = useRef(new Set());
  
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Execute all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        } catch (error) {
          console.error(`Error during cleanup for ${componentName}:`, error);
        }
      });
      cleanupFunctionsRef.current.clear();
    };
  }, [componentName]);
  
  const addCleanup = useCallback((cleanup) => {
    if (typeof cleanup !== 'function') {
      console.warn('useComponentLifecycle.addCleanup: cleanup must be a function');
      return () => {};
    }
    
    cleanupFunctionsRef.current.add(cleanup);
    return () => {
      cleanupFunctionsRef.current.delete(cleanup);
    };
  }, []);
  
  const isMounted = useCallback(() => {
    return isMountedRef.current;
  }, []);
  
  return {
    addCleanup,
    isMounted
  };
}

/**
 * Utility to check if a component is still mounted before updating state
 */
export function useSafeState(initialState) {
  const [state, setState] = useState(initialState);
  const { isMounted } = useComponentLifecycle();
  
  const safeSetState = useCallback((newState) => {
    if (isMounted()) {
      setState(newState);
    }
  }, [isMounted]);
  
  return [state, safeSetState];
}

/**
 * Memory leak detection utilities
 */
export const memoryLeakUtils = {
  /**
   * Get current cleanup registry size
   */
  getCleanupCount() {
    return cleanupRegistry.size;
  },
  
  /**
   * Log current cleanup registry for debugging
   */
  logCleanupRegistry() {
    console.log('Current cleanup registry:', Array.from(cleanupRegistry.entries()).map(([id, { component }]) => component));
  },
  
  /**
   * Force cleanup of all registered cleanups
   */
  forceCleanup() {
    executeAllCleanups();
  },
  
  /**
   * Get detailed cleanup registry information
   */
  getCleanupDetails() {
    return Array.from(cleanupRegistry.entries()).map(([id, { component }]) => ({
      id,
      component
    }));
  },
  
  /**
   * Check if there are any potential memory leaks
   */
  checkForLeaks() {
    const count = cleanupRegistry.size;
    if (count > 10) {
      console.warn(`Potential memory leak detected: ${count} cleanup functions registered`);
      this.logCleanupRegistry();
    }
    return count;
  }
};

/**
 * Debug hook for tracking component lifecycle
 */
export function useDebugLifecycle(componentName) {
  useEffect(() => {
    console.log(`[DEBUG] ${componentName} mounted`);
    
    return () => {
      console.log(`[DEBUG] ${componentName} unmounted`);
    };
  }, [componentName]);
}

/**
 * Enhanced ErrorBoundary with memory leak detection
 */
export function useErrorBoundary() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  
  const handleError = useCallback((error, errorInfo) => {
    console.error('Error caught by useErrorBoundary:', error, errorInfo);
    setError(error);
    setHasError(true);
    
    // Log memory leak information when errors occur
    memoryLeakUtils.checkForLeaks();
  }, []);
  
  return {
    hasError,
    error,
    handleError
  };
}

// Register global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', executeAllCleanups);
  window.addEventListener('unload', executeAllCleanups);
  
  // Add global error handler for memory leak detection
  window.addEventListener('error', (event) => {
    console.error('Global error detected:', event.error);
    memoryLeakUtils.checkForLeaks();
  });
  
  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    memoryLeakUtils.checkForLeaks();
  });
} 