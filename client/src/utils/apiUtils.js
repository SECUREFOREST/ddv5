import { ERROR_MESSAGES, SUCCESS_MESSAGES, API_RESPONSE_TYPES } from '../constants';

/**
 * Validates and normalizes API responses
 * @param {any} data - The response data to validate
 * @param {string} expectedType - The expected data type from API_RESPONSE_TYPES
 * @returns {any} - Normalized data or empty array/object
 */
export function validateApiResponse(data, expectedType) {
  if (!data) {
    console.warn(`API response validation: No data received for type ${expectedType}`);
    return getDefaultValue(expectedType);
  }

  switch (expectedType) {
    case API_RESPONSE_TYPES.DARE_ARRAY:
    case API_RESPONSE_TYPES.SWITCH_GAME_ARRAY:
    case API_RESPONSE_TYPES.USER_ARRAY:
    case API_RESPONSE_TYPES.ACTIVITY_ARRAY:
      return Array.isArray(data) ? data : [];
    
    case API_RESPONSE_TYPES.DARE:
    case API_RESPONSE_TYPES.SWITCH_GAME:
    case API_RESPONSE_TYPES.USER:
    case API_RESPONSE_TYPES.STATS:
    case API_RESPONSE_TYPES.ACTIVITY:
      return typeof data === 'object' && data !== null ? data : getDefaultValue(expectedType);
    
    default:
      console.warn(`API response validation: Unknown type ${expectedType}`);
      return data;
  }
}

/**
 * Gets default value for a given API response type
 * @param {string} type - The API response type
 * @returns {any} - Default value
 */
function getDefaultValue(type) {
  switch (type) {
    case API_RESPONSE_TYPES.DARE_ARRAY:
    case API_RESPONSE_TYPES.SWITCH_GAME_ARRAY:
    case API_RESPONSE_TYPES.USER_ARRAY:
    case API_RESPONSE_TYPES.ACTIVITY_ARRAY:
      return [];
    
    case API_RESPONSE_TYPES.DARE:
    case API_RESPONSE_TYPES.SWITCH_GAME:
    case API_RESPONSE_TYPES.USER:
    case API_RESPONSE_TYPES.STATS:
    case API_RESPONSE_TYPES.ACTIVITY:
      return null;
    
    default:
      return null;
  }
}

/**
 * Handles API errors consistently
 * @param {Error} error - The error object
 * @param {string} context - Context for the error (e.g., 'fetching dares')
 * @returns {string} - User-friendly error message
 */
export function handleApiError(error, context = '') {
  console.error(`API Error in ${context}:`, error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return ERROR_MESSAGES.AUTHENTICATION_FAILED;
      case 403:
        return ERROR_MESSAGES.PERMISSION_DENIED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 429:
        return ERROR_MESSAGES.RATE_LIMITED;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return data?.error || ERROR_MESSAGES.SERVER_ERROR;
    }
  } else if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT;
  } else if (error.message) {
    return error.message;
  } else {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
}

/**
 * Normalizes user ID field (handles both 'id' and '_id')
 * @param {Object} user - User object
 * @returns {string|null} - Normalized user ID
 */
export function normalizeUserId(user) {
  if (!user) return null;
  return user.id || user._id || null;
}

/**
 * Validates user object structure
 * @param {Object} user - User object to validate
 * @returns {boolean} - Whether user object is valid
 */
export function validateUserObject(user) {
  if (!user) return false;
  
  const userId = normalizeUserId(user);
  if (!userId) return false;
  
  // Check for required fields
  if (!user.username && !user.fullName) return false;
  
  return true;
}

/**
 * Creates a standardized API call wrapper with error handling
 * @param {Function} apiCall - The API call function
 * @param {string} context - Context for error messages
 * @param {string} expectedType - Expected response type
 * @returns {Promise} - Promise with normalized data
 */
export async function safeApiCall(apiCall, context, expectedType) {
  try {
    const response = await apiCall();
    const validatedData = validateApiResponse(response.data, expectedType);
    return { data: validatedData, error: null };
  } catch (error) {
    const errorMessage = handleApiError(error, context);
    return { data: getDefaultValue(expectedType), error: errorMessage };
  }
}

/**
 * Debounces function calls to prevent excessive API requests
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles function calls to limit API request frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Validates pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} - Validated pagination parameters
 */
export function validatePaginationParams(params = {}) {
  const { page = 1, limit = 20 } = params;
  
  return {
    page: Math.max(1, parseInt(page) || 1),
    limit: Math.min(100, Math.max(5, parseInt(limit) || 20))
  };
}

/**
 * Formats API response for consistent structure
 * @param {any} data - Response data
 * @param {string} type - Response type
 * @param {Object} meta - Additional metadata
 * @returns {Object} - Formatted response
 */
export function formatApiResponse(data, type, meta = {}) {
  return {
    data: validateApiResponse(data, type),
    type,
    timestamp: new Date().toISOString(),
    ...meta
  };
} 