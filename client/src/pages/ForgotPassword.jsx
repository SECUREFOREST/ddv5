import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, SparklesIcon, ExclamationTriangleIcon, FireIcon, LockClosedIcon } from '@heroicons/react/24/outline';
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
          <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-8 shadow-xl">
            <form role="form" aria-labelledby="forgot-password-title" onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {forgotError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{forgotError}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
            
            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="text-neutral-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-2 hover:gap-3"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>

          {/* Help Info */}
          <div className="mt-8 p-6 bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-neutral-300">
                <p>Don't worry! If an account exists with this email, you'll receive a password reset link.</p>
                <p className="text-xs text-neutral-400">Check your spam folder if you don't see the email in your inbox.</p>
              </div>
            </div>
          </div>

          {/* Additional CTA */}
          <div className="mt-8 text-center">
            <p className="text-neutral-400 text-sm mb-3">Don't have an account?</p>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-xl font-medium transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50"
            >
              <span>Create Account</span>
              <SparklesIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 