import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import TagsInput from '../components/TagsInput';
import Modal from '../components/Modal';
import { ShieldCheckIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, PlusIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { ButtonLoading } from '../components/LoadingSpinner';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { MainContent, ContentContainer } from '../components/Layout';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert } from '../components/Alert';

export default function DomDemandCreator() {
  const { showSuccess, showError } = useToast();
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
  const navigate = useNavigate();



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
  };

  const handleCancelDare = async () => {
    if (!createdDare || !createdDare._id) {
      showError('No dare to cancel.');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      '🚨 Are you absolutely sure you want to cancel this dare?\n\n' +
      'This action cannot be undone and will:\n' +
      '• Permanently delete the dare\n' +
      '• Remove any associated content\n' +
      '• Notify any participants\n\n' +
      'Click OK to proceed with cancellation.'
    );

    if (!confirmed) {
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

    } catch (err) {
      console.error('Dare cancellation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel dare.';
      showError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>

        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Demand & Dominate</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Create a dare that requires submissive consent before revealing
            </p>
          </div>

          {/* Create Dominant Dare Form */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            {/* Error Display */}
            {createError && (
              <ErrorAlert className="mb-6">
                {createError}
              </ErrorAlert>
            )}

            <form onSubmit={handleCreate} className="space-y-8">

              {/* Difficulty Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Difficulty Level
                </label>
                <div className="space-y-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${difficulty === option.value
                          ? 'border-red-500 bg-red-500/20 text-red-300 shadow-lg'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-3 rounded-lg flex-shrink-0 ${difficulty === option.value
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-neutral-700/50 text-neutral-400'
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
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <FormTextarea
                label="Your Dare (Hidden until consent)"
                placeholder="Describe your dare in detail... (This will be hidden until the submissive consents)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Tags */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Tags
                </label>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="publicDare"
                    checked={publicDare}
                    onChange={(e) => setPublicDare(e.target.checked)}
                    className="w-5 h-5 text-red-600 bg-neutral-800 border-neutral-700 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <label htmlFor="publicDare" className="text-white">
                    Make this dare public
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {creating ? (
                  <>
                    <ButtonLoading />
                    Creating Dare...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-6 h-6" />
                    Create Dominant Dare
                  </>
                )}
              </button>
            </form>
          </div>
        </MainContent>
      </ContentContainer>

      {/* Success Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Dominant Dare Created Successfully!"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-4">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Dare Created!</h3>
            <p className="text-neutral-300 mb-4">
              Your dominant dare has been created with double-consent protection.
              The submissive must first consent before seeing your specific dare.
            </p>
          </div>

          {claimLink && (
            <div>
              <label htmlFor="claim-link" className="block font-semibold mb-1 text-white">Shareable Link</label>
              <input
                id="claim-link"
                type="text"
                value={claimLink}
                readOnly
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(claimLink)}
                className="w-full mt-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Copy Link
              </button>
            </div>
          )}
          {/* OMG Cancel Button */}
          <div className="pt-4 border-t border-neutral-700">
            <button
              onClick={handleCancelDare}
              disabled={cancelling}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {cancelling ? (
                <>
                  <ButtonLoading />
                  Cancelling Dare...
                </>
              ) : (
                <>
                  🚨 OMG, Cancel This! 🚨
                </>
              )}
            </button>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-neutral-600 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

        </div>
      </Modal>
    </div>
  );
} 