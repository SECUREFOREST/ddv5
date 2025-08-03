import axios from 'axios';
import { rateLimiter } from '../utils/validation';

// Check if we're online
const isOnline = () => {
  return navigator.onLine;
};

// Retry configuration
const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Ensure baseURL is properly formatted
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (!envURL) return '/api';
  
  // Remove trailing slash if present
  return envURL.endsWith('/') ? envURL.slice(0, -1) : envURL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 second timeout
});

// Debug: Log the base URL being used
console.log('API Base URL:', getBaseURL());

// Attach JWT if present and check online status
api.interceptors.request.use((config) => {
  // Debug: Log the config being processed
  console.log('Request interceptor - config:', {
    method: config?.method,
    url: config?.url,
    baseURL: config?.baseURL,
    headers: config?.headers
  });
  
  // Ensure config exists and has required properties
  if (!config) {
    console.error('Request interceptor - config is undefined');
    return Promise.reject(new Error('Invalid request configuration'));
  }
  
  // Check if we're online
  if (!isOnline()) {
    return Promise.reject(new Error('You are offline. Please check your internet connection.'));
  }
  
  // Rate limiting check - ensure config has method and url
  if (config.method && config.url) {
    const requestKey = `${config.method}:${config.url}`;
    
    // Skip rate limiting for certain endpoints that need to be more responsive
    const skipRateLimit = config.url.includes('/stats/leaderboard') || 
                         config.url.includes('/activity-feed') ||
                         config.url.includes('/notifications');
    
    if (!skipRateLimit && !rateLimiter.isAllowed(requestKey)) {
      const error = new Error('Rate limit exceeded. Please try again later.');
      error.isRateLimit = true;
      return Promise.reject(error);
    }
  }
  
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 errors by attempting to refresh the token and retry the request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ensure originalRequest exists
    if (!originalRequest) {
      return Promise.reject(error);
    }
    
    // Don't handle auth endpoints - let them fail normally
    const isAuthEndpoint = originalRequest.url?.includes('/auth/') || 
                          originalRequest.url?.includes('/login') || 
                          originalRequest.url?.includes('/register');
    
    // Don't redirect on admin pages - let admin handle auth differently
    const isAdminPage = window.location.pathname === '/admin';
    
    // Handle offline errors
    if (error.message === 'You are offline. Please check your internet connection.') {
      return Promise.reject(error);
    }
    
    // Disable axios interceptor retry logic to avoid conflicts with retryApiCall
    // The retryApiCall function will handle retries more intelligently
    /*
    // Implement retry logic for network errors and 5xx errors
    // Only retry if we haven't already retried and it's a retryable error
    if (RETRY_CONFIG.retryCondition(error) && !originalRequest._retryCount && !originalRequest._retry) {
      originalRequest._retryCount = 1;
      console.log('Axios interceptor: Retrying request due to error:', error.message);
      
      const retryRequest = async (retryCount = 1) => {
        try {
          // Add exponential backoff
          const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          return api(originalRequest);
        } catch (retryError) {
          if (retryCount < RETRY_CONFIG.retries && RETRY_CONFIG.retryCondition(retryError)) {
            console.log(`Axios interceptor: Retry ${retryCount + 1} failed, trying again...`);
            return retryRequest(retryCount + 1);
          }
          return Promise.reject(retryError);
        }
      };
      
      return retryRequest();
    }
    */
    
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        
        // Add a small delay before attempting refresh to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const res = await api.post('/auth/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, clear tokens but don't redirect immediately
        // Let the component handle the error gracefully
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on auth pages and not on admin page
        const isAuthPage = window.location.pathname === '/login' || 
                          window.location.pathname === '/register' || 
                          window.location.pathname === '/forgot-password';
        
        if (!isAuthPage && !isAdminPage) {
          // Use a more graceful redirect that doesn't break the current flow
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        } else if (isAdminPage) {
          // For admin pages, show a more specific error message
          console.error('Admin authentication failed:', refreshErr);
        }
        
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 