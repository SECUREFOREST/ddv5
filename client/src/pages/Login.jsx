import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="max-w-sm w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Link to="/" className="inline-block mb-4">
        <button className="text-primary hover:text-primary-dark text-sm font-semibold">&larr; Back to Home</button>
      </Link>
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="identifier" className="block font-semibold mb-1 text-primary">Username or Email</label>
          <input
            type="text"
            id="identifier"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            aria-label="Username or Email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1 text-primary">Password</label>
          <input
            type="password"
            id="password"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            aria-label="Password"
          />
        </div>
        {error && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>}
        {success && <div className="text-success text-sm font-medium" role="status" aria-live="polite">{success}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark"
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
  );
} 