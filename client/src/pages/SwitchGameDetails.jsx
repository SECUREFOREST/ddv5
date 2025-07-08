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
    return <div className="panel panel-default" style={{ maxWidth: 500, margin: '40px auto' }}><div className="panel-body">Loading...</div></div>;
  }
  if (!game) {
    return (
      <div className="panel panel-default" style={{ maxWidth: 500, margin: '40px auto' }}>
        <div className="panel-heading">
          <h1 className="panel-title">Switch Game Not Found</h1>
        </div>
        <div className="panel-body">
          <div className="text-danger">No switch game with this ID exists.</div>
          <button className="btn btn-default" onClick={() => navigate('/switches')}>Back to Switch Games</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="panel panel-default" style={{ maxWidth: 500, margin: '40px auto' }}><div className="panel-body">Please log in to participate in switch games.</div></div>;
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
    <div className="panel panel-default" style={{ maxWidth: 500, margin: '40px auto' }}>
      <div className="panel-heading">
        <h1 className="panel-title">{game.name}</h1>
      </div>
      <div className="panel-body">
        <div><b>Status:</b> {game.status}</div>
        <div><b>Participants:</b> {game.participants ? game.participants.join(', ') : '-'}</div>
        <div><b>Winner:</b> {game.winner || winner || '-'}</div>
        <hr />
        {!hasJoined && (
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining...' : 'Join Switch Game'}
          </button>
        )}
        {hasJoined && canPlayRps && !userMove && (
          <div style={{ marginTop: 20 }}>
            <b>Rock-Paper-Scissors: Choose your move</b>
            <div style={{ marginTop: 10 }}>
              {MOVES.map(move => (
                <button
                  key={move}
                  className="btn btn-default"
                  style={{ marginRight: 8 }}
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
          <div style={{ marginTop: 20 }}>
            <b>Waiting for the other participant to choose...</b>
          </div>
        )}
        {bothMoves && rpsResult === 'draw' && (
          <div style={{ marginTop: 20 }} className="alert alert-info">
            <b>It's a draw!</b> Both players chose {game.moves[game.participants[0]]}. Please choose again.
            {/* Optionally, add a button to reset moves if backend supports it */}
          </div>
        )}
        {bothMoves && winner && (
          <div style={{ marginTop: 20 }} className="alert alert-success">
            <b>{winner} wins!</b> {loser} must submit proof of the demanded act.
            {proofExpiresAt && (
              <div style={{ marginTop: 10 }}>
                <b>Proof review window:</b> {proofExpired ? <span className="text-danger">Expired</span> : <span>{proofExpiresIn} remaining</span>}
              </div>
            )}
          </div>
        )}
        {bothMoves && isLoser && !game.proof && proofExpiresAt && proofExpired && (
          <div style={{ marginTop: 20 }} className="alert alert-danger">
            <b>Proof submission window has expired. You can no longer submit proof.</b>
          </div>
        )}
        {bothMoves && isLoser && !game.proof && (!proofExpiresAt || !proofExpired) && (
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-warning" onClick={() => setShowProofModal(true)}>
              Submit Proof of Demanded Act
            </button>
            {proofExpiresAt && (
              <div style={{ marginTop: 10 }}>
                <b>Proof submission window:</b> {proofExpiresIn ? <span>{proofExpiresIn} remaining</span> : null}
              </div>
            )}
          </div>
        )}
        {bothMoves && isLoser && game.proof && (
          <div style={{ marginTop: 20 }} className="alert alert-info">
            <b>Proof submitted:</b> {game.proof.text}
            {proofExpiresAt && (
              <div style={{ marginTop: 10 }}>
                <b>Proof review window:</b> {proofExpired ? <span className="text-danger">Expired</span> : <span>{proofExpiresIn} remaining</span>}
              </div>
            )}
          </div>
        )}
        {bothMoves && isWinner && game.proof && (
          <div style={{ marginTop: 20 }} className="alert alert-info">
            <b>{loser} has submitted proof:</b> {game.proof.text}
            {proofExpiresAt && (
              <div style={{ marginTop: 10 }}>
                <b>Proof review window:</b> {proofExpired ? <span className="text-danger">Expired</span> : <span>{proofExpiresIn} remaining</span>}
              </div>
            )}
          </div>
        )}
        <button className="btn btn-default" style={{ marginTop: 30 }} onClick={() => navigate('/switches')}>Back to Switch Games</button>
      </div>
      <Modal open={showProofModal} onClose={() => setShowProofModal(false)} title="Submit Proof of Demanded Act">
        <form onSubmit={handleProofSubmit}>
          <div className="form-group">
            <label>Describe or upload proof of the demanded act:</label>
            <textarea
              className="form-control"
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={4}
              placeholder="Describe what you did, or paste a link to a photo, etc."
            />
          </div>
          {proofError && <div className="text-danger help-block">{proofError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowProofModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Proof
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 