import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

import { FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import Button from '../components/Button';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, PRIVACY_OPTIONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { ButtonLoading } from '../components/LoadingSpinner';
import { MainContent, ContentContainer } from '../components/Layout';

export default function DareParticipant() {
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [difficulty, setDifficulty] = useState('titillating');
  const [consented, setConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const [noDare, setNoDare] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [fetching, setFetching] = useState(!!id);

  const MAX_PROOF_SIZE_MB = 10;



  // If id param is present, fetch that dare directly
  const fetchDare = useCallback(async () => {
    if (!id) return;
    
    try {
      setFetching(true);
      
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${id}`));
      
      if (response.data) {
        setDare(response.data);
        setConsented(true);
        showSuccess('Dare loaded successfully!');

      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare loading error:', error);
      const errorMessage = error.response?.data?.error || 'Dare not found.';
      setGeneralError(errorMessage);
      setNoDare(true);
      showError(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [id, showSuccess, showError]);

  React.useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  const handleConsent = useCallback(async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    
    try {
      // Use retry mechanism for random dare fetch
      const response = await retryApiCall(() => api.get(`/dares/random?difficulty=${difficulty}`));
      
      if (response.data && response.data._id) {
        setDare(response.data);
        setConsented(true);
        showSuccess('Dare loaded successfully!');

      } else {
        setNoDare(true);
        showError('No dares available for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to fetch random dare:', error);
      setNoDare(true);
      const errorMessage = error.response?.data?.error || 'Failed to fetch dare.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [difficulty, showSuccess, showError]);

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!dare || (!proof && !proofFile)) {
      return;
    }
    
    try {
      let formData;
      if (proofFile) {
        formData = new FormData();
        if (proof) formData.append('text', proof);
        formData.append('file', proofFile);
        formData.append('contentDeletion', contentDeletion);
        // Use retry mechanism for proof submission with file
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }));
      } else {
        // Use retry mechanism for proof submission with text
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, { text: proof, contentDeletion }));
      }
      setProof('');
      setProofFile(null);
      setProofSuccess('Proof submitted successfully!');
      showSuccess('Proof submitted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit proof.';
      setProofError(errorMessage);
      showError(errorMessage);
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      // Use retry mechanism for chicken out
      await retryApiCall(() => api.post(`/dares/${dare._id}/chicken-out`));
      setGeneralSuccess('Successfully chickened out!');
      showSuccess('Successfully chickened out!');
      setTimeout(() => {
        setConsented(false);
        setDare(null);
        setGeneralSuccess('');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to chicken out.';
      setChickenOutError(errorMessage);
      showError(errorMessage);
    } finally {
      setChickenOutLoading(false);
    }
  };

  const handleTryDifferent = () => {
    setConsented(false);
    setDare(null);
    setNoDare(false);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    setGeneralError('');
    setGeneralSuccess('');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
        showError(`File size must be less than ${MAX_PROOF_SIZE_MB}MB.`);
        e.target.value = '';
        return;
      }
      setProofFile(file);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={6} />
          </div>
        </ContentContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Participate in Dare</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Join and perform exciting dares
            </p>
          </div>

          {!consented ? (
            /* Consent Form */
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Choose Your Challenge</h2>
                <p className="text-neutral-300 mb-6">
                  Select a difficulty level and consent to perform a random dare
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-white mb-4">Difficulty Level</label>
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

              {/* Consent Checkbox */}
              <div className="mb-8">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <label htmlFor="consent" className="text-white">
                    I consent to perform a dare of the selected difficulty level. I understand that I can decline any dare that makes me uncomfortable.
                  </label>
                </div>
              </div>

              {/* Get Dare Button */}
              <div className="text-center">
                <Button
                  onClick={handleConsent}
                  disabled={!consentChecked || loading}
                  variant="primary"
                  size="lg"
                  className="mx-auto"
                >
                  {loading ? (
                    <>
                      <ButtonLoading />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FireIcon className="w-6 h-6" />
                      Get Random Dare
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : dare ? (
            /* Dare Display and Proof Submission */
            <div className="space-y-8">
              {/* Dare Card */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-xl">
                    {DIFFICULTY_ICONS[dare.difficulty]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Dare</h2>
                    <div className="text-neutral-300 mb-4">{dare.description}</div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <span>Difficulty: {dare.difficulty}</span>
                      {dare.creator && (
                        <span>Created by: {dare.creator.fullName || dare.creator.username}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleTryDifferent}
                    variant="default"
                    size="md"
                  >
                    Try Different Dare
                  </Button>
                  
                  <Button
                    onClick={handleChickenOut}
                    disabled={chickenOutLoading}
                    variant="danger"
                    size="md"
                  >
                    {chickenOutLoading ? 'Chickening Out...' : 'Chicken Out'}
                  </Button>
                </div>
              </div>

              {/* Proof Submission */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">Submit Proof</h3>
                
                <form onSubmit={handleProofSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">Proof Description</label>
                    <textarea
                      id="proof-text"
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                      placeholder="Describe how you completed the dare..."
                    />
                  </div>

                  <div>
                    <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">Proof File (Optional)</label>
                    <input
                      type="file"
                      id="proof-file"
                      onChange={handleProofFileChange}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
                    <div className="text-sm text-neutral-400 mt-1">
                      Max file size: {MAX_PROOF_SIZE_MB}MB
                    </div>
                  </div>

                  {/* OSA-Style Content Expiration Settings */}
                  <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-start gap-4 mb-4">
                      <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                        <p className="text-neutral-300 leading-relaxed">
                          Choose how long this proof content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
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

                  <Button
                    type="submit"
                    disabled={proofLoading || (!proof && !proofFile)}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {proofLoading ? (
                      <>
                        <ButtonLoading />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FireIcon className="w-6 h-6" />
                        Submit Proof
                      </>
                    )}
                  </Button>
                </form>

                {proofError && (
                  <ErrorAlert className="mt-4">
                    {proofError}
                  </ErrorAlert>
                )}

                {proofSuccess && (
                  <SuccessAlert className="mt-4">
                    {proofSuccess}
                  </SuccessAlert>
                )}

                {chickenOutError && (
                  <ErrorAlert className="mt-4">
                    {chickenOutError}
                  </ErrorAlert>
                )}
              </div>
            </div>
          ) : noDare ? (
            /* No Dare Available */
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">No dares available</div>
              <p className="text-neutral-500 text-sm mb-6">
                No dares are available for the selected difficulty level. Try a different difficulty or create your own dare.
              </p>
              <Button
                onClick={handleTryDifferent}
                variant="primary"
                size="md"
              >
                Try Different Difficulty
              </Button>
            </div>
          ) : null}

          {/* General Error/Success Messages */}
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
    </div>
  );
} 