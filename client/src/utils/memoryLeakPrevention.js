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
    const timerId = window.setTimeout(callback, delay, ...args);
    timersRef.current.add(timerId);
    return timerId;
  }, []);
  
  const setInterval = useCallback((callback, delay, ...args) => {
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
    const key = `${element}-${event}`;
    if (listenersRef.current.has(key)) {
      const { element: existingElement, event: existingEvent, handler: existingHandler, options: existingOptions } = listenersRef.current.get(key);
      existingElement.removeEventListener(existingEvent, existingHandler, existingOptions);
      listenersRef.current.delete(key);
    }
  }, []);
  
  const clearAllListeners = useCallback(() => {
    listenersRef.current.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
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
    
    const socket = new WebSocket(url);
    socketRef.current = socket;
    
    // Set up event handlers
    if (options.onOpen) socket.onopen = options.onOpen;
    if (options.onMessage) socket.onmessage = options.onMessage;
    if (options.onClose) socket.onclose = options.onClose;
    if (options.onError) socket.onerror = options.onError;
    
    return socket;
  }, []);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  const send = useCallback((data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
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
    if (!enabled || delay === null) {
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
    if (!enabled || delay === null) {
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
    subscriptionsRef.current.add(subscription);
    return () => {
      subscriptionsRef.current.delete(subscription);
      if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);
  
  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach(subscription => {
      if (typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
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
    const cleanup = effect();
    
    if (cleanup) {
      registerCleanup(cleanup, componentName);
      return () => {
        cleanup();
      };
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
          cleanup();
        } catch (error) {
          console.error(`Error during cleanup for ${componentName}:`, error);
        }
      });
      cleanupFunctionsRef.current.clear();
    };
  }, [componentName]);
  
  const addCleanup = useCallback((cleanup) => {
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
  }
};

// Register global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', executeAllCleanups);
  window.addEventListener('unload', executeAllCleanups);
} 