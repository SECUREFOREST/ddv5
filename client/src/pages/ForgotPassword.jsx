import React, { useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import { EnvelopeIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <EnvelopeIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Forgot Password
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold text-lg animate-fade-in">
          <EnvelopeIcon className="w-6 h-6" /> Forgot Password
        </span>
      </div>

      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <form role="form" aria-labelledby="forgot-password-title" onSubmit={handleSubmit} className="space-y-6">
          <h1 id="forgot-password-title" className="text-2xl font-bold mb-4">Forgot Password</h1>
          <div>
            <label htmlFor="forgot-email" className="block font-semibold mb-1 text-primary">Email</label>
            <input
              type="email"
              id="forgot-email"
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              aria-required="true"
              aria-label="Email address for password reset"
            />
          </div>
          {message && <Banner type="success" message={message} onClose={() => setMessage('')} />}
          {error && <Banner type="error" message={error} onClose={() => setError('')} />}
          <button
            type="submit"
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
            disabled={loading}
            aria-label="Send password reset link"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </main>
    </div>
  );
} 