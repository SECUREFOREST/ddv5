import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import { KeyIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      showNotification('Password reset successful!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to reset password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden"><div className="text-danger font-semibold text-center">Invalid or missing token.</div></div>;
  }

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <KeyIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Reset Password
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold text-lg animate-fade-in">
          <KeyIcon className="w-6 h-6" /> Reset Password
        </span>
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <form role="form" aria-labelledby="reset-password-title" onSubmit={handleSubmit} className="space-y-6">
          <h1 id="reset-password-title" className="text-2xl font-bold mb-4">Reset Password</h1>
          <div>
            <label htmlFor="reset-password" className="block font-semibold mb-1 text-primary">New Password</label>
            <input
              type="password"
              id="reset-password"
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </main>
    </div>
  );
} 