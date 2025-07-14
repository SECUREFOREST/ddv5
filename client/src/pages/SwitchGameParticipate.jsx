import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';

const MOVES = ['rock', 'paper', 'scissors'];
// Removed DIFFICULTIES and difficulty state

export default function SwitchGameParticipate() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  // Removed difficulty state
  const [move, setMove] = useState('rock');
  const [consent, setConsent] = useState(false);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setGeneralError('');
    api.get('/switches')
      .then(res => setGames(Array.isArray(res.data)
        ? res.data.filter(g => g.status === 'waiting_for_participant' && !g.participant && (!user || (typeof g.creator === 'object' ? g.creator._id !== user.id : g.creator !== user.id)))
        : []))
      .catch(() => { setGames([]); setGeneralError('Failed to load switch games.'); })
      .finally(() => setLoading(false));
  }, [user]);

  const handleParticipate = (game) => {
    setSelectedGame(game);
    // Removed setDifficulty
    setMove('rock');
    setConsent(false);
    setError('');
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!consent) {
      setError('You must consent to participate.');
      setGeneralError('You must consent to participate.');
      return;
    }
    setJoining(true);
    setError('');
    setToast('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      // Removed difficulty from join API call
      await api.post(`/switches/${selectedGame._id}/join`, { move });
      setToast('Joined switch game!');
      setGeneralSuccess('Joined switch game!');
      setTimeout(() => navigate(`/switches/${selectedGame._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join switch game.');
      setGeneralError(err.response?.data?.error || 'Failed to join switch game.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Participate in a Switch Game</h1>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">{toast}</div>
      )}
      {loading ? (
        <div className="text-center text-neutral-400">Loading available switch games...</div>
      ) : games.length === 0 ? (
        <div className="text-center text-neutral-400">No switch games are currently waiting for a participant.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow mb-4">
          <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th className="p-2 text-left font-semibold">Title</th>
                <th className="p-2 text-left font-semibold">Creator</th>
                <th className="p-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {games.map((g) => (
                <tr key={g._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                  <td className="p-2 font-medium text-primary">{g.title || g.name || 'Untitled'}</td>
                  <td className="p-2">
                    <span className="inline-flex items-center gap-2">
                      <Avatar user={g.creator} size={24} />
                      {g.creator && typeof g.creator === 'object' ? (g.creator.username || '[deleted]') : '-'}
                    </span>
                  </td>
                  <td className="p-2">
                    <button
                      className="bg-primary text-primary-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-primary-dark"
                      onClick={() => handleParticipate(g)}
                      disabled={user && ((typeof g.creator === 'object' ? g.creator._id : g.creator) === user.id)}
                    >
                      Participate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={!!selectedGame} onClose={() => setSelectedGame(null)} title="Participate in Switch Game" role="dialog" aria-modal="true">
        <form onSubmit={handleJoin} className="space-y-4">
          {/* Show dare description if available */}
          {selectedGame && selectedGame.creatorDare && selectedGame.creatorDare.description && (
            <div className="mb-2 p-3 bg-neutral-900 rounded border border-neutral-800">
              <b className="block mb-1 text-primary">Dare Description:</b>
              <span className="text-neutral-100">{selectedGame.creatorDare.description}</span>
            </div>
          )}
          {/* Removed difficulty selector UI */}
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mr-2"
              required
            />
            <label htmlFor="consent" className="text-sm">I consent to participate and complete the dare if I lose.</label>
          </div>
          {error && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setSelectedGame(null)} disabled={joining}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50" disabled={joining}>
              {joining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 