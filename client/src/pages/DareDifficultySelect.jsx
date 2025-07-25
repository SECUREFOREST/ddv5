import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRightIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';
import { DIFFICULTY_OPTIONS } from '../constants';

const DIFFICULTY_ICONS = {
  titillating: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  arousing: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  explicit: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  edgy: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  hardcore: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
};

export default function DareDifficultySelect() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('titillating');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/dares/random?difficulty=${difficulty}`);
      if (res.data && res.data._id) {
        navigate(`/dare/consent/${res.data._id}`, { state: { dare: res.data } });
      } else {
        showNotification('No dare found for this difficulty.', 'error');
      }
    } catch (err) {
      const apiError = err.response?.data?.error || err.message;
      showNotification(apiError || 'Failed to fetch dare.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Choose Dare Difficulty</h1>
      </div>
      {/* Card-like section for form content */}
      <form role="form" onSubmit={handleContinue} className="space-y-6 p-4 sm:p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-duration-200 mb-4" aria-label="Dare Difficulty Selection">
        <div>
          <div className="flex flex-col gap-4">
            {DIFFICULTY_OPTIONS.map(opt => (
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
                  aria-required="true"
                />
                <span className="flex items-center gap-2">
                  {DIFFICULTY_ICONS[opt.value]}
                  <b className="text-base text-primary-contrast">{opt.label}</b>
                </span>
                <span className="text-xs text-neutral-400 ml-6 text-left">{opt.desc}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Error message above button */}
        <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
          <button
            type="submit"
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
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