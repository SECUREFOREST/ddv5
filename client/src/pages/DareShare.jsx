import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      label = 'titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      label = 'arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      label = 'explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      label = 'edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      label = 'hardcore';
      break;
    default:
      label = level ? level : 'unknown';
  }
  return (
    <span className={`font-bold ${badgeClass}`}>{label}</span>
  );
}

export default function DareShare() {
  const { dareId } = useParams();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/dares/${dareId}`)
      .then(res => setDare(res.data))
      .catch(() => setError('Failed to load dare.'))
      .finally(() => setLoading(false));
  }, [dareId]);

  const dareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dares/${dareId}` : '';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this dare?')) return;
    setCanceling(true);
    try {
      await api.delete(`/dares/${dareId}`);
      setCanceled(true);
      setTimeout(() => navigate('/dares'), 1500);
    } catch {
      setError('Failed to cancel dare.');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <div className="text-center text-neutral-400 mt-12">Loading...</div>;
  if (error) return <div className="text-center text-danger mt-12">{error}</div>;
  if (canceled) return <div className="text-center text-success mt-12">Dare canceled. Redirecting...</div>;

  return (
    <div className="max-w-md w-full mx-auto mt-10 bg-[#222] border border-[#282828] rounded shadow p-6 relative" style={{ minHeight: 500 }}>
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">Hi {dare.creator?.username || 'there'}</h2>
        <div className="text-neutral-300 mb-2">share this link very carefully</div>
        <input
          className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 text-center font-mono mb-2"
          value={dareUrl}
          readOnly
          onFocus={e => e.target.select()}
        />
        <div className="mb-4 text-lg text-neutral-200">
          The first person to claim it can demand a{' '}
          <DifficultyBadge level={dare.difficulty} /> pic of their choice.
        </div>
        <button
          className="w-full bg-danger text-danger-contrast rounded px-4 py-2 font-bold mb-4 hover:bg-danger-dark"
          onClick={handleCancel}
          disabled={canceling}
        >
          {canceling ? 'Canceling...' : 'OMG, cancel this'}
        </button>
      </div>
      <div className="flex mb-4">
        <button
          className="flex-1 bg-primary text-primary-contrast rounded-l px-4 py-2 font-semibold hover:bg-primary-dark"
          onClick={() => navigator.clipboard.writeText(dareUrl)}
        >
          Share Privately
        </button>
        <button
          className="flex-1 bg-neutral-700 text-neutral-100 rounded-r px-4 py-2 font-semibold hover:bg-neutral-800"
          onClick={() => navigator.clipboard.writeText(dareUrl)}
        >
          Share with Strangers
        </button>
      </div>
      <div className="mb-4 bg-neutral-800 rounded p-3 text-neutral-300 text-sm">
        Share with your friends via email by copying and pasting the link above.<br />
        Share on adult social networks by copying the link above and pasting it into a message.
      </div>
      <button
        className="w-full bg-pink-700 text-white rounded px-4 py-2 font-semibold hover:bg-pink-800 mb-4"
        onClick={() => window.open('https://fetlife.com', '_blank')}
      >
        Share on Fetlife
      </button>
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-neutral-400">
        Built by kinky folks, for kinky folks.<br />
        <Link to="/about" className="underline text-primary">More about us</Link> | <Link to="/vote" className="underline text-primary">Vote for what we build next</Link><br />
        You have 0 kreds, <Link to="/kreds" className="underline text-primary">get more kreds</Link>.
      </div>
    </div>
  );
} 