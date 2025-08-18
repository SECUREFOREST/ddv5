import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  CheckCircleIcon, 
  UserIcon, 
  FireIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon,
  EyeDropperIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DIFFICULTY_OPTIONS, ERROR_MESSAGES } from '../../constants.jsx';
import { retryApiCall } from '../../utils/retry';
import api from '../../api/axios';

const ModernDareConsent = () => {
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

  const getDifficultyColor = (difficultyValue) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficultyValue] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyIcon = (difficultyValue) => {
    const icons = {
      titillating: <SparklesIcon className="w-6 h-6" />,
      arousing: <EyeDropperIcon className="w-6 h-6" />,
      explicit: <FireIcon className="w-6 h-6" />,
      edgy: <ExclamationTriangleIcon className="w-6 h-6" />,
      hardcore: <RocketLaunchIcon className="w-6 h-6" />
    };
    return icons[difficultyValue] || <StarIcon className="w-6 h-6" />;
  };

  const getDifficultyDescription = (difficultyValue) => {
    const descriptions = {
      titillating: 'Light, playful challenges that tease and excite',
      arousing: 'Moderate intensity with clear arousal elements',
      explicit: 'Direct and explicit content with strong arousal',
      edgy: 'Pushing boundaries with intense experiences',
      hardcore: 'Maximum intensity for experienced users only'
    };
    return descriptions[difficultyValue] || 'Select a difficulty level to continue';
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dare details...</div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dare Not Found</h2>
          <p className="text-neutral-400 mb-6">The dare you're looking for could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty);
  const isDomDemand = dare.dareType === 'domination' && dare.requiresConsent;
  const creator = dare.creator;

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
                <h1 className="text-2xl font-bold text-white">Dare Consent</h1>
                <p className="text-neutral-400 text-sm">Review and consent to perform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span>Consent Required</span>
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
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                {creator?.fullName || creator?.username || 'Someone'} wants you to perform
              </h2>
              <h3 className="text-3xl sm:text-4xl font-bold text-primary mt-2">
                One Submissive Act
              </h3>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Review the creator's information and difficulty level before giving your consent
          </p>
        </div>

        {/* Creator Information */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-primary" />
            Creator Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                <span className="text-neutral-400 font-medium">Name</span>
                <span className="text-white font-semibold">
                  {creator?.fullName || creator?.username || 'Anonymous'}
                </span>
              </div>
              
              {creator?.gender && (
                <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                  <span className="text-neutral-400 font-medium">Gender</span>
                  <span className="text-white capitalize">{creator.gender}</span>
                </div>
              )}
              
              {creator?.age && (
                <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                  <span className="text-neutral-400 font-medium">Age</span>
                  <span className="text-white">{creator.age} years old</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                <span className="text-neutral-400 font-medium">Submissive Acts</span>
                <span className="text-white">
                  {creator?.daresPerformed || 0} completed
                  {creator?.avgGrade ? (
                    <span className="ml-2 text-primary">
                      {Math.round(creator.avgGrade * 20)}% {creator.avgGrade >= 4.5 ? 'A' : creator.avgGrade >= 3.5 ? 'B' : creator.avgGrade >= 2.5 ? 'C' : 'D'}
                    </span>
                  ) : ''}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                <span className="text-neutral-400 font-medium">Dominant Acts</span>
                <span className="text-white">{creator?.daresCreated || 0}</span>
              </div>
              
              {creator?.hardLimits && creator.hardLimits.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                  <span className="text-neutral-400 font-medium">Hard Limits</span>
                  <span className="text-white text-sm">{creator.hardLimits.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Consent Question */}
        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-2xl border border-primary/30 p-8 shadow-xl text-center mb-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Will you agree to perform their demand?
          </h3>
          <p className="text-neutral-300 text-lg">
            This is a binding agreement. Please consider carefully before consenting.
          </p>
        </div>

        {/* Catch Warning */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-8 shadow-xl mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Of course, there's a catch.</h3>
            <p className="text-yellow-300 text-xl">
              We'll only tell you what you have to do once you consent. :)
            </p>
          </div>
        </div>

        {/* Difficulty Information */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Difficulty Level</h3>
          
          <div className="text-center mb-6">
            <p className="text-neutral-300 text-lg mb-6">
              This dare might describe any act up to or including the following difficulty level:
            </p>
            
            <div className={`inline-flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white shadow-xl`}>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {getDifficultyIcon(dare.difficulty)}
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold capitalize">{dare.difficulty}</div>
                <div className="text-white/90">{getDifficultyDescription(dare.difficulty)}</div>
              </div>
            </div>
          </div>
          
          {diff && (
            <div className="text-center">
              <p className="text-neutral-300 leading-relaxed text-lg">
                {diff.desc}
              </p>
              {diff.longDesc && (
                <p className="text-neutral-400 leading-relaxed mt-2">
                  {diff.longDesc}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Safety Information */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl border border-blue-500/30 p-6 shadow-xl mb-8">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
              <ShieldCheckIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">Your Safety Matters</h4>
              <p className="text-blue-200 text-sm leading-relaxed">
                Remember that you can always decline any dare that makes you uncomfortable, even after consenting. 
                Your boundaries and comfort are important.
              </p>
            </div>
          </div>
        </div>

        {/* Consent Button */}
        <div className="text-center">
          <button
            onClick={handleConsent}
            disabled={loading}
            className="px-12 py-6 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:scale-105 shadow-2xl hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 mx-auto"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                I Consent
              </>
            )}
          </button>
          
          <p className="text-neutral-500 text-sm mt-4">
            Clicking this button indicates your consent to perform the dare
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernDareConsent; 