// CSRF Protection utilities

/**
 * Generate a CSRF token
 * @returns {string} - CSRF token
 */
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in session storage
 * @param {string} token - CSRF token to store
 */
export function storeCSRFToken(token) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
}

/**
 * Get stored CSRF token
 * @returns {string|null} - Stored CSRF token or null
 */
export function getCSRFToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} - Whether token is valid
 */
export function validateCSRFToken(token) {
  const storedToken = getCSRFToken();
  return storedToken && token === storedToken;
}

/**
 * Add CSRF token to request headers
 * @param {Object} config - Axios config
 * @returns {Object} - Updated config with CSRF token
 */
export function addCSRFToken(config) {
  const token = getCSRFToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
}

/**
 * Initialize CSRF protection
 * @returns {Promise<string>} - Generated CSRF token
 */
export async function initializeCSRF() {
  try {
    // Try to get token from server first
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      storeCSRFToken(token);
      return token;
    }
  } catch (error) {
    console.warn('Failed to get CSRF token from server, generating client-side token');
  }
  
  // Fallback to client-side token generation
  const token = generateCSRFToken();
  storeCSRFToken(token);
  return token;
}

/**
 * CSRF middleware for axios
 */
export const csrfMiddleware = {
  request: (config) => {
    // Skip CSRF for GET requests and external URLs
    if (config.method === 'get' || !config.url.startsWith('/api/')) {
      return config;
    }
    
    return addCSRFToken(config);
  },
  
  response: (response) => {
    // Handle CSRF token refresh
    const newToken = response.headers['x-csrf-token'];
    if (newToken) {
      storeCSRFToken(newToken);
    }
    return response;
  },
  
  error: (error) => {
    // Handle CSRF validation errors
    if (error.response?.status === 403 && error.response?.data?.error === 'CSRF token invalid') {
      // Clear stored token and redirect to login
      sessionStorage.removeItem('csrf_token');
      window.location.href = '/login?error=csrf_invalid';
    }
    return Promise.reject(error);
  }
}; 