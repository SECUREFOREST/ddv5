import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import Button from '../components/Button';
import { DIFFICULTY_OPTIONS, ERROR_MESSAGES } from '../constants.jsx';
import { ShieldCheckIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { retryApiCall } from '../utils/retry';
import { DifficultyBadge } from '../components/Badge';
import { MainContent, ContentContainer } from '../components/Layout';
import { WarningAlert } from '../components/Alert';
import { ButtonLoading } from '../components/LoadingSpinner';

export default function DareConsent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


  const fetchDare = useCallback(async () => {
    if (!id) return;
    
    try {
      setFetching(true);
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${id}`));
      setDare(response.data);
    } catch (error) {
      console.error('Dare consent loading error:', error);
      const errorMessage = error.response?.data?.error || ERROR_MESSAGES.DARE_LOAD_FAILED;
      showError(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [id, showError]);

  useEffect(() => {
    if (id) {
      fetchDare();
    }
  }, [id, fetchDare]);

  const handleConsent = async () => {
    setLoading(true);
    if (dare && dare._id) {
      try {
        // For dom demands, this consent unlocks the hidden demand
        if (dare.dareType === 'domination' && dare.requiresConsent) {
          // Use retry mechanism for consent submission
          await retryApiCall(() => api.patch(`/dares/${dare._id}/consent`, { 
            consented: true,
            consentedAt: new Date().toISOString()
          }));
          showSuccess('Consent recorded! You can now view the full demand.');
        } else {
          // For regular dares, update status to in_progress
          if (dare.status !== 'in_progress') {
                      // Use retry mechanism for status update
          await retryApiCall(() => api.patch(`/dares/${dare._id}`, { 
            status: 'in_progress'
          }));
            showSuccess('Dare status updated successfully!');
          }
        }
        
        // Navigate to reveal page to show the full content
        navigate(`/dare/reveal/${dare._id}`);
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to record consent.';
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  if (fetching) {
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
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">Dare Not Found</div>
              <p className="text-neutral-500 text-sm">
                The dare you're looking for could not be found.
              </p>
            </div>
          </div>
        </ContentContainer>
      </div>
    );
  }

  const diff = DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty);
  const isDomDemand = dare.dareType === 'domination' && dare.requiresConsent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {isDomDemand ? 'Consent to View Demand' : 'Dare Consent'}
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              {isDomDemand 
                ? 'Confirm your consent to view this dominant demand'
                : 'Confirm your consent to perform this dare'
              }
            </p>
          </div>

          {/* Double-Consent Warning for Dom Demands */}
          {isDomDemand && (
            <div className="bg-gradient-to-r from-red-600/20 to-red-700/20 border border-red-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <LockClosedIcon className="w-8 h-8 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Double-Consent Protection</h3>
                  <p className="text-neutral-300 leading-relaxed">
                    This dominant demand is currently hidden. By consenting, you acknowledge that you are comfortable 
                    with the difficulty level and agree to view the full demand. This ensures proper consent before 
                    revealing the specific content.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-400">Step 2 of 2</div>
              <div className="text-sm text-neutral-400">
                {isDomDemand ? 'Consent to View Demand' : 'Consent to Perform Dare'}
              </div>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Dare Card */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isDomDemand ? 'Demand Preview' : 'Dare Details'}
              </h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Creator Avatar */}
                {dare.creator && dare.creator.avatar ? (
                  <img 
                    src={dare.creator.avatar} 
                    alt={`${dare.creator.fullName || dare.creator.username || 'Anonymous'} avatar`} 
                    className="w-12 h-12 rounded-full border-2 border-primary" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 border-2 border-neutral-600">
                    ?
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold text-white">
                    {dare.creator?.fullName || dare.creator?.username || 'Anonymous'}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {isDomDemand ? 'Dominant' : 'Creator'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dare Description */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-white mb-3">
                {isDomDemand ? 'Demand Preview' : 'Description'}
              </label>
              <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                {isDomDemand ? (
                  <div className="text-center">
                    <LockClosedIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                    <p className="text-neutral-400 italic">
                      The full demand is hidden until you consent to view it.
                    </p>
                  </div>
                ) : (
                  <p className="text-neutral-300">{dare.description}</p>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-white mb-3">Difficulty</label>
              <div className="flex items-center gap-4">
                <DifficultyBadge level={dare.difficulty} />
                {diff && (
                  <div className="text-sm text-neutral-400">
                    {diff.description}
                  </div>
                )}
              </div>
            </div>

            {/* Consent Warning */}
            <WarningAlert className="mb-8">
              {isDomDemand 
                ? 'By consenting to view this demand, you acknowledge that you are comfortable with the difficulty level and agree to view the full content. You can decline at any time.'
                : 'By consenting to this dare, you acknowledge that you are comfortable with the difficulty level and content. You can decline any dare that makes you uncomfortable at any time.'
              }
            </WarningAlert>



            {/* Consent Button */}
            <div className="text-center">
              <Button
                onClick={handleConsent}
                disabled={loading}
                variant="primary"
                size="lg"
                className="mx-auto"
              >
                {loading ? (
                  <>
                    <ButtonLoading />
                    Processing...
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span>{isDomDemand ? 'I Consent to View This Demand' : 'I Consent to Perform This Dare'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
}