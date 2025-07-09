import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Password has been reset. You may now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="max-w-sm mx-auto mt-16 bg-neutral-800 rounded-lg shadow p-6"><div className="text-danger font-semibold text-center">Invalid or missing token.</div></div>;
  }

  return (
    <div className="max-w-sm mx-auto mt-16 bg-neutral-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-primary">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-primary">New Password</label>
          <input
            type="password"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        {message && <div className="text-success text-sm font-medium">{message}</div>}
        {error && <div className="text-danger text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
} 