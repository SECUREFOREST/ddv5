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
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { retryApiCall } from '../../utils/retry';
import { validateApiResponse } from '../../utils/apiValidation';
import { handleApiError } from '../../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../../utils/dateUtils';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../../constants.jsx';
import api from '../../api/axios';

const MOVES = ['rock', 'paper', 'scissors'];

const ModernSwitchGameParticipate = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [game, setGame] = useState(null);
  const [demand, setDemand] = useState('');
  const [gesture, setGesture] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [consent, setConsent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for finding a game
  const handleFindGame = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!difficulty) {
      showError('Please select a difficulty.');
      return;
    }
    if (!consent) {
      showError('You must consent to participate.');
      return;
    }
    setSearching(true);
    try {
      const response = await retryApiCall(() => api.get('/switches', { params: { status: 'waiting_for_participant', difficulty } }));
      
      if (response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const gamesData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        if (gamesData.length > 0 && gamesData[0]._id) {
          navigate(`/modern/switches/claim/${gamesData[0]._id}`);
        } else {
          showError('No open switch games available for this difficulty.');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to find switch game:', error);
      const errorMessage = handleApiError(error, 'switch game search');
      showError(errorMessage);
    } finally {
      setSearching(false);
    }
  }, [difficulty, consent, showError, navigate]);

  // Fetch game if gameId is present
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

  // Handle game submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!demand || demand.length < 10) {
      showError('Please enter a demand of at least 10 characters.');
      return;
    }
    if (!gesture) {
      showError('Please select your gesture.');
      return;
    }
    
    const gameDifficulty = game.creatorDare?.difficulty || game.difficulty;
    if (!gameDifficulty) {
      showError('Game difficulty is not available. Please try refreshing the page.');
      return;
    }
    
    const allowedDifficulties = ['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'];
    if (!allowedDifficulties.includes(gameDifficulty)) {
      showError(`Invalid difficulty: ${gameDifficulty}. Please contact support.`);
      return;
    }
    
    try {
      const requestPayload = {
        move: gesture,
        consent: true,
        difficulty: gameDifficulty,
        dare: demand
      };
      
      await retryApiCall(() => api.post(`/switches/${gameId}/join`, requestPayload));
      showSuccess('Successfully joined the game!');
      navigate(`/modern/switches/${gameId}`);
    } catch (err) {
      console.error('Join game error:', err);
      const errorMessage = err.response?.data?.error || 'Failed to join game.';
      
      if (errorMessage.includes('user blocking') || errorMessage.includes('blocked')) {
        showError('You cannot join this game due to user blocking. The creator has blocked you or you have blocked them.');
      } else {
        showError(errorMessage);
      }
    }
  };

  // Helper to determine if current user is the loser
  const userId = user?.id || user?._id;
  const isLoser = game && game.loser && (game.loser._id === userId || game.loser.id === userId || game.loser === userId);

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      await retryApiCall(() => api.post(`/switches/${game._id}/chicken-out`));
      showSuccess('You have successfully chickened out.');
      window.location.reload();
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      showError(err.response?.data?.error || 'Failed to chicken out.');
    } finally {
      setChickenOutLoading(false);
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

  // Conditional rendering logic
  let content;
  if (!gameId) {
    content = (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Participate in Switch Game</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Join an existing game or find a new one
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Choose your difficulty level and create a dare for the game creator
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4 mb-8">
          {DIFFICULTY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDifficulty(opt.value)}
              className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                difficulty === opt.value
                  ? 'border-primary bg-primary/20 text-primary shadow-lg'
                  : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  difficulty === opt.value
                    ? 'bg-primary/20 text-primary'
                    : 'bg-neutral-700/50 text-neutral-400'
                }`}>
                  {DIFFICULTY_ICONS[opt.value]}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg mb-2">{opt.label}</div>
                  <div className="text-sm leading-relaxed text-neutral-300 mb-2">
                    {opt.desc}
                  </div>
                  {opt.longDesc && (
                    <div className="text-xs text-neutral-400 leading-relaxed mb-2">
                      {opt.longDesc}
                    </div>
                  )}
                  {opt.examples && (
                    <div className="text-xs text-neutral-500 italic">
                      Examples: {opt.examples}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
          <form onSubmit={handleFindGame} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-3">Your Dare for the Creator</label>
              <textarea
                className="w-full rounded-xl border border-neutral-700 px-4 py-3 bg-neutral-800/50 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                value={demand}
                onChange={e => setDemand(e.target.value)}
                rows={4}
                required
                minLength={10}
                placeholder="Describe the dare you want the creator to perform if you win the rock-paper-scissors game..."
              />
              <p className="text-neutral-400 text-sm mt-2">
                <strong>Important:</strong> If you win the rock-paper-scissors game, the creator will have to perform this dare. 
                Make it challenging but fair!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                required
              />
              <label htmlFor="consent" className="text-white">
                I consent to participate in a switch game at this difficulty
              </label>
            </div>
          </form>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            onClick={handleFindGame}
            disabled={searching || !difficulty || !consent}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
          >
            {searching ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Finding Game...
              </>
            ) : (
              <>
                <UserGroupIcon className="w-6 h-6" />
                Find Game
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-neutral-400 text-sm">
            Want to play something else? <button onClick={() => navigate('/modern/dashboard')} className="text-primary hover:text-primary-light underline">Try one of our other options</button>.
          </p>
        </div>
      </div>
    );
  } else if (error) {
    content = (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Participate in Switch Game</h2>
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
    );
  } else if (!game || loading) {
    content = (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Game</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load the game...</p>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">Participate in Switch Game</h2>
        </div>

        {/* Status Badge */}
        {game && (
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
        )}

        {/* Game Info Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Game Details</h3>
          
          {/* Participants */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full mb-2">Creator</span>
              <span className="font-semibold text-white">{game.creator?.fullName || game.creator?.username}</span>
            </div>
            
            {game.participant && (
              <>
                <span className="hidden sm:block text-white/50 text-4xl mx-4">→</span>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-300 font-bold bg-blue-500/20 px-3 py-1 rounded-full mb-2">Participant</span>
                  <span className="font-semibold text-white">{game.participant?.fullName || game.participant?.username}</span>
                </div>
              </>
            )}
          </div>

          {/* Game Description */}
          <div className="text-center mb-6">
            <p className="text-white/90 text-lg leading-relaxed">{game.difficultyDescription}</p>
          </div>

          {/* Tags */}
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

        {/* Join Form Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Join Game</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-3">Your dare for the creator</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-neutral-700 px-4 py-3 bg-neutral-800/50 text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                required
                value={demand}
                onChange={e => setDemand(e.target.value)}
                placeholder="Describe the dare you want the creator to perform if you win the rock-paper-scissors game..."
              />
              <p className="text-neutral-400 text-sm mt-2">
                <strong>Important:</strong> If you win the rock-paper-scissors game, the creator will have to perform this dare. 
                Make it challenging but fair!
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-3">Your gesture</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {MOVES.map(opt => (
                  <label 
                    key={opt} 
                    className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col items-center hover:scale-105 ${
                      gesture === opt 
                        ? 'bg-primary/20 text-primary border-primary shadow-lg' 
                        : 'bg-neutral-800/50 text-neutral-300 border-neutral-700 hover:border-primary/50'
                    }`}
                  >
                    <input
                      className="sr-only"
                      required
                      type="radio"
                      value={opt}
                      name="gesture"
                      checked={gesture === opt}
                      onChange={e => setGesture(e.target.value)}
                    />
                    <span className="text-4xl mb-2">{opt === 'rock' ? '🪨' : opt === 'paper' ? '📄' : '✂️'}</span>
                    <span className="font-semibold text-lg">{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                  </label>
                ))}
              </div>
              <p className="text-neutral-400 text-sm">
                The winner is determined by this game of rock-paper-scissors. Wondering what happens on a draw?{' '}
                <button 
                  type="button"
                  onClick={() => setShowRules(!showRules)} 
                  className="text-primary underline hover:text-primary-light"
                >
                  See more details
                </button>
              </p>
              
              {showRules && (
                <div className="mt-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                  <h4 className="font-bold text-white mb-3">Game rules</h4>
                  <div className="text-sm text-neutral-300 space-y-2">
                    <p>If you don't know what rock-paper-scissors is, check out <a href="https://en.wikipedia.org/wiki/Rock-paper-scissors" className="text-primary underline hover:text-primary-light" target="_blank" rel="noopener noreferrer">the wikipedia article</a>.</p>
                    <p>In the case of a draw, what happens depend on which gesture you both picked:</p>
                    <p><strong>Rock:</strong> You both lose and both have to perform the other person's demand.</p>
                    <p><strong>Paper:</strong> You both win, and no one has to do anything. You might want to start another game.</p>
                    <p><strong>Scissors:</strong> Deep in the bowels of our data center, a trained monkey flips a coin and the loser is randomly determined.</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            onClick={handleSubmit}
            disabled={!demand || demand.length < 10 || !gesture}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
          >
            <UserGroupIcon className="w-6 h-6" />
            Join Game
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-neutral-400 text-sm">
            Want to play something else? <button onClick={() => navigate('/modern/dashboard')} className="text-primary hover:text-primary-light underline">Try one of our other options</button>.
          </p>
        </div>

        {/* Timestamps */}
        {game.createdAt && (
          <div className="mt-8 text-center">
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
                  Last Updated: 
                  <span className="cursor-help">
                    {formatRelativeTimeWithTooltip(game.updatedAt).display}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chicken Out Button */}
        {isLoser && game.status === 'in_progress' && (
          <div className="mt-8">
            <button
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleChickenOut}
              disabled={chickenOutLoading}
            >
              {chickenOutLoading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Chickening Out...
                </>
              ) : (
                'Chicken Out'
              )}
            </button>
            {chickenOutError && (
              <div className="text-red-300 text-sm font-medium mt-3 text-center">
                {chickenOutError}
              </div>
            )}
          </div>
        )}
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
                <h1 className="text-2xl font-bold text-white">Participate in Switch Game</h1>
                <p className="text-neutral-400 text-sm">Join games and participate in challenges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <PlayIcon className="w-4 h-4" />
                  <span>Participation Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {content}
    </div>
  );
};

export default ModernSwitchGameParticipate; 