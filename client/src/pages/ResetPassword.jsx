import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import Card from '../components/Card';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../components/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      showSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-4">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center">
              <div className="text-red-400 text-xl mb-4">Invalid Reset Link</div>
              <p className="text-neutral-400 text-sm mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              >
                Request New Reset Link
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
          
          <main id="main-content" tabIndex="-1" role="main">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                  <KeyIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-neutral-400 text-sm">Enter your new password below</p>
            </div>

            <form role="form" aria-labelledby="reset-password-title" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reset-password" className="block font-semibold mb-3 text-primary text-sm">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reset-password"
                    className="w-full rounded-xl border border-neutral-700 px-4 py-4 pr-12 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    aria-required="true"
                    placeholder="Enter your new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-neutral-700/50"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
              <div className="text-sm text-neutral-400">
                <p className="mb-2">Choose a strong password that you haven't used before.</p>
                <p className="text-xs">Your new password will be active immediately after reset.</p>
              </div>
            </div>
          </main>
        </Card>
      </div>
    </div>
  );
} 