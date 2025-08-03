import React from 'react';

// Retry utility for handling failed operations

/**
 * Retry configuration options
 */
export const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: 0.1, // 10% jitter to prevent thundering herd
};

/**
 * Calculate delay with exponential backoff and jitter
 * @param {number} attempt - Current attempt number (1-based)
 * @param {Object} config - Retry configuration
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(attempt, config = RETRY_CONFIG) {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  );
  
  // Add jitter to prevent thundering herd
  const jitter = delay * config.jitter * (Math.random() - 0.5);
  return delay + jitter;
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with function result
 */
export async function retry(fn, options = {}) {
  // Ensure fn is a function
  if (typeof fn !== 'function') {
    console.error('retry: fn is not a function:', fn);
    throw new Error('Invalid function provided to retry');
  }
  
  const config = { ...RETRY_CONFIG, ...options };
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.isRateLimit || error.isAuthError || error.isValidationError) {
        throw error;
      }
      
      // Check if we should retry this error
      if (config.shouldRetry && !config.shouldRetry(error)) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === config.maxAttempts) {
        throw error;
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Retry configuration for different types of operations
 */
export const RETRY_STRATEGIES = {
  // For API calls
  api: {
    maxAttempts: 3,
    baseDelay: 1000,
    shouldRetry: (error) => {
      // Retry on network errors and 5xx server errors
      return !error.response || 
             (error.response.status >= 500 && error.response.status < 600) ||
             error.code === 'ECONNABORTED' ||
             error.message.includes('timeout');
    }
  },
  
  // For file uploads
  upload: {
    maxAttempts: 2,
    baseDelay: 2000,
    shouldRetry: (error) => {
      // Retry on network errors only
      return !error.response || error.response.status >= 500;
    }
  },
  
  // For critical operations
  critical: {
    maxAttempts: 5,
    baseDelay: 500,
    shouldRetry: (error) => {
      // Retry on most errors except auth/validation
      return !error.isAuthError && !error.isValidationError;
    }
  },
  
  // For non-critical operations
  nonCritical: {
    maxAttempts: 1,
    baseDelay: 0,
    shouldRetry: () => false
  }
};

/**
 * Retry hook for React components
 * @param {Function} operation - Operation to retry
 * @param {Object} options - Retry options
 * @returns {Object} - Retry state and functions
 */
export function useRetry(operation, options = {}) {
  const [state, setState] = React.useState({
    loading: false,
    error: null,
    attempts: 0,
    lastAttempt: null
  });
  
  const execute = React.useCallback(async (...args) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await retry(() => operation(...args), options);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null,
        attempts: 0 
      }));
      return result;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error,
        attempts: prev.attempts + 1,
        lastAttempt: Date.now()
      }));
      throw error;
    }
  }, [operation, options]);
  
  const reset = React.useCallback(() => {
    setState({
      loading: false,
      error: null,
      attempts: 0,
      lastAttempt: null
    });
  }, []);
  
  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Retry wrapper for API calls
 * @param {Function} apiCall - API call function
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with API result
 */
export function retryApiCall(apiCall, options = RETRY_STRATEGIES.api) {
  // Ensure apiCall is a function
  if (typeof apiCall !== 'function') {
    console.error('retryApiCall: apiCall is not a function:', apiCall);
    return Promise.reject(new Error('Invalid API call function'));
  }
  
  // Wrap the API call to ensure it's properly handled
  const wrappedApiCall = async () => {
    try {
      console.log('retryApiCall: Executing API call');
      const result = await apiCall();
      console.log('retryApiCall: API call successful:', result);
      return result;
    } catch (error) {
      console.error('retryApiCall: API call failed:', error);
      throw error;
    }
  };
  
  return retry(wrappedApiCall, options);
}

/**
 * Retry wrapper for file uploads
 * @param {Function} uploadCall - Upload function
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with upload result
 */
export function retryUpload(uploadCall, options = RETRY_STRATEGIES.upload) {
  return retry(uploadCall, options);
}

/**
 * Retry wrapper for critical operations
 * @param {Function} operation - Critical operation
 * @param {Object} options - Retry options
 * @returns {Promise} - Promise that resolves with operation result
 */
export function retryCritical(operation, options = RETRY_STRATEGIES.critical) {
  return retry(operation, options);
} 