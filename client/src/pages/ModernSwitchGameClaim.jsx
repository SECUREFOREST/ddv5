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
  FlagIcon,
  ArrowPathIcon,
  TagIcon,
  Squares2X2Icon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import api from '../api/axios';

const ModernSwitchGameClaim = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');

  // Fetch game details
  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await retryApiCall(() => api.get(`/switches/${gameId}`));
      
      if (response.data) {
        setGame(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load switch game:', error);
      const errorMessage = error.response?.data?.error || 'Game not found.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, showError]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  // Handle claiming the game
  const handleClaim = async () => {
    if (!user) {
      showError('You must be logged in to claim a game.');
      return;
    }
    
    setClaiming(true);
    setClaimError('');
    
    try {
      await retryApiCall(() => api.post(`/switches/${gameId}/claim`));
      showSuccess('Successfully claimed the game!');
      navigate(`/modern/switches/${gameId}`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to claim game.';
      setClaimError(errorMessage);
      showError(errorMessage);
    } finally {
      setClaiming(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Game</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load the game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Claim Switch Game</h2>
          </div>

          {/* Error Card */}
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 shadow-xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Game Not Found</h3>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/modern/switches/participate')}
            >
              Try Another Game
            </button>
          </div>
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
                <h1 className="text-2xl font-bold text-white">Claim Switch Game</h1>
                <p className="text-neutral-400 text-sm">Join and participate in this switch game</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <HandRaisedIcon className="w-4 h-4" />
                  <span>Claim Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <HandRaisedIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Claim This Switch Game</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Join and participate in the challenge
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Review the game details and claim your spot to participate in this switch game
          </p>
        </div>

        {/* Game Status */}
        <div className="text-center mb-8">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-lg text-lg ${
            game.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            game.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            game.status === 'waiting_for_participant' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
          }`}>
            {game.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> :
             game.status === 'in_progress' ? <ClockIcon className="w-5 h-5" /> :
             game.status === 'waiting_for_participant' ? <ClockIcon className="w-5 h-5" /> :
             <ExclamationTriangleIcon className="w-5 h-5" />}
            {game.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Game Info Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Game Information</h3>
          
          {/* Game Title and Description */}
          {game.title && (
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-white mb-2">{game.title}</h4>
              {game.description && (
                <p className="text-neutral-300 leading-relaxed">{game.description}</p>
              )}
            </div>
          )}
          
          {/* Creator Info */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full mb-2">Game Creator</span>
            <span className="font-semibold text-white text-lg">{game.creator?.fullName || game.creator?.username}</span>
          </div>

          {/* Game Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Participants</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.participants?.length || 0} / {game.maxParticipants || 2}
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
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Created</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {game.createdAt ? formatRelativeTimeWithTooltip(game.createdAt).display : 'Unknown'}
              </div>
            </div>
          </div>

          {/* Difficulty and Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${getDifficultyColor(game.difficulty)} text-white rounded-full px-4 py-2 text-sm font-semibold border border-white/20`}>
              {getDifficultyIcon(game.difficulty)} {game.difficulty}
            </span>
            {game.tags && game.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 rounded-full px-4 py-2 text-sm font-semibold border border-blue-500/30">
                <TagIcon className="w-4 h-4" /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Creator's Dare */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
            <CogIcon className="w-6 h-6 text-primary" />
            Creator's Dare
          </h3>
          <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
            <p className="text-neutral-300 leading-relaxed text-lg">
              {game.creatorDare?.description || 'No dare description provided'}
            </p>
          </div>
        </div>

        {/* Game Rules */}
        {game.rules && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              Game Rules
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">{game.rules}</p>
            </div>
          </div>
        )}

        {/* Rewards & Consequences */}
        {game.rewards && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <TrophyIcon className="w-6 h-6 text-primary" />
              Rewards & Consequences
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">{game.rewards}</p>
            </div>
          </div>
        )}

        {/* Claim Action */}
        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm rounded-2xl p-8 border border-primary/30 shadow-xl text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Join?</h3>
          <p className="text-neutral-300 mb-6">
            Click the button below to claim your spot in this switch game and start participating!
          </p>
          
          <button
            onClick={handleClaim}
            disabled={claiming || game.status !== 'waiting_for_participant'}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
          >
            {claiming ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <HandRaisedIcon className="w-6 h-6" />
                Claim This Game
              </>
            )}
          </button>
          
          {claimError && (
            <div className="text-red-300 text-sm font-medium mt-4" role="alert">
              {claimError}
            </div>
          )}
          
          {game.status !== 'waiting_for_participant' && (
            <div className="text-yellow-300 text-sm font-medium mt-4">
              This game is no longer accepting participants
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-neutral-400 text-sm">
            Want to play something else? <button onClick={() => navigate('/modern/dashboard')} className="text-primary hover:text-primary-light underline">Try one of our other options</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernSwitchGameClaim; 