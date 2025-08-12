import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { retryApiCall } from '../utils/retry';
import { handleApiError } from '../utils/errorHandler';
import { MainContent, ContentContainer } from '../components/Layout';
import { ErrorAlert, InfoAlert } from '../components/Alert';
import { ButtonLoading } from '../components/LoadingSpinner';
import { DifficultyBadge } from '../components/Badge';
import Button from '../components/Button';
import { DIFFICULTY_OPTIONS } from '../constants.jsx';
import { FormTextarea, FormSelect } from '../components/Form';
import { 
  FireIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon, 
  UserIcon,
  ClockIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  FireIcon as FireIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

export default function SwitchGameClaim() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [showCreatorDare, setShowCreatorDare] = useState(false);
  
  // Form state for joining the game
  const [demand, setDemand] = useState('');
  const [gesture, setGesture] = useState('rock');
  const [consent, setConsent] = useState(false);


  useEffect(() => {
    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const fetchGame = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await retryApiCall(() => api.get(`/switches/claim/${gameId}`));
      
      if (response.data) {
        console.log('Switch game data received:', response.data);
        console.log('Game difficulty:', response.data.difficulty);
        setGame(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Failed to fetch switch game:', err);
      const errorMessage = handleApiError(err, 'switch game');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError('You must be logged in to join this game.');
      return;
    }
    
    if (!demand.trim() || demand.trim().length < 10) {
      showError('Please enter a dare of at least 10 characters.');
      return;
    }
    
    if (!gesture) {
      showError('Please select your gesture.');
      return;
    }
    
    if (!consent) {
      showError('You must consent to participate in this game.');
      return;
    }
    
    setClaiming(true);
    try {
      const response = await retryApiCall(() => api.post(`/switches/${gameId}/join`, {
        difficulty: game?.creatorDare?.difficulty || 'titillating',
        move: gesture,
        consent: true,
        dare: demand
      }));
      
      showSuccess('Successfully joined the switch game!');
      navigate(`/switches/${gameId}`);
    } catch (err) {
      console.error('Failed to join switch game:', err);
      const errorMessage = handleApiError(err, 'joining switch game');
      showError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const handleBlockCreator = async () => {
    if (!game?.creator?._id) {
      showError('Cannot block: No creator information available.');
      return;
    }
    
    setBlocking(true);
    try {
      await retryApiCall(() => api.post('/users/block', { userId: game.creator._id }));
      showSuccess('Creator blocked successfully. You will no longer see their content.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Block API call failed:', err);
      const errorMessage = handleApiError(err, 'blocking creator');
      showError(errorMessage);
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white">Loading Switch Game...</h2>
              <p className="text-white/70">Please wait while we fetch the game details.</p>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIconSolid className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">Game Not Found</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIconSolid className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">Game Not Available</h2>
              <p className="text-yellow-300 mb-6">This switch game is no longer available to join.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  // Check if game is still available
  if (game.status !== 'waiting_for_participant' || game.participant) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FireIconSolid className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">Game Full</h2>
              <p className="text-blue-300 mb-6">This switch game already has a participant and is no longer accepting new players.</p>
              <button
                onClick={() => navigate('/switches')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Find Other Games
              </button>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {game?.creator?.fullName || game?.creator?.username || 'Someone'} wants to challenge you to a
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              Switch Game
            </h2>
          </div>

          {/* Creator Information Table - OSA Style */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="space-y-4">
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Name</td>
                    <td className="py-2 text-white font-semibold">
                      {game?.creator?.fullName || game?.creator?.username || 'Anonymous'}
                    </td>
                  </tr>
                  {game?.creator?.gender && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Gender</td>
                      <td className="py-2 text-white capitalize">{game.creator.gender}</td>
                    </tr>
                  )}
                  {game?.creator?.age && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Age</td>
                      <td className="py-2 text-white">{game.creator.age} years old</td>
                    </tr>
                  )}
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Games Created</td>
                    <td className="py-2 text-white">{game?.creator?.switchGamesCreated || 0}</td>
                  </tr>
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Games Won</td>
                    <td className="py-2 text-white">{game?.creator?.switchGamesWon || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>



          {/* Consent Question */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Will you accept this challenge?
            </h3>
          </div>

          {/* Catch Warning */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Here's how it works:</h3>
              <p className="text-yellow-300 text-lg">
                You'll both reveal your moves (Rock, Paper, Scissors). The loser must perform the winner's dare!
              </p>
            </div>
          </div>

          {/* Difficulty Information */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-neutral-300 text-lg mb-4">
                This game might involve dares up to or including the following difficulty level:
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                {game?.creatorDare?.difficulty ? (
                  <DifficultyBadge level={game.creatorDare.difficulty} />
                ) : (
                  <span className="px-3 py-1 bg-neutral-600/20 border border-neutral-500/30 text-neutral-400 rounded-full text-sm font-medium">
                    Difficulty not set
                  </span>
                )}
              </div>
            </div>
            
                        {game?.creatorDare?.difficulty && DIFFICULTY_OPTIONS.find(d => d.value === game.creatorDare.difficulty) ? (
              <div className="text-center">
                <p className="text-neutral-300 leading-relaxed">
                  {DIFFICULTY_OPTIONS.find(d => d.value === game.creatorDare.difficulty).desc}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-neutral-300 leading-relaxed">
                  The difficulty level for this game has not been specified by the creator.
                </p>
              </div>
            )}
          </div>

          {/* Join Game Form */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <form onSubmit={handleJoin} className="space-y-6">
              <h3 className="text-2xl font-bold text-white text-center mb-6">Join the Game</h3>
              
              {/* Your Dare */}
              <FormTextarea
                label="Your Dare (What the loser must do)"
                placeholder="Describe the dare you want the loser to perform... (minimum 10 characters)"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Move Selection */}
              <div className="pt-6 space-y-2">
                <label className="block text-lg font-semibold text-white mb-3">
                  Your Move (Rock, Paper, or Scissors)
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'rock', label: '🪨 Rock', desc: 'Strong and solid' },
                    { value: 'paper', label: '📄 Paper', desc: 'Flexible and covering' },
                    { value: 'scissors', label: '✂️ Scissors', desc: 'Sharp and precise' }
                  ].map((moveOption) => (
                    <button
                      key={moveOption.value}
                      type="button"
                      onClick={() => setGesture(moveOption.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        gesture === moveOption.value
                          ? 'border-primary bg-primary/20 text-primary shadow-lg'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{moveOption.label.split(' ')[0]}</div>
                      <div className="text-sm font-semibold">{moveOption.label.split(' ')[1]}</div>
                      <div className="text-xs text-neutral-400 mt-1">{moveOption.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="w-5 h-5 text-green-500 bg-neutral-800 border-neutral-700 rounded focus:ring-green-500 focus:ring-2 mt-1"
                    required
                  />
                  <label htmlFor="consent" className="text-white text-sm leading-relaxed">
                    I consent to participate in this switch game. I understand that if I lose, I will be required to perform the creator's dare and submit proof. I also understand that the creator will be required to perform my dare if they lose.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={claiming || !consent || !demand.trim() || demand.trim().length < 10}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {claiming ? (
                    <>
                      <ButtonLoading />
                      Joining Game...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-6 h-6" />
                      Accept Challenge
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Block Creator Option */}
          <div className="text-center pt-8">
            <button
              onClick={handleBlockCreator}
              disabled={blocking}
              className="bg-red-600/20 text-red-400 px-6 py-3 rounded-xl font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {blocking ? (
                <>
                  <ButtonLoading />
                  Blocking...
                </>
              ) : (
                <>
                  <XMarkIcon className="w-5 h-5" />
                  Block Creator
                </>
              )}
            </button>
            <p className="text-neutral-400 text-sm mt-2">
              Don't want to play with this creator? Block them to avoid future interactions.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-neutral-400 text-sm">
              Changed your mind? <a href="/dashboard" className="text-primary hover:text-primary-light underline">Go back to dashboard</a>.
            </p>
          </div>


        </MainContent>
      </ContentContainer>
    </div>
  );
} 