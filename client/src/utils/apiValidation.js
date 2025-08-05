import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';

/**
 * Validates and normalizes API responses
 * @param {any} response - The API response object
 * @param {string} expectedType - The expected data type from API_RESPONSE_TYPES
 * @returns {any} - Normalized data or empty array/object
 */
export function validateApiResponse(response, expectedType) {
  if (!response) {
    console.warn(`API response validation: No response received for type ${expectedType}`);
    return getDefaultValue(expectedType);
  }

  // Handle different response formats
  let data = null;
  
  if (response.data !== undefined) {
    // Standard format: { data: ..., pagination: ... }
    data = response.data;
  } else if (Array.isArray(response)) {
    // Direct array format
    data = response;
  } else {
    // Fallback to response itself
    data = response;
  }

  if (!data) {
    console.warn(`API response validation: No data in response for type ${expectedType}`);
    return getDefaultValue(expectedType);
  }

  switch (expectedType) {
    case API_RESPONSE_TYPES.DARE_ARRAY:
      return Array.isArray(data.dares) ? data.dares : 
             Array.isArray(data) ? data : [];
    
    case API_RESPONSE_TYPES.SWITCH_GAME_ARRAY:
      return Array.isArray(data.games) ? data.games : 
             Array.isArray(data) ? data : [];
    
    case API_RESPONSE_TYPES.USER_ARRAY:
      return Array.isArray(data.users) ? data.users : 
             Array.isArray(data) ? data : [];
    
    case API_RESPONSE_TYPES.ACTIVITY_ARRAY:
      return Array.isArray(data.activities) ? data.activities : 
             Array.isArray(data) ? data : [];
    
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
 * Validates pagination data in API response
 * @param {Object} response - The API response object
 * @returns {Object} - Validated pagination object
 */
export function validatePagination(response) {
  if (!response || !response.pagination) {
    return { page: 1, limit: 10, total: 0, pages: 0 };
  }

  const { page, limit, total, pages } = response.pagination;
  
  return {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    total: parseInt(total) || 0,
    pages: parseInt(pages) || 0
  };
}

/**
 * Creates a standardized API response object
 * @param {any} data - The response data
 * @param {string} type - The response type
 * @param {Object} pagination - Optional pagination data
 * @returns {Object} - Standardized response object
 */
export function createStandardResponse(data, type, pagination = null) {
  const response = {
    data: validateApiResponse(data, type),
    type,
    timestamp: new Date().toISOString()
  };

  if (pagination) {
    response.pagination = validatePagination({ pagination });
  }

  return response;
}

/**
 * Safely extracts data from API response with fallback
 * @param {Object} response - The API response
 * @param {string} key - The data key to extract
 * @param {any} fallback - Fallback value if key doesn't exist
 * @returns {any} - Extracted data or fallback
 */
export function safeExtract(response, key, fallback = []) {
  if (!response || !response.data) return fallback;
  
  const data = response.data[key];
  return data !== undefined ? data : fallback;
}

/**
 * Validates user ID field (handles both 'id' and '_id')
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