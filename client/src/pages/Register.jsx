import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import { Banner } from '../components/Modal';
import { UserPlusIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useNotification } from '../context/NotificationContext';

export default function Register() {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [interestedIn, setInterestedIn] = useState([]);
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username || !fullName || !email || !password || !dob || !gender || interestedIn.length === 0) {
      showNotification('All fields are required.', 'error');
      return false;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Invalid email format.', 'error');
      return false;
    }
    if (password.length < 8) {
      showNotification('Password must be at least 8 characters.', 'error');
      return false;
    }
    return true;
  };

  const handleInterestedIn = (val) => {
    setInterestedIn(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!validate()) return;
    try {
      await register({ username, fullName, email, password, dob, gender, interestedIn, limits });
      showNotification('Registration successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] p-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-8 shadow-2xl">
        <Helmet>
          <title>Register | Deviant Dare</title>
          <meta name="description" content="Create your Deviant Dare account and join the ultimate social dare and challenge platform." />
          <meta property="og:title" content="Register | Deviant Dare" />
          <meta property="og:description" content="Create your Deviant Dare account and join the ultimate social dare and challenge platform." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://deviantdare.com/register" />
          <meta property="og:image" content="/logo.svg" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Register | Deviant Dare" />
          <meta name="twitter:description" content="Create your Deviant Dare account and join the ultimate social dare and challenge platform." />
          <meta name="twitter:image" content="/logo.svg" />
        </Helmet>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-full">
              <UserPlusIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-neutral-400 text-sm">Join Deviant Dare and start your journey</p>
        </div>

        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main">
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="register-title">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="register-username" className="block font-semibold mb-2 text-primary text-sm">
                  Username
                </label>
                <input
                  type="text"
                  id="register-username"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  aria-label="Username"
                  placeholder="Choose a username"
                />
              </div>
              
              <div>
                <label htmlFor="register-fullName" className="block font-semibold mb-2 text-primary text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  id="register-fullName"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  aria-label="Full Name"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="register-email" className="block font-semibold mb-2 text-primary text-sm">
                Email <span className="text-xs text-neutral-400">(we keep this private)</span>
              </label>
              <input
                type="email"
                id="register-email"
                className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Email address"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="register-password" className="block font-semibold mb-2 text-primary text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-password"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 pr-12 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="register-dob" className="block font-semibold mb-2 text-primary text-sm">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="register-dob"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  required
                  aria-label="Date of Birth"
                />
              </div>
              
              <div>
                <label htmlFor="register-gender" className="block font-semibold mb-2 text-primary text-sm">
                  Gender
                </label>
                <select
                  id="register-gender"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  required
                  aria-label="Gender"
                >
                  <option value="">Select gender...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            {/* Preferences */}
            <div>
              <label className="block font-semibold mb-3 text-primary text-sm">
                Interested in
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50 transition-all cursor-pointer">
                  <input 
                    id="register-interestedIn-female" 
                    type="checkbox" 
                    checked={interestedIn.includes('female')} 
                    onChange={() => handleInterestedIn('female')} 
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2" 
                  />
                  <span className="text-neutral-100 font-medium">Female</span>
                  {interestedIn.includes('female') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>
                
                <label className="flex items-center gap-3 p-4 rounded-lg border border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50 transition-all cursor-pointer">
                  <input 
                    id="register-interestedIn-male" 
                    type="checkbox" 
                    checked={interestedIn.includes('male')} 
                    onChange={() => handleInterestedIn('male')} 
                    className="w-5 h-5 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2" 
                  />
                  <span className="text-neutral-100 font-medium">Male</span>
                  {interestedIn.includes('male') && <CheckIcon className="w-5 h-5 text-primary ml-auto" />}
                </label>
              </div>
            </div>
            
            <div>
              <label className="block font-semibold mb-2 text-primary text-sm">
                Limits
              </label>
              <TagsInput value={limits} onChange={setLimits} placeholder="Add a limit..." />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-neutral-400 text-sm">Already have an account?</span>{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
} 