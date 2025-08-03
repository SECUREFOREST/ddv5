import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import TagsInput from '../components/TagsInput';
import { useNavigate } from 'react-router-dom';
import { DocumentPlusIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';

import { PRIVACY_OPTIONS } from '../constants.jsx';

function mapPrivacyValue(val) {
  if (val === 'when_viewed') return 'delete_after_view';
  if (val === '30_days') return 'delete_after_30_days';
  if (val === 'never') return 'never_delete';
  return val;
}

function unmapPrivacyValue(val) {
  if (val === 'delete_after_view') return 'when_viewed';
  if (val === 'delete_after_30_days') return '30_days';
  if (val === 'never_delete') return 'never';
  return val;
}



export default function OfferSubmission() {
  const { showSuccess, showError } = useToast();
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
  const navigate = useNavigate();

  // Fetch slot/cooldown state and privacy setting
  const fetchSettings = useCallback(async () => {
    try {
      setFetching(true);
      
      const [slotsRes, privacyRes] = await Promise.allSettled([
        api.get('/users/user/slots'),
        api.get('/safety/content_deletion'),
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
      
      showSuccess('Settings loaded successfully!');
    } catch (error) {
      console.error('Settings loading error:', error);
      showError('Failed to load slot or privacy info.');
    } finally {
      setFetching(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Handle privacy change
  const handlePrivacyChange = async (val) => {
    setPrivacyLoading(true);
    setPrivacyError('');
    try {
      await api.post('/safety/content_deletion', { value: mapPrivacyValue(val) });
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

  // Deduplicate tags
  const handleTags = (newTags) => {
    setTags([...new Set(newTags.map(t => t.trim().toLowerCase()).filter(Boolean))]);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!difficulty) {
      showError('Please select a difficulty.');
      return;
    }
    if (!description.trim()) {
      showError('Please enter a description or requirements.');
      return;
    }
    if (description.trim().length < 10) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length > 1000) {
      showError('Description must be less than 1000 characters.');
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
      await api.post('/users/subs', {
        difficulty,
        description,
        tags,
        privacy: mapPrivacyValue(privacy),
      });
      setSuccess('Submission offer created successfully!');
      showSuccess('Submission offer created successfully!');
      setTimeout(() => navigate('/performer-dashboard'), 1200);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create submission offer.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <DocumentPlusIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Submit Offer</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Create a submission offer for performers
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Slot Status */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{slotCount}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Available Slots</h3>
                  <p className="text-sm text-neutral-400">{slotCount} of {maxSlots} slots used</p>
                </div>
              </div>
              {slotLimit && (
                <div className="text-red-400 text-sm">
                  You've reached the maximum number of open dares.
                </div>
              )}
            </div>

            {/* Cooldown Status */}
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-white">Cooldown Status</h3>
                  <p className="text-sm text-neutral-400">
                    {cooldown && new Date() < new Date(cooldown) 
                      ? `Cooldown until ${new Date(cooldown).toLocaleString()}`
                      : 'No active cooldown'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Difficulty Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        difficulty === option.value
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {DIFFICULTY_ICONS[option.value]}
                        <div className="text-left">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm opacity-75">{option.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
                  Description & Requirements
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Describe what you're looking for..."
                  required
                />
                <div className="text-sm text-neutral-400 mt-2">
                  {description.length}/1000 characters
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Tags (Optional)
                </label>
                <TagsInput
                  tags={tags}
                  onChange={handleTags}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
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
                  <div className="mt-2 text-red-400 text-sm">{privacyError}</div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <DocumentPlusIcon className="w-6 h-6" />
                      Create Submission Offer
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/performer-dashboard')}
                  className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Back to Dashboard
                </button>
              </div>
            </form>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mt-4 bg-green-900/20 border border-green-800/30 rounded-xl p-4 text-green-300">
                {success}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 