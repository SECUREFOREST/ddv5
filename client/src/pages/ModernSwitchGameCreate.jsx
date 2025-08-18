import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon,
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants.jsx';
import api from '../api/axios';

const ModernSwitchGameCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 2,
    duration: 7,
    difficulty: 'explicit',
    isPublic: true,
    allowSpectators: false,
    autoStart: false,
    creatorDare: '',
    participantDare: '',
    rules: '',
    rewards: '',
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const validateForm = () => {
    const validation = validateFormData(formData, VALIDATION_SCHEMAS.switchGameCreate);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors before submitting.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await retryApiCall(() => api.post('/switches', formData));
      
      if (response.data) {
        showSuccess('Switch game created successfully!');
        navigate(`/modern/switches/${response.data._id}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create switch game';
      showError(errorMessage);
    } finally {
      setLoading(false);
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
                <h1 className="text-2xl font-bold text-white">Create Switch Game</h1>
                <p className="text-neutral-400 text-sm">Set up a new switch game with rules and challenges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <PlusIcon className="w-4 h-4" />
                  <span>Creation Mode</span>
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
              <PlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Create Switch Game</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Set up a new switch game with rules and challenges
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Design an engaging switch game where participants can experience different roles and challenges
          </p>
        </div>

        {/* Creation Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <InformationCircleIcon className="w-6 h-6 text-primary" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-2">
                    Game Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder="Enter game title"
                    required
                  />
                  {errors.title && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {errors.title}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-neutral-300 mb-2">
                    Max Participants
                  </label>
                  <select
                    id="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={5}>5 Players</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-300 mb-2">
                  Game Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Describe your switch game..."
                  required
                />
                {errors.description && (
                  <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    {errors.description}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-primary" />
                Difficulty Level
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'].map((difficulty) => (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => handleInputChange('difficulty', difficulty)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.difficulty === difficulty
                        ? `border-primary bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white shadow-lg`
                        : 'border-neutral-700 bg-neutral-700/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.difficulty === difficulty
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-600/50 text-neutral-400'
                      }`}>
                        {getDifficultyIcon(difficulty)}
                      </div>
                      <div>
                        <div className="font-semibold capitalize">{difficulty}</div>
                        <div className="text-sm opacity-75">
                          {difficulty === 'titillating' && 'Mild and playful'}
                          {difficulty === 'arousing' && 'Moderate excitement'}
                          {difficulty === 'explicit' && 'Direct and clear'}
                          {difficulty === 'edgy' && 'Pushing boundaries'}
                          {difficulty === 'hardcore' && 'Intense challenges'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Settings */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                Game Settings
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-neutral-300 mb-2">
                    Game Duration (days)
                  </label>
                  <select
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  >
                    <option value={1}>1 Day</option>
                    <option value={3}>3 Days</option>
                    <option value={7}>1 Week</option>
                    <option value={14}>2 Weeks</option>
                    <option value={30}>1 Month</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                      className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-neutral-300">Public Game</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.allowSpectators}
                      onChange={(e) => handleInputChange('allowSpectators', e.target.checked)}
                      className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-neutral-300">Allow Spectators</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.autoStart}
                      onChange={(e) => handleInputChange('autoStart', e.target.checked)}
                      className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="text-neutral-300">Auto-start when full</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Game Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <TrophyIcon className="w-6 h-6 text-primary" />
                Game Content
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="creatorDare" className="block text-sm font-medium text-neutral-300 mb-2">
                    Creator's Dare *
                  </label>
                  <textarea
                    id="creatorDare"
                    value={formData.creatorDare}
                    onChange={(e) => handleInputChange('creatorDare', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    placeholder="Describe the dare for the game creator..."
                    required
                  />
                  {errors.creatorDare && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {errors.creatorDare}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="participantDare" className="block text-sm font-medium text-neutral-300 mb-2">
                    Participant's Dare *
                  </label>
                  <textarea
                    id="participantDare"
                    value={formData.participantDare}
                    onChange={(e) => handleInputChange('participantDare', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    placeholder="Describe the dare for participants..."
                    required
                  />
                  {errors.participantDare && (
                    <div className="text-red-400 text-sm mt-1 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {errors.participantDare}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="rules" className="block text-sm font-medium text-neutral-300 mb-2">
                  Game Rules
                </label>
                <textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Optional: Add specific rules for your game..."
                />
              </div>
              
              <div>
                <label htmlFor="rewards" className="block text-sm font-medium text-neutral-300 mb-2">
                  Rewards & Consequences
                </label>
                <textarea
                  id="rewards"
                  value={formData.rewards}
                  onChange={(e) => handleInputChange('rewards', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Optional: Describe rewards for winners and consequences for losers..."
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <StarIcon className="w-6 h-6 text-primary" />
                Tags
              </h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-1 text-white flex items-center gap-2"
                    >
                      <span className="text-sm">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-neutral-400 hover:text-red-400 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-6 border-t border-neutral-700/50">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    Create Switch Game
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 bg-neutral-600/50 hover:bg-neutral-500/50 text-neutral-300 hover:text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModernSwitchGameCreate; 