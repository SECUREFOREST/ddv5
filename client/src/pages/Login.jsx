import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import { ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useNotification } from '../context/NotificationContext';
import { safeStorage } from '../utils/cleanup';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      // Get last visited path or default to dashboard
      const lastPath = safeStorage.get('lastVisitedPath', '/dashboard');
      const redirectPath = lastPath === '/login' ? '/dashboard' : lastPath;
      navigate(redirectPath);
      showNotification('Login successful! Redirecting...', 'success');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        showNotification(err.response.data.error, 'error');
      } else if (err.message) {
        showNotification(err.message, 'error');
      } else {
        showNotification('Login failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-8 shadow-2xl">
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-full">
              <ArrowRightOnRectangleIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-neutral-400 text-sm">Sign in to your Deviant Dare account</p>
        </div>

        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main">
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="login-title">
            <div>
              <label htmlFor="login-identifier" className="block font-semibold mb-2 text-primary text-sm">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="login-identifier"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  aria-label="Username or Email"
                  placeholder="Enter your username or email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="login-password" className="block font-semibold mb-2 text-primary text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  className="w-full rounded-lg border border-neutral-700 px-4 py-3 pr-12 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-neutral-800/50 transition-all duration-200"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  aria-label="Password"
                  placeholder="Enter your password"
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
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-4 font-semibold text-base transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center justify-center gap-3 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <span className="text-neutral-400 text-sm">Don't have an account?</span>{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Create Account
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-neutral-400 hover:text-neutral-300 text-sm transition-colors">
              Forgot your password?
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
} 