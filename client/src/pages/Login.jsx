import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';
import { useToast } from '../context/ToastContext';
import { safeStorage } from '../utils/cleanup';
import { validateFormData, VALIDATION_SCHEMAS, rateLimiter } from '../utils/validation';
import { retryApiCall } from '../utils/retry';
import { ErrorAlert } from '../components/Alert';
import { FormInput } from '../components/Form';
import { MainContent } from '../components/Layout';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      
      // Rate limiting check
      if (!rateLimiter.isAllowed('login')) {
        const remaining = rateLimiter.getRemainingAttempts('login');
        const errorMessage = `Too many login attempts. Please wait before trying again. (${remaining} attempts remaining)`;
        setLoginError(errorMessage);
        showError(errorMessage);
        return;
      }
      
      // Validate form data
      const validation = validateFormData(
        { identifier, password },
        VALIDATION_SCHEMAS.login
      );
      
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors)[0];
        setLoginError(errorMessage);
        showError(errorMessage);
        return;
      }
      
      setLoading(true);
      setLoginError('');
      
      try {
        // Use retry mechanism for login
        await retryApiCall(async () => {
          await login(validation.sanitizedData.identifier, validation.sanitizedData.password);
        });
        
        // Get last visited path or default to dashboard
        const lastPath = safeStorage.get('lastVisitedPath', '/dashboard');
        const redirectPath = lastPath === '/login' ? '/dashboard' : lastPath;
        
        showSuccess('Login successful! Redirecting...');
        // Memory-safe timeout for navigation
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } catch (err) {
        console.error('Login error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';
        setLoginError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } catch (outerErr) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
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
          
          <MainContent>
            <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-labelledby="login-title" noValidate>
              {/* Error Display */}
              {loginError && (
                <ErrorAlert>
                  {loginError}
                </ErrorAlert>
              )}
              
              <FormInput
                type="text"
                label="Username or Email"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
              
              <FormInput
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                onClick={(e) => {
                  if (loading) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Sign In
              </Button>
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


          </MainContent>
        </Card>
      </div>
    </div>
  );
} 