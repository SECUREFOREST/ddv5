import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon, 
  PlusIcon, 
  LockClosedIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  GlobeAltIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import api from '../api/axios';

const ModernDomDemandCreator = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [claimLink, setClaimLink] = useState('');
  const [createdDare, setCreatedDare] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [tags, setTags] = useState([]);
  const [publicDare, setPublicDare] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (description.trim().length < 10) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length > 1000) {
      showError('Description must be less than 1000 characters.');
      return;
    }

    setCreating(true);
    try {
      // Create a dom demand with double-consent protection
      const res = await retryApiCall(() => api.post('/dares/dom-demand', {
        description,
        difficulty,
        tags,
        public: publicDare,
        dareType: 'domination',
        requiresConsent: true, // This ensures double-consent workflow
      }));

      if (res.data && res.data.claimLink) {
        setClaimLink(res.data.claimLink);
        setCreatedDare(res.data.dare || res.data);
        setShowModal(true);
        showSuccess('Dominant dare created successfully! The submissive must consent before seeing your demand.');
      } else {
        throw new Error('Invalid response: missing claim link');
      }
    } catch (err) {
      console.error('Dominant dare creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create dominant dare.';
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
    setCreateError('');
    setTags([]);
    setCreatedDare(null);
    setShowDescription(false);
  };

  const handleCancelDare = async () => {
    if (!createdDare || !createdDare._id) {
      showError('No dare to cancel.');
      return;
    }

    setCancelling(true);
    try {
      await retryApiCall(() => api.delete(`/dares/${createdDare._id}`));
      
      showSuccess('Dare cancelled successfully!');
      setShowModal(false);
      setCreatedDare(null);
      setClaimLink('');
      
      // Reset form
      setDescription('');
      setDifficulty('titillating');
      setTags([]);
      setCreateError('');
      setShowDescription(false);
      
    } catch (err) {
      console.error('Dare cancellation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel dare.';
      showError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const addTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(claimLink);
      showSuccess('Link copied to clipboard!');
    } catch (err) {
      showError('Failed to copy link to clipboard.');
    }
  };

  const getDifficultyColor = (diff) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[diff] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyBorderColor = (diff) => {
    const colors = {
      titillating: 'border-pink-500',
      arousing: 'border-purple-500',
      explicit: 'border-red-500',
      edgy: 'border-yellow-500',
      hardcore: 'border-gray-700'
    };
    return colors[diff] || 'border-neutral-500';
  };

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
                <h1 className="text-2xl font-bold text-white">Create Dominant Demand</h1>
                <p className="text-neutral-400 text-sm">Create a dare that requires submissive consent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                Consent Protected
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FireIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Demand & Dominate</h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Create a dare that requires submissive consent before revealing. 
            Your demand stays hidden until they agree to participate.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Select Difficulty Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  difficulty === option.value
                    ? `border-primary bg-gradient-to-r ${getDifficultyColor(option.value)}/20 text-white shadow-lg shadow-primary/25`
                    : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 transition-all duration-200 ${
                    difficulty === option.value
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-700/50 text-neutral-400 group-hover:bg-neutral-600/50'
                  }`}>
                    {DIFFICULTY_ICONS[option.value]}
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
                
                {/* Selection Indicator */}
                {difficulty === option.value && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          {/* Error Display */}
          {createError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">{createError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                Your Dare Description
                <span className="text-neutral-400 font-normal ml-2">
                  (Hidden until consent)
                </span>
              </label>
              
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your dare in detail... (This will be hidden until the submissive consents)"
                  required
                  className="w-full h-32 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  maxLength={1000}
                />
                
                {/* Character Count */}
                <div className="absolute bottom-3 right-3 text-xs text-neutral-400">
                  {description.length}/1000
                </div>
                
                {/* Preview Toggle */}
                <button
                  type="button"
                  onClick={() => setShowDescription(!showDescription)}
                  className="absolute top-3 right-3 p-2 bg-neutral-600/50 hover:bg-neutral-500/50 text-neutral-300 rounded-lg transition-colors duration-200"
                >
                  {showDescription ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Description Preview */}
              {showDescription && description && (
                <div className="mt-3 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
                  <div className="text-sm text-neutral-400 mb-2">Preview:</div>
                  <div className="text-white text-sm leading-relaxed">{description}</div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-lg font-semibold text-white mb-3">
                <TagIcon className="w-5 h-5 inline mr-2" />
                Tags
                <span className="text-neutral-400 font-normal ml-2">
                  (Max 10 tags)
                </span>
              </label>
              
              {/* Tag Input */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.length >= 10}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary-dark transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-neutral-700/30 rounded-lg border border-neutral-600/50">
                <input
                  type="checkbox"
                  id="publicDare"
                  checked={publicDare}
                  onChange={(e) => setPublicDare(e.target.checked)}
                  className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="publicDare" className="text-white flex items-center space-x-2">
                  <GlobeAltIcon className="w-5 h-5" />
                  <span>Make this dare public for others to discover</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <div className="text-green-400 text-sm">
                  <strong>Consent Protected:</strong> Your dare description will remain hidden until the submissive explicitly consents to participate.
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            onClick={handleCreate}
            disabled={creating || !description.trim()}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Dare...
              </>
            ) : (
              <>
                <PlusIcon className="w-6 h-6" />
                Create Dominant Dare
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-neutral-400 text-sm">
            Not feeling dominant?{' '}
            <button
              onClick={() => navigate('/dashboard')}
              className="text-primary hover:text-primary-light underline transition-colors duration-200"
            >
              Try one of our other options
            </button>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Dare Created Successfully!</h3>
              <p className="text-neutral-300 text-sm">
                Your dominant dare has been created with consent protection.
                The submissive must first consent before seeing your specific dare.
              </p>
            </div>

            {claimLink && (
              <div className="mb-6">
                <label htmlFor="claim-link" className="block font-semibold mb-2 text-white text-sm">
                  Shareable Link
                </label>
                <div className="flex space-x-2">
                  <input
                    id="claim-link"
                    type="text"
                    value={claimLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <button
                onClick={handleCancelDare}
                disabled={cancelling}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {cancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    <span>🚨 Cancel This Dare 🚨</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleCreateAnother}
                className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-600 transition-colors duration-200"
              >
                Create Another
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDomDemandCreator; 