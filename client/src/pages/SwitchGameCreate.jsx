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
    { value: 'titillating', label: 'Titillating', icon: '🔥' },
    { value: 'arousing', label: 'Arousing', icon: '💋' },
    { value: 'explicit', label: 'Explicit', icon: '💦' },
    { value: 'edgy', label: 'Edgy', icon: '⚡' },
    { value: 'hardcore', label: 'Hardcore', icon: '💀' }
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(claimLink);
      showSuccess('Link copied to clipboard!');
    } catch (err) {
      showError('Failed to copy link. Please copy manually.');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl shadow-2xl shadow-green-600/25">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Create Switch Game</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge others to a game of chance where the loser must perform a dare
            </p>
          </div>

          {/* Rules & Info */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <ShieldCheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-400">How Switch Games Work</h2>
                <p className="text-neutral-300">Understand the rules before creating your game</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-neutral-200">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5" />
                  Game Setup
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• You create a dare and choose your move</li>
                  <li>• Others join with their own dare and move</li>
                  <li>• Rock-Paper-Scissors determines the winner</li>
                  <li>• Loser must perform the winner's dare</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <EyeDropperIcon className="w-5 h-5" />
                  Privacy & Safety
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>• All content expires automatically</li>
                  <li>• Proof submissions are private</li>
                  <li>• Consent required before participation</li>
                  <li>• Block users you don't want to play with</li>
                </ul>
              </div>
            </div>
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
                placeholder="Describe the dare that the loser will have to perform... (Be creative but respectful)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Difficulty & Move Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Difficulty */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-200">
                    Difficulty Level
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    {safeDifficultyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Move Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-200">
                    Your Move (Rock, Paper, or Scissors)
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <select
                    value={move}
                    onChange={(e) => setMove(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    <option value="rock">🪨 Rock</option>
                    <option value="paper">📄 Paper</option>
                    <option value="scissors">✂️ Scissors</option>
                  </select>
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

          {/* Submit Button - Centered like Dare Difficulty Select */}
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
                Anyone with this link can join your switch game
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleViewGame}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShareIcon className="w-5 h-5" />
              View Game
            </button>
            
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Create Another
            </button>
          </div>

          {/* Cancel Game Option */}
          <div className="pt-4 border-t border-neutral-700">
            <button
              onClick={handleCancelGame}
              disabled={cancelling}
              className="w-full bg-red-600/20 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <ButtonLoading />
                  Cancelling...
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Cancel Game
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}