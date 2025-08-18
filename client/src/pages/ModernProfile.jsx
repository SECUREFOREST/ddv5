import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  PencilIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  CheckIcon,
  ArrowRightOnRectangleIcon, 
  XMarkIcon,
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  BoltIcon,
  SparklesIcon,
  HeartIcon,
  TagIcon,
  CalendarIcon,
  CameraIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';
import { PRIVACY_OPTIONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import api from '../api/axios';

const ModernProfile = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dob, setDob] = useState(user?.dob ? user.dob.slice(0, 10) : '');
  const [interestedIn, setInterestedIn] = useState(user?.interestedIn || []);
  const [limits, setLimits] = useState(user?.limits || []);
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Content deletion
  const { contentDeletion, loading: contentDeletionLoading, updateContentDeletion } = useContentDeletion();
  
  const fileInputRef = useRef(null);

  // Initialize form fields
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setGender(user.gender || '');
      setDob(user.dob ? user.dob.slice(0, 10) : '');
      setInterestedIn(user.interestedIn || []);
      setLimits(user.limits || []);
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username is required';
    if (username.length < 3) errors.username = 'Username must be at least 3 characters';
    if (username.length > 20) errors.username = 'Username must be less than 20 characters';
    if (fullName && fullName.length > 50) errors.fullName = 'Full name must be less than 50 characters';
    if (bio && bio.length > 300) errors.bio = 'Bio must be less than 300 characters';
    return errors;
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setHasUnsavedChanges(true);
    switch(field) {
      case 'username': setUsername(value); break;
      case 'fullName': setFullName(value); break;
      case 'bio': setBio(value); break;
      case 'gender': setGender(value); break;
      case 'dob': setDob(value); break;
      case 'interestedIn': setInterestedIn(value); break;
      case 'limits': setLimits(value); break;
    }
  };

  // Handle save
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    if (!user) {
      showError('User not loaded. Please refresh and try again.');
      return;
    }
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showError('Please fix the errors before saving.');
      return;
    }
    
    setSaving(true);
    try {
      const userId = user?.id || user?._id;
      await api.patch(`/users/${userId}`, { 
        username, bio, gender, dob, interestedIn, limits, fullName 
      });
      
      setHasUnsavedChanges(false);
      const updatedUser = { ...user, username, bio, gender, dob, interestedIn, limits, fullName };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    
    setAvatarFile(file);
    setUploadProgress(0);
    setUploadError('');
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    
    // Upload
    if (user && (user.id || user._id)) {
      const userId = user.id || user._id;
      const formData = new FormData();
      formData.append('avatar', file);
      
      try {
        const uploadRes = await api.post(`/users/${userId}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        
        const newAvatarUrl = uploadRes.data.avatar;
        setAvatarPreview(newAvatarUrl);
        setUploadProgress(100);
        
        // Update user object
        const updatedUser = { ...user, avatar: newAvatarUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        showSuccess('Profile picture updated!');
        
        setTimeout(() => setUploadProgress(0), 2000);
      } catch (uploadErr) {
        setUploadError('Failed to upload avatar. Please try again.');
        setUploadProgress(0);
        showError('Failed to upload avatar. Please check your connection and try again.');
      }
    }
    
    e.target.value = '';
  };

  // Fetch user stats
  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    
    const userId = user._id || user.id;
    if (!userId) return;
    
    const cacheKey = `profile_stats_${userId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setStats(cachedData);
      return;
    }
    
    try {
      setLoading(true);
      const response = await retryApiCall(() => api.get(`/stats/users/${userId}`));
      const statsData = validateApiResponse(response, API_RESPONSE_TYPES.STATS);
      setStats(statsData);
      setCachedData(cacheKey, statsData, 10 * 60 * 1000); // 10 minutes
    } catch (error) {
      console.error('Error fetching user stats:', error);
      showError('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  }, [user, getCachedData, setCachedData, showError]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  if (!user) return null;

  const tabs = [
    {
      label: 'Profile',
      icon: UserIcon,
      content: (
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center border-4 border-neutral-700/50 shadow-2xl overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt={user.fullName || user.username} 
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-neutral-800/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <CameraIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-neutral-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                
                {uploadError && (
                  <div className="text-red-400 text-sm text-center">{uploadError}</div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-xl text-neutral-400 mb-4">@{user?.username}</p>
                
                {bio && (
                  <p className="text-neutral-300 mb-6 max-w-2xl leading-relaxed">{bio}</p>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    {editMode ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                  
                  <button
                    onClick={logout}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role Balance */}
          {stats && (stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center justify-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                Your Role Balance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dominant */}
                <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-300">Dominant</div>
                      <div className="text-3xl font-bold text-blue-400">{stats.dominantPercent || 0}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-blue-700/30 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.dominantPercent || 0}%` }}
                    />
                  </div>
                  <div className="text-sm text-blue-300">
                    {stats.dominantCount || 0} dares as dominant
                  </div>
                </div>
                
                {/* Submissive */}
                <div className="bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl p-6 border border-pink-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                      <HeartIcon className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-pink-300">Submissive</div>
                      <div className="text-3xl font-bold text-pink-400">{stats.submissivePercent || 0}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-pink-700/30 rounded-full h-3 mb-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${stats.submissivePercent || 0}%` }}
                    />
                  </div>
                  <div className="text-sm text-pink-300">
                    {stats.submissiveCount || 0} dares as submissive
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 text-neutral-400">
                Based on {stats.totalCount || 0} total completed dares
              </div>
            </div>
          )}

          {/* Profile Form */}
          {editMode && (
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6">Edit Profile</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => handleFormChange('username', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      placeholder="Enter username"
                    />
                    {formErrors.username && (
                      <div className="text-red-400 text-sm mt-1">{formErrors.username}</div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => handleFormChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      placeholder="Enter full name"
                    />
                    {formErrors.fullName && (
                      <div className="text-red-400 text-sm mt-1">{formErrors.fullName}</div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-neutral-300 mb-2">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => handleFormChange('gender', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-neutral-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => handleFormChange('dob', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => handleFormChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  {formErrors.bio && (
                    <div className="text-red-400 text-sm mt-1">{formErrors.bio}</div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="px-8 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )
    },
    {
      label: 'Privacy',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              Content Deletion Settings
            </h3>
            
            {contentDeletionLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-neutral-400">Loading settings...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {PRIVACY_OPTIONS.map((option) => {
                  const mappedValue = option.value === 'delete_after_view' ? 'when_viewed' :
                                    option.value === 'delete_after_30_days' ? '30_days' :
                                    option.value === 'never_delete' ? 'never' : option.value;
                  
                  return (
                    <label key={option.value} className="flex items-start gap-4 p-4 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/30 transition-all cursor-pointer">
                      <input
                        type="radio"
                        name="contentDeletion" 
                        value={mappedValue} 
                        checked={contentDeletion === option.value} 
                        onChange={() => updateContentDeletion(mappedValue)} 
                        disabled={contentDeletionLoading}
                        className="mt-1 w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{option.icon}</span>
                          <div className="font-semibold text-white">{option.label}</div>
                        </div>
                        <div className="text-sm text-neutral-400">{option.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

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
                <h1 className="text-2xl font-bold text-white">Profile Management</h1>
                <p className="text-neutral-400 text-sm">Manage your profile and preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-2">
            {tabs.map((tab, index) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                    activeTab === index 
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 shadow-xl">
          {tabs[activeTab]?.content}
        </div>
      </div>
    </div>
  );
};

export default ModernProfile; 