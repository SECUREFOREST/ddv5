import React, { useState } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS, PRIVACY_OPTIONS } from '../../constants';

const ModernSwitchGameCreator = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'arousing',
    maxParticipants: 4,
    minParticipants: 2,
    duration: 7, // days
    privacy: 'public',
    allowRoleSwitching: true,
    requireApproval: false,
    tags: [],
    rules: '',
    rewards: '',
    startDate: '',
    endDate: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-red-400 to-red-600',
      explicit: 'from-orange-500 to-orange-700',
      edgy: 'from-purple-500 to-purple-700',
      hardcore: 'from-gray-700 to-gray-900'
    };
    return colors[difficulty] || 'from-gray-400 to-gray-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <FireIcon className="w-5 h-5" />,
      explicit: <EyeDropperIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <SparklesIcon className="w-5 h-5" />;
  };

  const getPrivacyIcon = (privacy) => {
    const icons = {
      public: <GlobeAltIcon className="w-5 h-5" />,
      private: <LockClosedIcon className="w-5 h-5" />,
      friends: <UserGroupIcon className="w-5 h-5" />
    };
    return icons[privacy] || <GlobeAltIcon className="w-5 h-5" />;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Switch Game Created:', formData);
      // Reset form or redirect
    } catch (error) {
      console.error('Error creating switch game:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
                              <UserGroupIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create Switch Game</h1>
              <p className="text-neutral-400">Design a multi-participant game with role switching</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <StarIcon className="w-6 h-6 text-primary" />
              <span>Basic Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Game Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter game title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Difficulty Level *</label>
                <div className="grid grid-cols-5 gap-2">
                  {DIFFICULTY_OPTIONS.map((difficulty) => (
                    <button
                      key={difficulty.value}
                      type="button"
                      onClick={() => handleInputChange('difficulty', difficulty.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                        formData.difficulty === difficulty.value
                          ? `border-primary bg-gradient-to-r ${getDifficultyColor(difficulty.value)}`
                          : 'border-neutral-600/50 bg-neutral-700/50 hover:border-neutral-500/50'
                      }`}
                    >
                      <div className="text-white">
                        {getDifficultyIcon(difficulty.value)}
                      </div>
                      <span className={`text-xs font-medium ${
                        formData.difficulty === difficulty.value ? 'text-white' : 'text-neutral-400'
                      }`}>
                        {difficulty.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your switch game, objectives, and how it works..."
                required
              />
            </div>
          </div>

          {/* Game Configuration */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <CogIcon className="w-6 h-6 text-primary" />
              <span>Game Configuration</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Minimum Participants *</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.minParticipants}
                  onChange={(e) => handleInputChange('minParticipants', parseInt(e.target.value))}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Maximum Participants *</label>
                <input
                  type="number"
                  min={formData.minParticipants}
                  max="20"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Game Duration (days) *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Privacy Setting *</label>
                <select
                  value={formData.privacy}
                  onChange={(e) => handleInputChange('privacy', e.target.value)}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {PRIVACY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowRoleSwitching"
                    checked={formData.allowRoleSwitching}
                    onChange={(e) => handleInputChange('allowRoleSwitching', e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="allowRoleSwitching" className="text-white font-medium">
                    Allow Role Switching During Game
                  </label>
                </div>
                <span className="text-sm text-neutral-400">Players can switch between dominant/submissive roles</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="requireApproval" className="text-white font-medium">
                    Require Approval for New Participants
                  </label>
                </div>
                <span className="text-sm text-neutral-400">You must approve new players joining</span>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <CogIcon className="w-6 h-6 text-primary" />
                <span>Advanced Options</span>
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-400">{showAdvanced ? 'Hide' : 'Show'}</span>
                <div className={`w-5 h-5 transition-transform duration-200 ${
                  showAdvanced ? 'rotate-180' : ''
                }`}>
                  <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </button>

            {showAdvanced && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Game Rules</label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => handleInputChange('rules', e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Detailed rules and guidelines for participants..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Rewards & Incentives</label>
                  <textarea
                    value={formData.rewards}
                    onChange={(e) => handleInputChange('rewards', e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="What participants can earn or gain from this game..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <StarIcon className="w-6 h-6 text-primary" />
              <span>Tags & Categories</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-2 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Save Draft
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Switch Game</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Missing icon component
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default ModernSwitchGameCreator; 