import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

const MOVES = ['rock', 'paper', 'scissors'];
const MOVE_ICONS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};
const DIFFICULTIES = [
  {
    value: 'titillating',
    label: 'Titillating',
    desc: 'Fun, flirty, and easy. For beginners or light play.',
    icon: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  },
  {
    value: 'arousing',
    label: 'Arousing',
    desc: 'A bit more daring, but still approachable.',
    icon: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  },
  {
    value: 'explicit',
    label: 'Explicit',
    desc: 'Sexually explicit or more intense.',
    icon: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  },
  {
    value: 'edgy',
    label: 'Edgy',
    desc: 'Pushes boundaries, not for the faint of heart.',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  },
  {
    value: 'hardcore',
    label: 'Hardcore',
    desc: 'Extreme, risky, or very advanced.',
    icon: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
  },
];

export default function SwitchGameCreate() {
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [move, setMove] = useState('rock');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [publicGame, setPublicGame] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setToast('');
    try {
      const res = await api.post('/switches', { description, difficulty, move, public: publicGame });
      setToast('Switch Game created!');
      setTimeout(() => navigate(`/switches/${res.data._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create switch game.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Create a Switch Game</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Toast notification for feedback (if needed) */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">{toast}</div>
      )}
      {error && (
        <div className="mb-4 text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>
      )}
      {/* Card-like section for form content */}
      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
        {/* Difficulty selection */}
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
                  className="accent-primary focus:ring-2 focus:ring-primary-contrast focus:outline-none"
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
        {/* Description textarea */}
        <div>
          <label className="block font-bold text-primary mb-2">Description / Requirements</label>
          <textarea
            id="description"
            className="w-full rounded border border-neutral-900 px-3 py-2" style={{ backgroundColor: '#181818' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
            minLength={10}
            placeholder="Describe the dare..."
            aria-label="Description or requirements"
          />
        </div>
        {/* Public/private toggle */}
        <div className="flex items-center justify-center">
          <input id="publicGame" type="checkbox" checked={publicGame} onChange={e => setPublicGame(e.target.checked)} className="mr-2 accent-primary focus:ring-2 focus:ring-primary-contrast" />
          <label htmlFor="publicGame" className="text-neutral-200">Make this switch game public (visible to others)</label>
        </div>
        {/* Move selection */}
        <div>
          <div className="font-bold text-xl text-primary mb-2">Your Move</div>
          <div className="flex gap-3 mt-1 justify-center">
            {MOVES.map(m => (
              <label
                key={m}
                className={`cursor-pointer px-3 py-2 rounded-lg border transition-all duration-150 flex flex-col items-center ${move === m ? 'bg-primary text-primary-contrast border-primary scale-105 shadow-lg' : 'bg-neutral-900 text-neutral-100 border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}`}
                tabIndex={0}
                aria-label={`Select move ${m}`}
              >
                <input
                  type="radio"
                  name="move"
                  value={m}
                  checked={move === m}
                  onChange={() => setMove(m)}
                  className="hidden"
                />
                <span className="text-2xl mb-1">{MOVE_ICONS[m]}</span>
                <span className="font-semibold">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-contrast px-4 py-2 rounded font-bold hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-contrast"
          disabled={creating}
          aria-label="Create Switch Game"
        >
          {creating ? (
            <svg className="animate-spin h-5 w-5 text-primary-contrast" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          ) : (
            <>Create Switch Game</>
          )}
        </button>
      </form>
    </div>
  );
}