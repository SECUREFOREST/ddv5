import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { DARE_DIFFICULTIES } from '../tailwindColors';
import { Squares2X2Icon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';

const MOVES = ['rock', 'paper', 'scissors'];
const MOVE_ICONS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

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

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  const found = DARE_DIFFICULTIES.find(d => d.value === level);
  let label = found ? found.label : (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown');
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      break;
    default:
      break;
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold mr-2 ${badgeClass}`}>{label}</span>
  );
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
  const { showNotification } = useNotification();

  function getId(obj) {
    if (!obj) return undefined;
    if (typeof obj === 'object') {
      if (obj._id) return obj._id;
      if (obj.id) return obj.id;
      return undefined;
    }
    return obj;
  }

  // --- Move winner/loser/isLoser logic up here ---
  const username = user?.username;
  const userId = getId(user);
  const hasJoined = game?.participants && game.participants.some(p => getId(p) === userId || p === username);
  const canPlayRps = game?.participants && game.participants.length === 2 && !game.winner;
  const userMove = game?.moves && game.moves[username];
  const bothMoves = canPlayRps && game.moves && Object.keys(game.moves).length === 2;
  let rpsResult = null;
  let winner = null;
  let loser = null;
  if (bothMoves) {
    const [p1, p2] = game.participants;
    const move1 = game.moves[getId(p1) === userId ? username : getId(p1)];
    const move2 = game.moves[getId(p2) === userId ? username : getId(p2)];
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
  const winnerId = game && game.winner && getId(game.winner);
  const creatorId = game && game.creator && getId(game.creator);
  const participantId = game && game.participant && getId(game.participant);
  let loserId = null;
  if (winnerId && creatorId && participantId) {
    if (winnerId === creatorId) {
      loserId = participantId;
    } else if (winnerId === participantId) {
      loserId = creatorId;
    }
  }
  const isWinner = user && winnerId && (userId === winnerId);
  const isLoser = user && loserId && (userId === loserId);

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
    showNotification(msg, 'error');
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
    if (game.status === 'in_progress') showNotification('Game started!', 'success');
    if (game.status === 'completed') showNotification('Game completed!', 'success');
    if (game.status === 'proof_submitted') showNotification('Proof submitted!', 'success');
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

  // Grading/Feedback state
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');

  // Check if user is a participant
  const isCreator = user && game && (getId(user) === getId(game.creator));
  const isParticipant = user && game && (getId(user) === getId(game.participant));
  const canGrade = (isCreator || isParticipant) && game && game.status === 'completed' && game.grades && !game.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id));

  const handleGrade = async (e) => {
    e.preventDefault();
    setGradeError('');
    setGeneralError('');
    setGeneralSuccess('');
    if (!grade) {
      setGradeError('Please select a grade.');
      showNotification('Please select a grade.', 'error');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback });
      setGrade('');
      setFeedback('');
      fetchGameWithFeedback(true);
      showNotification('Grade submitted successfully!', 'success');
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
      showNotification(err.response?.data?.error || 'Failed to submit grade', 'error');
    } finally {
      setGrading(false);
    }
  };

  // Grading logic for bidirectional grading
  const hasGradedParticipant = user && game && game.grades && game.participant && game.grades.some(g => getId(g.user) === userId && getId(g.target) === getId(game.participant));
  const hasGradedCreator = user && game && game.grades && game.creator && game.grades.some(g => getId(g.user) === userId && getId(g.target) === getId(game.creator));
  const handleBidirectionalGrade = async (e, targetId) => {
    e.preventDefault();
    setGradeError('');
    if (!grade) {
      setGradeError('Please select a grade.');
      showNotification('Please select a grade.', 'error');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback }); // Removed target
      setGrade('');
      setFeedback('');
      showNotification('Grade submitted!', 'success');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
      showNotification(err.response?.data?.error || 'Failed to submit grade', 'error');
    } finally {
      setGrading(false);
    }
  };

  // Helper to normalize MongoDB IDs
  // const getId = (obj) => (typeof obj === 'object' && obj !== null ? obj._id : obj); // This line is removed
  // const isCreator = user && game && getId(game.creator) === user.id; // This line is removed
  // const isParticipant = user && game && getId(game.participant) === user.id; // This line is removed

  // Improved debug log for updated game state
  useEffect(() => {
    if (game && (toast || generalSuccess)) {
      console.log('Updated switch game after action:', game);
    }
  }, [game, toast, generalSuccess]);

  // Find grades given and received
  const myGivenGrade = game && game.grades && user && game.grades.find(g => getId(g.user) === userId);
  const myReceivedGrade = game && game.grades && user && game.grades.find(g => getId(g.target) === userId);
  const allGrades = game && game.grades && game.grades.length > 0 ? game.grades : [];

  // Determine winner and loser IDs
  // const winnerId = game && game.winner && (game.winner._id || game.winner);
  // const loserId = game && game.creator && game.participant && winnerId && (game.creator._id === winnerId || game.creator === winnerId ? (game.participant._id || game.participant) : (game.creator._id || game.creator));
  // const isWinner = user && winnerId && (user.id === winnerId || user._id === winnerId);
  // const isLoser = user && loserId && (user.id === loserId || user._id === loserId);

  // --- Proof Submission State ---
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      showNotification('File too large. Max size is 10MB.', 'error');
      setProofFile(null);
      return;
    }
    setProofFile(file);
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofError('');
    setProofLoading(true);
    if (!proofFile || !proofFile.type.match(/^image\/(jpeg|png|gif|webp)$|^video\/mp4$/)) {
      setProofError('Please upload a proof file (image or video).');
      setProofLoading(false);
      return;
    }
    let formData = new FormData();
    formData.append('file', proofFile);
    try {
      await api.post(`/switches/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProofFile(null);
      showNotification('Proof submitted successfully!', 'success');
      fetchGameWithFeedback(true);
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      showNotification(err.response?.data?.error || 'Failed to submit proof.', 'error');
    } finally {
      setProofLoading(false);
    }
  };

  // Review proof handler
  const handleProofReview = async (action) => {
    setReviewError('');
    setReviewSuccess('');
    setReviewSubmitting(true);
    try {
      await api.post(`/switches/${id}/proof-review`, { action, feedback: reviewFeedback });
      setReviewFeedback('');
      setReviewSuccess(action === 'approve' ? 'Proof approved!' : 'Proof rejected.');
      fetchGameWithFeedback(true);
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to review proof.');
      showNotification(err.response?.data?.error || 'Failed to review proof.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Add state for move selection modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMove, setJoinMove] = useState('rock');

  // Chicken out (forfeit) handler
  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      await api.post(`/switches/${id}/forfeit`);
      setChickenOutLoading(false);
      showNotification('You have chickened out of this switch game.', 'success');
      fetchGameWithFeedback(true);
    } catch (err) {
      setChickenOutLoading(false);
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      showNotification(err.response?.data?.error || 'Failed to chicken out.', 'error');
    }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto mt-12 bg-neutral-800 rounded-lg p-6 text-center text-neutral-400">Loading...</div>;
  }
  if (!game) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none p-[15px] mb-5">
        <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
          <h1 className="text-xl font-bold mb-4">Switch Game Not Found</h1>
        </div>
        <div className="text-danger font-medium mb-4">No switch game with this ID exists.</div>
        <button className="bg-neutral-700 text-neutral-100 rounded-none px-4 py-2 font-semibold hover:bg-neutral-900 shadow-lg" onClick={() => navigate('/switches')}>Back to Switch Games</button>
      </div>
    );
  }
  if (!user) {
    return <div className="max-w-lg mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none p-[15px] mb-5 text-center text-[#888]">Please log in to view this game.</div>;
  }

  console.log('userId', userId, 'winnerId', winnerId, 'creatorId', creatorId, 'participantId', participantId, 'loserId', loserId, 'isLoser', isLoser, 'game.status', game.status, 'game.proof', game.proof);

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <Squares2X2Icon className="w-7 h-7 text-primary" aria-hidden="true" /> Switch Game Details
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        {game && (
          game.status === 'completed' ? (
            <span className="inline-flex items-center gap-2 bg-green-900/90 border border-green-700 text-green-200 rounded-full px-4 py-1 font-semibold text-lg animate-fade-in">
              <CheckCircleIcon className="w-6 h-6" /> Completed
            </span>
          ) : game.status === 'expired' ? (
            <span className="inline-flex items-center gap-2 bg-red-900/90 border border-red-700 text-red-200 rounded-full px-4 py-1 font-semibold text-lg animate-fade-in">
              <ExclamationTriangleIcon className="w-6 h-6" /> Expired
            </span>
          ) : game.status === 'in_progress' ? (
            <span className="inline-flex items-center gap-2 bg-blue-900/90 border border-blue-700 text-blue-200 rounded-full px-4 py-1 font-semibold text-lg animate-fade-in">
              <ClockIcon className="w-6 h-6" /> In Progress
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-4 py-1 font-semibold text-lg animate-fade-in">
              <Squares2X2Icon className="w-6 h-6" /> {game.status ? game.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Switch Game'}
            </span>
          )
        )}
      </div>

      {/* Main card background for all content */}
      <div className="max-w-md w-full mx-auto bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
        {/* User info card */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 ">
          {/* Avatars, role badges, usernames for creator/participant */}
          <div className="flex flex-col items-center">
            <Avatar user={game.creator} size={60} alt={`Avatar for ${game.creator?.fullName || game.creator?.username || 'creator'}`} />
            <span className="font-semibold text-lg text-primary mt-2">{game.creator?.username || '[deleted]'}</span>
            <span className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">Creator</span>
            <DifficultyBadge level={game.creatorDare?.difficulty} />
          </div>
          <div className="flex flex-col items-center">
            <Avatar user={game.participant} size={60} alt={`Avatar for ${game.participant?.fullName || game.participant?.username || 'participant'}`} />
            <span className="font-semibold text-lg text-blue-400 mt-2">{game.participant?.username || '[deleted]'}</span>
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full mt-1">Participant</span>
            <DifficultyBadge level={game.participantDare?.difficulty} />
          </div>
        </div>
        {/* Description card */}
        <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
          <div className="font-bold text-xl text-primary mb-2">Game Description</div>
          <div className="text-base font-normal mb-3 break-words text-primary-contrast">{game.description}</div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <DifficultyBadge level={game.creatorDare?.difficulty} />
            {/* tags here if any */}
          </div>
        </div>
        {/* Proof preview/modal if applicable */}
        {/* ...proof preview/modal code from DareReveal... */}
        {/* Sticky footer for action buttons */}
        <div className="sticky bottom-0  py-4 flex flex-col sm:flex-row gap-3 justify-center items-center z-10 border-t border-neutral-800">
          {/* Action buttons here, styled as in DareReveal */}
          {!hasJoined && game.status === 'waiting_for_participant' && !game.participant && !isCreator && (
            <button className="bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark shadow-lg" onClick={() => setShowJoinModal(true)} disabled={joining}>
              {joining ? 'Joining...' : 'Join Switch Game'}
            </button>
          )}
          {showJoinModal && (
            <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Switch Game" role="dialog" aria-modal="true">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setJoining(true);
                setGeneralError('');
                setGeneralSuccess('');
                try {
                  await api.post(`/switches/${id}/join`, {
                    difficulty: String(game.creatorDare.difficulty),
                    move: String(joinMove),
                    consent: true
                  });
                  setGeneralSuccess('Joined the game successfully!');
                  setShowJoinModal(false);
                  fetchGameWithFeedback(true);
                } catch (err) {
                  setGeneralError(err.response?.data?.error || 'Failed to join the game.');
                  showNotification(err.response?.data?.error || 'Failed to join the game.', 'error');
                } finally {
                  setJoining(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1">Select your move:</label>
                  <div className="flex gap-3 mt-1">
                    {MOVES.map(m => (
                      <label key={m} className={`cursor-pointer px-3 py-2 rounded border ${joinMove === m ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-900 text-neutral-100 border-neutral-700'}`}>
                        <input
                          type="radio"
                          name="join-move"
                          value={m}
                          checked={joinMove === m}
                          onChange={() => setJoinMove(m)}
                          className="hidden"
                        />
                        <span className="mr-2">{MOVE_ICONS[m]}</span>
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300 shadow-lg" onClick={() => setShowJoinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark shadow-lg" disabled={joining}>
                    {joining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </form>
            </Modal>
          )}
          {hasJoined && game.status === 'in_progress' && canPlayRps && !userMove && (
            <div className="mt-6">
              <b>Rock-Paper-Scissors: Choose your move</b>
              <div className="mt-3 flex gap-2">
                {MOVES.map(move => (
                  <button
                    key={move}
                    className="bg-neutral-800 text-primary rounded px-4 py-2 font-semibold hover:bg-primary/80 disabled:opacity-50"
                    onClick={() => handleMoveSubmit(move)}
                    disabled={moveSubmitting}
                  >
                    <span className="mr-2">{MOVE_ICONS[move]}</span>
                    {move.charAt(0).toUpperCase() + move.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Waiting for other participant's move */}
          {hasJoined && game.status === 'in_progress' && canPlayRps && userMove && !bothMoves && (
            <div className="mt-6 text-primary font-semibold">Waiting for the other participant to choose...</div>
          )}
          {/* Show draw message if both moves are the same */}
          {bothMoves && rpsResult === 'draw' && (
            <div className="mt-6 bg-info bg-opacity-10 border border-info rounded p-4">
              <b>It's a draw!</b> Both players chose {game.moves[game.participants[0]]}. Please choose again.
            </div>
          )}
          {/* Show winner/loser and proof submission if awaiting_proof */}
          {game.status === 'awaiting_proof' && (
            <div className="mt-6 bg-warning bg-opacity-10 border border-warning rounded p-4">
              <b>Awaiting proof from the loser.</b>
              {isLoser && !game.proof && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-6">
                  <div className="bg-danger/10 border border-danger text-danger text-lg font-bold rounded p-4 mb-4">
                    You lost! Please submit your proof to complete the game.
                  </div>
                  <h2 className="text-lg font-bold mb-2">Submit Proof</h2>
                  <form onSubmit={handleProofSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="proof-file" className="block font-semibold mb-1">Upload image or video proof:</label>
                      <input
                        type="file"
                        id="proof-file"
                        className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                        onChange={handleProofFileChange}
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        aria-required="true"
                      />
                      <small className="text-gray-400">Accepted file types: images (jpg, png, gif, webp) or video (mp4). Max size: 10MB.</small>
                    </div>
                    {proofError && <div className="text-danger text-sm font-medium" role="alert">{proofError}</div>}
                    <button type="submit" className="btn btn-accent shadow-lg w-full" disabled={proofLoading} aria-label="Submit Proof">
                      {proofLoading ? 'Submitting...' : 'Submit Proof'}
                    </button>
                  </form>
                </div>
              )}
              {game.proof && (
                <div className="mt-2 text-info">Proof submitted by <span className="inline-flex items-center gap-2"><Avatar user={game.proof.user} size={28} alt={`Avatar for ${game.proof.user?.fullName || game.proof.user?.username || 'user'}`} />{game.proof.user?.username || '[deleted]'}</span>: {game.proof.text}</div>
              )}
            </div>
          )}
          {game.status === 'proof_submitted' && (
            <div className="mt-6 bg-success bg-opacity-10 border border-success rounded p-4">
              <b>Proof submitted!</b> Proof by <span className="inline-flex items-center gap-2"><Avatar user={game.proof?.user} size={28} alt={`Avatar for ${game.proof?.user?.fullName || game.proof?.user?.username || 'user'}`} />{game.proof?.user?.username || '[deleted]'}</span>: {game.proof?.text}
            </div>
          )}
          {game.status === 'expired' && (
            <div className="mt-6 bg-danger bg-opacity-10 border border-danger rounded p-4">
              <b>Proof submission window has expired.</b>
            </div>
          )}
          {(game && (
            (game.grades && game.grades.length > 0) ||
            (isCreator && game.participant && !hasGradedParticipant && (granularStatus === 'proof_submitted' || granularStatus === 'completed')) ||
            (isParticipant && game.creator && !hasGradedCreator && (granularStatus === 'proof_submitted' || granularStatus === 'completed'))
          )) && (
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
                        <Avatar user={g.user} size={24} alt={`Avatar for ${g.user?.fullName || g.user?.username || 'user'}`} />
                        <span className="font-semibold">{g.user?.username || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">
                          ({g.user && game.creator && (getId(g.user) === getId(game.creator) ? 'Creator' : 'Participant')})
                        </span>
                        <span className="mx-2">→</span>
                        <Avatar user={g.target} size={24} alt={`Avatar for ${g.target?.fullName || g.target?.username || 'user'}`} />
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
                ) : null}
                {/* Creator grades participant */}
                {isCreator && game.participant && !hasGradedParticipant && (granularStatus === 'proof_submitted' || granularStatus === 'completed') && (
                  <form onSubmit={e => handleBidirectionalGrade(e, getId(game.participant))} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar user={game.participant} size={32} alt={`Avatar for ${game.participant?.fullName || game.participant?.username || 'participant'}`} />
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
                    <textarea
                      className="border rounded px-2 py-1 w-full"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                      maxLength={500}
                      rows={2}
                      placeholder="Optional feedback"
                    />
                    {gradeError && <div className="text-danger text-sm">{gradeError}</div>}
                    <button type="submit" className="btn btn-primary shadow-lg" disabled={grading}>
                      {grading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                  </form>
                )}
                {/* Participant grades creator */}
                {isParticipant && game.creator && !hasGradedCreator && (granularStatus === 'proof_submitted' || granularStatus === 'completed') && (
                  <form onSubmit={e => handleBidirectionalGrade(e, getId(game.creator))} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar user={game.creator} size={32} alt={`Avatar for ${game.creator?.fullName || game.creator?.username || 'creator'}`} />
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
                    <input className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (optional)" />
                    {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                    <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark shadow-lg" disabled={grading || !grade}>
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
          {/* Grading/Feedback Form for Participants */}
          {canGrade && !myGivenGrade && (
            <div className="bg-white rounded p-4 mt-6">
              <h2 className="text-lg font-bold mb-2">Grade Your Opponent</h2>
              {generalSuccess && <div className="text-green-600 mb-2">{generalSuccess}</div>}
              <form role="form" aria-labelledby="switch-grade-title" onSubmit={handleGrade} className="space-y-6">
                <h1 id="switch-grade-title" className="text-2xl font-bold mb-4">Grade Switch Game</h1>
                <div className="mb-2">
                  <label htmlFor="switch-grade" className="block font-semibold mb-1">Grade (1-10):</label>
                  <select
                    id="switch-grade"
                    className="border rounded px-2 py-1"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    required
                    disabled={grading || !!myGivenGrade}
                    aria-required="true"
                  >
                    <option value="">Select</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label htmlFor="switch-feedback" className="block font-semibold mb-1">Feedback (optional):</label>
                  <textarea
                    id="switch-feedback"
                    className="border rounded px-2 py-1 w-full"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    maxLength={500}
                    rows={3}
                    disabled={grading || !!myGivenGrade}
                    aria-label="Feedback for the opponent"
                  />
                </div>
                {gradeError && <div className="text-red-500 mb-2">{gradeError}</div>}
                <button type="submit" className="btn btn-primary shadow-lg" disabled={grading || !!myGivenGrade}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            </div>
          )}
          {/* Show the grade/feedback you gave */}
          {myGivenGrade && (
            <div className="bg-green-50 border border-green-200 rounded p-4 mt-6">
              <h2 className="text-lg font-bold mb-2">Your Grade for Opponent</h2>
              <div className="mb-1">Grade: <span className="font-semibold">{myGivenGrade.grade}</span></div>
              {myGivenGrade.feedback && <div className="mb-1">Feedback: <span className="italic">{myGivenGrade.feedback}</span></div>}
            </div>
          )}
          {/* Show the grade/feedback you received from your opponent */}
          {myReceivedGrade && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
              <h2 className="text-lg font-bold mb-2">Feedback You Received</h2>
              <div className="mb-1">Grade: <span className="font-semibold">{myReceivedGrade.grade}</span></div>
              {myReceivedGrade.feedback && <div className="mb-1">Feedback: <span className="italic">{myReceivedGrade.feedback}</span></div>}
            </div>
          )}
          {/* Show all grades/feedback if more than one exists */}
          {allGrades.length > 1 && (
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mt-6">
              <h2 className="text-lg font-bold mb-2">All Grades & Feedback</h2>
              <ul className="list-disc pl-5">
                {allGrades.map((g, i) => (
                  <li key={i} className="mb-1">
                    <span className="font-semibold">Grade:</span> {g.grade}
                    {g.feedback && <span> | <span className="font-semibold">Feedback:</span> <span className="italic">{g.feedback}</span></span>}
                    {g.user && <span> | <span className="font-semibold">From:</span> {g.user.username || g.user._id || g.user}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Chicken Out button for creator or participant when in progress */}
          {game.status === 'in_progress' && (getId(user) === getId(game.creator) || getId(user) === getId(game.participant)) && (
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
          {/* Proof Submission (Loser) */}
          {isLoser && !game.proof && (
            <div className="flex justify-center">
              <form
                onSubmit={handleProofSubmit}
                className="w-full max-w-md bg-neutral-100 rounded-xl shadow-lg p-6 border border-neutral-300 flex flex-col items-center space-y-4"
                style={{ margin: '0 auto' }}
              >
                <div className="w-full text-center">
                  <div className="bg-danger/10 border border-danger text-danger text-lg font-bold rounded p-4 mb-4">
                    You lost! Please submit your proof to complete the game.
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-primary">Submit Proof</h2>
                </div>
                <div className="w-full">
                  <label htmlFor="proof-file" className="block font-semibold mb-1">
                    Upload image or video proof:
                  </label>
                  <input
                    type="file"
                    id="proof-file"
                    className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                    onChange={handleProofFileChange}
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    aria-required="true"
                  />
                  <small className="text-gray-400">
                    Accepted file types: images (jpg, png, gif, webp) or video (mp4). Max size: 10MB.
                  </small>
                </div>
                {proofError && (
                  <div className="text-danger text-sm font-medium w-full text-center" role="alert">
                    {proofError}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg"
                  disabled={proofLoading}
                  aria-label="Submit Proof"
                >
                  {proofLoading ? 'Submitting...' : 'Submit Proof'}
                </button>
              </form>
            </div>
          )}
          {/* Proof Review (Winner) */}
          {isWinner && game.status === 'proof_submitted' && game.proof && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-6">
              <h2 className="text-lg font-bold mb-2">Review Submitted Proof</h2>
              <div className="mb-2"><span className="font-semibold">Proof:</span> {game.proof.text}</div>
              <div className="mb-2">
                <label className="block font-semibold mb-1">Feedback (optional):</label>
                <textarea
                  className="border rounded px-2 py-1 w-full"
                  value={reviewFeedback}
                  onChange={e => setReviewFeedback(e.target.value)}
                  maxLength={500}
                  rows={2}
                  disabled={reviewSubmitting}
                />
              </div>
              {reviewError && <div className="text-red-500 mb-2">{reviewError}</div>}
              {reviewSuccess && <div className="text-green-600 mb-2">{reviewSuccess}</div>}
              <div className="flex space-x-2">
                <button className="btn btn-success shadow-lg" disabled={reviewSubmitting} onClick={() => handleProofReview('approve')}>Approve</button>
                <button className="btn btn-danger shadow-lg" disabled={reviewSubmitting} onClick={() => handleProofReview('reject')}>Reject</button>
              </div>
            </div>
          )}
          {/* Proof Review Status/Feedback */}
          {game.proof && game.proof.review && (
            <div className={`rounded shadow p-4 mt-6 ${game.proof.review.action === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className="text-lg font-bold mb-2">Proof Review</h2>
              <div className="mb-1">Status: <span className="font-semibold">{game.proof.review.action === 'approved' ? 'Approved' : 'Rejected'}</span></div>
              {game.proof.review.feedback && <div className="mb-1">Feedback: <span className="italic">{game.proof.review.feedback}</span></div>}
            </div>
          )}
        </div>
        {/* Timestamps/meta with icons */}
        <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1" title={new Date(game.createdAt).toLocaleString()}>
            <ClockIcon className="w-4 h-4 text-neutral-400" />
            Created: {new Date(game.createdAt).toLocaleDateString()}
          </div>
          {game.updatedAt && (
            <div className="flex items-center gap-1" title={new Date(game.updatedAt).toLocaleString()}>
              <Squares2X2Icon className="w-4 h-4 text-blue-400" />
              Updated: {new Date(game.updatedAt).toLocaleDateString()}
            </div>
          )}
          {game.proofExpiresAt && (
            <div className="flex items-center gap-1" title={proofExpiresAt ? new Date(proofExpiresAt).toLocaleString() : ''}>
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
              Proof Expires: {proofExpiresAt ? new Date(proofExpiresAt).toLocaleDateString() : 'N/A'}
            </div>
          )}
          {game.winner && (
            <div className="flex items-center gap-1" title={new Date(game.winner.createdAt).toLocaleString()}>
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              Winner: {game.winner?.username || game.winner?._id || game.winner}
            </div>
          )}
        </div>
        {/* Toast notifications */}
        {toast && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300
            bg-green-700 text-white`}
            role="alert"
            aria-live="polite"
            onClick={() => setToast('')}
            tabIndex={0}
            onBlur={() => setToast('')}
          >
            {toast}
          </div>
        )}
        {errorToast && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-700 text-white px-4 py-2 rounded z-50 text-center" aria-live="assertive">
            {errorToast}
          </div>
        )}
      </div>
    </div>
  );
} 