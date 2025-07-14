import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';

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
  const [expireAfterView, setExpireAfterView] = useState(false);
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [fetchingGame, setFetchingGame] = useState(false);
  const [fetchGameError, setFetchGameError] = useState('');

  // --- Move winner/loser/isLoser logic up here ---
  const username = user?.username;
  const hasJoined = game?.participants && game.participants.includes(username);
  const canPlayRps = game?.participants && game.participants.length === 2 && !game.winner;
  const userMove = game?.moves && game.moves[username];
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

  // --- proofExpiresAt and related calculations (already moved up) ---
  let proofExpiresAt = game?.proofExpiresAt ? new Date(game.proofExpiresAt) : null;
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

  // --- granularStatus logic ---
  let granularStatus = game?.status;
  if (game?.status === 'completed' && !game?.proof) {
    if (isLoser && proofExpiresAt && !proofExpired) {
      granularStatus = 'expired';
    } else {
      granularStatus = 'awaiting_proof';
    }
  }
  // Status badge helper
  const statusBadge = (status) => {
    if (status === 'waiting_for_participant') return <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Waiting for Participant</span>;
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

  // Custom comparison for relevant fields
  const isGameEqual = (a, b) => {
    if (!a || !b) return false;
    return (
      a.status === b.status &&
      a.creator === b.creator &&
      a.participant === b.participant &&
      JSON.stringify(a.creatorDare) === JSON.stringify(b.creatorDare) &&
      JSON.stringify(a.participantDare) === JSON.stringify(b.participantDare) &&
      a.winner === b.winner &&
      JSON.stringify(a.proof) === JSON.stringify(b.proof) &&
      String(a.proofExpiresAt) === String(b.proofExpiresAt)
    );
  };

  // Enhanced fetchGame with loading/error state
  const fetchGameWithFeedback = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setFetchingGame(true);
    setFetchGameError('');
    try {
      const res = await api.get(`/switches/${id}`);
      if (!isGameEqual(res.data, game)) {
        setGame(res.data);
      }
    } catch (err) {
      setFetchGameError('Failed to load updated switch game details. Please refresh the page.');
    } finally {
      setFetchingGame(false);
      if (showLoading) setLoading(false);
    }
  };

  // Replace all fetchGame(true) with fetchGameWithFeedback(true)
  useEffect(() => {
    fetchGameWithFeedback(true); // show loading spinner on first load
    // eslint-disable-next-line
  }, [id]);

  // Poll for updates every 2s if game is waiting for participant and not completed
  useEffect(() => {
    if (!game || game.status !== 'waiting_for_participant' || game.winner) return;
    const interval = setInterval(() => fetchGameWithFeedback(false), 2000); // no loading spinner for polling
    return () => clearInterval(interval);
  }, [game && game.status, game && game.winner]);

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

  // Check if user has already graded this switch game
  const hasGraded = user && game && game.grades && game.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id));
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [grading, setGrading] = useState(false);

  const handleGrade = async (e) => {
    e.preventDefault();
    setGradeError('');
    if (!grade) {
      setGradeError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback });
      setGrade('');
      setFeedback('');
      setToast('Grade submitted!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  // Grading logic for bidirectional grading
  const hasGradedParticipant = user && game && game.grades && game.participant && game.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === game.participant._id || g.target === game.participant._id || g.target === game.participant));
  const hasGradedCreator = user && game && game.grades && game.creator && game.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === game.creator._id || g.target === game.creator._id || g.target === game.creator));
  const handleBidirectionalGrade = async (e, targetId) => {
    e.preventDefault();
    setGradeError('');
    if (!grade) {
      setGradeError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback, target: targetId });
      setGrade('');
      setFeedback('');
      setToast('Grade submitted!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  // Helper to normalize MongoDB IDs
  const getId = (obj) => (typeof obj === 'object' && obj !== null ? obj._id : obj);
  const isCreator = user && game && getId(game.creator) === user.id;
  const isParticipant = user && game && getId(game.participant) === user.id;

  // Improved debug log for updated game state
  useEffect(() => {
    if (game && (toast || proofError || generalSuccess)) {
      console.log('Updated switch game after action:', game);
    }
  }, [game, toast, proofError, generalSuccess]);

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

  const handleJoin = async () => {
    setJoining(true);
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.post(`/switches/${id}/join`, { difficulty: game.creatorDare.difficulty, move: '', consent: true });
      setGeneralSuccess('Joined the game successfully!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to join the game.');
    } finally {
      setJoining(false);
    }
  };

  const handleMoveSubmit = async (move) => {
    setMoveSubmitting(true);
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.post(`/switches/${id}/move`, { move });
      setGeneralSuccess('Move submitted!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to submit move.');
    } finally {
      setMoveSubmitting(false);
    }
  };

  const handleProofSubmit = async () => {
    setProofError('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.post(`/switches/${id}/proof`, { text: proof, expireAfterView });
      setProof('');
      setShowProofModal(false);
      setGeneralSuccess('Proof submitted!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      setGeneralError(err.response?.data?.error || 'Failed to submit proof.');
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      await api.post(`/switches/${id}/forfeit`);
      await fetchGameWithFeedback();
      setToast('You have chickened out (forfeited) this switch game.');
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
    } finally {
      setChickenOutLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-[#222] border border-[#282828] rounded shadow">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-xl font-bold mb-4">{game.name}</h1>
      </div>
      <div className="mb-2 flex items-center"><b>Status:</b> {statusBadge(granularStatus)}</div>
      <div className="mb-2"><b>Participants:</b> {[
        <span className="inline-flex items-center gap-2"><Avatar user={game.creator} size={28} />{game.creator?.username || '[deleted]'}</span>,
        <span className="inline-flex items-center gap-2"><Avatar user={game.participant} size={28} />{game.participant?.username || '[deleted]'}</span>
      ].filter(Boolean).join(', ') || '-'}</div>
      {/* Difficulty display */}
      <div className="mb-2"><b>Difficulty:</b> {game.creatorDare && game.creatorDare.difficulty ? game.creatorDare.difficulty.charAt(0).toUpperCase() + game.creatorDare.difficulty.slice(1) : '-'}</div>
      <div className="mb-4"><b>Winner:</b> {game.winner ? <span className="inline-flex items-center gap-2"><Avatar user={game.winner} size={28} />{game.winner?.username || '[deleted]'}</span> : '-'}</div>
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
      {/* Only allow join if waiting for participant and no participant */}
      {!hasJoined && game.status === 'waiting_for_participant' && !game.participant && (
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
                onClick={() => handleMoveSubmit(move)}
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
                  <div className="flex items-center mt-2">
                    <input
                      id="expireAfterView"
                      type="checkbox"
                      checked={expireAfterView}
                      onChange={e => setExpireAfterView(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="expireAfterView" className="text-sm">Expire proof 48 hours after it is viewed by the dare creator.</label>
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
            <div className="mt-2 text-info">Proof submitted by <span className="inline-flex items-center gap-2"><Avatar user={game.proof.user} size={28} />{game.proof.user?.username || '[deleted]'}</span>: {game.proof.text}</div>
          )}
        </div>
      )}
      {game.status === 'proof_submitted' && (
        <div className="mt-6 bg-success bg-opacity-10 border border-success rounded p-4">
          <b>Proof submitted!</b> Proof by <span className="inline-flex items-center gap-2"><Avatar user={game.proof?.user} size={28} />{game.proof?.user?.username || '[deleted]'}</span>: {game.proof?.text}
        </div>
      )}
      {game.status === 'expired' && (
        <div className="mt-6 bg-danger bg-opacity-10 border border-danger rounded p-4">
          <b>Proof submission window has expired.</b>
        </div>
      )}
      {/* Grades Section */}
      {game && (
        <div className="bg-neutral-900 rounded p-4 mb-6 mt-6">
          <div className="border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Grades</h2>
          </div>
          <div>
            {fetchingGame && <div className="text-center text-info mb-2">Loading updated switch game details...</div>}
            {fetchGameError && <div className="text-danger text-center mb-2">{fetchGameError}</div>}
            {game.grades && game.grades.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {game.grades.map((g, i) => (
                  <li key={i} className="flex items-center gap-3 bg-neutral-800 rounded p-2">
                    <Avatar user={g.user} size={24} />
                    <span className="font-semibold">{g.user?.username || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">
                      ({g.user && game.creator && (getId(g.user) === getId(game.creator) ? 'Creator' : 'Participant')})
                    </span>
                    <span className="mx-2">→</span>
                    <Avatar user={g.target} size={24} />
                    <span className="font-semibold">{g.target?.username || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">
                      ({g.target && game.creator && (getId(g.target) === getId(game.creator) ? 'Creator' : 'Participant')})
                    </span>
                    <span className="ml-4 bg-primary text-white rounded px-2 py-1 text-xs font-semibold">
                      {g.grade}
                    </span>
                    {g.feedback && <span className="text-gray-400 ml-2">({g.feedback})</span>}
                    {g.createdAt && (
                      <span className="ml-2 text-xs text-gray-500">{new Date(g.createdAt).toLocaleString()}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 mb-4 text-center">No grades yet.</div>
            )}
            {/* Creator grades participant */}
            {isCreator && game.participant && !hasGradedParticipant && (
              <form onSubmit={e => handleBidirectionalGrade(e, getId(game.participant))} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar user={game.participant} size={32} />
                  <span className="font-semibold">{game.participant?.username || 'Participant'}</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button
                      type="button"
                      key={num}
                      className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-colors ${Number(grade) === num ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-primary/20'}`}
                      onClick={() => setGrade(num)}
                      aria-label={`Score ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (optional)" />
                {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={grading || !grade}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
            {/* Participant grades creator */}
            {isParticipant && game.creator && !hasGradedCreator && (
              <form onSubmit={e => handleBidirectionalGrade(e, getId(game.creator))} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar user={game.creator} size={32} />
                  <span className="font-semibold">{game.creator?.username || 'Creator'}</span>
                </div>
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button
                      type="button"
                      key={num}
                      className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-colors ${Number(grade) === num ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-primary/20'}`}
                      onClick={() => setGrade(num)}
                      aria-label={`Score ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (optional)" />
                {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={grading || !grade}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
            {/* Show message if already graded */}
            {(isCreator && hasGradedParticipant) || (isParticipant && hasGradedCreator) ? (
              <div className="text-success text-center font-medium mb-2">You have already graded this user for this switch game.</div>
            ) : null}
          </div>
        </div>
      )}
      {/* Chicken Out button for creator or participant when in progress */}
      {game.status === 'in_progress' && (user?._id === game.creator?._id || user?._id === game.participant?._id) && (
        <div className="mt-6">
          <button
            className="w-full bg-danger text-danger-contrast rounded px-4 py-2 font-semibold hover:bg-danger-dark disabled:opacity-50"
            onClick={handleChickenOut}
            disabled={chickenOutLoading}
            aria-busy={chickenOutLoading}
          >
            {chickenOutLoading ? 'Chickening Out...' : 'Chicken Out'}
          </button>
          {chickenOutError && <div className="text-danger text-sm font-medium mt-2" role="alert" aria-live="assertive">{chickenOutError}</div>}
        </div>
      )}
    </div>
  );
} 