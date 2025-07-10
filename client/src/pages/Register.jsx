import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import TagsInput from '../components/TagsInput';

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [interestedIn, setInterestedIn] = useState([]);
  const [limits, setLimits] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!username || !fullName || !email || !password || !dob || !gender || interestedIn.length === 0) {
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

  const handleInterestedIn = (val) => {
    setInterestedIn(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ username, fullName, email, password, dob, gender, interestedIn, limits });
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
          <label htmlFor="fullName" className="block font-semibold mb-1 text-primary">Full Name</label>
          <input
            id="fullName"
            type="text"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            aria-label="Full Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1 text-primary">Email <span className="text-xs text-neutral-400">(we keep this private)</span></label>
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
        <div>
          <label htmlFor="dob" className="block font-semibold mb-1 text-primary">Date of Birth</label>
          <input
            id="dob"
            type="date"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
            value={dob}
            onChange={e => setDob(e.target.value)}
            required
            aria-label="Date of Birth"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block font-semibold mb-1 text-primary">Gender</label>
          <select
            id="gender"
            className="w-full rounded border border-[#282828] px-3 py-2 bg-[#282828] text-[#eee] focus:outline-none focus:ring focus:border-primary"
            value={gender}
            onChange={e => setGender(e.target.value)}
            required
            aria-label="Gender"
          >
            <option value="">Select...</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-primary">Interested in</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={interestedIn.includes('female')} onChange={() => handleInterestedIn('female')} />
              Female
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={interestedIn.includes('male')} onChange={() => handleInterestedIn('male')} />
              Male
            </label>
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-primary">Limits</label>
          <TagsInput value={limits} onChange={setLimits} placeholder="Add a limit..." />
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