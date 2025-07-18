import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MOVES = ['rock', 'paper', 'scissors'];
const MOVE_ICONS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};
const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.' },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.' },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.' },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.' },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.' },
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
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Create a Switch Game</h1>
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
          <div className="font-bold text-xl text-primary mb-2">Choose a difficulty</div>
          <div className="flex flex-col gap-3">
            {DIFFICULTIES.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer border transition-all duration-150
                ${difficulty === opt.value
                  ? 'border-primary bg-primary/10 shadow-lg scale-105'
                  : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
              `} tabIndex={0} aria-label={`Select ${opt.label} difficulty`}>
                <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} className="accent-primary mt-1 focus:ring-2 focus:ring-primary-contrast" />
                <span>
                  <b className="text-base">{opt.label}</b>
                  <div className="text-xs text-neutral-400 mt-1 ml-1">{opt.desc}</div>
                </span>
              </label>
            ))}
          </div>
        </div>
        {/* Description textarea */}
        <div>
          <div className="font-bold text-xl text-primary mb-2">Dare Description</div>
          <textarea
            id="description"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Describe the dare..."
            aria-label="Dare description"
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
              <label key={m} className={`cursor-pointer px-3 py-2 rounded-lg border transition-all duration-150 flex flex-col items-center
                ${move === m ? 'bg-primary text-primary-contrast border-primary scale-105 shadow-lg' : 'bg-neutral-900 text-neutral-100 border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}`}
                tabIndex={0} aria-label={`Select move ${m}`}>
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
          className="w-full bg-primary text-primary-contrast px-4 py-2 rounded font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-contrast"
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