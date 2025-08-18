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
  ArrowLeftIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ModernRegister = () => {
  const navigate = useNavigate();
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

  const handleInterestedIn = (val) => {
    setFormData(prev => ({
      ...prev,
      interestedIn: prev.interestedIn.includes(val) 
        ? prev.interestedIn.filter(i => i !== val) 
        : [...prev.interestedIn, val]
    }));
  };

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

    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Hard limits validation
    if (formData.limits.length === 0) {
      newErrors.limits = 'Hard limits are required';
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
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Account</h1>
              <p className="text-neutral-400">Join Deviant Dare and start your journey</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

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
                  <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email * <span className="text-neutral-400 text-xs">(we keep this private)</span>
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
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
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
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full ${
                          level <= passwordStrength.score
                            ? passwordStrength.color.replace('text-', 'bg-').replace('-400', '-500')
                            : 'bg-neutral-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </p>
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
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-neutral-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dob"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className={`w-full px-4 py-3 bg-neutral-700/50 border rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.dob ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                />
                {errors.dob && (
                  <p className="text-red-400 text-sm mt-1">{errors.dob}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-neutral-300 mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-4 py-3 bg-neutral-700/50 border rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200 ${
                    errors.gender ? 'border-red-500' : 'border-neutral-600/50'
                  }`}
                >
                  <option value="">Select gender...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-4">
                Interested in
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  formData.interestedIn.includes('female') 
                    ? 'border-primary bg-primary/10' 
                    : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.interestedIn.includes('female')} 
                    onChange={() => handleInterestedIn('female')} 
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2" 
                  />
                  <span className="text-neutral-100 font-medium">Female</span>
                  {formData.interestedIn.includes('female') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>
                
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  formData.interestedIn.includes('male') 
                    ? 'border-primary bg-primary/10' 
                    : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={formData.interestedIn.includes('male')} 
                    onChange={() => handleInterestedIn('male')} 
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2" 
                  />
                  <span className="text-neutral-100 font-medium">Male</span>
                  {formData.interestedIn.includes('male') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>
              </div>
            </div>

            {/* Hard Limits - Enhanced Prominence */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Hard Limits</h3>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                    List any dares or activities you absolutely will not do. This helps ensure your safety and comfort.
                  </p>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-3 text-red-300 text-sm">
                  Your Hard Limits (Required)
                </label>
                <input
                  type="text"
                  value={formData.limits.join(', ')}
                  onChange={(e) => {
                    const limits = e.target.value.split(',').map(limit => limit.trim()).filter(limit => limit);
                    handleInputChange('limits', limits);
                  }}
                  placeholder="Add a limit (e.g., 'no photos', 'no public', 'no pain')..."
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
                <p className="text-neutral-400 text-xs mt-2">
                  Examples: no photos, no public, no pain, no humiliation, no specific dares
                </p>
                <p className="text-neutral-400 text-xs mt-2 italic">
                  Note: This isn't a social network. Your account isn't publicly listed in any directory.
                </p>
              </div>
              {errors.limits && (
                <p className="text-red-400 text-sm mt-1">{errors.limits}</p>
              )}
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
                />
                <span className="text-neutral-100 font-medium">Subscribe to newsletter for updates</span>
                {formData.newsletter && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
              </label>
            </div>

            {/* Terms and Privacy */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300 text-sm">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:text-primary-dark underline">
                    Terms of Service
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToPrivacy}
                  onChange={(e) => handleInputChange('agreeToPrivacy', e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300 text-sm">
                  I agree to the{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary-dark underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToPrivacy && (
                <p className="text-red-400 text-sm">{errors.agreeToPrivacy}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlusIcon className="w-5 h-5" />
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-neutral-400 text-sm">Already have an account?</span>{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </div>

          {/* Demo Account Info */}
          <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Quick Start</span>
            </div>
            <p className="text-xs text-neutral-400">
              Fill in your details above to create your account. All fields are required to ensure a safe and personalized experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRegister; 