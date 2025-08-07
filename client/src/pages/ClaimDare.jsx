import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlusIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ShieldCheckIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { PRIVACY_OPTIONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { DifficultyBadge } from '../components/Badge';
import { ButtonLoading } from '../components/LoadingSpinner';
import { MainContent, ContentContainer } from '../components/Layout';
import Button from '../components/Button';

export default function ClaimDare() {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();

  const fetchClaimDare = useCallback(async () => {
    if (!claimToken) return;
    
    try {
      setLoading(true);
      
      // Use retry mechanism for dare claim fetch
      const response = await retryApiCall(() => api.get(`/dares/claim/${claimToken}`));
      
      if (response.data) {
        setDare(response.data);


      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare claim loading error:', error);
      
      // Only show error once
      if (!errorShown) {
        let errorMessage = 'Dare not found or already claimed.';
        
        if (error.response?.status === 404) {
          errorMessage = 'This dare link is invalid or has expired. The dare may have already been claimed or removed.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        
        showError(errorMessage);
        setErrorShown(true);
      }
    } finally {
      setLoading(false);
    }
  }, [claimToken]);

  useEffect(() => {
    setErrorShown(false);
    fetchClaimDare();
  }, [fetchClaimDare]);

  const handleConsent = async (e) => {
    e.preventDefault();
    setClaiming(true);
    try {
      // Use retry mechanism for dare claim submission
      const res = await retryApiCall(() => api.post(`/dares/claim/${claimToken}`, { 
        demand: 'I consent',
        contentDeletion // OSA-style content expiration specified by participant
      }));
      
      // Check if this is a dom demand that requires double-consent
      if (dare.dareType === 'domination' && dare.requiresConsent) {
        // For dom demands, show the actual demand after consent
        setSubmitted(true);
        showSuccess('Consent given! Now you can see the actual demand.');
      } else {
        // For regular dares, redirect to perform
        const dareId = res.data?.dare?._id || (dare && dare._id);
        if (dareId) {
          showSuccess('Dare claimed successfully! Redirecting...');
          navigate(`/dare/${dareId}/perform`);
        } else {
          setSubmitted(true);
          showSuccess('Thank you! You have consented to perform this dare.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to consent to dare.';
      showError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const handleBlockDom = async () => {
    if (!dare?.creator?._id) return;
    
    setBlocking(true);
    try {
      await retryApiCall(() => api.post('/users/block', { userId: dare.creator._id }));
      showSuccess('Dom blocked successfully. You will no longer see their content.');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to block dom.';
      showError(errorMessage);
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-2xl mx-auto space-y-8">
            <ListSkeleton count={5} />
          </div>
        </ContentContainer>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <MainContent className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-neutral-600 to-neutral-700 p-4 rounded-2xl shadow-2xl shadow-neutral-500/25">
                  <ExclamationTriangleIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Not Found</h1>
              <p className="text-xl sm:text-2xl text-neutral-300">
                This dare link is invalid or has expired
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <div className="text-center space-y-6">
                <div className="text-neutral-400 text-lg">
                  This dare may have been:
                </div>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Already claimed by someone else</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Removed by the creator</span>
                  </div>
                  <div className="flex items-center gap-3 text-neutral-300">
                    <div className="w-2 h-2 bg-neutral-500 rounded-full"></div>
                    <span>Expired or invalid</span>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-xl px-6 py-3 font-bold hover:from-neutral-700 hover:to-neutral-800 transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  if (submitted) {
    // For dom demands, show the actual demand after consent
    if (dare.dareType === 'domination' && dare.requiresConsent) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
          <ContentContainer>
            <MainContent className="max-w-2xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dom Demand Revealed</h1>
                <p className="text-xl sm:text-2xl text-neutral-300">
                  You have consented. Here is the actual demand:
                </p>
              </div>

              {/* Revealed Demand */}
              <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-2xl p-8 border border-red-800/30 shadow-xl">
                <div className="text-center mb-6">
                  <div className="text-red-400 text-xl mb-4">The Dom's Demand</div>
                  <DifficultyBadge level={dare.difficulty} />
                </div>
                
                <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30 mb-6">
                  <p className="text-white text-lg leading-relaxed">
                    {dare.description}
                  </p>
                </div>

                {/* Dom Information */}
                {dare.creator && (
                  <div className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-700/30 mb-6">
                    <div className="text-center mb-4">
                      <div className="text-red-400 text-lg font-semibold mb-2">Demand Created By</div>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {dare.creator.avatar ? (
                          <img 
                            src={dare.creator.avatar} 
                            alt={`${dare.creator.fullName || dare.creator.username} avatar`}
                            className="w-12 h-12 rounded-full border-2 border-red-500/30"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center border-2 border-red-500/30">
                            <span className="text-white font-bold text-lg">
                              {(dare.creator.fullName || dare.creator.username || 'D').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white font-semibold text-lg">
                            {dare.creator.fullName || dare.creator.username}
                          </div>
                          <div className="text-neutral-400 text-sm">
                            Dom • {dare.creator.daresCreated || 0} dares created
                          </div>
                        </div>
                      </div>
                      
                      {/* Block Button */}
                      <div className="mt-4">
                        <button
                          onClick={handleBlockDom}
                          disabled={blocking}
                          className="bg-gradient-to-r from-red-800 to-red-900 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:from-red-900 hover:to-red-950 transition-all duration-200 flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blocking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Blocking...
                            </>
                          ) : (
                            <>
                              <NoSymbolIcon className="w-4 h-4" />
                              Block Dom
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {dare.creator.gender && (
                        <div>
                          <span className="text-neutral-400">Gender:</span>
                          <span className="ml-2 text-white capitalize">{dare.creator.gender}</span>
                        </div>
                      )}
                      {dare.creator.age && (
                        <div>
                          <span className="text-neutral-400">Age:</span>
                          <span className="ml-2 text-white">{dare.creator.age}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-neutral-400">Dares performed:</span>
                        <span className="ml-2 text-white">{dare.creator.daresPerformed || 0} completed</span>
                      </div>
                      <div>
                        <span className="text-neutral-400">Average grade:</span>
                        <span className="ml-2 text-white">
                          {dare.creator.avgGrade ? `${dare.creator.avgGrade.toFixed(1)}` : 'No grades yet'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-neutral-300 text-sm">
                    You have consented to perform this demand. The dom will be notified.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate(`/dare/${dare._id}/perform`)}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <FireIcon className="w-5 h-5" />
                    Perform Dare
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-xl px-6 py-3 font-bold hover:from-neutral-700 hover:to-neutral-800 transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </MainContent>
          </ContentContainer>
        </div>
      );
    }

    // For regular dares, show the standard thank you message
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl p-8 border border-green-800/30 shadow-xl text-center">
              <div className="text-green-400 text-xl mb-4">Thank You!</div>
              <p className="text-green-300 text-sm">
                You have consented to perform this dare.
              </p>
            </div>
          </div>
        </ContentContainer>
      </div>
    );
  }

  const creator = dare.creator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <UserPlusIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Claim Dare</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Someone wants you to perform a dare
            </p>
          </div>

          {/* Dare Card */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-8">
              <p className="text-lg text-primary mb-2">
                {creator?.fullName || creator?.username} wants you to perform
              </p>
              <h2 className="text-2xl font-bold text-white mb-4">A Deviant Dare</h2>
            </div>

            {/* Dare Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-3">Dare Description</label>
                <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                  <p className="text-neutral-300">{dare.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <DifficultyBadge level={dare.difficulty} />
                <div className="text-sm text-neutral-400">
                  Created {dare.createdAt && new Date(dare.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="mt-8 p-6 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
              <h3 className="text-lg font-semibold text-white mb-4">About the Creator</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Name:</span>
                  <span className="ml-2 text-white">{creator?.fullName || creator?.username}</span>
                </div>
                {creator?.gender && (
                  <div>
                    <span className="text-neutral-400">Gender:</span>
                    <span className="ml-2 text-white">{creator.gender}</span>
                  </div>
                )}
                {creator?.age && (
                  <div>
                    <span className="text-neutral-400">Age:</span>
                    <span className="ml-2 text-white">{creator.age}</span>
                  </div>
                )}
                <div>
                  <span className="text-neutral-400">Dares performed:</span>
                  <span className="ml-2 text-white">{creator?.daresPerformed || 0} completed</span>
                </div>
                <div>
                  <span className="text-neutral-400">Average grade:</span>
                  <span className="ml-2 text-white">
                    {creator?.avgGrade ? `${creator.avgGrade.toFixed(1)}` : 'No grades yet'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Dares created:</span>
                  <span className="ml-2 text-white">{creator?.daresCreated || 0}</span>
                </div>
              </div>
            </div>

            {/* OSA-Style Content Expiration Settings */}
            <div className="mt-8 bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                  <p className="text-neutral-300 leading-relaxed">
                    Choose how long this dare content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
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

            {/* Consent Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleConsent}
                disabled={claiming}
                variant="primary"
                size="lg"
                className="mx-auto"
              >
                {claiming ? (
                  <>
                    <ButtonLoading />
                    Claiming...
                  </>
                ) : (
                  <>
                    <FireIcon className="w-6 h-6" />
                    Accept & Perform Dare
                  </>
                )}
              </Button>
            </div>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 