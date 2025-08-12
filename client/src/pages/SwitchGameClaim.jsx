import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { retryApiCall } from '../utils/retry';
import { handleApiError } from '../utils/errorHandler';
import { MainContent, ContentContainer } from '../components/Layout';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert, InfoAlert } from '../components/Alert';
import { ButtonLoading } from '../components/LoadingSpinner';
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
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
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
  const [contentDeletion, setContentDeletion] = useState('delete_after_30_days');

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
        difficulty: game.creatorDare.difficulty,
        move: gesture,
        consent: true,
        dare: demand,
        contentDeletion
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
        <MainContent className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl shadow-2xl shadow-green-600/25">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Join Switch Game</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge the creator in a game of Rock, Paper, Scissors
            </p>
          </div>

          {/* Game Info Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <FireIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-400">Game Details</h2>
                <p className="text-neutral-300">Review the game before joining</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Creator Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Creator
                </h3>
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/30">
                  <div className="flex items-center gap-3 mb-2">
                    {game.creator?.avatar ? (
                      <img 
                        src={game.creator.avatar} 
                        alt={game.creator.fullName || game.creator.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {game.creator?.fullName || game.creator?.username || 'Unknown User'}
                      </div>
                      <div className="text-sm text-neutral-400">
                        @{game.creator?.username || 'unknown'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  Game Info
                </h3>
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Difficulty:</span>
                    <span className="text-white font-semibold capitalize">{game.creatorDare?.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Created:</span>
                    <span className="text-white font-semibold">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Status:</span>
                    <span className="text-green-400 font-semibold">Waiting for Player</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator's Dare Preview */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <EyeIcon className="w-5 h-5" />
                  Creator's Dare Preview
                </h3>
                <button
                  onClick={() => setShowCreatorDare(!showCreatorDare)}
                  className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
                >
                  {showCreatorDare ? (
                    <>
                      <EyeSlashIcon className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" />
                      Show
                    </>
                  )}
                </button>
              </div>
              
              {showCreatorDare ? (
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/30">
                  <p className="text-white">{game.creatorDare?.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-neutral-400">
                    <span>Move: {game.creatorDare?.move}</span>
                    <span>Tags: {game.creatorDare?.tags?.join(', ') || 'None'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/30 text-center">
                  <p className="text-neutral-400">Click "Show" to preview the creator's dare</p>
                </div>
              )}
            </div>
          </div>

          {/* Join Game Form */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <PlayIcon className="w-6 h-6 text-green-400" />
              Join the Game
            </h2>

            <form onSubmit={handleJoin} className="space-y-6">
              {/* Your Dare */}
              <FormTextarea
                label="Your Dare (What the creator must do if you win)"
                placeholder="Describe the dare that the creator will have to perform if you win... (Be creative but respectful)"
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Your Move */}
              <FormSelect
                label="Your Move (Rock, Paper, or Scissors)"
                options={[
                  { value: 'rock', label: '🪨 Rock' },
                  { value: 'paper', label: '📄 Paper' },
                  { value: 'scissors', label: '✂️ Scissors' }
                ]}
                value={gesture}
                onChange={(e) => setGesture(e.target.value)}
                required
              />

              {/* Content Deletion Preference */}
              <FormSelect
                label="Content Deletion Preference"
                options={[
                  { value: 'delete_after_view', label: 'Delete after viewing (24 hours)' },
                  { value: 'delete_after_30_days', label: 'Delete after 30 days' },
                  { value: 'never_delete', label: 'Never delete' }
                ]}
                value={contentDeletion}
                onChange={(e) => setContentDeletion(e.target.value)}
                required
              />

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
                      Join Switch Game
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