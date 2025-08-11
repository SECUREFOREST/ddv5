import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import { ArrowLeftIcon, EnvelopeIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateEmail } from '../utils/validation';
import { FormInput } from '../components/Form';
import { ErrorAlert } from '../components/Alert';
import { MainContent } from '../components/Layout';
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
    <div className="min-h-screen bg-black">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      
      <MainContent>
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
                  <ErrorAlert>
                    {forgotError}
                  </ErrorAlert>
                )}
                
                <FormInput
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  variant="gradient-purple"
                  fullWidth
                  loading={loading}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Send Reset Link
                </Button>
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
      </MainContent>
    </div>
  );
} 