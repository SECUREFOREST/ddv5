import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

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
        } catch {
          setUser(null);
        }
      } else if (userData) {
        setUser(JSON.parse(userData));
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
        throw new Error('Login succeeded but failed to load user profile. Please try again.');
      }
      localStorage.setItem('user', JSON.stringify(userRes.data));
      setUser(userRes.data);
    } catch (err) {
      throw err;
    }
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
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
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, accessToken, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
} 