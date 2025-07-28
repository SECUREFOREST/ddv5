import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { DIFFICULTY_OPTIONS } from '../constants';
import { Squares2X2Icon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

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
  const found = DIFFICULTY_OPTIONS.find(d => d.value === level);
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
    if (status === 'awaiting_proof') return <span className="inline-block bg-warning text-warning-contrast rounded px-2 py-1 text-xs font-semibold ml-2">Waiting for Proof</span>;
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
  const [proofText, setProofText] = useState('');
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const modalCloseBtnRef = useRef(null);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      showNotification('File too large. Max size is 10MB.', 'error');
      setProofFile(null);
      setFilePreviewUrl(null);
      return;
    }
    setProofFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofError('');
    setProofSuccess('');
    setProofLoading(true);
    if (!proofFile || !proofFile.type.match(/^image\/(jpeg|png|gif|webp)$|^video\/mp4$/)) {
      setProofError('Please upload a proof file (image or video).');
      setProofLoading(false);
      return;
    }
    let formData = new FormData();
    if (proofText) formData.append('text', proofText);
    formData.append('file', proofFile);
    try {
      await api.post(`/switches/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProofFile(null);
      setFilePreviewUrl(null);
      setProofText('');
      setProofSuccess('Proof submitted successfully!');
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
            <a href={game.creator?._id ? `/profile/${game.creator._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.creator?.fullName || game.creator?.username || 'creator'}'s profile`}>
              <Avatar user={game.creator} size={60} alt={`Avatar for ${game.creator?.fullName || game.creator?.username || 'creator'}`} />
              <span className="font-semibold text-lg text-primary mt-2 group-hover:underline group-focus:underline text-center">{game.creator?.fullName || game.creator?.username || 'Not joined yet'}</span>
            </a>
            <span className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">Creator</span>
          </div>
          <div className="flex flex-col items-center">
            <a href={game.participant?._id ? `/profile/${game.participant._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.participant?.fullName || game.participant?.username}'s profile`}>
              <Avatar user={game.participant} size={60} alt={`Avatar for ${game.participant?.fullName || game.participant?.username || 'participant'}`} />
              <span className="font-semibold text-lg text-blue-400 mt-2 group-hover:underline group-focus:underline text-center">{game.participant?.fullName || game.participant?.username || 'Not joined yet'}</span>
            </a>
            <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full mt-1">Participant</span>
          </div>
        </div>
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
            <div className="mt-6 text-neutral-500 text-center font-semibold">
              Waiting for proof from the loser.
            </div>
          )}
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
          {isLoser && !game.proof && (
            <>
              <div className="flex flex-col items-center w-full">
                {/* Winner's Dare Description Card */}
                <div className="w-full max-w-lg mb-8 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border-2 border-primary/40 text-neutral-100 rounded-2xl shadow-2xl p-6">
                  <div className="text-center mb-2 text-lg font-bold text-primary">Winner's Dare</div>
                  <div className="flex flex-col items-center mb-2">
                    {/* Winner's Avatar centered above full name */}
                    <a href={game.winner?._id ? `/profile/${game.winner._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.winner?.fullName || game.winner?.username}'s profile`}>
                      <Avatar user={game.winner} size={48} alt={`Avatar for ${game.winner?.fullName || game.winner?.username || 'winner'}`} />
                      <span className="font-semibold text-base mt-2 group-hover:underline group-focus:underline text-center">{game.winner?.fullName || game.winner?.username || 'Winner'}</span>
                    </a>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary text-primary-contrast px-2 py-0.5 rounded-full mt-1 shadow">Winner</span>
                  </div>
                  {/* Difficulty badge centered */}
                  <div className="mt-2 mb-2 flex justify-center">
                    <DifficultyBadge level={game.winner && getId(game.winner) === getId(game.creator) ? game.creatorDare?.difficulty : game.participantDare?.difficulty} />
                  </div>
                  {/* Winner's dare description centered and styled */}
                  <div className="w-full text-center mt-2 mb-2 px-2 py-2 bg-neutral-900/80 rounded text-base font-medium border border-neutral-700">
                    {game.winner && getId(game.winner) === getId(game.creator) ? game.creatorDare?.description : game.participantDare?.description}
                  </div>
                </div>
                {/* Proof Submission Form */}
                <form
                  onSubmit={handleProofSubmit}
                  className="w-full max-w-lg bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border-2 border-primary/40 text-neutral-100 rounded-2xl shadow-2xl p-6 flex flex-col items-center space-y-4"
                  style={{ margin: '0 auto' }}
                  aria-label="Submit Proof Form"
                >
                  {/* Proof preview thumbnail before submit (unchanged) */}
                  {filePreviewUrl && (
                    <div className="flex flex-col items-center mb-2">
                      <div className="relative w-32 h-32 flex items-center justify-center bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                        {proofFile && proofFile.type.startsWith('video') ? (
                          <video src={filePreviewUrl} className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} controls={false} />
                        ) : (
                          <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} />
                        )}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                          {proofFile && proofFile.type.startsWith('video') ? (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.842L8 10m7 0V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m7 0H8" /></svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.842L8 10m7 0V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m7 0H8" /></svg>
                          )}
                        </div>
                      </div>
                      <button type="button" className="mt-2 text-primary underline hover:text-primary-contrast transition-colors shadow-lg" onClick={() => setFilePreviewUrl(null)} aria-label="Remove preview">Remove</button>
                    </div>
                  )}
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <label htmlFor="proof-file" className="font-semibold mb-0 whitespace-nowrap mr-2">
                        Upload image or video proof:
                      </label>
                      <button
                        type="button"
                        className="bg-neutral-800 text-neutral-100 rounded px-4 py-2 font-semibold border border-neutral-700 hover:bg-primary/80 focus:outline-none focus:ring focus:border-primary"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        aria-label="Choose file"
                      >
                        {proofFile ? (proofFile.name.length > 24 ? proofFile.name.slice(0, 21) + '...' : proofFile.name) : 'Choose File'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="proof-file"
                        className="hidden"
                        onChange={handleProofFileChange}
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        aria-required="true"
                      />
                      {proofFile && (
                        <span className="text-xs text-gray-400">{proofFile.type.startsWith('video') ? 'Video' : 'Image'}</span>
                      )}
                    </div>
                    <small className="text-gray-400 block mb-2">
                      Accepted file types: images (jpg, png, gif, webp) or video (mp4). Max size: 10MB.
                    </small>
                  </div>
                  <div className="w-full">
                    <label htmlFor="proof-text" className="block font-semibold mb-1">Describe what you did (optional):</label>
                    <textarea
                      id="proof-text"
                      className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                      value={proofText}
                      onChange={e => setProofText(e.target.value)}
                      rows={3}
                      placeholder="Describe your proof, add context, or leave blank."
                      aria-label="Proof description"
                    />
                  </div>
                  {proofError && (
                    <div className="text-danger text-sm font-medium w-full text-center" role="alert" aria-live="assertive">
                      {proofError}
                    </div>
                  )}
                  {proofSuccess && (
                    <div className="flex flex-col items-center w-full text-center" role="status" aria-live="polite">
                      <svg className="w-10 h-10 text-green-500 mb-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-success text-base font-bold">{proofSuccess}</span>
                    </div>
                  )}
                  <div className="w-full pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg"
                      disabled={proofLoading}
                      aria-label="Submit Proof"
                    >
                      {proofLoading ? 'Submitting...' : 'Submit Proof'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
          {game.proof && game.proof.fileUrl && (
            <>
              <div className="flex flex-col items-center mb-4 mt-8">
                <div className="relative group cursor-pointer w-48 h-48 flex items-center justify-center bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden" onClick={() => setProofModalOpen(true)}>
                  {game.proof.fileUrl.match(/\.(mp4)$/) ? (
                    <video src={game.proof.fileUrl} className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} controls={false} />
                  ) : (
                    <img src={game.proof.fileUrl} alt="Proof" className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.842L8 10m7 0V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m7 0H8" /></svg>
                  </div>
                </div>
                <button className="mt-2 text-primary underline hover:text-primary-contrast transition-colors shadow-lg" onClick={() => setProofModalOpen(true)}>View Full Proof</button>
              </div>
              {proofModalOpen && (
                <div className="fixed z-50 inset-0 overflow-y-auto flex items-center justify-center animate-fade-in-scale" role="dialog" aria-modal="true">
                  <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" onClick={() => setProofModalOpen(false)} />
                  <div className="relative bg-neutral-900 rounded-lg p-6 max-w-lg w-full animate-fade-in-scale">
                    <button ref={modalCloseBtnRef} className="absolute top-2 right-2 text-neutral-400 hover:text-primary transition-colors shadow-lg text-2xl font-bold" onClick={() => setProofModalOpen(false)} aria-label="Close Proof Preview">×</button>
                    <div className="text-lg font-bold mb-4 text-primary">Proof Preview</div>
                    {game.proof.fileUrl.match(/\.(mp4)$/) ? (
                      <video src={game.proof.fileUrl} className="w-full aspect-square rounded-lg" controls autoPlay onError={e => e.target.style.display = 'none'} />
                    ) : (
                      <img src={game.proof.fileUrl} alt="Proof" className="w-full aspect-square rounded-lg" onError={e => e.target.style.display = 'none'} />
                    )}
                    {game.proof.text && (
                      <div className="mt-4 p-3 bg-neutral-800 text-neutral-200 rounded text-sm border border-neutral-700">{game.proof.text}</div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Timestamps/meta with icons */}
        <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1" title={formatRelativeTimeWithTooltip(game.createdAt).tooltip}>
            <ClockIcon className="w-4 h-4 text-neutral-400" />
            Created: 
            <span className="cursor-help">
              {formatRelativeTimeWithTooltip(game.createdAt).display}
            </span>
          </div>
          {game.updatedAt && (
            <div className="flex items-center gap-1" title={formatRelativeTimeWithTooltip(game.updatedAt).tooltip}>
              <Squares2X2Icon className="w-4 h-4 text-blue-400" />
              Updated: 
              <span className="cursor-help">
                {formatRelativeTimeWithTooltip(game.updatedAt).display}
              </span>
            </div>
          )}
          {game.proofExpiresAt && (
            <div className="flex items-center gap-1" title={proofExpiresAt ? formatRelativeTimeWithTooltip(proofExpiresAt).tooltip : ''}>
              <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
              Proof Expires: 
              <span className="cursor-help">
                {proofExpiresAt ? formatRelativeTimeWithTooltip(proofExpiresAt).display : 'N/A'}
              </span>
            </div>
          )}
          {game.winner && (
            <div className="flex items-center gap-1" title={formatRelativeTimeWithTooltip(game.winner.createdAt).tooltip}>
              <CheckCircleIcon className="w-4 h-4 text-green-400" />
              Winner: {game.winner?.username || game.winner?._id || game.winner}
              <span className="cursor-help ml-1">
                ({formatRelativeTimeWithTooltip(game.winner.createdAt).display})
              </span>
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