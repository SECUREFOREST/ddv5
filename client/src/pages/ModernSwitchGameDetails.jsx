import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlayIcon,
  FireIcon,
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CogIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import api from '../api/axios';

const ModernSwitchGameDetails = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchGameDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await retryApiCall(() => api.get(`/switches/${gameId}`));
      
      if (response && response.data) {
        const gameData = validateApiResponse(response.data, API_RESPONSE_TYPES.SWITCH_GAME);
        setGame(gameData);
      } else {
        setError('Failed to load game details');
      }
    } catch (error) {
      console.error('Failed to load game details:', error);
      const errorMessage = handleApiError(error, 'game details');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameDetails();
  }, [fetchGameDetails]);

  const handleJoinGame = async () => {
    if (!user) {
      showError('You must be logged in to join a game');
      return;
    }
    
    setJoining(true);
    try {
      await retryApiCall(() => api.post(`/switches/${gameId}/join`));
      showSuccess('Successfully joined the game!');
      fetchGameDetails(); // Refresh game data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to join game';
      showError(errorMessage);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGame = async () => {
    setLeaving(true);
    try {
      await retryApiCall(() => api.post(`/switches/${gameId}/leave`));
      showSuccess('Successfully left the game');
      fetchGameDetails(); // Refresh game data
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to leave game';
      showError(errorMessage);
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteGame = async () => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }
    
    setDeleting(true);
    try {
      await retryApiCall(() => api.delete(`/switches/${gameId}`));
      showSuccess('Game deleted successfully');
      navigate('/modern/switches');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete game';
      showError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'waiting_for_participant':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress':
        return <FireIcon className="w-4 h-4" />;
      case 'waiting_for_participant':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <HeartIcon className="w-5 h-5" />,
      arousing: <SparklesIcon className="w-5 h-5" />,
      explicit: <FireIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <ShieldCheckIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <StarIcon className="w-5 h-5" />;
  };

  const isCreator = user && game?.creator?._id === user._id;
  const isParticipant = user && game?.participants?.some(p => p._id === user._id);
  const canJoin = user && !isCreator && !isParticipant && game?.status === 'waiting_for_participant';
  const canLeave = user && isParticipant && game?.status !== 'completed';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Game Details</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load the game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-white text-lg mb-2">Error Loading Game</div>
          <p className="text-neutral-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg">Game not found</div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Game Details</h1>
                <p className="text-neutral-400 text-sm">{game.title || 'Switch Game'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <PlayIcon className="w-4 h-4" />
                  <span>Switch Game</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Game Header */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(game.status)} flex items-center gap-2`}>
                  {getStatusIcon(game.status)}
                  {game.status.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border bg-gradient-to-r ${getDifficultyColor(game.difficulty)} text-white`}>
                  {game.difficulty}
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {game.title || 'Switch Game'}
              </h2>
              
              {game.description && (
                <p className="text-neutral-300 text-lg leading-relaxed mb-6">
                  {game.description}
                </p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{game.maxParticipants || 2}</div>
                  <div className="text-neutral-400 text-sm">Max Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{game.participants?.length || 0}</div>
                  <div className="text-neutral-400 text-sm">Current</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{game.duration || 7}</div>
                  <div className="text-neutral-400 text-sm">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{game.tags?.length || 0}</div>
                  <div className="text-neutral-400 text-sm">Tags</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {canJoin && (
                <button
                  onClick={handleJoinGame}
                  disabled={joining}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5" />
                      Join Game
                    </>
                  )}
                </button>
              )}
              
              {canLeave && (
                <button
                  onClick={handleLeaveGame}
                  disabled={leaving}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Leaving...
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-5 h-5" />
                      Leave Game
                    </>
                  )}
                </button>
              )}
              
              {isCreator && game.status !== 'completed' && (
                <button
                  onClick={handleDeleteGame}
                  disabled={deleting}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FlagIcon className="w-5 h-5" />
                      Delete Game
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Creator's Dare */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CogIcon className="w-5 h-5 text-primary" />
              Creator's Dare
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">
                {game.creatorDare?.description || 'No dare description provided'}
              </p>
            </div>
          </div>
          
          {/* Participant's Dare */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-primary" />
              Participant's Dare
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">
                {game.participantDare?.description || 'No dare description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Game Rules & Rewards */}
        {(game.rules || game.rewards) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {game.rules && (
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-primary" />
                  Game Rules
                </h3>
                <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
                  <p className="text-neutral-300 leading-relaxed">{game.rules}</p>
                </div>
              </div>
            )}
            
            {game.rewards && (
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-primary" />
                  Rewards & Consequences
                </h3>
                <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
                  <p className="text-neutral-300 leading-relaxed">{game.rewards}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-primary" />
            Participants ({game.participants?.length || 0}/{game.maxParticipants || 2})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Creator */}
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <CogIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="font-semibold text-white">Creator</div>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.creator?.fullName || game.creator?.username || 'Unknown'}
              </div>
            </div>
            
            {/* Participants */}
            {game.participants?.map((participant, index) => (
              <div key={participant._id} className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="font-semibold text-white">Player {index + 1}</div>
                </div>
                <div className="text-neutral-300 text-sm">
                  {participant.fullName || participant.username || 'Unknown'}
                </div>
              </div>
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: (game.maxParticipants || 2) - (game.participants?.length || 0) - 1 }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30 border-dashed">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-neutral-600/50 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="font-semibold text-neutral-500">Open Slot</div>
                </div>
                <div className="text-neutral-500 text-sm">Waiting for player</div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-primary" />
            Game Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Created</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.createdAt ? formatRelativeTimeWithTooltip(game.createdAt).display : 'Unknown'}
              </div>
            </div>
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-white">Duration</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.duration || 7} days
              </div>
            </div>
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Visibility</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-primary" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-1 text-neutral-300 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSwitchGameDetails; 