import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username || !email || !password) {
      setError('All fields are required.');
      return false;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Link to="/" className="inline-block mb-4">
        <button className="text-primary hover:text-primary-dark text-sm font-semibold">&larr; Back to Home</button>
      </Link>
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block font-semibold mb-1 text-primary">Username</label>
          <input
            id="username"
            type="text"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            aria-label="Username"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1 text-primary">Email</label>
          <input
            id="email"
            type="email"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1 text-primary">Password</label>
          <input
            id="password"
            type="password"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
} 