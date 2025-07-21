import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import { Banner } from '../components/Modal';
import { UserPlusIcon } from '@heroicons/react/24/solid';

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
    // Ensure dob is a string, interestedIn and limits are arrays
    const payload = {
      username,
      fullName,
      email,
      password,
      dob: dob ? String(dob) : '',
      gender,
      interestedIn: Array.isArray(interestedIn) ? interestedIn : [],
      limits: Array.isArray(limits) ? limits : [],
    };
    console.log('Register payload:', payload); // For debugging
    try {
      await register(payload);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <UserPlusIcon className="w-7 h-7 text-primary" /> Create Account
        </h1>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="flex flex-col items-center text-center px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto" role="form" aria-labelledby="register-title">
            <h1 id="register-title" className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
              <UserPlusIcon className="w-7 h-7 text-primary" /> Create Account
            </h1>
            <div>
              <label htmlFor="register-username" className="block font-semibold mb-1 text-primary">Username</label>
              <input
                type="text"
                id="register-username"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                aria-label="Username"
              />
            </div>
            <div>
              <label htmlFor="register-fullName" className="block font-semibold mb-1 text-primary">Full Name</label>
              <input
                type="text"
                id="register-fullName"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                aria-label="Full Name"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block font-semibold mb-1 text-primary">Email <span className="text-xs text-neutral-400">(we keep this private)</span></label>
              <input
                type="email"
                id="register-email"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block font-semibold mb-1 text-primary">Password</label>
              <input
                type="password"
                id="register-password"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                aria-label="Password"
              />
            </div>
            <div>
              <label htmlFor="register-dob" className="block font-semibold mb-1 text-primary">Date of Birth</label>
              <input
                type="date"
                id="register-dob"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                value={dob}
                onChange={e => setDob(e.target.value)}
                required
                aria-label="Date of Birth"
              />
            </div>
            <div>
              <label htmlFor="register-gender" className="block font-semibold mb-1 text-primary">Gender</label>
              <select
                id="register-gender"
                className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
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
                  <input id="register-interestedIn-female" type="checkbox" checked={interestedIn.includes('female')} onChange={() => handleInterestedIn('female')} className="bg-[#1a1a1a]" />
                  Female
                </label>
                <label className="flex items-center gap-2">
                  <input id="register-interestedIn-male" type="checkbox" checked={interestedIn.includes('male')} onChange={() => handleInterestedIn('male')} className="bg-[#1a1a1a]" />
                  Male
                </label>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-primary">Limits</label>
              <TagsInput value={limits} onChange={setLimits} placeholder="Add a limit..." />
            </div>
            {error && <Banner type="error" message={error} onClose={() => setError('')} />}
            {success && <Banner type="success" message={success} onClose={() => setSuccess('')} />}
            <button
              type="submit"
              className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-neutral-400">Already have an account?</span>{' '}
            <Link to="/login" className="text-primary hover:underline">Log In</Link>
          </div>
        </div>
      </main>
    </div>
  );
} 