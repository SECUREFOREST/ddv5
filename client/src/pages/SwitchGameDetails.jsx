import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MOVES = ['rock', 'paper', 'scissors'];

function getRpsResult(moveA, moveB) {
  if (moveA === moveB) return 'draw';
  if (
    (moveA === 'rock' && moveB === 'scissors') ||
    (moveA === 'scissors' && moveB === 'paper') ||
    (moveA === 'paper' && moveB === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

export default function SwitchGameDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [moveSubmitting, setMoveSubmitting] = useState(false);
  const [proof, setProof] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofError, setProofError] = useState('');
  const [polling, setPolling] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimeout = useRef(null);
  // Add error toast state
  const [errorToast, setErrorToast] = useState('');
  // Status badge helper
  const statusBadge = (status) => {
    if (status === 'open') return <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Open</span>;
    if (status === 'in_progress') return <span className="inline-block bg-info text-info-contrast rounded px-2 py-1 text-xs font-semibold ml-2">In Progress</span>;
    if (status === 'awaiting_proof') return <span className="inline-block bg-warning text-warning-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Awaiting Proof</span>;
    if (status === 'proof_submitted') return <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Proof Submitted</span>;
    if (status === 'expired') return <span className="inline-block bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Expired</span>;
    if (status === 'completed') return <span className="inline-block bg-neutral-500 text-white rounded px-2 py-1 text-xs font-semibold ml-2">Completed</span>;
    return <span className="inline-block bg-gray-400 text-white rounded px-2 py-1 text-xs font-semibold ml-2">{status}</span>;
  };

  // Show error toast helper
  const showErrorToast = (msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(''), 4000);
  };

  // Fetch game details
  const fetchGame = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/switches/${id}`);
      setGame(res.data);
    } catch (err) {
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    // Poll for updates every 2s if game is open and not completed
    let interval = null;
    if (game && game.status === 'open' && !game.winner) {
      setPolling(true);
      interval = setInterval(fetchGame, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setPolling(false);
    };
    // eslint-disable-next-line
  }, [id, game && game.status, game && game.winner]);

  // Show toast on status change
  useEffect(() => {
    if (!game) return;
    if (game.status === 'in_progress') setToast('Game started!');
    if (game.status === 'completed') setToast('Game completed!');
    if (game.status === 'proof_submitted') setToast('Proof submitted!');
    if (toast) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(''), 3000);
    }
    // eslint-disable-next-line
  }, [game && game.status]);

  // Live countdown for proof submission
  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    let interval = null;
    if (proofExpiresAt && isLoser && game && game.status === 'completed' && !game.proof) {
      const updateCountdown = () => {
        const now = new Date();
        const diff = proofExpiresAt - now;
        if (diff <= 0) {
          setCountdown('Expired');
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      };
      updateCountdown();
      interval = setInterval(updateCountdown, 1000);
    } else {
      setCountdown('');
    }
    return () => interval && clearInterval(interval);
    // eslint-disable-next-line
  }, [proofExpiresAt, isLoser, game && game.status, game && game.proof]);

  if (loading) {
    return <div className="max-w-lg mx-auto mt-12 bg-neutral-800 rounded-lg shadow p-6 text-center text-neutral-400">Loading...</div>;
  }
  if (!game) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
        <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
          <h1 className="text-xl font-bold mb-4">Switch Game Not Found</h1>
        </div>
        <div className="text-danger font-medium mb-4">No switch game with this ID exists.</div>
        <button className="bg-neutral-700 text-neutral-100 rounded-none px-4 py-2 font-semibold hover:bg-neutral-900" onClick={() => navigate('/switches')}>Back to Switch Games</button>
      </div>
    );
  }
  if (!user) {
    return <div className="max-w-lg mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 text-center text-[#888]">Please log in to view this game.</div>;
  }

  const username = user.username;
  const hasJoined = game.participants && game.participants.includes(username);
  const canPlayRps = game.participants && game.participants.length === 2 && !game.winner;
  const userMove = game.moves && game.moves[username];
  const bothMoves = canPlayRps && game.moves && Object.keys(game.moves).length === 2;
  let rpsResult = null;
  let winner = null;
  let loser = null;
  if (bothMoves) {
    const [p1, p2] = game.participants;
    const move1 = game.moves[p1];
    const move2 = game.moves[p2];
    const res1 = getRpsResult(move1, move2);
    if (res1 === 'draw') {
      rpsResult = 'draw';
    } else if (res1 === 'win') {
      winner = p1;
      loser = p2;
    } else {
      winner = p2;
      loser = p1;
    }
  }
  const isLoser = loser === username;
  const isWinner = winner === username;

  // Calculate proof expiration
  let proofExpiresAt = game.proofExpiresAt ? new Date(game.proofExpiresAt) : null;
  let proofExpired = false;
  let proofExpiresIn = null;
  if (proofExpiresAt) {
    const now = new Date();
    proofExpired = now > proofExpiresAt;
    if (!proofExpired) {
      const diff = proofExpiresAt - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      proofExpiresIn = `${hours}h ${minutes}m ${seconds}s`;
    }
  }

  // More granular status logic
  let granularStatus = game.status;
  if (game.status === 'completed' && !game.proof) {
    if (isLoser && countdown === 'Expired') {
      granularStatus = 'expired';
    } else {
      granularStatus = 'awaiting_proof';
    }
  }

  const handleJoin = async () => {
    if (hasJoined) return;
    setJoining(true);
    try {
      await api.post(`/api/switches/${id}/join`);
      await fetchGame();
    } catch (err) {
      showErrorToast(err.response?.data?.error || 'Failed to join game.');
    } finally {
      setJoining(false);
    }
  };

  const handleMove = async move => {
    setMoveSubmitting(true);
    try {
      await api.post(`/api/switches/${id}/move`, { move });
      await fetchGame();
    } catch (err) {
      showErrorToast(err.response?.data?.error || 'Failed to submit move.');
    } finally {
      setMoveSubmitting(false);
    }
  };

  const handleProofSubmit = async e => {
    e.preventDefault();
    if (!proof.trim()) {
      setProofError('Please enter proof of the demanded act.');
      return;
    }
    try {
      await api.post(`/api/switches/${id}/proof`, { text: proof });
      setShowProofModal(false);
      setProof('');
      setProofError('');
      await fetchGame();
    } catch (err) {
      showErrorToast(err.response?.data?.error || 'Failed to submit proof.');
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-xl font-bold mb-4">{game.name}</h1>
      </div>
      <div className="mb-2 flex items-center"><b>Status:</b> {statusBadge(granularStatus)}</div>
      <div className="mb-2"><b>Participants:</b> {game.participants ? game.participants.join(', ') : '-'}</div>
      <div className="mb-4"><b>Winner:</b> {game.winner || winner || '-'}</div>
      <hr className="my-4" />
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-info text-info-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">
          {toast}
        </div>
      )}
      {errorToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-danger text-danger-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="assertive">
          {errorToast}
        </div>
      )}
      {/* Only allow join if open and no participant */}
      {!hasJoined && game.status === 'open' && !game.participant && (
        <button className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={handleJoin} disabled={joining}>
          {joining ? 'Joining...' : 'Join Switch Game'}
        </button>
      )}
      {/* Only allow moves if in_progress and both users present and no winner */}
      {hasJoined && game.status === 'in_progress' && canPlayRps && !userMove && (
        <div className="mt-6">
          <b>Rock-Paper-Scissors: Choose your move</b>
          <div className="mt-3 flex gap-2">
            {MOVES.map(move => (
              <button
                key={move}
                className="bg-gray-200 text-gray-700 rounded px-4 py-2 font-semibold hover:bg-gray-300 disabled:opacity-50"
                onClick={() => handleMove(move)}
                disabled={moveSubmitting}
              >
                {move.charAt(0).toUpperCase() + move.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Waiting for other participant's move */}
      {hasJoined && game.status === 'in_progress' && canPlayRps && userMove && !bothMoves && (
        <div className="mt-6 text-blue-600 font-semibold">Waiting for the other participant to choose...</div>
      )}
      {/* Show draw message if both moves are the same */}
      {bothMoves && rpsResult === 'draw' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <b>It's a draw!</b> Both players chose {game.moves[game.participants[0]]}. Please choose again.
        </div>
      )}
      {/* Show winner/loser and proof submission if awaiting_proof */}
      {game.status === 'awaiting_proof' && (
        <div className="mt-6 bg-warning bg-opacity-10 border border-warning rounded p-4">
          <b>Awaiting proof from the loser.</b>
          {isLoser && !game.proof && (
            <>
              <div className="mt-2 text-warning font-semibold">Proof submission window: {countdown}</div>
              <button className="ml-2 bg-warning text-warning-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-warning-dark" onClick={() => setShowProofModal(true)}>
                Submit Proof
              </button>
              <Modal open={showProofModal} onClose={() => setShowProofModal(false)} title="Submit Proof" role="dialog" aria-modal="true">
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="proofText" className="block font-semibold mb-1">Proof</label>
                    <textarea
                      id="proofText"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
                      value={proof}
                      onChange={e => setProof(e.target.value)}
                      placeholder="Describe or link your proof..."
                      rows={4}
                    />
                  </div>
                  {proofError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{proofError}</div>}
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowProofModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark">
                      Submit
                    </button>
                  </div>
                </form>
              </Modal>
            </>
          )}
          {game.proof && (
            <div className="mt-2 text-info">Proof submitted by {game.proof.user}: {game.proof.text}</div>
          )}
        </div>
      )}
      {game.status === 'proof_submitted' && (
        <div className="mt-6 bg-success bg-opacity-10 border border-success rounded p-4">
          <b>Proof submitted!</b> Proof by {game.proof?.user}: {game.proof?.text}
        </div>
      )}
      {game.status === 'expired' && (
        <div className="mt-6 bg-danger bg-opacity-10 border border-danger rounded p-4">
          <b>Proof submission window has expired.</b>
        </div>
      )}
    </div>
  );
} 