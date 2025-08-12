import React, { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import dayjs from 'dayjs';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PhotoIcon, PlayCircleIcon, TagIcon, ArrowPathIcon, ArrowRightIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { DIFFICULTY_ICONS, PRIVACY_OPTIONS } from '../constants.jsx';
import Countdown from '../components/Countdown';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { DifficultyBadge } from '../components/Badge';
import { ButtonLoading } from '../components/LoadingSpinner';
import { ErrorAlert, SuccessAlert } from '../components/Alert';
import { MainContent, ContentContainer } from '../components/Layout';



const STATUS_STEPS = [
  { key: 'in_progress', label: 'In Progress', icon: <ClockIcon className="w-5 h-5" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircleIcon className="w-5 h-5" /> },
          { key: 'chickened_out', label: 'Chickened Out', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
];

export default function DareReveal() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dareId = params.id || location.state?.dareId;
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const { contentDeletion, updateContentDeletion } = useContentDeletion();
  const [privacy, setPrivacy] = useState('when_viewed');
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('proof');

  const fetchDare = useCallback(async () => {
    if (authLoading) return;
    if (!dareId) {
      navigate('/dare/select');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${dareId}`));
      
      if (response.data && response.data._id) {
        const performerId = response.data.performer?._id || response.data.performer;
        if (!user || !performerId || String(performerId) !== String(user._id)) {
          setDare(null);
          showError('You are not authorized to view this dare.');
        } else {
          setDare(response.data);
  

        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare loading error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch dare.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dareId, navigate, user, authLoading, showSuccess, showError]);

  React.useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showError('File size must be less than 50MB.');
        e.target.value = '';
        return;
      }
      setProofFile(file);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    setProofError('');
    setProofSuccess('');
    
    if (!proof && !proofFile) {
      showError('Please provide proof text or upload a file.');
      setProofLoading(false);
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
      setProofModalOpen(false);
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
        // Memory-safe timeout for navigation
        setTimeout(() => {
          navigate('/dare/select');
        }, 2000);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to chicken out.';
        setChickenOutError(errorMessage);
        showError(errorMessage);
      } finally {
        setChickenOutLoading(false);
      }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={6} />
          </div>
        </ContentContainer>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <div className="max-w-2xl mx-auto">
            <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">Dare Not Found</div>
              <p className="text-neutral-500 text-sm">
                The dare you're looking for could not be found or you don't have permission to view it.
              </p>
            </div>
          </div>
        </ContentContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <EyeIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Reveal</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              View and complete your dare
            </p>
          </div>

          {/* Status Progress */}
          <div className="bg-neutral-800/80 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              {STATUS_STEPS.map((step, index) => (
                <div key={step.key} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    dare.status === step.key ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-sm font-semibold ${
                    dare.status === step.key ? 'text-primary' : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="w-8 h-0.5 bg-neutral-700 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dare Card */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-xl">
                <DifficultyBadge level={dare.difficulty} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Your Dare</h2>
                <div className="text-neutral-300 mb-4">{dare.description}</div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span>Difficulty: {dare.difficulty}</span>
                  {dare.creator && (
                    <span>Created by: {dare.creator?.fullName || dare.creator?.username || 'Unknown User'}</span>
                  )}
                  {dare.createdAt && (
                    <span>Created: {formatRelativeTimeWithTooltip(dare.createdAt).display}</span>
                  )}
                </div>
                
                {/* Proof Expiration Info */}
                {dare.proofExpiresAt && (
                  <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-yellow-400">Proof Expiration</span>
                    </div>
                    <div className="text-sm text-yellow-300">
                      Proof will expire on {new Date(dare.proofExpiresAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                {/* Consent Status for Dom Demands */}
                {dare.dareType === 'domination' && dare.requiresConsent && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-semibold text-green-400">Consent Recorded</span>
                    </div>
                    <div className="text-sm text-green-300">
                      You have consented to view this dom demand
                      {dare.consentedAt && ` on ${new Date(dare.consentedAt).toLocaleDateString()}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setProofModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PhotoIcon className="w-5 h-5" />
                Submit Proof
              </button>
              
              <button
                onClick={handleChickenOut}
                disabled={chickenOutLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {chickenOutLoading ? (
                  <>
                    <ButtonLoading />
                    Chickening Out...
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    Chicken Out
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Proof Modal */}
          <Dialog
            open={proofModalOpen}
            onClose={() => setProofModalOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-neutral-800/50" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-neutral-800/95 rounded-2xl p-8 border border-neutral-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <Dialog.Title className="text-2xl font-bold text-white mb-6">
                  Submit Proof
                </Dialog.Title>
                
                <form onSubmit={handleProofSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">
                      Proof Description
                    </label>
                    <textarea
                      id="proof-text"
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                      placeholder="Describe how you completed the dare..."
                    />
                  </div>

                  <div>
                    <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">
                      Proof File (Optional)
                    </label>
                    <input
                      type="file"
                      id="proof-file"
                      onChange={handleProofFileChange}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
                    <div className="text-sm text-neutral-400 mt-1">
                      Max file size: 50MB
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

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setProofModalOpen(false)}
                      className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={proofLoading || (!proof && !proofFile)}
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {proofLoading ? (
                        <>
                          <ButtonLoading />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ArrowRightIcon className="w-5 h-5" />
                          Submit Proof
                        </>
                      )}
                    </button>
                  </div>
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
              </Dialog.Panel>
            </div>
          </Dialog>

          {/* Error/Success Messages */}
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

          {chickenOutError && (
            <ErrorAlert>
              {chickenOutError}
            </ErrorAlert>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 