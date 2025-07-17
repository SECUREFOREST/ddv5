import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

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
    <div className="max-w-sm w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Select Dare Difficulty</h1>
      <form onSubmit={handleContinue} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-primary">Choose a difficulty</label>
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
        <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={loading}>
          {loading ? 'Loading...' : 'Continue'}
        </button>
        {error && <div className="text-danger text-center mt-2">{error}</div>}
      </form>
    </div>
  );
} 