import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import { ShareIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden relative">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <ShareIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Share Dare
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <ShareIcon className="w-6 h-6" /> Share Dare
        </span>
      </div>
      <div className="border-t border-neutral-800 my-4" />
      <h2 className="text-xl font-bold text-center mb-2">Hi {dare.creator?.username || 'there'}</h2>
      <div className="text-neutral-300 text-center mb-2">share this link very carefully</div>
      <input
        className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 text-center font-mono mb-2"
        value={dareUrl}
        readOnly
        onFocus={e => e.target.select()}
      />
      <div className="mb-4 text-lg text-neutral-200 text-center">
        The first person to claim it can demand a{' '}
        <DifficultyBadge level={dare.difficulty} /> pic of their choice.
      </div>
      <Button
        variant="danger"
        className="w-full mb-4"
        onClick={handleCancel}
        disabled={canceling}
      >
        {canceling ? 'Canceling...' : 'OMG, cancel this'}
      </Button>
      <div className="flex mb-4">
        <Button
          variant="primary"
          className="flex-1 rounded-l-none"
          onClick={() => navigator.clipboard.writeText(dareUrl)}
        >
          Share Privately
        </Button>
        <Button
          variant="default"
          className="flex-1 rounded-r-none"
          onClick={() => navigator.clipboard.writeText(dareUrl)}
        >
          Share with Strangers
        </Button>
      </div>
      <div className="mb-4 bg-neutral-800 rounded p-3 text-neutral-300 text-sm">
        Share with your friends via email by copying and pasting the link above.<br />
        Share on adult social networks by copying the link above and pasting it into a message.
      </div>
      <Button
        variant="primary"
        className="w-full bg-pink-700 hover:bg-pink-800 mb-4"
        onClick={() => window.open('https://fetlife.com', '_blank')}
      >
        Share on Fetlife
      </Button>
      {/* Remove the footer links and kreds info */}
    </div>
  );
} 