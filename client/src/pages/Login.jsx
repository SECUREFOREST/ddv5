import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import Card from '../components/Card';
import { ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/solid';
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
        <Card className="p-8">
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
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <ArrowRightOnRectangleIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-neutral-400 text-sm">Sign in to your Deviant Dare account</p>
          </div>

          <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
          
          <main id="main-content" tabIndex="-1" role="main">
            <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="login-title">
              <div>
                <label htmlFor="login-identifier" className="block font-semibold mb-3 text-primary text-sm">
                  Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="login-identifier"
                    className="w-full rounded-xl border border-neutral-700 px-4 py-4 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    required
                    aria-label="Username or Email"
                    placeholder="Enter your username or email"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="login-password" className="block font-semibold mb-3 text-primary text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="login-password"
                    className="w-full rounded-xl border border-neutral-700 px-4 py-4 pr-12 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200 text-base"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-neutral-700/50"
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
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:transform-none"
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
              </button>
            </form>
            
            <div className="mt-8 text-center space-y-4">
              <div>
                <span className="text-neutral-400 text-sm">Don't have an account?</span>{' '}
                <Link to="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                  Create Account
                </Link>
              </div>
              
              <div>
                <Link to="/forgot-password" className="text-neutral-400 hover:text-neutral-300 text-sm transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Demo Account Info */}
            <div className="mt-8 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/30">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Demo Account</span>
              </div>
              <p className="text-xs text-neutral-400">
                Try the app with demo credentials: <code className="bg-neutral-700 px-1 rounded">demo@example.com</code> / <code className="bg-neutral-700 px-1 rounded">password</code>
              </p>
            </div>
          </main>
        </Card>
      </div>
    </div>
  );
} 