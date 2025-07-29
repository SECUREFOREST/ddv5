import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT if present
api.interceptors.request.use((config) => {
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
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const res = await api.post('/auth/refresh-token', { refreshToken });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // If refresh fails, clear tokens but don't redirect for login/auth endpoints
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Only redirect if it's not a login/auth endpoint to avoid infinite loops
        const isAuthEndpoint = originalRequest.url?.includes('/auth/') || 
                              originalRequest.url?.includes('/login') || 
                              originalRequest.url?.includes('/register');
        
        if (!isAuthEndpoint) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api; 