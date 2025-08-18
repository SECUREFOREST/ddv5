import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const ModernRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'switch',
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingEmails: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { value: 'switch', label: 'Switch', description: 'Enjoy both dominant and submissive roles' },
    { value: 'dom', label: 'Dominant', description: 'Prefer to take the lead and give direction' },
    { value: 'sub', label: 'Submissive', description: 'Prefer to follow and receive guidance' }
  ];

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, make API call to register user
      console.log('Registration data:', formData);
      
      // Redirect to login or dashboard
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.' 
        } 
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[!@#$%^&*])/.test(password)) score++;

    const strengthMap = {
      0: { label: 'Very Weak', color: 'text-red-400' },
      1: { label: 'Weak', color: 'text-red-400' },
      2: { label: 'Fair', color: 'text-yellow-400' },
      3: { label: 'Good', color: 'text-yellow-400' },
      4: { label: 'Strong', color: 'text-green-400' },
      5: { label: 'Very Strong', color: 'text-green-400' }
    };

    return { score, ...strengthMap[score] };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              <h1 className="text-3xl font-bold text-white">Join OSA</h1>
              <p className="text-neutral-400">Create your account and start your journey</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.fullName ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                Username *
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
                  placeholder="Choose a unique username"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.email ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Preferred Role *
              </label>
              <div className="space-y-3">
                {roleOptions.map((role) => (
                  <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{role.label}</div>
                      <div className="text-sm text-neutral-400">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password *
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
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-400">Password strength:</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-neutral-700/50 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score <= 2 ? 'bg-yellow-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-400' :
                        passwordStrength.score <= 4 ? 'bg-green-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                />
                <div className="text-sm text-neutral-300">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-primary hover:text-primary-dark underline">
                    Community Guidelines
                  </a>
                  *
                </div>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.agreeToTerms}</span>
                </p>
              )}

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                />
                <div className="text-sm text-neutral-300">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                  *
                </div>
              </label>
              {errors.agreeToPrivacy && (
                <p className="text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.agreeToPrivacy}</span>
                </p>
              )}

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.marketingEmails}
                  onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                />
                <div className="text-sm text-neutral-300">
                  I would like to receive updates about new features and community events
                </div>
              </label>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400 flex items-center space-x-1">
                  <XMarkIcon className="w-4 h-4" />
                  <span>{errors.general}</span>
                </p>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-neutral-400">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRegister; 