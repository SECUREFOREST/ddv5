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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000, // 10 second timeout
});

// Attach JWT if present and check online status
api.interceptors.request.use((config) => {
  // Check if we're online
  if (!isOnline()) {
    return Promise.reject(new Error('You are offline. Please check your internet connection.'));
  }
  
  // Rate limiting check
  const requestKey = `${config.method}:${config.url}`;
  if (!rateLimiter.isAllowed(requestKey)) {
    const error = new Error('Rate limit exceeded. Please try again later.');
    error.isRateLimit = true;
    return Promise.reject(error);
  }
  
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 errors by attempting to refresh the token and retry the request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
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
    
    // Implement retry logic for network errors and 5xx errors
    if (RETRY_CONFIG.retryCondition(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;
      
      const retryRequest = async (retryCount = 1) => {
        try {
          await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay * retryCount));
          return api(originalRequest);
        } catch (retryError) {
          if (retryCount < RETRY_CONFIG.retries && RETRY_CONFIG.retryCondition(retryError)) {
            return retryRequest(retryCount + 1);
          }
          return Promise.reject(retryError);
        }
      };
      
      return retryRequest();
    }
    
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