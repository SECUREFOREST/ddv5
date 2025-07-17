import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.' },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.' },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.' },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.' },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.' },
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
        // Only pass safe metadata (no description)
        const dareMeta = {
          _id: res.data._id,
          difficulty: res.data.difficulty,
          creator: res.data.creator ? { username: res.data.creator.username } : undefined,
        };
        navigate('/dare/consent', { state: { dare: dareMeta } });
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
    <div>
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Select Dare Difficulty</h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">Step 1 of 2: Choose Your Dare Difficulty</div>
      <div className="border-t border-neutral-800 my-6" />
      <div className="max-w-md w-full mx-auto bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-12 overflow-hidden">
        <form onSubmit={handleContinue} className="space-y-6 p-6">
          <div>
            <label className="block font-bold mb-2 text-primary text-lg flex items-center gap-2">
              Choose a difficulty
              <span className="ml-1" title="Difficulties determine how intense the dare will be.">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
              </span>
            </label>
            <div className="flex flex-col gap-3">
              {DIFFICULTIES.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer border transition-all duration-150
                    ${difficulty === opt.value
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
                  `}
                  tabIndex={0}
                  aria-label={`Select ${opt.label} difficulty`}
                >
                  <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} className="accent-primary mt-1" />
                  <span>
                    <b className="text-base">{opt.label}</b>
                    <div className="text-xs text-neutral-400 mt-1 ml-1">{opt.desc}</div>
                  </span>
                </label>
              ))}
            </div>
          </div>
          {/* Error message above button */}
          {error && <div className="text-danger text-center mt-2 mb-2 font-semibold" role="alert">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast"
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
        </form>
      </div>
    </div>
  );
} 