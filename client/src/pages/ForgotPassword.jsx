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
    <div className="max-w-sm mx-auto mt-16 bg-neutral-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-primary">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-primary">Email</label>
          <input
            type="email"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
} 