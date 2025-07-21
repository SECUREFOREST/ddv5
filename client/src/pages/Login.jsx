import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await login(identifier, password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
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
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <ArrowRightOnRectangleIcon className="w-7 h-7 text-primary" /> Login
        </h1>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        {/* Section divider for main content */}
        <div className="flex flex-col items-center text-center px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto" role="form" aria-labelledby="login-title">
            <div>
              <label htmlFor="login-identifier" className="block font-semibold mb-1 text-primary">Username or Email</label>
              <input
                type="text"
                id="login-identifier"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                aria-label="Username or Email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block font-semibold mb-1 text-primary">Password</label>
              <input
                type="password"
                id="login-password"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
            {error && <Banner type="error" message={error} onClose={() => setError('')} />}
            {success && <Banner type="success" message={success} onClose={() => setSuccess('')} />}
            <button
              type="submit"
              className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-neutral-400">Don't have an account?</span>{' '}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </div>
      </main>
    </div>
  );
} 