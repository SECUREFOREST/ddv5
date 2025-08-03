import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlusIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';

function DifficultyBadge({ level }) {
  const DIFFICULTY_ICONS = {
    titillating: <SparklesIcon className="w-4 h-4" />,
    arousing: <FireIcon className="w-4 h-4" />,
    explicit: <EyeDropperIcon className="w-4 h-4" />,
    edgy: <ExclamationTriangleIcon className="w-4 h-4" />,
    hardcore: <RocketLaunchIcon className="w-4 h-4" />,
  };

  const getBadgeStyle = (level) => {
    switch (level) {
      case 'titillating':
        return 'bg-pink-600/20 border-pink-600/30 text-pink-400';
      case 'arousing':
        return 'bg-purple-600/20 border-purple-600/30 text-purple-400';
      case 'explicit':
        return 'bg-red-600/20 border-red-600/30 text-red-400';
      case 'edgy':
        return 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400';
      case 'hardcore':
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
      default:
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
    }
  };

  const getLabel = (level) => {
    switch (level) {
      case 'titillating': return 'Titillating';
      case 'arousing': return 'Arousing';
      case 'explicit': return 'Explicit';
      case 'edgy': return 'Edgy';
      case 'hardcore': return 'Hardcore';
      default: return level;
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-semibold ${getBadgeStyle(level)}`}>
      {DIFFICULTY_ICONS[level]}
      {getLabel(level)}
    </span>
  );
}

export default function ClaimDare() {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchClaimDare = useCallback(async () => {
    if (!claimToken) return;
    
    try {
      setLoading(true);
      
      const response = await api.get(`/dares/claim/${claimToken}`);
      
      if (response.data) {
        setDare(response.data);
        showSuccess('Dare loaded successfully!');

      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare claim loading error:', error);
      const errorMessage = error.response?.data?.error || 'Dare not found or already claimed.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [claimToken, showSuccess, showError]);

  useEffect(() => {
    fetchClaimDare();
  }, [fetchClaimDare]);

  const handleConsent = async (e) => {
    e.preventDefault();
    setClaiming(true);
    try {
      const res = await api.post(`/dares/claim/${claimToken}`, { demand: 'I consent' });
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <ListSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">Dare Not Found</div>
              <p className="text-neutral-500 text-sm">
                This dare may have been claimed already or the link is invalid.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    // For dom demands, show the actual demand after consent
    if (dare.dareType === 'domination' && dare.requiresConsent) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
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

                <div className="text-center">
                  <p className="text-neutral-300 text-sm mb-4">
                    You have consented to perform this demand. The dom will be notified.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // For regular dares, show the standard thank you message
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-2xl p-8 border border-green-800/30 shadow-xl text-center">
              <div className="text-green-400 text-xl mb-4">Thank You!</div>
              <p className="text-green-300 text-sm">
                You have consented to perform this dare.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const creator = dare.creator;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-2xl mx-auto space-y-8">
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

            {/* Consent Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleConsent}
                disabled={claiming}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
              >
                {claiming ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Claiming...
                  </>
                ) : (
                  <>
                    <FireIcon className="w-6 h-6" />
                    Accept & Perform Dare
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 