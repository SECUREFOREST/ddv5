import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlayIcon,
  FireIcon,
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CogIcon,
  FlagIcon,
  ArrowPathIcon,
  TagIcon,
  Squares2X2Icon,
  HandRaisedIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { retryApiCall } from '../../utils/retry';
import { validateApiResponse } from '../../utils/apiValidation';
import { handleApiError } from '../../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../../utils/dateUtils';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../../constants.jsx';
import api from '../../api/axios';

const ModernClaimDare = () => {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [consent, setConsent] = useState(false);

  // Fetch dare details
  const fetchDare = useCallback(async () => {
    if (!claimToken) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await retryApiCall(() => api.get(`/claim/${claimToken}`));
      
      if (response.data) {
        setDare(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load dare:', error);
      const errorMessage = error.response?.data?.error || 'Dare not found or expired.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [claimToken, showError]);

  useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  // Handle claiming the dare
  const handleClaim = async () => {
    if (!user) {
      showError('You must be logged in to claim a dare.');
      return;
    }
    
    if (!consent) {
      showError('You must consent to participate in this dare.');
      return;
    }
    
    setClaiming(true);
    setClaimError('');
    
    try {
      await retryApiCall(() => api.post(`/claim/${claimToken}`, { consent: true }));
      showSuccess('Successfully claimed the dare!');
      navigate(`/modern/dares/${dare._id}/participate`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to claim dare.';
      setClaimError(errorMessage);
      showError(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <HeartIcon className="w-5 h-5" />,
      arousing: <SparklesIcon className="w-5 h-5" />,
      explicit: <FireIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <ShieldCheckIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <StarIcon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Dare</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load the dare...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Claim Dare</h2>
          </div>

          {/* Error Card */}
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30 p-8 shadow-xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Dare Not Available</h3>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/modern/dares')}
            >
              Browse Other Dares
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg">Dare not found</div>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 mt-4"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Claim Dare</h1>
                <p className="text-neutral-400 text-sm">Accept and participate in this challenge</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <HandRaisedIcon className="w-4 h-4" />
                  <span>Claim Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <HandRaisedIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Claim This Dare</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Accept and participate in the challenge
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Review the dare details and claim your spot to participate in this challenge
          </p>
        </div>

        {/* Dare Status */}
        <div className="text-center mb-8">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold shadow-lg text-lg ${
            dare.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            dare.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
            dare.status === 'waiting_for_participant' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
            'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
          }`}>
            {dare.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> :
             dare.status === 'in_progress' ? <ClockIcon className="w-5 h-5" /> :
             dare.status === 'waiting_for_participant' ? <ClockIcon className="w-5 h-5" /> :
             <ExclamationTriangleIcon className="w-5 h-5" />}
            {dare.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Dare Info Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Dare Information</h3>
          
          {/* Dare Title and Description */}
          {dare.title && (
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-white mb-2">{dare.title}</h4>
              {dare.description && (
                <p className="text-neutral-300 leading-relaxed">{dare.description}</p>
              )}
            </div>
          )}
          
          {/* Creator Info */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-full mb-2">Dare Creator</span>
            <span className="font-semibold text-white text-lg">{dare.creator?.fullName || dare.creator?.username}</span>
          </div>

          {/* Dare Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-white">Participants</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {dare.participants?.length || 0} / {dare.maxParticipants || 1}
              </div>
            </div>
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-white">Duration</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {dare.duration || 7} days
              </div>
            </div>
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-green-400" />
                <span className="font-medium text-white">Visibility</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {dare.isPublic ? 'Public' : 'Private'}
              </div>
            </div>
            
            <div className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Created</span>
              </div>
              <div className="text-neutral-300 text-sm">
                {dare.createdAt ? formatRelativeTimeWithTooltip(dare.createdAt).display : 'Unknown'}
              </div>
            </div>
          </div>

          {/* Difficulty and Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white rounded-full px-4 py-2 text-sm font-semibold border border-white/20`}>
              {getDifficultyIcon(dare.difficulty)} {dare.difficulty}
            </span>
            {dare.tags && dare.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 rounded-full px-4 py-2 text-sm font-semibold border border-blue-500/30">
                <TagIcon className="w-4 h-4" /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Dare Content */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-primary" />
            Dare Content
          </h3>
          <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
            <p className="text-neutral-300 leading-relaxed text-lg">
              {dare.content || 'No dare content provided'}
            </p>
          </div>
        </div>

        {/* Dare Rules */}
        {dare.rules && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              Dare Rules
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">{dare.rules}</p>
            </div>
          </div>
        )}

        {/* Rewards & Consequences */}
        {dare.rewards && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 shadow-xl mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <TrophyIcon className="w-6 h-6 text-primary" />
              Rewards & Consequences
            </h3>
            <div className="bg-neutral-700/50 rounded-lg p-6 border border-neutral-600/50">
              <p className="text-neutral-300 leading-relaxed">{dare.rewards}</p>
            </div>
          </div>
        )}

        {/* Consent and Claim Action */}
        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm rounded-2xl p-8 border border-primary/30 shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Ready to Participate?</h3>
          
          {/* Consent Checkbox */}
          <div className="flex items-center gap-3 mb-6 justify-center">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
              required
            />
            <label htmlFor="consent" className="text-white text-lg">
              I consent to participate in this dare at the {dare.difficulty} difficulty level
            </label>
          </div>
          
          <p className="text-neutral-300 mb-6 text-center">
            Click the button below to claim your spot in this dare and start participating!
          </p>
          
          <button
            onClick={handleClaim}
            disabled={claiming || !consent || dare.status !== 'waiting_for_participant'}
            className="bg-gradient-to-r from-primary to-primary-dark text-white px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
          >
            {claiming ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <HandRaisedIcon className="w-6 h-6" />
                Claim This Dare
              </>
            )}
          </button>
          
          {claimError && (
            <div className="text-red-300 text-sm font-medium mt-4 text-center" role="alert">
              {claimError}
            </div>
          )}
          
          {dare.status !== 'waiting_for_participant' && (
            <div className="text-yellow-300 text-sm font-medium mt-4 text-center">
              This dare is no longer accepting participants
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-neutral-400 text-sm">
            Want to play something else? <button onClick={() => navigate('/modern/dares')} className="text-primary hover:text-primary-light underline">Browse other dares</button>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernClaimDare; 