import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import Avatar from '../components/Avatar';
import { DIFFICULTY_OPTIONS } from '../constants';
import { Squares2X2Icon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, PlayIcon } from '@heroicons/react/24/solid';
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
  let badgeClass = 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300';
  const found = DIFFICULTY_OPTIONS.find(d => d.value === level);
  let label = found ? found.label : (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown');
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600/20 border border-pink-500/50 text-pink-300';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-600/20 border border-purple-500/50 text-purple-300';
      break;
    case 'explicit':
      badgeClass = 'bg-red-600/20 border border-red-500/50 text-red-300';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300';
      break;
    case 'hardcore':
      badgeClass = 'bg-black/20 border border-white/50 text-white';
      break;
    default:
      break;
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>{label}</span>
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
  const { showSuccess, showError } = useToast();

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

  // Show error toast helper
  const showErrorToast = (msg) => {
    showError(msg);
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

  const fetchGameWithFeedback = useCallback(async (showLoading = false) => {
    if (!id) return;
    
    if (showLoading) setLoading(true);
    setFetchingGame(true);
    setFetchGameError('');
    
    try {
      const response = await api.get(`/switches/${id}`);
      
      if (response.data) {
        if (!isGameEqual(response.data, game)) {
          setGame(response.data);

        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to fetch switch game:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load switch game details.';
      setFetchGameError(errorMessage);
      showError(errorMessage);
    } finally {
      setFetchingGame(false);
      if (showLoading) setLoading(false);
    }
  }, [id, game, showError]);

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
    if (game.status === 'in_progress') showSuccess('Game started!');
    if (game.status === 'completed') showSuccess('Game completed!');
    if (game.status === 'proof_submitted') showSuccess('Proof submitted!');
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
      showError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback });
      setGrade('');
      setFeedback('');
      fetchGameWithFeedback(true);
      showSuccess('Grade submitted successfully!');
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
      showError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  // Grading logic for bidirectional grading
  const hasGradedParticipant = user && game && game.grades && game.participant && game.grades.some(g => getId(g.user) === userId && getId(g.target) === getId(game.participant));
  const hasGradedCreator = user && game && game.grades && game.creator && game.grades.some(g => getId(g.user) === userId && getId(g.target) === getId(game.creator));
  const handleBidirectionalGrade = async (e) => {
    e.preventDefault();
    setGradeError('');
    if (!grade) {
      setGradeError('Please select a grade.');
      showError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/switches/${id}/grade`, { grade: Number(grade), feedback }); // Removed target
      setGrade('');
      setFeedback('');
      showSuccess('Grade submitted!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
      showError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };



  // Find grades given and received
  const myGivenGrade = game && game.grades && user && game.grades.find(g => getId(g.user) === userId);
  const myReceivedGrade = game && game.grades && user && game.grades.find(g => getId(g.target) === userId);
  const allGrades = game && game.grades && game.grades.length > 0 ? game.grades : [];

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
      showError('File too large. Max size is 10MB.');
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
      showSuccess('Proof submitted successfully!');
      fetchGameWithFeedback(true);
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      showError(err.response?.data?.error || 'Failed to submit proof.');
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
      showError(err.response?.data?.error || 'Failed to review proof.');
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
      showSuccess('You have chickened out of this switch game.');
      fetchGameWithFeedback(true);
    } catch (err) {
      setChickenOutLoading(false);
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      showError(err.response?.data?.error || 'Failed to chicken out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ListSkeleton />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Switch Game Not Found</h2>
            <p className="text-white/80 mb-6">No switch game with this ID exists.</p>
            <button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={() => navigate('/switches')}
            >
              Back to Switch Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-white/80">Please log in to view this game.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <PlayIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Switch Game Details</h1>
            </div>
      </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
        {game && (
          game.status === 'completed' ? (
                <span className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/50 text-green-300 rounded-full px-6 py-3 font-semibold text-lg">
              <CheckCircleIcon className="w-6 h-6" /> Completed
            </span>
          ) : game.status === 'expired' ? (
                <span className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-300 rounded-full px-6 py-3 font-semibold text-lg">
              <ExclamationTriangleIcon className="w-6 h-6" /> Expired
            </span>
          ) : game.status === 'in_progress' ? (
                <span className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-full px-6 py-3 font-semibold text-lg">
              <ClockIcon className="w-6 h-6" /> In Progress
            </span>
          ) : (
                <span className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-full px-6 py-3 font-semibold text-lg">
              <Squares2X2Icon className="w-6 h-6" /> {game.status ? game.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Switch Game'}
            </span>
          )
        )}
      </div>

          {/* Game Info Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Participants</h2>
            
            {/* Participants */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-8">
          <div className="flex flex-col items-center">
            <a href={game.creator?._id ? `/profile/${game.creator._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.creator?.fullName || game.creator?.username || 'creator'}'s profile`}>
              <Avatar user={game.creator} size={60} alt={`Avatar for ${game.creator?.fullName || game.creator?.username || 'creator'}`} />
                  <span className="font-semibold text-lg text-white mt-2 group-hover:underline group-focus:underline text-center">{game.creator?.fullName || game.creator?.username || 'Not joined yet'}</span>
            </a>
                <span className="inline-flex items-center gap-1 text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full mt-2">Creator</span>
          </div>
              
          <div className="flex flex-col items-center">
            <a href={game.participant?._id ? `/profile/${game.participant._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.participant?.fullName || game.participant?.username}'s profile`}>
              <Avatar user={game.participant} size={60} alt={`Avatar for ${game.participant?.fullName || game.participant?.username || 'participant'}`} />
                  <span className="font-semibold text-lg text-white mt-2 group-hover:underline group-focus:underline text-center">{game.participant?.fullName || game.participant?.username || 'Not joined yet'}</span>
            </a>
                <span className="inline-flex items-center gap-1 text-xs text-blue-300 font-bold bg-blue-500/20 px-3 py-1 rounded-full mt-2">Participant</span>
          </div>
        </div>

            {/* Game Status Messages */}
          {hasJoined && game.status === 'in_progress' && canPlayRps && userMove && !bothMoves && (
              <div className="text-center text-white/80 font-semibold mb-4">Waiting for the other participant to choose...</div>
          )}
            
          {bothMoves && rpsResult === 'draw' && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-4 text-center">
                <div className="text-white font-bold mb-2">It's a draw!</div>
                <div className="text-white/80">Both players chose {game.moves[game.participants[0]]}. Please choose again.</div>
              </div>
            )}
            
            {game.status === 'awaiting_proof' && (
              <div className="text-center text-white/80 font-semibold mb-4">Waiting for proof from the loser.</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            {!hasJoined && game.status === 'waiting_for_participant' && !game.participant && !isCreator && (
              <button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => setShowJoinModal(true)} 
                disabled={joining}
              >
                {joining ? 'Joining...' : 'Join Switch Game'}
              </button>
            )}
            
            {hasJoined && game.status === 'in_progress' && canPlayRps && !userMove && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Rock-Paper-Scissors: Choose your move</h3>
                <div className="grid grid-cols-3 gap-4">
                  {MOVES.map(move => (
                    <button
                      key={move}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 font-semibold hover:bg-purple-500/20 hover:border-purple-400/50 border border-white/20 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                      onClick={() => handleMoveSubmit(move)}
                      disabled={moveSubmitting}
                    >
                      <span className="text-2xl mb-2 block">{MOVE_ICONS[move]}</span>
                      <span className="text-sm">{move.charAt(0).toUpperCase() + move.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Proof Submission Section */}
          {isLoser && !game.proof && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Submit Proof</h2>
              
              {/* Winner's Dare Description */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold text-white mb-2">Winner's Dare</div>
                  <div className="flex flex-col items-center mb-4">
                    <a href={game.winner?._id ? `/profile/${game.winner._id}` : '#'} className="group flex flex-col items-center" tabIndex={0} aria-label={`View ${game.winner?.fullName || game.winner?.username}'s profile`}>
                      <Avatar user={game.winner} size={48} alt={`Avatar for ${game.winner?.fullName || game.winner?.username || 'winner'}`} />
                      <span className="font-semibold text-base mt-2 group-hover:underline group-focus:underline text-center">{game.winner?.fullName || game.winner?.username || 'Winner'}</span>
                    </a>
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-500/20 text-green-300 px-2 py-1 rounded-full mt-1">Winner</span>
                  </div>
                  <div className="mb-4">
                    <DifficultyBadge level={game.winner && getId(game.winner) === getId(game.creator) ? game.creatorDare?.difficulty : game.participantDare?.difficulty} />
                  </div>
                  <div className="text-white/90 text-base font-medium px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                    {game.winner && getId(game.winner) === getId(game.creator) ? game.creatorDare?.description : game.participantDare?.description}
                  </div>
                </div>
              </div>

              {/* Proof Submission Form */}
              <form onSubmit={handleProofSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block font-bold text-white mb-3">Upload proof (image or video)</label>
                  <div className="flex items-center gap-4 mb-2">
                    <button
                      type="button"
                      className="bg-white/10 text-white rounded-xl px-4 py-2 font-semibold border border-white/20 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-200"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleProofFileChange}
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      required
                    />
                    {proofFile && (
                      <span className="text-white/60 text-sm">{proofFile.name}</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">Accepted: images (jpg, png, gif, webp) or video (mp4). Max size: 10MB.</p>
                </div>

                {/* Text Description */}
                <div>
                  <label className="block font-bold text-white mb-3">Description (optional)</label>
                  <textarea
                    className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    value={proofText}
                    onChange={e => setProofText(e.target.value)}
                    rows={3}
                    placeholder="Describe your proof, add context, or leave blank."
                  />
                </div>

                {/* Error/Success Messages */}
                {proofError && (
                  <div className="text-red-300 text-sm font-medium text-center" role="alert" aria-live="assertive">
                    {proofError}
                  </div>
                )}
                
                {proofSuccess && (
                  <div className="text-green-300 text-sm font-medium text-center" role="status" aria-live="polite">
                    {proofSuccess}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={proofLoading}
                >
                  {proofLoading ? 'Submitting...' : 'Submit Proof'}
                </button>
              </form>
            </div>
          )}

          {/* Proof Display */}
          {game.proof && game.proof.fileUrl && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Submitted Proof</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative group cursor-pointer w-48 h-48 flex items-center justify-center bg-white/5 rounded-xl border border-white/20 overflow-hidden mb-4" onClick={() => setProofModalOpen(true)}>
                  {game.proof.fileUrl.match(/\.(mp4)$/) ? (
                    <video src={game.proof.fileUrl} className="w-full h-full object-cover" controls={false} />
                  ) : (
                    <img src={game.proof.fileUrl} alt="Proof" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553 2.276A2 2 0 0121 14.118V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.882a2 2 0 01.447-1.842L8 10m7 0V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v4m7 0H8" />
                    </svg>
                  </div>
                </div>
                <button 
                  className="text-purple-300 underline hover:text-purple-200 transition-colors" 
                  onClick={() => setProofModalOpen(true)}
                >
                  View Full Proof
                </button>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-center">
            <div className="inline-flex flex-col gap-2 text-sm text-white/60">
              <div className="flex items-center justify-center gap-2" title={formatRelativeTimeWithTooltip(game.createdAt).tooltip}>
                <ClockIcon className="w-4 h-4" />
                Created: 
                <span className="cursor-help">
                  {formatRelativeTimeWithTooltip(game.createdAt).display}
                </span>
              </div>
              {game.updatedAt && (
                <div className="flex items-center justify-center gap-2" title={formatRelativeTimeWithTooltip(game.updatedAt).tooltip}>
                  <Squares2X2Icon className="w-4 h-4" />
                  Updated: 
                  <span className="cursor-help">
                    {formatRelativeTimeWithTooltip(game.updatedAt).display}
                  </span>
                </div>
              )}
              {game.proofExpiresAt && (
                <div className="flex items-center justify-center gap-2" title={proofExpiresAt ? formatRelativeTimeWithTooltip(proofExpiresAt).tooltip : ''}>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Proof Expires: 
                  <span className="cursor-help">
                    {proofExpiresAt ? formatRelativeTimeWithTooltip(proofExpiresAt).display : 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Join Modal */}
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
                  showSuccess('Joined the game successfully!');
                } catch (err) {
                  setGeneralError(err.response?.data?.error || 'Failed to join the game.');
                  showError(err.response?.data?.error || 'Failed to join the game.');
                } finally {
                  setJoining(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block font-semibold text-white mb-3">Select your move:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {MOVES.map(m => (
                      <label key={m} className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col items-center hover:scale-105
                        ${joinMove === m 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-lg' 
                          : 'bg-white/10 text-white border-white/20 hover:border-purple-400/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="join-move"
                          value={m}
                          checked={joinMove === m}
                          onChange={() => setJoinMove(m)}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-2">{MOVE_ICONS[m]}</span>
                        <span className="text-sm font-semibold">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    className="bg-white/10 text-white rounded-xl px-4 py-2 font-semibold hover:bg-white/20 transition-all duration-200" 
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-4 py-2 font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50" 
                    disabled={joining}
                  >
                    {joining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Proof Modal */}
          {proofModalOpen && (
            <div className="fixed z-50 inset-0 overflow-y-auto flex items-center justify-center" role="dialog" aria-modal="true">
              <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" onClick={() => setProofModalOpen(false)} />
              <div className="relative bg-neutral-900 rounded-2xl p-6 max-w-lg w-full mx-4">
                  <button
                  ref={modalCloseBtnRef} 
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors text-2xl font-bold" 
                  onClick={() => setProofModalOpen(false)} 
                  aria-label="Close Proof Preview"
                >
                  ×
                      </button>
                <div className="text-xl font-bold mb-4 text-white">Proof Preview</div>
                  {game.proof.fileUrl.match(/\.(mp4)$/) ? (
                  <video src={game.proof.fileUrl} className="w-full aspect-square rounded-xl" controls autoPlay />
                ) : (
                  <img src={game.proof.fileUrl} alt="Proof" className="w-full aspect-square rounded-xl" />
                    )}
                    {game.proof.text && (
                  <div className="mt-4 p-4 bg-white/5 text-white/80 rounded-xl border border-white/10">{game.proof.text}</div>
          )}
        </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 