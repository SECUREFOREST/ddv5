import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import Button from '../components/Button';
import { DIFFICULTY_OPTIONS, ERROR_MESSAGES } from '../constants.jsx';
import { ShieldCheckIcon, LockClosedIcon, CheckCircleIcon, UserIcon, FireIcon } from '@heroicons/react/24/solid';
import { retryApiCall } from '../utils/retry';
import { DifficultyBadge } from '../components/Badge';
import Avatar from '../components/Avatar';
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
                <UserIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {creator?.fullName || creator?.username || 'Someone'} wants you to perform
            </h1>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              One Submissive Act
            </h2>
          </div>

          {/* Dom Information Table - OSA Style */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <tbody className="space-y-4">
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Name</td>
                    <td className="py-2 text-white font-semibold">
                      {creator?.fullName || creator?.username || 'Anonymous'}
                    </td>
                  </tr>
                  {creator?.gender && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Gender</td>
                      <td className="py-2 text-white capitalize">{creator.gender}</td>
                    </tr>
                  )}
                  {creator?.age && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Age</td>
                      <td className="py-2 text-white">{creator.age} years old</td>
                    </tr>
                  )}
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Submissive Acts</td>
                    <td className="py-2 text-white">
                      {creator?.daresPerformed || 0} of {creator?.daresPerformed || 0} completed 
                      {creator?.avgGrade ? ` ${Math.round(creator.avgGrade * 20)}% ${creator.avgGrade >= 4.5 ? 'A' : creator.avgGrade >= 3.5 ? 'B' : creator.avgGrade >= 2.5 ? 'C' : 'D'}` : ''}
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-700/30 pb-4">
                    <td className="py-2 text-neutral-400 font-semibold w-1/3">Dominant Acts</td>
                    <td className="py-2 text-white">{creator?.daresCreated || 0}</td>
                  </tr>
                  {creator?.hardLimits && creator.hardLimits.length > 0 && (
                    <tr className="border-b border-neutral-700/30 pb-4">
                      <td className="py-2 text-neutral-400 font-semibold w-1/3">Hard Limits</td>
                      <td className="py-2 text-white">{creator.hardLimits.join(' ')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consent Question */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
            <h3 className="text-2xl font-bold text-white mb-6">
              Will you agree to perform their demand?
            </h3>
          </div>

          {/* Catch Warning */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Of course, there's a catch.</h3>
              <p className="text-yellow-300 text-lg">
                We'll only tell you what you have to do once you consent. :)
              </p>
            </div>
          </div>

          {/* Difficulty Information */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-6">
              <p className="text-neutral-300 text-lg mb-4">
                This dare might describe any act up to or including the following difficulty level:
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <DifficultyBadge level={dare.difficulty} />
                <span className="text-neutral-400">difficulty: {dare.difficulty.charAt(0).toUpperCase() + dare.difficulty.slice(1)}</span>
              </div>
            </div>
            
            {diff && (
              <div className="text-center">
                <p className="text-neutral-300 leading-relaxed">
                  {diff.desc}
                </p>
              </div>
            )}
          </div>

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
                  <span>I Consent</span>
                </div>
              )}
            </Button>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
}