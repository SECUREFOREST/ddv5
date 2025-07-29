import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

import TagsInput from '../components/TagsInput';
import { ArrowRightIcon, CheckCircleIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/Toast';
import { DIFFICULTY_OPTIONS } from '../constants';
import { ButtonLoading } from '../components/LoadingSpinner';

export default function DareCreator() {
  const { showSuccess, showError } = useToast();
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdDareId, setCreatedDareId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [claimable, setClaimable] = useState(false);
  const [claimLink, setClaimLink] = useState('');
  const [tags, setTags] = useState([]);
  const [publicDare, setPublicDare] = useState(true);

  const DIFFICULTY_ICONS = {
    titillating: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
    arousing: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
    explicit: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
    edgy: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
    hardcore: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
  };

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
    setCreating(true);
    try {
      let res;
      if (claimable) {
        res = await api.post('/dares/claimable', {
          description,
          difficulty,
          tags,
          public: publicDare,
        });
        setClaimLink(res.data.claimLink);
        setShowModal(true);
        showSuccess('Claimable dare created successfully!');
      } else {
        res = await api.post('/dares', {
          description,
          difficulty,
          tags,
          public: publicDare,
        });
        showSuccess('Dare created successfully!');
        navigate(`/dare/share/${res.data._id || res.data.id}`);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create dare.';
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const dareUrl = createdDareId && typeof window !== 'undefined' ? `${window.location.origin}/dares/${createdDareId}` : '';

  const handleCreateAnother = () => {
    setShowModal(false);
    setCreatedDareId(null);
    setDescription('');
    setDifficulty('titillating');
    setCreateError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-4xl mx-auto space-y-8">
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
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <form onSubmit={handleCreate} className="space-y-8">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
                  Dare Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Describe your dare in detail..."
                  required
                />
                <div className="text-sm text-neutral-400 mt-2">
                  {description.length}/1000 characters
                </div>
              </div>

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
                          <div className="text-sm opacity-75">{option.description}</div>
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
                  tags={tags}
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
                <button
                  type="submit"
                  disabled={creating || description.trim().length < 10}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FireIcon className="w-6 h-6" />
                      Create Dare
                    </>
                  )}
                </button>
                
                <Link
                  to="/dares"
                  className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <ArrowRightIcon className="w-6 h-6" />
                  Back to Dares
                </Link>
              </div>
            </form>
          </div>

          {/* Error/Success Messages */}
          {createError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
              {createError}
            </div>
          )}
          
          {generalError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
              {generalError}
            </div>
          )}
          
          {generalSuccess && (
            <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4 text-green-300">
              {generalSuccess}
            </div>
          )}
        </main>
      </div>

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
              <button
                onClick={() => navigator.clipboard.writeText(claimLink)}
                className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Copy Link
              </button>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Create Another Dare
            </button>
            <Link
              to="/dares"
              className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-center"
            >
              View All Dares
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
} 