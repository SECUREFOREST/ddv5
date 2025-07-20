import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRightIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.', icon: <SparklesIcon className="w-6 h-6 text-pink-400" /> },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.', icon: <FireIcon className="w-6 h-6 text-purple-500" /> },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.', icon: <EyeDropperIcon className="w-6 h-6 text-red-500" /> },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.', icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" /> },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.', icon: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" /> },
];

export default function DareDifficultySelect() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('titillating');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/dares/random?difficulty=${difficulty}`);
      if (res.data && res.data._id) {
        navigate(`/dare/consent/${res.data._id}`, { state: { dare: res.data } });
      } else {
        setError('No dare found for this difficulty.');
      }
    } catch (err) {
      const apiError = err.response?.data?.error || err.message;
      setError(apiError || 'Failed to fetch dare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-neutral-700 rounded-full h-2 mt-4 mb-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '50%' }} />
      </div>
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Select Dare Difficulty</h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">Step 1 of 2: Choose Your Dare Difficulty</div>
      {/* Section divider */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Card-like section for form content */}
      <form onSubmit={handleContinue} className="space-y-6 p-4 sm:p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4" role="radiogroup" aria-label="Dare Difficulty Selection">
        <div>
          <div className="font-bold text-xl text-primary mb-4">Choose a difficulty</div>
          <div className="flex flex-col gap-4">
            {DIFFICULTIES.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-primary-contrast
                  ${difficulty === opt.value
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
                `}
                tabIndex={0}
                aria-label={`Select ${opt.label} difficulty`}
                role="radio"
                aria-checked={difficulty === opt.value}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setDifficulty(opt.value);
                }}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={opt.value}
                  checked={difficulty === opt.value}
                  onChange={() => setDifficulty(opt.value)}
                  className="accent-primary focus:ring-2 focus:ring-primary-contrast focus:outline-none bg-[#1a1a1a]"
                  aria-checked={difficulty === opt.value}
                  aria-label={opt.label}
                  tabIndex={-1}
                />
                <span className="flex items-center gap-2">
                  {opt.icon}
                  <b className="text-base text-primary-contrast">{opt.label}</b>
                </span>
                <span className="text-xs text-neutral-400 ml-6 text-left">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Error message above button */}
        {error && <div className="bg-danger/10 text-danger text-center mt-2 mb-2 font-semibold rounded p-2 flex items-center gap-2 justify-center" role="alert"><ExclamationTriangleIcon className="w-5 h-5 inline text-danger" /> {error}</div>}
        <div className="sticky bottom-0 bg-gradient-to-t from-[#232526] via-[#282828] to-transparent py-4 flex justify-center z-10 border-t border-neutral-800">
          <button
            type="submit"
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
            disabled={loading}
            aria-label="Continue to next step"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-primary-contrast" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            ) : (
              <>
                Continue <ArrowRightIcon className="inline w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 