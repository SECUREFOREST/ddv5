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
    { value: 'titillating', label: 'Titillating', icon: '🔥', desc: 'A gentle challenge for beginners.', longDesc: 'Perfect for first-timers or those who prefer a more relaxed dare.', examples: 'A simple dare like "Take a sip of water" or "Tell a joke"' },
    { value: 'arousing', label: 'Arousing', icon: '💋', desc: 'A playful dare that might make you blush.', longDesc: 'Useful for playful dares or dares that require a bit of imagination.', examples: 'A dare like "Kiss your hand" or "Pretend to be a cat and meow"' },
    { value: 'explicit', label: 'Explicit', icon: '💦', desc: 'A daring dare that might be too personal.', longDesc: 'Useful for dares that involve physical contact or personal boundaries.', examples: 'A dare like "Give a back rub" or "Pretend to be a dog and bark"' },
    { value: 'edgy', label: 'Edgy', icon: '⚡', desc: 'A daring dare that might push boundaries.', longDesc: 'Useful for dares that involve risk or discomfort.', examples: 'A dare like "Eat a spoonful of hot sauce" or "Pretend to be a chicken and cluck"' },
    { value: 'hardcore', label: 'Hardcore', icon: '💀', desc: 'A very daring dare that might be dangerous.', longDesc: 'Useful for dares that involve extreme physical or mental challenges.', examples: 'A dare like "Eat a whole raw onion" or "Pretend to be a zombie and moan"' }
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
      showSuccess('Switch game cancelled successfully.');
      setShowModal(false);
      setCreatedGame(null);
      setClaimLink('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel switch game.';
      showError(errorMessage);
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
                    {option.icon}
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
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-4">
          <div className="text-center">
            <FireIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Switch Game Created!</h3>
            <p className="text-neutral-300 mb-4">
              Your switch game has been created successfully! Share the link below to invite others to join and challenge you.
            </p>
          </div>

          {claimLink && (
            <div>
              <label htmlFor="claim-link" className="block font-semibold mb-1 text-white">Shareable Link</label>
              <div className="flex gap-2">
                <input
                  id="claim-link"
                  type="text"
                  value={claimLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Anyone with this link can join your game and challenge you!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-neutral-600 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={handleViewGame}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Game
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-neutral-400 hover:text-white underline text-sm transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}