import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import { ArrowLeftIcon, EnvelopeIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateEmail } from '../utils/validation';

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      
      <main id="main-content" tabIndex="-1" role="main">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl shadow-2xl">
                    <EnvelopeIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                <p className="text-white/70 text-sm">Enter your email to receive a reset link</p>
              </div>

              <form role="form" aria-labelledby="forgot-password-title" onSubmit={handleSubmit} className="space-y-6">
                {/* Error Display */}
                {forgotError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4" role="alert" aria-live="polite">
                    <div className="flex items-center gap-3 text-red-300">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span className="font-medium">{forgotError}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="forgot-email" className="block font-semibold mb-3 text-white text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="forgot-email"
                    className="w-full rounded-xl border border-white/20 px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white/10 transition-all duration-200 text-base placeholder-white/50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Email address for password reset"
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center gap-3 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
                  disabled={loading}
                  aria-label="Send password reset link"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <Link 
                  to="/login" 
                  className="text-white/70 hover:text-white text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>

              {/* Help Info */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-sm text-white/60">
                  <p className="mb-2">Don't worry! If an account exists with this email, you'll receive a password reset link.</p>
                  <p className="text-xs">Check your spam folder if you don't see the email in your inbox.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 