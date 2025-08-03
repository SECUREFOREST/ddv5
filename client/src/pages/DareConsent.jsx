import React, { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';
import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { DIFFICULTY_OPTIONS } from '../constants';

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
      default: return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-semibold ${getBadgeStyle(level)}`}>
      {DIFFICULTY_ICONS[level]}
      {getLabel(level)}
    </span>
  );
}

export default function DareConsent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = React.useState(location.state?.dare || null);
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(!dare);

  const fetchDare = useCallback(async () => {
    if (!id) return;
    
    try {
      setFetching(true);
      
      const response = await api.get(`/dares/${id}`);
      
      if (response.data) {
        setDare(response.data);
        showSuccess('Dare loaded successfully!');

      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare loading error:', error);
      const errorMessage = error.response?.data?.error || 'Dare not found.';
      showError(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [id, showSuccess, showError]);

  React.useEffect(() => {
    if (!dare && id) {
      fetchDare();
    }
  }, [dare, id, fetchDare]);

  const handleConsent = async () => {
    setLoading(true);
    if (dare && dare._id) {
      if (dare.status !== 'in_progress') {
        try {
          await api.patch(`/dares/${dare._id}`, { status: 'in_progress' });
          showSuccess('Dare status updated successfully!');
        } catch (err) {
          const errorMessage = err.response?.data?.error || 'Failed to update dare status.';
          showError(errorMessage);
          setLoading(false);
          return;
        }
      }
      navigate(`/dare/reveal/${dare._id}`);
    }
    setLoading(false);
  };

  if (fetching) {
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
                The dare you're looking for could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Consent</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Confirm your consent to perform this dare
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-400">Step 2 of 2</div>
              <div className="text-sm text-neutral-400">Consent to Perform Dare</div>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Dare Card */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Dare Details</h2>
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
                  <div className="text-sm text-neutral-400">Creator</div>
                </div>
              </div>
            </div>

            {/* Dare Description */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-white mb-3">Description</label>
              <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                <p className="text-neutral-300">{dare.description}</p>
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
            <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-2">Important Notice</h3>
                  <p className="text-yellow-300 text-sm">
                    By consenting to this dare, you acknowledge that you are comfortable with the difficulty level and content. 
                    You can decline any dare that makes you uncomfortable at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Button */}
            <div className="text-center">
              <button
                onClick={handleConsent}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-6 h-6" />
                    I Consent to Perform This Dare
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