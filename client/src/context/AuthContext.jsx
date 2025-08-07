import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { ERROR_MESSAGES } from '../constants.jsx';
import { realtimeUtils } from '../utils/realtime';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');

  useEffect(() => {
    // Try to load user from localStorage
    const userData = localStorage.getItem('user');
    async function fetchUser() {
      if (accessToken) {
        try {
          const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${accessToken}` } });
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
          
          // Initialize real-time connection after successful authentication
          realtimeUtils.init(accessToken);
        } catch (err) {
          console.log('Token validation failed, attempting refresh...');
          // Try to refresh the token if validation fails
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              // Retry with new token
              const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${newToken}` } });
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
              realtimeUtils.init(newToken);
            } else {
              // Clear invalid tokens
              setUser(null);
              realtimeUtils.disconnect();
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
            }
          } catch (refreshErr) {
            console.log('Token refresh failed, clearing authentication...');
            setUser(null);
            realtimeUtils.disconnect();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      } else if (userData) {
        // If no access token but user data exists, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${newToken}` } });
              setUser(res.data);
              localStorage.setItem('user', JSON.stringify(res.data));
              realtimeUtils.init(newToken);
            } else {
              setUser(JSON.parse(userData));
            }
          } catch (refreshErr) {
            console.log('Token refresh failed, using cached user data...');
            setUser(JSON.parse(userData));
          }
        } else {
          setUser(JSON.parse(userData));
        }
      } else {
        realtimeUtils.disconnect();
      }
      setLoading(false);
    }
    fetchUser();
  }, [accessToken]);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      setAccessToken(res.data.accessToken);
      setRefreshToken(res.data.refreshToken);
      // Fetch user info after login
      let userRes;
      try {
        userRes = await api.get('/users/me', { headers: { Authorization: `Bearer ${res.data.accessToken}` } });
      } catch (userErr) {
        // If fetching user info fails, clear tokens and throw error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAccessToken('');
        setRefreshToken('');
        throw new Error(ERROR_MESSAGES.USER_PROFILE_LOAD_FAILED);
      }
      localStorage.setItem('user', JSON.stringify(userRes.data));
      setUser(userRes.data);
    } catch (err) {
      throw err;
    }
  };

  const register = async (data) => {
    // Ensure dob is a string (YYYY-MM-DD)
    const payload = { ...data, dob: data.dob ? String(data.dob) : '' };
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    // Fetch user info after register
    const userRes = await api.get('/users/me', { headers: { Authorization: `Bearer ${res.data.accessToken}` } });
    localStorage.setItem('user', JSON.stringify(userRes.data));
    setUser(userRes.data);
  };

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) throw new Error('No refresh token');
    const res = await api.post('/auth/refresh-token', { refreshToken: storedRefreshToken });
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setAccessToken(res.data.accessToken);
    setRefreshToken(res.data.refreshToken);
    return res.data.accessToken;
  };

  const logout = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      try { await api.post('/auth/logout', { refreshToken: storedRefreshToken }); } catch {}
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken('');
    setRefreshToken('');
    setUser(null);
    
    // Disconnect real-time connection on logout
    realtimeUtils.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, accessToken, refreshToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
} 