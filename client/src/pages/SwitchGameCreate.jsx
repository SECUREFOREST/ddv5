import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import Modal from '../components/Modal';
import { ShieldCheckIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, PlusIcon, LockClosedIcon, ShareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { ButtonLoading } from '../components/LoadingSpinner';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { MainContent, ContentContainer } from '../components/Layout';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert } from '../components/Alert';
import { Link } from 'react-router-dom';

export default function SwitchGameCreate() {
  const { showSuccess, showError } = useToast();
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [move, setMove] = useState('rock');
  const [tags, setTags] = useState([]);
  const [publicGame, setPublicGame] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [claimLink, setClaimLink] = useState('');
  const [createdGame, setCreatedGame] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [constantsLoaded, setConstantsLoaded] = useState(false);
  const navigate = useNavigate();

  // Ensure constants are available to prevent errors
  const safeDifficultyOptions = Array.isArray(DIFFICULTY_OPTIONS) ? DIFFICULTY_OPTIONS : [
    { 
      value: 'titillating', 
      label: 'Titillating', 
      desc: 'Fun, flirty, and easy. For beginners or light play.',
      longDesc: 'Perfect for those new to the scene. Light teasing, playful challenges, and gentle exploration. Think flirty photos, mild dares, or simple tasks that build confidence.',
      examples: 'Send a flirty selfie, wear something slightly revealing, or perform a simple dance'
    },
    { 
      value: 'arousing', 
      label: 'Arousing', 
      desc: 'A bit more daring, but still approachable.',
      longDesc: 'A step up from titillating. More sensual and intimate, but still within comfortable boundaries. Good for those with some experience who want to push their limits gently.',
      examples: 'Strip tease, sensual massage, or intimate photography'
    },
    { 
      value: 'explicit', 
      label: 'Explicit', 
      desc: 'Sexually explicit or more intense.',
      longDesc: 'Directly sexual content and activities. Explicit language, nudity, and sexual dares. For experienced users who are comfortable with adult content.',
      examples: 'Nude photos, sexual dares, or explicit roleplay scenarios'
    },
    { 
      value: 'edgy', 
      label: 'Edgy', 
      desc: 'Pushes boundaries, not for the faint of heart.',
      longDesc: 'Advanced content that may involve kink, BDSM elements, or taboo scenarios. Requires clear consent and understanding of limits. Not for everyone.',
      examples: 'BDSM activities, taboo scenarios, or extreme roleplay'
    },
    { 
      value: 'hardcore', 
      label: 'Hardcore', 
      desc: 'Extreme, risky, or very advanced.',
      longDesc: 'The most intense level. May involve extreme kinks, public elements, or very taboo content. Only for experienced users with explicit consent and understanding of risks.',
      examples: 'Extreme BDSM, public exposure, or very taboo scenarios'
    }
  ];

  // Wait for constants to be loaded
  useEffect(() => {
    if (DIFFICULTY_OPTIONS && Array.isArray(DIFFICULTY_OPTIONS)) {
      setConstantsLoaded(true);
    } else {
      // Fallback: set constants as loaded after a short delay
      const timer = setTimeout(() => setConstantsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render until constants are loaded
  if (!constantsLoaded) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div className="text-white/80 text-lg font-medium">Loading...</div>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    // Enhanced validation with better user feedback
    if (!description.trim()) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length < 10) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length > 1000) {
      showError('Description must be less than 1000 characters.');
      return;
    }
    if (!move) {
      showError('Please select a move.');
      return;
    }
    
    setCreating(true);
    try {
      const res = await retryApiCall(() => api.post('/switches', {
        description,
        difficulty,
        move,
        tags,
        public: publicGame
      }));
      
      if (res.data && res.data._id) {
        // Generate claim link for sharing
        const claimLink = `${window.location.origin}/switches/claim/${res.data._id}`;
        setClaimLink(claimLink);
        setCreatedGame(res.data);
        setShowModal(true);
        showSuccess('Switch game created successfully! Share the link to invite others to join.');
      } else {
        throw new Error('Invalid response: missing game ID');
      }
    } catch (err) {
      console.error('Switch game creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create switch game.';
      setCreateError(errorMessage);
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAnother = () => {
    setShowModal(false);
    setDescription('');
    setDifficulty('titillating');
    setMove('rock');
    setTags([]);
    setCreateError('');
  };

  const handleViewGame = () => {
    setShowModal(false);
    navigate(`/switches/${createdGame._id}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(claimLink);
      showSuccess('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = claimLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccess('Link copied to clipboard!');
    }
  };

  const handleCancelGame = async () => {
    if (!createdGame?._id) return;
    
    setCancelling(true);
    try {
      await retryApiCall(() => api.delete(`/switches/${createdGame._id}`));
      showSuccess('Game cancelled successfully');
      setShowModal(false);
      setCreatedGame(null);
      // Reset form
      setDescription('');
      setDifficulty('titillating');
      setMove('rock');
      setTags([]);
      setPublicGame(true);
    } catch (error) {
      showError('Failed to cancel game');
      console.error('Error cancelling game:', error);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>

        <MainContent className="max-w-3xl mx-auto space-y-8">
          {/* Header - Matching Dom Demand Create Design */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Create Switch Game</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge someone to a game where the loser performs your dare
            </p>
          </div>

          {/* Difficulty Selection - Vertical Layout like Dom Demand Create */}
          <div className="space-y-4">
            {safeDifficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                  difficulty === option.value
                    ? 'border-primary bg-primary/20 text-primary shadow-lg'
                    : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${
                    difficulty === option.value
                      ? 'bg-primary/20 text-primary'
                      : 'bg-neutral-700/50 text-neutral-400'
                  }`}>
                    {DIFFICULTY_ICONS[option.value] || '⚙️'}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-2">{option.label}</div>
                    <div className="text-sm leading-relaxed text-neutral-300 mb-2">
                      {option.desc}
                    </div>
                    {option.longDesc && (
                      <div className="text-xs text-neutral-400 leading-relaxed mb-2">
                        {option.longDesc}
                      </div>
                    )}
                    {option.examples && (
                      <div className="text-xs text-neutral-500 italic">
                        Examples: {option.examples}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Create Switch Game Form */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            {/* Error Display */}
            {createError && (
              <ErrorAlert className="mb-6">
                {createError}
              </ErrorAlert>
            )}

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Description */}
              <FormTextarea
                label="Your Dare (What the loser must do)"
                placeholder="Describe your dare in detail... (This is what the loser will have to perform)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Move Selection */}
              <div className="space-y-2">
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
                      onClick={() => setMove(moveOption.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        move === moveOption.value
                          ? 'border-primary bg-primary/20 text-primary shadow-lg'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{moveOption.label.split(' ')[0]}</div>
                      <div className="font-semibold text-sm">{moveOption.label.split(' ')[1]}</div>
                      <div className="text-xs text-neutral-400 mt-1">{moveOption.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-4">
                <label className="block text-lg font-semibold text-white mb-3">
                  Tags
                </label>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="publicGame"
                    checked={publicGame}
                    onChange={(e) => setPublicGame(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="publicGame" className="text-white">
                    Make this game public (others can find and join)
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Submit Button - Centered like Dom Demand Create */}
          <div className="text-center pt-8">
            <button
              onClick={handleCreate}
              disabled={creating || !description.trim() || !move}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
            >
              {creating ? (
                <>
                  <ButtonLoading />
                  Creating Switch Game...
                </>
              ) : (
                <>
                  <PlusIcon className="w-6 h-6" />
                  Create Switch Game
                </>
              )}
            </button>
          </div>

          {/* Footer - Matching Dom Demand Create Style */}
          <div className="text-center pt-8">
            <p className="text-neutral-400 text-sm">
              Want to play something else? <a href="/dashboard" className="text-primary hover:text-primary-light underline">Try one of our other options</a>.
            </p>
          </div>
        </MainContent>
      </ContentContainer>

      {/* Success Modal */}
      {showModal && (
        <Modal open={showModal} onClose={() => setShowModal(false)} title="Game Created Successfully!">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Switch Game is Ready!</h3>
              <p className="text-gray-600 mb-4">
                Share this link with someone to challenge them to your game. The loser will have to perform your dare!
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Share this link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={claimLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCreateAnother}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                Create Another Game
              </button>
              
              <button
                onClick={handleViewGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                View Game
              </button>
              
              <button
                onClick={handleCancelGame}
                disabled={cancelling}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? (
                  <>
                    <ButtonLoading className="w-4 h-4 mr-2" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Game'
                )}
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                ← Go to Dashboard
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}