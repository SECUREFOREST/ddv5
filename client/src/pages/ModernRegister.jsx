import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateFormData, VALIDATION_SCHEMAS, rateLimiter } from '../utils/validation';
import { retryApiCall } from '../utils/retry';
import TagsInput from '../components/TagsInput';
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
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const ModernRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dob: '',
    gender: '',
    interestedIn: [],
    limits: [],
    newsletter: false,
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = () => {
    // Rate limiting check (from legacy)
    if (!rateLimiter.isAllowed('register')) {
      const remaining = rateLimiter.getRemainingAttempts('register');
      const errorMessage = `Too many registration attempts. Please wait before trying again. (${remaining} attempts remaining)`;
      setErrors({ general: errorMessage });
      showError(errorMessage);
      return false;
    }

    // Use legacy validation schema
    const validation = validateFormData(
      {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        dob: formData.dob,
        gender: formData.gender,
        interestedIn: formData.interestedIn,
        limits: formData.limits,
        newsletter: formData.newsletter
      },
      VALIDATION_SCHEMAS.register
    );

    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors)[0];
      setErrors({ general: errorMessage });
      showError(errorMessage);
      return false;
    }

    // Additional validation for fields not in legacy schema
    if (!formData.confirmPassword) {
      setErrors({ general: 'Please confirm your password' });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ general: 'Passwords do not match' });
      return false;
    }

    if (!formData.agreeToTerms) {
      setErrors({ general: 'You must agree to the Terms of Service' });
      return false;
    }

    if (!formData.agreeToPrivacy) {
      setErrors({ general: 'You must agree to the Privacy Policy' });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: '', general: '' }));
    }
  };

  const handleInterestedIn = (val) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(val)
        ? prev.interestedIn.filter(i => i !== val)
        : [...prev.interestedIn, val]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use retry mechanism for registration (from legacy)
      await retryApiCall(async () => {
        await register({
          username: formData.username,
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          dob: formData.dob,
          gender: formData.gender,
          interestedIn: formData.interestedIn,
          limits: formData.limits,
          newsletter: formData.newsletter
        });
      });

      showSuccess('Registration successful! Redirecting...');

      // Memory-safe timeout for navigation (from legacy)
      setTimeout(() => {
        navigate('/modern/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
      showError(errorMessage);
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
      <div className="max-w-2xl w-full">
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${errors.fullName ? 'border-red-500' : 'border-neutral-600/50'
                      }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>
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
                    className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${errors.username ? 'border-red-500' : 'border-neutral-600/50'
                      }`}
                    placeholder="Choose a unique username"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address * <span className="text-neutral-400 text-xs">(we keep this private)</span>
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${errors.email ? 'border-red-500' : 'border-neutral-600/50'
                    }`}
                  placeholder="Enter your email address"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-neutral-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-neutral-300 mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select gender...</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interested In */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Interested in *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.interestedIn.includes('female')
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={formData.interestedIn.includes('female')}
                    onChange={() => handleInterestedIn('female')}
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-neutral-100 font-medium">Female</span>
                  {formData.interestedIn.includes('female') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${formData.interestedIn.includes('male')
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                  }`}>
                  <input
                    type="checkbox"
                    checked={formData.interestedIn.includes('male')}
                    onChange={() => handleInterestedIn('male')}
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-neutral-100 font-medium">Male</span>
                  {formData.interestedIn.includes('male') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>
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
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${errors.password ? 'border-red-500' : 'border-neutral-600/50'
                    }`}
                  placeholder="Create a strong password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                  disabled={isSubmitting}
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
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.score <= 1 ? 'bg-red-500' :
                          passwordStrength.score <= 2 ? 'bg-yellow-500' :
                            passwordStrength.score <= 3 ? 'bg-yellow-400' :
                              passwordStrength.score <= 4 ? 'bg-green-400' : 'bg-green-500'
                        }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
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
                  className={`w-full pl-10 pr-12 py-3 bg-neutral-700/50 border rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-600/50'
                    }`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Hard Limits - Enhanced Prominence */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-2xl p-6">
              <div>
                <label className="block font-semibold mb-3 text-red-300 text-sm">
                  Your Hard Limits (Required) *
                </label>
                <TagsInput
                  value={formData.limits}
                  onChange={(limits) => handleInputChange('limits', limits)}
                  placeholder="Add a limit (e.g., 'no photos', 'no public', 'no pain')..."
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
                <p className="text-neutral-400 text-xs mt-2">
                  Examples: no public, no pain, no humiliation, no specific dares
                </p>
              </div>
            </div>

            {/* Newsletter Opt-in */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <SparklesIcon className="w-8 h-8 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Stay Updated</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                    Get notified about new features, community updates, and exciting challenges.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                  disabled={isSubmitting}
                />
                <span className="text-neutral-100 font-medium">Subscribe to newsletter for updates</span>
                {formData.newsletter && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
              </label>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                  disabled={isSubmitting}
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

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                  disabled={isSubmitting}
                />
                <div className="text-sm text-neutral-300">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </a>
                  *
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
                  <UserPlusIcon className="w-5 h-5" />
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
          <p className="flex items-center justify-center space-x-2 text-sm text-neutral-400">
            Note: This isn't a social network. Your account isn't publicly listed in any directory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernRegister; 