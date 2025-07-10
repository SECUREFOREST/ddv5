import React, { useState, useEffect } from 'react';
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

  const handleJoin = async () => {
    if (hasJoined) return;
    setJoining(true);
    try {
      await api.post(`/api/switches/${id}/join`);
      await fetchGame();
    } catch (err) {
      // handle error
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
      // handle error
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
      setProofError('Failed to submit proof.');
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-xl font-bold mb-4">{game.name}</h1>
      </div>
      <div className="mb-2"><b>Status:</b> {game.status}</div>
      <div className="mb-2"><b>Participants:</b> {game.participants ? game.participants.join(', ') : '-'}</div>
      <div className="mb-4"><b>Winner:</b> {game.winner || winner || '-'}</div>
      <hr className="my-4" />
      {!hasJoined && (
        <button className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={handleJoin} disabled={joining}>
          {joining ? 'Joining...' : 'Join Switch Game'}
        </button>
      )}
      {hasJoined && canPlayRps && !userMove && (
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
      {hasJoined && canPlayRps && userMove && !bothMoves && (
        <div className="mt-6 text-blue-600 font-semibold">Waiting for the other participant to choose...</div>
      )}
      {bothMoves && rpsResult === 'draw' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <b>It's a draw!</b> Both players chose {game.moves[game.participants[0]]}. Please choose again.
        </div>
      )}
      {bothMoves && winner && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
          <b>{winner} wins!</b> {loser} must submit proof of the demanded act.
          {proofExpiresAt && (
            <div className="mt-2">
              <b>Proof review window:</b> {proofExpired ? <span className="text-red-500">Expired</span> : <span>{proofExpiresIn} remaining</span>}
            </div>
          )}
        </div>
      )}
      {bothMoves && isLoser && !game.proof && proofExpiresAt && proofExpired && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded p-4">
          <b>Proof submission window has expired. You can no longer submit proof.</b>
        </div>
      )}
      {bothMoves && isLoser && !game.proof && (!proofExpiresAt || !proofExpired) && (
        <div className="mt-6">
          <button className="bg-yellow-400 text-gray-900 rounded px-4 py-2 font-semibold hover:bg-yellow-300" onClick={() => setShowProofModal(true)}>
            Submit Proof of Demanded Act
          </button>
          {proofExpiresAt && (
            <div className="mt-2">
              <b>Proof submission window:</b> {proofExpiresIn ? <span>{proofExpiresIn} remaining</span> : null}
            </div>
          )}
        </div>
      )}
      {bothMoves && isLoser && game.proof && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <b>Proof submitted:</b> {game.proof.text}
          {proofExpiresAt && (
            <div className="mt-2">
              <b>Proof review window:</b> {proofExpired ? <span className="text-red-500">Expired</span> : <span>{proofExpiresIn} remaining</span>}
            </div>
          )}
        </div>
      )}
      {bothMoves && isWinner && game.proof && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <b>{loser} has submitted proof:</b> {game.proof.text}
          {proofExpiresAt && (
            <div className="mt-2">
              <b>Proof review window:</b> {proofExpired ? <span className="text-red-500">Expired</span> : <span>{proofExpiresIn} remaining</span>}
            </div>
          )}
        </div>
      )}
      <Modal open={showProofModal} onClose={() => setShowProofModal(false)} title="Submit Proof" role="dialog" aria-modal="true">
        <form onSubmit={handleProofSubmit} className="space-y-4">
          <div>
            <label htmlFor="proof" className="block font-semibold mb-1">Proof of Demanded Act</label>
            <textarea
              id="proof"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={4}
              placeholder="Describe or link to your proof..."
              required
            />
          </div>
          {proofError && <div className="text-red-500 text-sm font-medium" role="alert" aria-live="assertive">{proofError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowProofModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50">
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 