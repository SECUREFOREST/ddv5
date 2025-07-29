import React, { useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-reset', { email });
      const successMessage = 'If an account with that email exists, a reset link has been sent.';
      setMessage(successMessage);
      showSuccess(successMessage);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Request failed. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                  <EnvelopeIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-neutral-400 text-sm">Enter your email to receive a reset link</p>
            </div>

            <form role="form" aria-labelledby="forgot-password-title" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="forgot-email" className="block font-semibold mb-3 text-primary text-sm">
                  Email Address
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  className="w-full rounded-xl border border-neutral-700 px-4 py-4 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  aria-label="Email address for password reset"
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              
              {message && <Banner type="success" message={message} onClose={() => setMessage('')} />}
              {error && <Banner type="error" message={error} onClose={() => setError('')} />}
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:transform-none"
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
                className="text-neutral-400 hover:text-neutral-300 text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>

            {/* Help Info */}
            <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
              <div className="text-sm text-neutral-400">
                <p className="mb-2">Don't worry! If an account exists with this email, you'll receive a password reset link.</p>
                <p className="text-xs">Check your spam folder if you don't see the email in your inbox.</p>
              </div>
            </div>
          </main>
        </Card>
      </div>
    </div>
  );
}

// Card component for consistent styling
function Card({ children, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-8 shadow-2xl ${className}`}>
      {children}
    </div>
  );
} 