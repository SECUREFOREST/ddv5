import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import api from '../api/axios';

const ModernDareDifficultySelect = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [difficulty, setDifficulty] = useState('titillating');
  const [loading, setLoading] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const handleDifficultySelect = (difficultyValue) => {
    setDifficulty(difficultyValue);
    setSelectedDifficulty(difficultyValue);
  };

  const handleContinue = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use retry mechanism for random dare fetch
      const response = await retryApiCall(() => api.get(`/dares/random?difficulty=${difficulty}`));

      if (response.data && response.data._id) {
        showSuccess('Dare found! Redirecting...');
        // Use claimable link if available, otherwise fall back to consent
        const targetRoute = response.data.claimToken 
          ? `/claim/${response.data.claimToken}` 
          : `/dare/consent/${response.data._id}`;
        navigate(targetRoute, { state: { dare: response.data } });
      } else {
        showError('No dare found for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to fetch random dare:', error);
      const apiError = error.response?.data?.error || error.message;
      showError(apiError || 'Failed to fetch dare.');
    } finally {
      setLoading(false);
    }
  }, [difficulty, navigate, showSuccess, showError]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white">Perform a Deviant Dare</h1>
                <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                  Choose your adventure level
                </p>
              </div>
            </div>
            <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
              It's up to you how much you offer, and who you share it with. 
              Select a difficulty level that matches your comfort zone.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Selected Difficulty Display */}
        {selectedDifficulty && (
          <div className="mb-8">
            <div className={`bg-gradient-to-r ${getDifficultyColor(selectedDifficulty)} rounded-2xl p-6 text-white shadow-xl`}>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {getDifficultyIcon(selectedDifficulty)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {DIFFICULTY_OPTIONS.find(opt => opt.value === selectedDifficulty)?.label}
                  </h2>
                  <p className="text-white/90">
                    {getDifficultyDescription(selectedDifficulty)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Difficulty Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleDifficultySelect(option.value)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                difficulty === option.value
                  ? `border-primary bg-gradient-to-r ${getDifficultyColor(option.value)} text-white shadow-2xl shadow-primary/25`
                  : 'border-neutral-700/50 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600/50 hover:bg-neutral-700/30'
              }`}
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 opacity-10 ${
                difficulty === option.value ? 'bg-white' : 'bg-neutral-600'
              }`} style={{
                backgroundImage: 'radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
              
              <div className="relative p-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  difficulty === option.value
                    ? 'bg-white/20 text-white'
                    : 'bg-neutral-700/50 text-neutral-400 group-hover:bg-neutral-600/50 group-hover:text-neutral-300'
                }`}>
                  {DIFFICULTY_ICONS[option.value]}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className={`font-bold text-xl transition-colors duration-300 ${
                    difficulty === option.value ? 'text-white' : 'text-white group-hover:text-primary'
                  }`}>
                    {option.label}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                    difficulty === option.value ? 'text-white/90' : 'text-neutral-300 group-hover:text-neutral-200'
                  }`}>
                    {option.desc}
                  </p>
                  
                  {option.longDesc && (
                    <p className={`text-xs leading-relaxed transition-colors duration-300 ${
                      difficulty === option.value ? 'text-white/80' : 'text-neutral-400 group-hover:text-neutral-300'
                    }`}>
                      {option.longDesc}
                    </p>
                  )}
                  
                  {option.examples && (
                    <div className={`text-xs italic transition-colors duration-300 ${
                      difficulty === option.value ? 'text-white/70' : 'text-neutral-500 group-hover:text-neutral-400'
                    }`}>
                      Examples: {option.examples}
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {difficulty === option.value && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* How it Works Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl p-8 border border-blue-500/30 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <InformationCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-4">How it works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Select Difficulty</h4>
                    <p className="text-blue-200 text-sm">Choose your comfort level from titillating to hardcore</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Get Matched</h4>
                    <p className="text-blue-200 text-sm">We'll find a dare that matches your selected difficulty</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-1">Review & Decide</h4>
                    <p className="text-blue-200 text-sm">Review the dare details and accept or decline</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <ShieldCheckIcon className="w-4 h-4" />
                  <span className="font-medium">Remember:</span> You can always decline any dare that makes you uncomfortable.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={loading || !difficulty}
            className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 mx-auto ${
              difficulty 
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary hover:shadow-primary/25'
                : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                Finding Dare...
              </>
            ) : (
              <>
                <ArrowRightIcon className="w-6 h-6" />
                Continue to Dare
              </>
            )}
          </button>
          
          {!difficulty && (
            <p className="text-neutral-500 text-sm mt-3">
              Please select a difficulty level to continue
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
            <p className="text-neutral-400 text-lg mb-4">
              Not feeling subby today?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/modern/dashboard')}
                className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => navigate('/modern/community')}
                className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Community
              </button>
              <button
                onClick={() => navigate('/modern/dares/create/dom')}
                className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <FireIcon className="w-4 h-4" />
                Create Dare
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDareDifficultySelect; 