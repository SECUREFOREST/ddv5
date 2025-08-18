import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DocumentPlusIcon, 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon, 
  ClockIcon,
  ArrowLeftIcon,
  TagIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CalendarIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES } from '../constants.jsx';
import { PRIVACY_OPTIONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import api from '../api/axios';

const ModernOfferSubmission = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  // State management
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [privacy, setPrivacy] = useState('when_viewed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(null);
  const [slotLimit, setSlotLimit] = useState(false);
  const [slotCount, setSlotCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(5);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [newTag, setNewTag] = useState('');

  // Fetch slot/cooldown state and privacy setting
  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      
      const [slotsRes, privacyRes] = await Promise.allSettled([
        retryApiCall(() => api.get('/users/user/slots')),
        retryApiCall(() => api.get('/safety/content_deletion')),
      ]);
      
      // Handle slots response
      if (slotsRes.status === 'fulfilled') {
        if (slotsRes.value.data) {
          const slotsData = slotsRes.value.data;
          setSlotCount(slotsData.openSlots ?? 0);
          setMaxSlots(slotsData.maxSlots ?? 5);
          setSlotLimit((slotsData.openSlots ?? 0) >= (slotsData.maxSlots ?? 5));
          setCooldown(slotsData.cooldownUntil ?? null);
        }
      } else {
        console.error('Failed to fetch slots data:', slotsRes.reason);
      }
      
      // Handle privacy response
      if (privacyRes.status === 'fulfilled') {
        if (privacyRes.value.data) {
          setPrivacy(privacyRes.value.data.value || 'when_viewed');
        }
      } else {
        console.error('Failed to fetch privacy setting:', privacyRes.reason);
      }
      
    } catch (error) {
      console.error('Settings loading error:', error);
      showError(ERROR_MESSAGES.SLOT_PRIVACY_LOAD_FAILED);
    } finally {
      setFetching(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle privacy change
  const handlePrivacyChange = async (val) => {
    setPrivacyLoading(true);
    setPrivacyError('');
    try {
      // Use retry mechanism for privacy setting update
      await retryApiCall(() => api.post('/safety/content_deletion', { value: mapPrivacyValue(val) }));
      setPrivacy(val);
      showSuccess('Privacy setting updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update privacy setting.';
      setPrivacyError(errorMessage);
      showError(errorMessage);
    } finally {
      setPrivacyLoading(false);
    }
  };

  // Map privacy values
  function mapPrivacyValue(val) {
    if (val === 'when_viewed') return 'delete_after_view';
    if (val === '30_days') return 'delete_after_30_days';
    if (val === 'never') return 'never_delete';
    return val;
  }

  // Handle tags
  const handleTags = (newTags) => {
    setTags([...new Set(newTags.map(t => t.trim().toLowerCase()).filter(Boolean))]);
  };

  // Add new tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use comprehensive form validation
    const formData = {
      difficulty,
      description: description.trim(),
      tags,
      privacy
    };
    
    const validation = validateFormData(formData, VALIDATION_SCHEMAS.offerSubmission);
    
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }
    
    if (slotLimit) {
      showError('You have reached the maximum number of open dares. Complete or reject a dare to free up a slot.');
      return;
    }
    if (cooldown && new Date() < new Date(cooldown)) {
      showError('You are in cooldown and cannot offer a new submission until it ends.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Use retry mechanism for offer submission
      await retryApiCall(() => api.post('/users/subs', {
        difficulty,
        description,
        tags,
        privacy: mapPrivacyValue(privacy),
      }));
      setSuccess('Submission offer created successfully!');
      showSuccess('Submission offer created successfully!');
      // Memory-safe timeout for navigation
      setTimeout(() => navigate('/modern/performer-dashboard'), 1200);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create submission offer.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get difficulty color
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading submission form...</div>
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
                <h1 className="text-2xl font-bold text-white">Submit Offer</h1>
                <p className="text-neutral-400 text-sm">Create a submission offer for performers</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <DocumentPlusIcon className="w-4 h-4" />
                  <span>Submission Mode</span>
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
              <DocumentPlusIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Submit Offer</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Create a submission offer for performers
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Describe what you're looking for and set your preferences for performers to discover
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Slot Status */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                slotLimit 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                <span className="text-lg font-bold">{slotCount}</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Available Slots</h3>
                <p className="text-sm text-neutral-400">{slotCount} of {maxSlots} slots used</p>
              </div>
            </div>
            {slotLimit && (
              <div className="text-red-400 text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                You've reached the maximum number of open dares.
              </div>
            )}
          </div>

          {/* Cooldown Status */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                cooldown && new Date() < new Date(cooldown)
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                <ClockIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Cooldown Status</h3>
                <p className="text-sm text-neutral-400">
                  {cooldown && new Date() < new Date(cooldown) 
                    ? `Active until ${new Date(cooldown).toLocaleString()}`
                    : 'No active cooldown'
                  }
                </p>
              </div>
            </div>
            {cooldown && new Date() < new Date(cooldown) && (
              <div className="text-yellow-400 text-sm flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4" />
                You cannot submit new offers during cooldown.
              </div>
            )}
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Difficulty Selection */}
            <div>
              <label className="block text-xl font-semibold text-white mb-6">
                Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDifficulty(option.value)}
                    className={`group relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
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
                    
                    <div className="relative flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        difficulty === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-700/50 text-neutral-400 group-hover:bg-neutral-600/50 group-hover:text-neutral-300'
                      }`}>
                        {DIFFICULTY_ICONS[option.value]}
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-lg transition-colors duration-300 ${
                          difficulty === option.value ? 'text-white' : 'text-white group-hover:text-primary'
                        }`}>
                          {option.label}
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          difficulty === option.value ? 'text-white/90' : 'text-neutral-300 group-hover:text-neutral-200'
                        }`}>
                          {option.desc}
                        </div>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {difficulty === option.value && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xl font-semibold text-white mb-3">
                Description & Requirements
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                placeholder="Describe what you're looking for, your preferences, and any specific requirements..."
                required
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-neutral-400">
                  {description.length}/1000 characters
                </div>
                {description.length > 800 && (
                  <div className="text-sm text-yellow-400">
                    {description.length > 950 ? 'Almost at limit!' : 'Getting close to limit'}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xl font-semibold text-white mb-3">
                Tags (Optional)
              </label>
              
              {/* Tag Input */}
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
                  <TagIcon className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
                        <XCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-neutral-400 mt-2">
                Tags help performers find your offer and understand your preferences
              </p>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-xl font-semibold text-white mb-4">
                Content Deletion Policy
              </label>
              <div className="grid grid-cols-1 gap-4">
                {PRIVACY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePrivacyChange(option.value)}
                    disabled={privacyLoading}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      privacy === option.value
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-sm opacity-75 mt-1">{option.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {privacyError && (
                <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {privacyError}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}
                className={`flex-1 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 ${
                  !loading && !slotLimit && (!cooldown || new Date() >= new Date(cooldown))
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary hover:shadow-primary/25'
                    : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <DocumentPlusIcon className="w-5 h-5" />
                    Create Submission Offer
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/modern/performer-dashboard')}
                className="flex-1 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
          </form>

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <InformationCircleIcon className="w-5 h-5 text-blue-400" />
            Tips for a Great Submission
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-300">
            <div>
              <h4 className="font-medium text-white mb-2">Be Specific</h4>
              <p>Describe exactly what you're looking for and any specific requirements or preferences.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Use Tags Wisely</h4>
              <p>Add relevant tags to help performers find your offer and understand your interests.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Set Clear Expectations</h4>
              <p>Be clear about difficulty level and what you expect from performers.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Privacy Matters</h4>
              <p>Choose your content deletion policy carefully to protect your privacy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernOfferSubmission; 