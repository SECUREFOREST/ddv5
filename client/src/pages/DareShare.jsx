import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { ShareIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600/20 border border-pink-500/50 text-pink-300';
      label = 'titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-600/20 border border-purple-500/50 text-purple-300';
      label = 'arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-600/20 border border-red-500/50 text-red-300';
      label = 'explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300';
      label = 'edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black/20 border border-white/50 text-white';
      label = 'hardcore';
      break;
    default:
      label = level ? level : 'unknown';
  }
  return (
    <span className={`font-bold px-3 py-1 rounded-full text-sm ${badgeClass}`}>{label}</span>
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
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setLoading(true);
    api.get(`/dares/${dareId}`)
      .then(res => setDare(res.data))
      .catch(() => {
        setError('Failed to load dare.');
        showError('Failed to load dare.');
      })
      .finally(() => setLoading(false));
  }, [dareId, showError]);

  const dareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dares/${dareId}` : '';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this dare?')) return;
    setCanceling(true);
    try {
      await api.delete(`/dares/${dareId}`);
      setCanceled(true);
      showSuccess('Dare canceled successfully.');
      setTimeout(() => navigate('/dares'), 1500);
    } catch {
      setError('Failed to cancel dare.');
      showError('Failed to cancel dare.');
    } finally {
      setCanceling(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dareUrl);
    showSuccess('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-white/60">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-white/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Dare Canceled</h2>
            <p className="text-white/80">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ShareIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Share Dare</h1>
            </div>
          </div>

          {/* Share Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-white text-center mb-4">Hi {dare.creator?.username || 'there'}</h2>
            <p className="text-white/70 text-center mb-6">Share this link very carefully</p>
            
            <div className="mb-6">
              <input
                className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                value={dareUrl}
                readOnly
                onFocus={e => e.target.select()}
                aria-label="Dare share link"
              />
            </div>

            <div className="mb-6 text-lg text-white/80 text-center">
              The first person to claim it can demand a{' '}
              <DifficultyBadge level={dare.difficulty} /> pic of their choice.
            </div>

            <div className="space-y-4">
              <button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                onClick={handleCancel}
                disabled={canceling}
              >
                {canceling ? 'Canceling...' : 'OMG, cancel this'}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-4 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={handleCopyLink}
                >
                  Share Privately
                </button>
                <button
                  className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-3 font-bold hover:bg-white/20 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={handleCopyLink}
                >
                  Share with Strangers
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl mb-8">
            <div className="text-white/70 text-sm space-y-2">
              <p>Share with your friends via email by copying and pasting the link above.</p>
              <p>Share on adult social networks by copying the link above and pasting it into a message.</p>
            </div>
          </div>

          {/* External Share Button */}
          <div className="text-center">
            <button
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl px-8 py-4 font-bold hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={() => window.open('https://fetlife.com', '_blank')}
            >
              Share on Fetlife
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 