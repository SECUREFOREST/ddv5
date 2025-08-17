import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FireIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const ModernLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setShowSuccessMessage(true);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, make API call to authenticate user
      console.log('Login data:', formData);
      
      // Simulate successful login
      // In real app, store auth token and redirect
      navigate('/modern/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Invalid username or password. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate demo login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to demo dashboard
      navigate('/modern/dashboard');
      
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center py-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <FireIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-neutral-400">Sign in to your OSA account</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {location.state?.message || 'Registration successful!'}
              </span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.username ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.password ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-neutral-300">Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-red-400">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-600/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-800/50 text-neutral-400">Or try the demo</span>
              </div>
            </div>
            
            <button
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="mt-4 w-full py-3 bg-neutral-700/50 hover:bg-neutral-600/50 disabled:bg-neutral-600 text-white rounded-lg font-medium transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Try Demo Account</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium transition-colors duration-200">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Features */}
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400 mb-2">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400">
              <CheckIcon className="w-4 h-4" />
              <span>Two-factor authentication available</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/modern" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Explore Platform
            </Link>
            <Link to="/about" className="text-neutral-400 hover:text-white transition-colors duration-200">
              About OSA
            </Link>
            <Link to="/help" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Help Center
            </Link>
            <Link to="/contact" className="text-neutral-400 hover:text-white transition-colors duration-200">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin; 