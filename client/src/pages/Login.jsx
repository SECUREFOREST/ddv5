import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon, SparklesIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../components/Toast';
import { safeStorage } from '../utils/cleanup';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(identifier, password);
      // Get last visited path or default to dashboard
      const lastPath = safeStorage.get('lastVisitedPath', '/dashboard');
      const redirectPath = lastPath === '/login' ? '/dashboard' : lastPath;
      
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-4">
      <div className="w-full max-w-md">
        <Card variant="elevated" className="p-8">
          <Helmet>
            <title>Login | Deviant Dare</title>
            <meta name="description" content="Login to Deviant Dare to join the ultimate social dare and challenge platform." />
            <meta property="og:title" content="Login | Deviant Dare" />
            <meta property="og:description" content="Login to Deviant Dare to join the ultimate social dare and challenge platform." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://deviantdare.com/login" />
            <meta property="og:image" content="/logo.svg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Login | Deviant Dare" />
            <meta name="twitter:description" content="Login to Deviant Dare to join the ultimate social dare and challenge platform." />
            <meta name="twitter:image" content="/logo.svg" />
          </Helmet>
          
          {/* Enhanced Header with Better Spacing */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-3xl shadow-2xl shadow-primary/25">
                <ArrowRightOnRectangleIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Welcome Back</h1>
            <p className="text-lg text-neutral-400 leading-relaxed">Sign in to your Deviant Dare account</p>
          </div>

          <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
          
          <main id="main-content" tabIndex="-1" role="main">
            <form onSubmit={handleSubmit} className="space-y-8" role="form" aria-labelledby="login-title">
              {/* Enhanced Username/Email Field */}
              <div className="space-y-3">
                <label htmlFor="login-identifier" className="block font-semibold text-primary text-sm">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    id="login-identifier"
                    className="w-full rounded-xl border border-neutral-700 pl-12 pr-4 py-4 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base placeholder-neutral-500"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    aria-label="Username or Email"
                    placeholder="Enter your username or email"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Enhanced Password Field */}
              <div className="space-y-3">
                <label htmlFor="login-password" className="block font-semibold text-primary text-sm">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    className="w-full rounded-xl border border-neutral-700 pl-12 pr-12 py-4 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base placeholder-neutral-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-2 rounded-lg hover:bg-neutral-700/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </Button>
              
              {/* Enhanced Links Section */}
              <div className="text-center space-y-4">
                <div className="text-sm text-neutral-400">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary-dark font-semibold transition-colors duration-200 hover:underline"
                  >
                    Create one here
                  </Link>
                </div>
                <div className="text-sm text-neutral-400">
                  <Link 
                    to="/forgot-password" 
                    className="text-neutral-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </form>
          </main>
        </Card>
      </div>
    </div>
  );
} 