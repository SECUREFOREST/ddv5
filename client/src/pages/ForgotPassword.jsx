import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, SparklesIcon, ExclamationTriangleIcon, FireIcon, LockClosedIcon, ShieldCheckIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateEmail } from '../utils/validation';
import { FormInput } from '../components/Form';
import { ErrorAlert } from '../components/Alert';
import Button from '../components/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      setForgotError('Please enter a valid email address.');
      showError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setForgotError('');
    
    try {
      // Use retry mechanism for password reset request
      await retryApiCall(() => api.post('/auth/request-reset', { email }));
      const successMessage = 'If an account with that email exists, a reset link has been sent.';
      showSuccess(successMessage);
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Request failed. Please try again.';
      setForgotError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12">
      <Helmet>
        <title>Forgot Password - Deviant Dare</title>
        <meta name="description" content="Reset your password for Deviant Dare" />
      </Helmet>

      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Login</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Reset Password</h1>
              <p className="text-neutral-400">Enter your email to receive reset instructions</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    forgotError ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Display */}
            {forgotError && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="text-sm">{forgotError}</span>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Help Info */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400 mb-2">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Secure password reset</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400">
              <CheckIcon className="w-4 h-4" />
              <span>Check your email for instructions</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/login" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Back to Login
            </Link>
            <Link to="/register" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Create Account
            </Link>
            <Link to="/modern" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Explore Platform
            </Link>
            <Link to="/help" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 