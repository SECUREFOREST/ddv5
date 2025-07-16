import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MOVES = ['rock', 'paper', 'scissors'];
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setToast('');
    try {
      const res = await api.post('/switches', { description, difficulty, move });
      setToast('Switch Game created!');
      setTimeout(() => navigate(`/switches/${res.data._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create switch game.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Create a Switch Game</h1>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">{toast}</div>
      )}
      {error && (
        <div className="mb-4 text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block font-semibold mb-1 text-primary">Dare Description</label>
          <textarea
            id="description"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Describe the dare..."
          />
        </div>
        <div>
          <label htmlFor="difficulty" className="block font-semibold mb-1 text-primary">Difficulty</label>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} />
                <span>
                  <b>{opt.label}</b><br/>
                  <span className="text-xs text-neutral-400">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-primary">Your Move</label>
          <div className="flex gap-3 mt-1">
            {MOVES.map(m => (
              <label key={m} className={`cursor-pointer px-3 py-2 rounded border ${move === m ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-900 text-neutral-100 border-neutral-700'}`}>
                <input
                  type="radio"
                  name="move"
                  value={m}
                  checked={move === m}
                  onChange={() => setMove(m)}
                  className="hidden"
                />
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark"
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Create Switch Game'}
        </button>
      </form>
    </div>
  );
} 