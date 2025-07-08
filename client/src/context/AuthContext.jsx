import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    async function fetchUser() {
      if (token) {
        try {
          const res = await api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
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
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    // Fetch user info after login
    const userRes = await api.get('/users/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
    localStorage.setItem('user', JSON.stringify(userRes.data));
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    // Fetch user info after register
    const userRes = await api.get('/users/me', { headers: { Authorization: `Bearer ${res.data.token}` } });
    localStorage.setItem('user', JSON.stringify(userRes.data));
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 