import React, { useState } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { DIFFICULTY_OPTIONS, PRIVACY_OPTIONS } from '../constants';

const ModernTaskCreator = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    type: 'domination',
    privacy: 'delete_after_view',
    parameters: {
      timeLimit: '',
      participants: 1,
      requiresEvidence: true,
      customRules: ''
    }
  });

  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-gray-500 to-gray-700';
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

  const handleDifficultyToggle = (difficulty) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDifficulties.length === 0) {
      alert('Please select at least one difficulty level');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    // Handle success
    console.log('Task created:', { ...formData, difficulties: selectedDifficulties });
  };

  const getPrivacyIcon = (privacy) => {
    const icons = {
      delete_after_view: <EyeIcon className="w-4 h-4" />,
      delete_after_30_days: <ClockIcon className="w-4 h-4" />,
      never_delete: <LockClosedIcon className="w-4 h-4" />
    };
    return icons[privacy] || <GlobeAltIcon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Create New Task</h1>
          <p className="text-neutral-400 text-lg">Design a challenge that matches your vision</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  placeholder="Enter a compelling title..."
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Task Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="domination">Domination</option>
                  <option value="submission">Submission</option>
                  <option value="switch">Switch</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe the task in detail..."
                required
              />
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6">Difficulty Level</h2>
            <p className="text-neutral-400 mb-6">Select one or more difficulty levels that apply to this task</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIFFICULTY_OPTIONS.map((difficulty) => (
                <div
                  key={difficulty.value}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    selectedDifficulties.includes(difficulty.value)
                      ? `border-transparent bg-gradient-to-r ${getDifficultyColor(difficulty.value)} text-white shadow-lg`
                      : 'border-neutral-600 bg-neutral-700/30 hover:border-neutral-500 text-neutral-300'
                  }`}
                  onClick={() => handleDifficultyToggle(difficulty.value)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {getDifficultyIcon(difficulty.value)}
                    <h3 className="font-semibold">{difficulty.label}</h3>
                  </div>
                  <p className="text-sm opacity-90">{difficulty.desc}</p>
                  
                  {selectedDifficulties.includes(difficulty.value) && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <XMarkIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedDifficulties.length > 0 && (
              <div className="mt-6 p-4 bg-neutral-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-3">Selected Difficulties:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDifficulties.map((difficulty) => (
                    <span
                      key={difficulty}
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white`}
                    >
                      {getDifficultyIcon(difficulty)}
                      <span className="capitalize">{difficulty}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <h2 className="text-2xl font-semibold text-white mb-6">Privacy & Visibility</h2>
            
            <div className="space-y-4">
              {PRIVACY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    formData.privacy === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-neutral-600 bg-neutral-700/30 hover:border-neutral-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={formData.privacy === option.value}
                    onChange={(e) => handleInputChange('privacy', e.target.value)}
                    className="mt-1 w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getPrivacyIcon(option.value)}
                      <span className="font-medium text-white">{option.label}</span>
                    </div>
                    <p className="text-sm text-neutral-400">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Advanced Options</h2>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary hover:text-primary-dark transition-colors duration-200"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Time Limit (hours)</label>
                    <input
                      type="number"
                      value={formData.parameters.timeLimit}
                      onChange={(e) => handleInputChange('parameters.timeLimit', e.target.value)}
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      placeholder="Optional time limit"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Max Participants</label>
                    <input
                      type="number"
                      value={formData.parameters.participants}
                      onChange={(e) => handleInputChange('parameters.participants', e.target.value)}
                      className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="requiresEvidence"
                    checked={formData.parameters.requiresEvidence}
                    onChange={(e) => handleInputChange('parameters.requiresEvidence', e.target.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                  />
                  <label htmlFor="requiresEvidence" className="text-white">
                    Require evidence of completion
                  </label>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Custom Rules (Optional)</label>
                  <textarea
                    value={formData.parameters.customRules}
                    onChange={(e) => handleInputChange('parameters.customRules', e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Any additional rules or requirements..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || selectedDifficulties.length === 0}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
                isSubmitting || selectedDifficulties.length === 0
                  ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Task...</span>
                </>
              ) : (
                <>
                  <FireIcon className="w-5 h-5" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernTaskCreator; 