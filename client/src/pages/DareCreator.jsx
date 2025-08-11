import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

import Button from '../components/Button';
import TagsInput from '../components/TagsInput';
import Modal from '../components/Modal';
import { ArrowRightIcon, CheckCircleIcon, FireIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { ButtonLoading } from '../components/LoadingSpinner';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { MainContent, ContentContainer } from '../components/Layout';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert, SuccessAlert } from '../components/Alert';

export default function DareCreator() {
  const { showSuccess, showError } = useToast();
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [claimable, setClaimable] = useState(false);
  const [claimLink, setClaimLink] = useState('');
  const [tags, setTags] = useState([]);
  const [publicDare, setPublicDare] = useState(true);



  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setGeneralError('');
    setGeneralSuccess('');
    setClaimLink('');
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
      let res;
      if (claimable) {
        res = await retryApiCall(() => api.post('/dares/claimable', {
          description,
          difficulty,
          tags,
          public: publicDare,
        }));
        if (res.data && res.data.claimLink) {
          setClaimLink(res.data.claimLink);
          setShowModal(true);
          showSuccess('Claimable dare created successfully!');
        } else {
          throw new Error('Invalid response: missing claim link');
        }
      } else {
        res = await retryApiCall(() => api.post('/dares', {
          description,
          difficulty,
          tags,
          public: publicDare,
        }));
        showSuccess('Dare created successfully!');
        navigate(`/dare/share/${res.data._id || res.data.id}`);
      }
    } catch (err) {
      console.error('Dare creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create dare.';
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
  };

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <PlusIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Create a Dare</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge yourself and others with exciting dares
            </p>
          </div>

          {/* Create Dare Form */}
          <div className="bg-black/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            {/* Error Display */}
            {createError && (
              <ErrorAlert className="mb-6">
                {createError}
              </ErrorAlert>
            )}
            
            <form onSubmit={handleCreate} className="space-y-8">
              {/* Description */}
              <FormTextarea
                label="Dare Description"
                placeholder="Describe your dare in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Difficulty Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        difficulty === option.value
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {DIFFICULTY_ICONS[option.value]}
                        <div className="text-left">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm opacity-75">{option.desc}</div>
                          {option.longDesc && (
                            <div className="text-xs opacity-60 mt-1">
                              {option.longDesc}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
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
                    id="claimable"
                    checked={claimable}
                    onChange={(e) => setClaimable(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="claimable" className="text-white">
                    Make this a claimable dare
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="public"
                    checked={publicDare}
                    onChange={(e) => setPublicDare(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="public" className="text-white">
                    Make this dare public
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={creating || description.trim().length < 10}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <ButtonLoading />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FireIcon className="w-6 h-6" />
                      Create Dare
                    </>
                  )}
                </Button>
                
                <Button
                  as={Link}
                  to="/dares"
                  variant="default"
                  size="lg"
                  className="flex-1"
                >
                  <ArrowRightIcon className="w-6 h-6" />
                  Back to Dares
                </Button>
              </div>
            </form>
          </div>

          {/* Error/Success Messages */}
          {createError && (
            <ErrorAlert>
              {createError}
            </ErrorAlert>
          )}
          
          {generalError && (
            <ErrorAlert>
              {generalError}
            </ErrorAlert>
          )}
          
          {generalSuccess && (
            <SuccessAlert>
              {generalSuccess}
            </SuccessAlert>
          )}
        </MainContent>
      </ContentContainer>

      {/* Success Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Dare Created Successfully!"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-4">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Dare Created!</h3>
            <p className="text-neutral-300 mb-4">
              Your claimable dare has been created successfully.
            </p>
          </div>
          
          {claimLink && (
            <div>
              <label htmlFor="claim-link" className="block font-semibold mb-1 text-white">Claimable Link</label>
              <input
                id="claim-link"
                type="text"
                value={claimLink}
                readOnly
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                onFocus={(e) => e.target.select()}
              />
              <Button
                onClick={() => navigator.clipboard.writeText(claimLink)}
                variant="info"
                size="md"
                className="w-full mt-2"
              >
                Copy Link
              </Button>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              onClick={handleCreateAnother}
              variant="primary"
              size="md"
              className="flex-1"
            >
              Create Another Dare
            </Button>
            <Button
              as={Link}
              to="/dares"
              variant="default"
              size="md"
              className="flex-1"
            >
              View All Dares
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 