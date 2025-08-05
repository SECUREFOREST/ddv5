import { ERROR_MESSAGES } from '../constants.jsx';

/**
 * Centralized error handler for API errors
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
 * Handles specific error types with custom messages
 * @param {Error} error - The error object
 * @param {string} errorType - The type of error
 * @returns {string} - User-friendly error message
 */
export function handleSpecificError(error, errorType) {
  const errorMap = {
    'dare_not_found': ERROR_MESSAGES.DARE_NOT_FOUND,
    'user_not_found': ERROR_MESSAGES.USER_NOT_FOUND,
    'associates_load_failed': ERROR_MESSAGES.ASSOCIATES_LOAD_FAILED,
    'ongoing_dares_load_failed': ERROR_MESSAGES.ONGOING_DARES_LOAD_FAILED,
    'completed_dares_load_failed': ERROR_MESSAGES.COMPLETED_DARES_LOAD_FAILED,
    'switch_games_load_failed': ERROR_MESSAGES.SWITCH_GAMES_LOAD_FAILED,
    'public_dares_load_failed': ERROR_MESSAGES.PUBLIC_DARES_LOAD_FAILED,
    'public_switch_games_load_failed': ERROR_MESSAGES.PUBLIC_SWITCH_GAMES_LOAD_FAILED,
    'dashboard_load_failed': ERROR_MESSAGES.DASHBOARD_LOAD_FAILED,
    'dare_load_failed': ERROR_MESSAGES.DARE_LOAD_FAILED,
    'dare_details_load_failed': ERROR_MESSAGES.DARE_DETAILS_LOAD_FAILED,
    'switch_game_details_load_failed': ERROR_MESSAGES.SWITCH_GAME_DETAILS_LOAD_FAILED,
    'profile_load_failed': ERROR_MESSAGES.PROFILE_LOAD_FAILED,
    'activity_load_failed': ERROR_MESSAGES.ACTIVITY_LOAD_FAILED,
    'activity_feed_load_failed': ERROR_MESSAGES.ACTIVITY_FEED_LOAD_FAILED,
    'notifications_load_failed': ERROR_MESSAGES.NOTIFICATIONS_LOAD_FAILED,
    'leaderboard_load_failed': ERROR_MESSAGES.LEADERBOARD_LOAD_FAILED,
    'blocked_users_load_failed': ERROR_MESSAGES.BLOCKED_USERS_LOAD_FAILED,
    'recent_activity_load_failed': ERROR_MESSAGES.RECENT_ACTIVITY_LOAD_FAILED,
    'slot_privacy_load_failed': ERROR_MESSAGES.SLOT_PRIVACY_LOAD_FAILED,
    'public_content_load_failed': ERROR_MESSAGES.PUBLIC_CONTENT_LOAD_FAILED,
    'user_profile_load_failed': ERROR_MESSAGES.USER_PROFILE_LOAD_FAILED,
    'file_too_large': ERROR_MESSAGES.FILE_TOO_LARGE,
    'invalid_file_type': ERROR_MESSAGES.INVALID_FILE_TYPE,
    'password_too_weak': ERROR_MESSAGES.PASSWORD_TOO_WEAK,
    'email_already_exists': ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
    'username_already_exists': ERROR_MESSAGES.USERNAME_ALREADY_EXISTS,
    'invalid_credentials': ERROR_MESSAGES.INVALID_CREDENTIALS,
    'account_locked': ERROR_MESSAGES.ACCOUNT_LOCKED,
    'email_not_verified': ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
    'token_expired': ERROR_MESSAGES.TOKEN_EXPIRED,
    'token_invalid': ERROR_MESSAGES.TOKEN_INVALID,
    'upload_failed': ERROR_MESSAGES.UPLOAD_FAILED,
    'upload_cancelled': ERROR_MESSAGES.UPLOAD_CANCELLED,
    'action_failed': ERROR_MESSAGES.ACTION_FAILED,
    'action_cancelled': ERROR_MESSAGES.ACTION_CANCELLED,
    'action_timeout': ERROR_MESSAGES.ACTION_TIMEOUT,
    'websocket_connection_failed': ERROR_MESSAGES.WEBSOCKET_CONNECTION_FAILED,
    'websocket_disconnected': ERROR_MESSAGES.WEBSOCKET_DISCONNECTED,
    'cache_error': ERROR_MESSAGES.CACHE_ERROR,
    'bulk_action_failed': ERROR_MESSAGES.BULK_ACTION_FAILED,
    'bulk_action_partial': ERROR_MESSAGES.BULK_ACTION_PARTIAL,
    'rate_limit_exceeded': ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    'too_many_requests': ERROR_MESSAGES.TOO_MANY_REQUESTS,
    'maintenance_mode': ERROR_MESSAGES.MAINTENANCE_MODE,
    'service_unavailable': ERROR_MESSAGES.SERVICE_UNAVAILABLE
  };

  return errorMap[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Handles validation errors
 * @param {Object} validationErrors - Validation errors object
 * @returns {string} - User-friendly error message
 */
export function handleValidationError(validationErrors) {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  const errorMessages = Object.values(validationErrors).filter(Boolean);
  return errorMessages.length > 0 ? errorMessages[0] : ERROR_MESSAGES.VALIDATION_ERROR;
}

/**
 * Handles network errors
 * @param {Error} error - The network error
 * @returns {string} - User-friendly error message
 */
export function handleNetworkError(error) {
  if (error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  if (error.message.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  return ERROR_MESSAGES.NETWORK_ERROR;
}

/**
 * Handles authentication errors
 * @param {Error} error - The authentication error
 * @returns {string} - User-friendly error message
 */
export function handleAuthError(error) {
  if (error.response?.status === 401) {
    return ERROR_MESSAGES.AUTHENTICATION_FAILED;
  }
  
  if (error.response?.status === 403) {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  }
  
  if (error.message.includes('token')) {
    return ERROR_MESSAGES.TOKEN_EXPIRED;
  }
  
  return ERROR_MESSAGES.AUTHENTICATION_FAILED;
}

/**
 * Creates a standardized error object
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {any} details - Additional error details
 * @returns {Object} - Standardized error object
 */
export function createError(message, type = 'error', details = null) {
  return {
    message,
    type,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Logs error with context for debugging
 * @param {Error} error - The error object
 * @param {string} context - Error context
 * @param {Object} additionalInfo - Additional information
 */
export function logError(error, context = '', additionalInfo = {}) {
  console.error(`Error in ${context}:`, {
    error: error.message,
    stack: error.stack,
    context,
    ...additionalInfo
  });
} 