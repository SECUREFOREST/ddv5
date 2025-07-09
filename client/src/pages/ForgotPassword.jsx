import React, { useState } from 'react';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-reset', { email });
      setMessage('If an account with that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        {message && <div className="text-green-600 text-sm font-medium">{message}</div>}
        {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
} 