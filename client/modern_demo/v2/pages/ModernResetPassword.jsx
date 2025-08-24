import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import { retryApiCall } from '../../utils/retry';
import { validatePassword } from '../../utils/validation';
import api from '../../api/axios';

const ModernResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const token = searchParams.get('token');
  const timeoutRef = useRef(null);

  // Check password strength
  useEffect(() => {
    if (newPassword) {
      let strength = 0;
      if (newPassword.length >= 8) strength++;
      if (/[a-z]/.test(newPassword)) strength++;
      if (/[A-Z]/.test(newPassword)) strength++;
      if (/[0-9]/.test(newPassword)) strength++;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return 'from-red-500 to-red-600';
    if (strength <= 3) return 'from-yellow-500 to-yellow-600';
    if (strength <= 4) return 'from-blue-500 to-blue-600';
    return 'from-green-500 to-green-600';
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      showError('Passwords do not match.');
      return;
    }
    
    // Validate password strength
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
      setShowSuccessMessage(true);
      
      // Redirect to login after 3 seconds
      timeoutRef.current = setTimeout(() => navigate('/modern/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to reset password. Please try again.';
      setResetError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-md mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center py-16">
            <div className="bg-red-900/20 border border-red-800/30 rounded-2xl p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                  <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-red-400 mb-4">Invalid Reset Link</h1>
              <p className="text-red-300 text-lg mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/modern/forgot-password')}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-md mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center py-16">
            <div className="bg-green-900/20 border border-green-800/30 rounded-2xl p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-2xl shadow-2xl shadow-green-500/25">
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-green-400 mb-4">Password Reset Success!</h1>
              <p className="text-green-300 text-lg mb-6">
                Your password has been successfully reset. Redirecting to login...
              </p>
              <div className="animate-pulse">
                <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
              <KeyIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
          <p className="text-neutral-300 text-lg">Enter your new password below</p>
        </div>

        {/* Form Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {resetError && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                  <div className="text-red-300 text-sm">{resetError}</div>
                </div>
              </div>
            )}
            
            {/* New Password Input */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-300 mb-3">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  placeholder="Enter your new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-neutral-400">Password Strength:</span>
                    <span className={`text-sm font-medium bg-gradient-to-r ${getPasswordStrengthColor(passwordStrength)} bg-clip-text text-transparent`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-700/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getPasswordStrengthColor(passwordStrength)} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-3">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2">
                  {newPassword === confirmPassword ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckIcon className="w-4 h-4" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <KeyIcon className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
            Password Requirements
          </h3>
          <div className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Include uppercase and lowercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Include numbers and special characters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="w-4 h-4 text-green-400" />
              <span>Choose a unique password you haven't used before</span>
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

export default ModernResetPassword;
