import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateEmail } from '../utils/validation';
import api from '../api/axios';

const ModernForgotPassword = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
      setShowSuccessMessage(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Request failed. Please try again.';
      setForgotError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-md mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Go Back</span>
            </button>
            
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <CheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-neutral-300 text-lg">Password reset instructions have been sent</p>
          </div>

          {/* Success Card */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">Reset Link Sent!</h2>
            <p className="text-neutral-300 mb-6">
              If an account with that email exists, we've sent you a password reset link. 
              Please check your email and follow the instructions.
            </p>
            
            <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-4 mb-6">
              <div className="space-y-3 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                  <span>Reset link is secure and time-limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-400" />
                  <span>Link expires in 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-purple-400" />
                  <span>Check your spam folder if needed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Try Another Email
              </button>
              <Link to="/modern/login">
                <button className="w-full bg-neutral-700/50 text-neutral-300 border border-neutral-600/50 rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:bg-neutral-600/50">
                  Back to Login
                </button>
              </Link>
            </div>
          </div>

          {/* Help Info */}
          <div className="mt-8 text-center">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-3 text-sm text-neutral-400">
                <p>• Check your email's spam/junk folder</p>
                <p>• Ensure you're using the correct email address</p>
                <p>• Contact support if you continue having issues</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <div className="max-w-md mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
          <p className="text-neutral-300 text-lg">Enter your email to receive reset instructions</p>
        </div>

        {/* Form Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-3">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                    forgotError ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {forgotError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {forgotError}
                </p>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <EnvelopeIcon className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Remember your password?{' '}
              <Link to="/modern/login" className="text-primary hover:text-primary-dark font-medium transition-colors duration-200 underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            Security Features
          </h3>
          <div className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Secure password reset process</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Time-limited reset links (24 hours)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>No password information stored</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Encrypted email transmission</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/modern/login" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Back to Login
            </Link>
            <Link to="/modern/register" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Create Account
            </Link>
            <Link to="/modern" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Explore Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernForgotPassword;
