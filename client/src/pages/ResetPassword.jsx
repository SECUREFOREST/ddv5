import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

import Card from '../components/Card';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, SparklesIcon, ExclamationTriangleIcon, KeyIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validatePassword } from '../utils/validation';
import { FormInput } from '../components/Form';
import { ErrorAlert } from '../components/Alert';
import { MainContent } from '../components/Layout';
import Button from '../components/Button';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setResetError(passwordValidation.feedback);
      showError(passwordValidation.feedback);
      return;
    }
    
    setLoading(true);
    setResetError('');
    
    try {
      // Use retry mechanism for password reset
      await retryApiCall(() => api.post('/auth/reset-password', { token, newPassword }));
      showSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reset password. Please try again.';
      setResetError(errorMessage);
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
          
          <MainContent>
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
              {/* Error Display */}
              {resetError && (
                <ErrorAlert>
                  {resetError}
                </ErrorAlert>
              )}
              
              <FormInput
                type="password"
                label="New Password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                <KeyIcon className="w-5 h-5" />
                Reset Password
              </Button>
            </form>

            {/* Security Info */}
            <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
              <div className="text-sm text-neutral-400">
                <p className="mb-2">Choose a strong password that you haven't used before.</p>
                <p className="text-xs">Your new password will be active immediately after reset.</p>
              </div>
            </div>
          </MainContent>
        </Card>
      </div>
    </div>
  );
} 