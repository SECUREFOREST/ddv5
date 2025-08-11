import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
// 1. Import Avatar and Heroicons
import Avatar from '../components/Avatar';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, TagIcon, ArrowPathIcon, SparklesIcon, FireIcon, EyeDropperIcon, RocketLaunchIcon, Squares2X2Icon, UserGroupIcon } from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS, PRIVACY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { MainContent, ContentContainer } from '../components/Layout';

const MOVES = ['rock', 'paper', 'scissors'];

// 2. Add a StatusBadge helper (like DareReveal)
function StatusBadge({ status }) {
  if (!status) return null;
  let badgeClass = 'bg-neutral-700 text-neutral-100';
  let icon = null;
  let text = status;
  switch (status) {
    case 'waiting_for_participant':
      badgeClass = 'bg-blue-600/20 border border-blue-500/50 text-blue-300';
      icon = <ClockIcon className="w-5 h-5" />;
      text = 'Waiting for Participant';
      break;
    case 'in_progress':
      badgeClass = 'bg-blue-600/20 border border-blue-500/50 text-blue-300';
      icon = <ClockIcon className="w-5 h-5" />;
      text = 'In Progress';
      break;
    case 'completed':
      badgeClass = 'bg-green-600/20 border border-green-500/50 text-green-300';
      icon = <CheckCircleIcon className="w-5 h-5" />;
      text = 'Completed';
      break;
    case 'forfeited':
      badgeClass = 'bg-red-600/20 border border-red-500/50 text-red-300';
      icon = <ExclamationTriangleIcon className="w-5 h-5" />;
      text = 'Forfeited';
      break;
    default:
      badgeClass = 'bg-neutral-700 text-neutral-100';
      icon = null;
      text = status;
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-lg text-lg ${badgeClass} mx-auto mb-6`}>
      {icon} {text}
    </span>
  );
}



export default function SwitchGameParticipate() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [demand, setDemand] = useState('');
  const [gesture, setGesture] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  // For difficulty/consent selection
  const [difficulty, setDifficulty] = useState('');
  const [consent, setConsent] = useState(false);
  const [searching, setSearching] = useState(false);
  const { showSuccess, showError } = useToast();
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [loading, setLoading] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();

  // Handler for finding a game (for the difficulty/consent form)
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
      // Fetch open switch games with selected difficulty
      const response = await retryApiCall(() => api.get('/switches', { params: { status: 'waiting_for_participant', difficulty } }));
      
      if (response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const gamesData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        if (gamesData.length > 0 && gamesData[0]._id) {
          navigate(`/switches/participate/${gamesData[0]._id}`);

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
  }, [difficulty, consent, showError, showSuccess, navigate]);

  // Fetch game if gameId is present
  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Use retry mechanism for switch game fetch
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

  // In the handleSubmit function, update the join POST request:
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
    try {
      // Use retry mechanism for switch game join
      await retryApiCall(() => api.post(`/switches/${gameId}/join`, { 
        move: gesture, 
        consent: true, 
        difficulty: game.difficulty,
        contentDeletion // OSA-style content expiration specified by participant
      }));
      showSuccess('Successfully joined the game!');
      navigate(`/switches/${gameId}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to join game.';
      
      // Handle block-related errors specifically
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
      // Use retry mechanism for forfeit
      await retryApiCall(() => api.post(`/switches/${game._id}/forfeit`));
      showSuccess('You have successfully chickened out.');
      // Optionally refresh or redirect
      window.location.reload();
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      showError(err.response?.data?.error || 'Failed to chicken out.');
    } finally {
      setChickenOutLoading(false);
    }
  };

  // Conditional rendering logic
  let content;
  if (!gameId) {
    content = (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserGroupIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Participate in Switch Game</h1>
            </div>
            <p className="text-xl text-white/80">Join an existing game or find a new one</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            <form onSubmit={handleFindGame} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Difficulty</h2>
                <div className="grid gap-4">
                  {DIFFICULTY_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                        ${difficulty === opt.value
                          ? 'border-purple-400 bg-purple-500/20 shadow-lg'
                          : 'border-white/20 hover:border-purple-400/50 bg-white/5'}
                      `}
                      tabIndex={0}
                      aria-label={`Select ${opt.label} difficulty`}
                      role="radio"
                      aria-checked={difficulty === opt.value}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') setDifficulty(opt.value);
                      }}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={opt.value}
                        checked={difficulty === opt.value}
                        onChange={() => setDifficulty(opt.value)}
                        className="sr-only"
                        aria-checked={difficulty === opt.value}
                        aria-label={opt.label}
                        tabIndex={-1}
                      />
                      <span className="flex items-center gap-3">
                        {DIFFICULTY_ICONS[opt.value]}
                        <div>
                          <div className="font-bold text-white text-lg">{opt.label}</div>
                          <div className="text-white/70 text-sm">{opt.desc}</div>
                          {opt.longDesc && (
                            <div className="text-white/50 text-xs mt-1">
                              {opt.longDesc}
                            </div>
                          )}
                          {opt.examples && (
                            <div className="text-white/40 text-xs mt-1 italic">
                              Examples: {opt.examples}
                            </div>
                          )}
                        </div>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-white mb-3">Your Demand (if they lose)</label>
                <textarea
                  className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  value={demand}
                  onChange={e => setDemand(e.target.value)}
                  rows={4}
                  required
                  minLength={10}
                  placeholder="Describe the dare you want the other to perform if they lose..."
                  aria-label="Description or requirements"
                />
                <p className="text-white/60 text-sm mt-2">They will only see this if they lose the game</p>
              </div>

              <div className="flex items-center justify-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                    className="w-5 h-5 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                    required
                  />
                  <span className="text-white">I consent to participate in a switch game at this difficulty</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={searching}
                aria-label="Find Game"
              >
                {searching ? (
                  <div className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Finding Game...
                  </div>
                ) : (
                  'Find Game'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  } else if (error) {
    content = (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserGroupIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Participate in Switch Game</h1>
            </div>
          </div>

          {/* Error Card */}
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Game Not Found</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              onClick={() => navigate('/switches/participate')}
            >
              Try Another Game
            </button>
          </div>
        </div>
      </div>
    );
  } else if (!game || loading) {
    content = (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ListSkeleton />
        </div>
      </div>
    );
  } else {
    const u = game.creator;
    content = (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserGroupIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Participate in Switch Game</h1>
            </div>
          </div>

          {/* Status Badge */}
          {game && <StatusBadge status={game.status} />}

          {/* Game Info Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Details</h2>
            
            {/* Participants */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-8">
              <div className="flex flex-col items-center">
                {game.creator && (
                  <a href={`/profile/${game.creator?._id || game.creator?.id || ''}`} className="group" tabIndex={0} aria-label={`View ${game.creator?.username || 'creator'}'s profile`}>
                    <Avatar user={game.creator} size="lg" alt={`Avatar for ${game.creator?.fullName || game.creator?.username || 'creator'}`} />
                  </a>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full mt-2">Creator</span>
                <span className="font-semibold text-white mt-1">{game.creator?.fullName || game.creator?.username}</span>
              </div>
              
              {game.participant && (
                <>
                  <span className="hidden sm:block text-white/50 text-4xl mx-4">→</span>
                  <div className="flex flex-col items-center">
                    <a href={`/profile/${game.participant._id || game.participant.id || ''}`} className="group" tabIndex={0} aria-label={`View ${game.participant.username}'s profile`}>
                      <Avatar user={game.participant} size="lg" alt={`Avatar for ${game.participant?.fullName || game.participant?.username || 'participant'}`} />
                    </a>
                    <span className="inline-flex items-center gap-1 text-xs text-blue-300 font-bold bg-blue-500/20 px-3 py-1 rounded-full mt-2">Participant</span>
                    <span className="font-semibold text-white mt-1">{game.participant?.fullName || game.participant?.username}</span>
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
              <span className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 rounded-full px-4 py-2 text-sm font-semibold border border-purple-500/30">
                <TagIcon className="w-4 h-4" /> {game.difficulty}
              </span>
              {game.tags && game.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 rounded-full px-4 py-2 text-sm font-semibold border border-blue-500/30">
                  <TagIcon className="w-4 h-4" /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Join Form Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Game</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-bold text-white mb-3">Your demand, if they lose</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-white/20 px-4 py-3 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  required
                  aria-required="true"
                  name="switch[demand]"
                  id="switch_demand"
                  value={demand}
                  onChange={e => setDemand(e.target.value)}
                  placeholder="Describe the dare you want the other to perform if they lose..."
                />
                <p className="text-white/60 text-sm mt-2">They will only see this if they lose the game</p>
              </div>

              <div>
                <label className="block font-bold text-white mb-3">Your gesture</label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {MOVES.map(opt => (
                    <label 
                      key={opt} 
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col items-center hover:scale-105
                        ${gesture === opt 
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-lg' 
                          : 'bg-white/10 text-white border-white/20 hover:border-purple-400/50'
                        }`}
                      tabIndex={0} 
                      aria-label={`Select gesture ${opt}`}
                    >
                      <input
                        className="sr-only"
                        required
                        aria-required="true"
                        type="radio"
                        value={opt}
                        name="switch[gesture]"
                        checked={gesture === opt}
                        onChange={e => setGesture(e.target.value)}
                      />
                      <span className="text-4xl mb-2">{opt === 'rock' ? '🪨' : opt === 'paper' ? '📄' : '✂️'}</span>
                      <span className="font-semibold text-lg">{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                    </label>
                  ))}
                </div>
                <p className="text-white/60 text-sm">
                  The winner is determined by this game of rock-paper-scissors. Wondering what happens on a draw?{' '}
                  <button 
                    type="button"
                    onClick={() => setShowRules(!showRules)} 
                    className="text-purple-300 underline hover:text-purple-200"
                  >
                    See more details
                  </button>
                </p>
                
                {showRules && (
                  <div className="mt-4 bg-white/10 p-4 rounded-xl border border-white/20">
                    <h4 className="font-bold text-white mb-3">Game rules</h4>
                    <div className="text-sm text-white/80 space-y-2">
                      <p>If you don't know what rock-paper-scissors is, check out <a href="https://en.wikipedia.org/wiki/Rock-paper-scissors" className="text-purple-300 underline hover:text-purple-200" target="_blank" rel="noopener noreferrer">the wikipedia article</a>.</p>
                      <p>In the case of a draw, what happens depend on which gesture you both picked:</p>
                      <p><strong>Rock:</strong> You both lose and both have to perform the other person's demand.</p>
                      <p><strong>Paper:</strong> You both win, and no one has to do anything. You might want to start another game.</p>
                      <p><strong>Scissors:</strong> Deep in the bowels of our data center, a trained monkey flips a coin and the loser is randomly determined.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* OSA-Style Content Expiration Settings */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4 mb-4">
                  <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      Choose how long this switch game content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {PRIVACY_OPTIONS.map((option) => (
                    <label key={option.value} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      contentDeletion === option.value 
                        ? 'border-yellow-500 bg-yellow-500/10' 
                        : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                    }`}>
                      <input 
                        type="radio" 
                        name="contentDeletion" 
                        value={option.value} 
                        checked={contentDeletion === option.value} 
                        onChange={(e) => updateContentDeletion(e.target.value)} 
                        className="w-5 h-5 text-yellow-600 bg-neutral-700 border-neutral-600 rounded-full focus:ring-yellow-500 focus:ring-2" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{option.icon}</span>
                          <span className="font-semibold text-white">{option.label}</span>
                        </div>
                        <p className="text-sm text-neutral-300">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Join Game
              </button>
            </form>
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
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleChickenOut}
                disabled={chickenOutLoading}
                aria-busy={chickenOutLoading}
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
                <div className="text-red-300 text-sm font-medium mt-3 text-center" role="alert" aria-live="assertive">
                  {chickenOutError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <MainContent>
          {content}
        </MainContent>
      </ContentContainer>
    </div>
  );
}
