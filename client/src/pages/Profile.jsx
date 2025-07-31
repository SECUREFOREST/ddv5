import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { UserIcon, ShieldCheckIcon, PencilIcon, NoSymbolIcon, ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon, ArrowRightOnRectangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FireIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import RecentActivityWidget from '../components/RecentActivityWidget';
import TagsInput from '../components/TagsInput';
import { ClockIcon } from '@heroicons/react/24/solid';

function mapPrivacyValue(val) {
  if (val === 'when_viewed') return 'delete_after_view';
  if (val === '30_days') return 'delete_after_30_days';
  if (val === 'never') return 'never_delete';
  return val;
}

export default function Profile() {
  const { user, accessToken, logout, loading, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [dares, setDares] = useState([]);
  const [created, setCreated] = useState([]);
  const [participating, setParticipating] = useState([]);
  const [switchGames, setSwitch] = useState([]);
  const [switchCreated, setSwitchCreated] = useState([]);
  const [switchParticipating, setSwitchParticipating] = useState([]);
  const [tabIdx, setTabIdx] = useState(0);
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);
  const [blockedUsersInfo, setBlockedUsersInfo] = useState([]);
  const [unblockStatus, setUnblockStatus] = useState({});
  const [gender, setGender] = useState(user?.gender || '');
  const [dob, setDob] = useState(user?.dob ? user.dob.slice(0, 10) : '');
  const [interestedIn, setInterestedIn] = useState(user?.interestedIn || []);
  const [limits, setLimits] = useState(user?.limits || []);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(avatar || '');
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [isBlocked, setIsBlocked] = useState(user?.blocked || false);
  const [contentDeletion, setContentDeletion] = useState('');
  const [contentDeletionLoading, setContentDeletionLoading] = useState(false);
  const [contentDeletionError, setContentDeletionError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form fields when user data loads
  const formInitializedRef = useRef(false);
  useEffect(() => {
    if (user && !formInitializedRef.current) {
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setGender(user.gender || '');
      setDob(user.dob ? user.dob.slice(0, 10) : '');
      setInterestedIn(user.interestedIn || []);
      setLimits(user.limits || []);
      setFullName(user.fullName || '');
      setAvatarPreview(user.avatar || '');
      setIsBlocked(user.blocked || false);
      formInitializedRef.current = true;
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

  // Handle save
  const handleSave = useCallback(async (e, isAutoSave = false) => {
    if (e) e.preventDefault();
    
    if (!user) {
      showError('User not loaded. Please refresh and try again.');
      return;
    }
    
    const userId = user?.id || user?._id;
    if (!userId) {
      showError('User ID not found. Please refresh and try again.');
      return;
    }
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      if (!isAutoSave) {
        showError('Please fix the errors before saving.');
      }
      return;
    }
    
    setSaving(true);
    try {
      await api.patch(`/users/${userId}`, { username, avatar, bio, gender, dob, interestedIn, limits, fullName });
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (isAutoSave) {
        showSuccess('Profile auto-saved!');
      } else {
        showSuccess('Profile updated successfully!');
        const updatedUser = { ...user, username, bio, gender, dob, interestedIn, limits, fullName };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      showError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }, [user, username, avatar, bio, gender, dob, interestedIn, limits, fullName, setUser]);

  // Track form changes for auto-save
  const handleFormChange = (field, value) => {
    setHasUnsavedChanges(true);
    switch(field) {
      case 'username':
        setUsername(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
      case 'bio':
        setBio(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'dob':
        setDob(value);
        break;
      case 'interestedIn':
        setInterestedIn(value);
        break;
      case 'limits':
        setLimits(value);
        break;
    }
  };

  // Auto-save with debouncing
  useEffect(() => {
    if (!editMode || !hasUnsavedChanges) return;
    
    const timeoutId = setTimeout(() => {
      const errors = validateForm();
      if (Object.keys(errors).length === 0) {
        handleSave(null, true); // Auto-save
      }
    }, 2000); // 2 second delay
    
    return () => clearTimeout(timeoutId);
  }, [username, fullName, bio, gender, dob, interestedIn, limits, editMode, hasUnsavedChanges, handleSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 's':
            e.preventDefault();
            if (editMode) {
              handleSave(e);
            }
            break;
          case 'e':
            e.preventDefault();
            setEditMode(!editMode);
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [editMode, handleSave]);

  // Fetch blocked users info
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    
    // Fetch info for blocked users with loading state
    if (user.blockedUsers && user.blockedUsers.length > 0) {
      setUserActivitiesLoading(true);
      Promise.all(user.blockedUsers.map(uid => api.get(`/users/${uid}`)))
        .then(resArr => setBlockedUsersInfo(resArr.map(r => r.data)))
        .catch((error) => {
          console.error('Failed to load blocked users:', error);
          setBlockedUsersInfo([]);
          showError('Failed to load blocked users information.');
        })
        .finally(() => setUserActivitiesLoading(false));
    } else {
      setBlockedUsersInfo([]);
    }
  }, [user, loading]);

  const handleUnblock = async (blockedUserId) => {
    setUnblockStatus(s => ({ ...s, [blockedUserId]: 'unblocking' }));
    try {
      await api.post(`/users/${blockedUserId}/unblock`);
      // Remove from local blockedUsers and blockedUsersInfo
      if (user && user.blockedUsers) {
        const idx = user.blockedUsers.indexOf(blockedUserId);
        if (idx !== -1) user.blockedUsers.splice(idx, 1);
      }
      setBlockedUsersInfo(info => info.filter(u => u._id !== blockedUserId));
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'idle' }));
      showSuccess('User unblocked successfully!');
    } catch (err) {
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'error' }));
      showError(err.response?.data?.error || 'Failed to unblock user.');
    }
  };

  // Fetch content deletion setting on mount
  useEffect(() => {
    setContentDeletionLoading(true);
    api.get('/safety/content_deletion')
      .then(res => setContentDeletion(res.data?.value || ''))
      .catch(() => setContentDeletionError('Failed to load content deletion setting.'))
      .finally(() => setContentDeletionLoading(false));
  }, []);

  const handleContentDeletionChange = async (val) => {
    setContentDeletionLoading(true);
    setContentDeletionError('');
    try {
      await api.post('/safety/content_deletion', { value: mapPrivacyValue(val) });
      setContentDeletion(val);
      showSuccess('Content deletion setting updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update setting.';
      setContentDeletionError(errorMessage);
      showError(errorMessage);
    } finally {
      setContentDeletionLoading(false);
    }
  };

  // Fetch user stats
  useEffect(() => {
    if (!user) return;
    const userId = user?.id || user?._id;
    if (!userId) return;
    
    setStatsLoading(true);
    setUserActivitiesLoading(true);
    setStatsError('');
    
    Promise.all([
      api.get('/stats/users/' + userId),
      api.get('/dares', { params: { creator: userId } }),
      api.get('/dares', { params: { participant: userId } }),
      api.get('/dares', { params: { assignedSwitch: userId } }),
      api.get('/switches', { params: { creator: userId } }),
      api.get('/switches', { params: { participant: userId } }),
      api.get('/activity-feed/activities', { params: { userId, limit: 10 } })
    ]).then(([statsRes, createdRes, participatingRes, switchRes, switchCreatedRes, switchParticipatingRes, activitiesRes]) => {
      setStats(statsRes.data);
      setCreated(Array.isArray(createdRes.data) ? createdRes.data : []);
      setParticipating(Array.isArray(participatingRes.data) ? participatingRes.data : []);
      setSwitch(Array.isArray(switchRes.data) ? switchRes.data : []);
      setSwitchCreated(Array.isArray(switchCreatedRes.data) ? switchCreatedRes.data : []);
      setSwitchParticipating(Array.isArray(switchParticipatingRes.data) ? switchParticipatingRes.data : []);
      setUserActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    }).catch((error) => {
      console.error('Failed to load profile data:', error);
      setStatsError('Failed to load profile statistics. Please refresh the page.');
      showError('Failed to load profile data. Please try again.');
    }).finally(() => {
      setStatsLoading(false);
      setUserActivitiesLoading(false);
    });
  }, [user]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('Avatar upload input ref not found');
      showError('Avatar upload not available. Please refresh the page.');
    }
  };

  // File validation helper
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, or WebP image');
      return false;
    }
    
    setUploadError('');
    return true;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFile(file)) {
        return;
      }
      
      setAvatarFile(file);
      setUploadProgress(0);
      setUploadError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Auto-upload avatar with progress tracking
      if (user && (user.id || user._id)) {
        const userId = user.id || user._id;
        const formData = new FormData();
        formData.append('avatar', file);
        setSaving(true);
        
        try {
          const uploadRes = await api.post('/users/' + userId + '/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          });
          
          const newAvatarUrl = uploadRes.data.avatar;
          setAvatar(newAvatarUrl);
          setAvatarSaved(true);
          setUploadProgress(100);
          
          // Clear success message after delay
          const successTimer = setTimeout(() => {
            setAvatarSaved(false);
            setUploadProgress(0);
          }, 2000);
          
          showSuccess('Profile picture saved!');
          
          // Update user object in AuthContext and localStorage
          const updatedUser = { ...user, avatar: newAvatarUrl };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Cleanup timer on component unmount
          return () => clearTimeout(successTimer);
        } catch (uploadErr) {
          console.error('Avatar upload failed:', uploadErr);
          setUploadError('Failed to upload avatar. Please try again.');
          setUploadProgress(0);
          showError('Failed to upload avatar. Please check your connection and try again.');
        } finally {
          setSaving(false);
        }
      }
    }
    
    // Clear the file input for future uploads
    e.target.value = '';
  };

  // Block/unblock handler
  const handleBlockToggle = async () => {
    setBlocking(true);
    setBlockError('');
    try {
      const action = isBlocked ? 'unblock' : 'block';
      await api.post(`/users/blocks/${user?._id}/${action}`);
      setIsBlocked(!isBlocked);
    } catch (err) {
      setBlockError('Failed to update block status.');
    } finally {
      setBlocking(false);
    }
  };

  if (!user) return null;

  // Helper for visually distinct status badge
  function RoleBadge({ roles }) {
    if (!roles) return null;
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-1 bg-yellow-900/90 border border-yellow-700 text-yellow-200 rounded-full px-3 py-1 font-semibold text-sm ml-2">
          <ShieldCheckIcon className="w-4 h-4" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-900/90 border border-blue-700 text-blue-200 rounded-full px-3 py-1 font-semibold text-sm ml-2">
        <UserIcon className="w-4 h-4" /> User
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
          
          <main id="main-content" tabIndex="-1" role="main">
            {/* Profile Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900/90 to-neutral-800/70 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center lg:items-start gap-4">
                    <div className="relative group" onClick={handleAvatarClick}>
                      <div className="w-24 h-24 rounded-full ring-4 ring-white/10 group-hover:ring-primary/30 transition-all duration-300">
                        <Avatar 
                          user={user} 
                          size={96} 
                          border={false}
                          shadow={false}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <PencilIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Avatar Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      aria-label="Upload profile picture"
                      title="Upload profile picture"
                    />
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-neutral-700/50 backdrop-blur-sm rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    {/* Upload Status Messages */}
                    {avatarSaved && (
                      <div className="text-green-400 text-sm font-semibold flex items-center gap-2 mt-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Avatar saved!
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="text-red-400 text-sm font-semibold flex items-center gap-2 mt-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        {uploadError}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                        {user?.fullName || user?.username}
                      </h1>
                      {user?.roles && user.roles.length > 0 && (
                        <RoleBadge roles={user.roles} />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        @{user?.username}
                      </span>
                      {user?.gender && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                          {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                        </span>
                      )}
                      {user?.dob && (
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-neutral-500 rounded-full" />
                          {new Date(user.dob).getFullYear()}
                        </span>
                      )}
                    </div>
                    
                    {bio && (
                      <p className="text-neutral-300 mb-6 max-w-2xl leading-relaxed">
                        {bio}
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-neutral-900"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <PencilIcon className="w-4 h-4" />
                          {editMode ? 'Cancel Edit' : 'Edit Profile'}
                        </span>
                        <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </button>
                      
                      {isBlocked && (
                        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-xl px-4 py-3 text-red-300 flex items-center gap-2">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          Account Blocked
                        </div>
                      )}
                    </div>
                    
                    {/* Keyboard Shortcuts Hint */}
                    {editMode && (
                      <div className="text-xs text-neutral-400 mt-4 flex items-center gap-4 justify-center lg:justify-start">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          Keyboard shortcuts: Ctrl+S to save, Ctrl+E to toggle edit mode
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="mt-12 mb-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-200">
                        {stats.daresCount || 0}
                      </div>
                      <div className="text-sm text-neutral-400">Total Dares</div>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <FireIcon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-400 group-hover:scale-110 transition-transform duration-200">
                        {stats.avgGrade ? stats.avgGrade.toFixed(2) : '-'}
                      </div>
                      <div className="text-sm text-neutral-400">Avg Grade</div>
                    </div>
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ChartBarIcon className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-400 group-hover:scale-110 transition-transform duration-200">
                        {stats.completedCount || 0}
                      </div>
                      <div className="text-sm text-neutral-400">Completed</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <CheckCircleIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-400 group-hover:scale-110 transition-transform duration-200">
                        {stats.activeCount || 0}
                      </div>
                      <div className="text-sm text-neutral-400">Active</div>
                    </div>
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ClockIcon className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Tabs
              tabs={[
                {
                  label: 'About',
                  content: (
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                      <div className="p-8">
                        {loading ? (
                          <div className="space-y-8">
                            <div className="h-8 bg-neutral-700/50 rounded w-1/3 animate-pulse" />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="h-4 bg-neutral-700/50 rounded w-1/3 animate-pulse" />
                                  <div className="h-12 bg-neutral-700/50 rounded-xl animate-pulse" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-8">About Me</h2>
                            
                            {editMode ? (
                              <form role="form" aria-labelledby="profile-edit-title" onSubmit={handleSave} className="space-y-8">
                                <h2 id="profile-edit-title" className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-8">Edit Profile</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                    <div>
                                      <label htmlFor="username" className="block font-semibold mb-3 text-neutral-300 text-sm">Username</label>
                                      <input 
                                        type="text" 
                                        id="username" 
                                        className={`w-full rounded-xl border px-4 py-4 bg-white/5 backdrop-blur-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                                          formErrors.username ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/50'
                                        }`}
                                        value={username} 
                                        onChange={e => handleFormChange('username', e.target.value)} 
                                        required 
                                        aria-required="true" 
                                        aria-label="Username"
                                        placeholder="Enter your username"
                                      />
                                      {formErrors.username && (
                                        <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                          <ExclamationTriangleIcon className="w-4 h-4" />
                                          {formErrors.username}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label htmlFor="fullName" className="block font-semibold mb-3 text-neutral-300 text-sm">Full Name</label>
                                      <input 
                                        type="text" 
                                        id="fullName" 
                                        className={`w-full rounded-xl border px-4 py-4 bg-white/5 backdrop-blur-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                                          formErrors.fullName ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/50'
                                        }`}
                                        value={fullName} 
                                        onChange={e => handleFormChange('fullName', e.target.value)} 
                                        required 
                                        aria-required="true" 
                                        aria-label="Full name"
                                        placeholder="Enter your full name"
                                      />
                                      {formErrors.fullName && (
                                        <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                          <ExclamationTriangleIcon className="w-4 h-4" />
                                          {formErrors.fullName}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label htmlFor="bio" className="block font-semibold mb-3 text-neutral-300 text-sm">Bio</label>
                                      <textarea 
                                        id="bio" 
                                        rows="4"
                                        className={`w-full rounded-xl border px-4 py-4 bg-white/5 backdrop-blur-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 resize-none ${
                                          formErrors.bio ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/50'
                                        }`}
                                        value={bio} 
                                        onChange={e => handleFormChange('bio', e.target.value)} 
                                        aria-label="Bio"
                                        placeholder="Tell us about yourself..."
                                      />
                                      {formErrors.bio && (
                                        <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                          <ExclamationTriangleIcon className="w-4 h-4" />
                                          {formErrors.bio}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-6">
                                    <div>
                                      <label htmlFor="gender" className="block font-semibold mb-3 text-neutral-300 text-sm">Gender</label>
                                      <select 
                                        id="gender" 
                                        className={`w-full rounded-xl border px-4 py-4 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                                          formErrors.gender ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/50'
                                        }`}
                                        value={gender} 
                                        onChange={e => handleFormChange('gender', e.target.value)} 
                                        aria-label="Gender"
                                      >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="other">Other</option>
                                      </select>
                                      {formErrors.gender && (
                                        <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                          <ExclamationTriangleIcon className="w-4 h-4" />
                                          {formErrors.gender}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label htmlFor="dob" className="block font-semibold mb-3 text-neutral-300 text-sm">Date of Birth</label>
                                      <input 
                                        type="date" 
                                        id="dob" 
                                        className={`w-full rounded-xl border px-4 py-4 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 ${
                                          formErrors.dob ? 'border-red-500/50 focus:border-red-500/50' : 'border-white/10 focus:border-primary/50'
                                        }`}
                                        value={dob} 
                                        onChange={e => handleFormChange('dob', e.target.value)} 
                                        aria-label="Date of birth"
                                      />
                                      {formErrors.dob && (
                                        <div className="text-red-400 text-sm mt-2 flex items-center gap-2">
                                          <ExclamationTriangleIcon className="w-4 h-4" />
                                          {formErrors.dob}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div>
                                      <label className="block font-semibold mb-3 text-neutral-300 text-sm">Interested In</label>
                                      <TagsInput 
                                        value={interestedIn} 
                                        onChange={setInterestedIn} 
                                        placeholder="Add interests..."
                                        className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block font-semibold mb-3 text-neutral-300 text-sm">Limits</label>
                                      <TagsInput 
                                        value={limits} 
                                        onChange={setLimits} 
                                        placeholder="Add limits..."
                                        className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200"
                                      />
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Form Actions */}
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-6 border-t border-white/10">
                                  <button
                                    type="submit"
                                    disabled={saving}
                                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark rounded-xl px-8 py-4 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      {saving ? (
                                        <>
                                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircleIcon className="w-5 h-5" />
                                          Save Changes
                                        </>
                                      )}
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    className="group relative overflow-hidden bg-gradient-to-r from-neutral-600 to-neutral-700 rounded-xl px-8 py-4 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-neutral-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900"
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      <XMarkIcon className="w-5 h-5" />
                                      Cancel
                                    </span>
                                  </button>
                                </div>
                                
                                {/* Save Status */}
                                <div className="flex items-center gap-4 text-sm">
                                  {hasUnsavedChanges && (
                                    <div className="text-yellow-400 flex items-center gap-2">
                                      <ExclamationTriangleIcon className="w-4 h-4" />
                                      Unsaved changes
                                    </div>
                                  )}
                                  {lastSaved && (
                                    <div className="text-green-400 flex items-center gap-2">
                                      <CheckCircleIcon className="w-4 h-4" />
                                      Last saved: {lastSaved.toLocaleTimeString()}
                                    </div>
                                  )}
                                </div>
                              </form>
                            ) : (
                              <div className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                      <div className="text-sm text-neutral-400 mb-2 font-medium">Username</div>
                                      <div className="text-white font-semibold text-lg">@{user.username}</div>
                                    </div>
                                    
                                    <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                      <div className="text-sm text-neutral-400 mb-2 font-medium">Full Name</div>
                                      <div className="text-white font-semibold text-lg">{user.fullName}</div>
                                    </div>
                                    
                                    <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                      <div className="text-sm text-neutral-400 mb-2 font-medium">Email</div>
                                      <div className="text-white font-semibold text-lg">{user.email}</div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    {user.gender && (
                                      <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                        <div className="text-sm text-neutral-400 mb-2 font-medium">Gender</div>
                                        <div className="text-white font-semibold text-lg capitalize">{user.gender}</div>
                                      </div>
                                    )}
                                    
                                    {user.dob && (
                                      <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                        <div className="text-sm text-neutral-400 mb-2 font-medium">Birth Date</div>
                                        <div className="text-white font-semibold text-lg">
                                          <span
                                            className="cursor-help hover:text-neutral-300 transition-colors"
                                            title={formatRelativeTimeWithTooltip(user.dob).tooltip}
                                          >
                                            {formatRelativeTimeWithTooltip(user.dob).display}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {user.interestedIn && user.interestedIn.length > 0 && (
                                      <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                        <div className="text-sm text-neutral-400 mb-3 font-medium">Interested In</div>
                                        <div className="flex flex-wrap gap-2">
                                          {user.interestedIn.map((interest, idx) => (
                                            <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold border border-primary/30">
                                              {interest}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {bio && (
                                  <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                    <div className="text-sm text-neutral-400 mb-3 font-medium">Bio</div>
                                    <div className="text-white leading-relaxed">{bio}</div>
                                  </div>
                                )}
                                
                                {user.limits && user.limits.length > 0 && (
                                  <div className="group relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                                    <div className="text-sm text-neutral-400 mb-3 font-medium">Limits</div>
                                    <div className="flex flex-wrap gap-2">
                                      {user.limits.map((limit, idx) => (
                                        <span key={idx} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold border border-red-500/30">
                                          {limit}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                  <button 
                                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-dark rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-neutral-900" 
                                    onClick={() => setEditMode(true)}
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      <PencilIcon className="w-5 h-5" />
                                      Edit Profile
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                  </button>
                                  
                                  <button 
                                    className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900" 
                                    onClick={logout}
                                  >
                                    <span className="relative z-10 flex items-center gap-2">
                                      <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                      Logout
                                    </span>
                                  </button>
                                  
                                  {/* Admin Controls */}
                                  {user.roles?.includes('admin') ? (
                                    <button
                                      className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={downgradeLoading}
                                      onClick={async () => {
                                        if (!user || !(user.id || user._id)) return;
                                        const userId = user.id || user._id;
                                        setDowngradeLoading(true);
                                        try {
                                          await api.patch(`/users/${userId}`, { roles: ['user'] });
                                          const updatedUser = { ...user, roles: ['user'] };
                                          localStorage.setItem('user', JSON.stringify(updatedUser));
                                          if (typeof setUser === 'function') setUser(updatedUser);
                                          showSuccess('User downgraded to regular user!');
                                        } catch (err) {
                                          showError('Failed to downgrade user: ' + (err.response?.data?.error || err.message));
                                        } finally {
                                          setDowngradeLoading(false);
                                        }
                                      }}
                                    >
                                      <span className="relative z-10 flex items-center gap-2">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                        {downgradeLoading ? 'Downgrading...' : 'Downgrade to User'}
                                      </span>
                                    </button>
                                  ) : (
                                    <button
                                      className="group relative overflow-hidden bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl px-6 py-3 font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={upgradeLoading}
                                      onClick={async () => {
                                        if (!user || !(user.id || user._id)) return;
                                        const userId = user.id || user._id;
                                        setUpgradeLoading(true);
                                        try {
                                          await api.patch(`/users/${userId}`, { roles: ['admin'] });
                                          const updatedUser = { ...user, roles: ['admin'] };
                                          localStorage.setItem('user', JSON.stringify(updatedUser));
                                          if (typeof setUser === 'function') setUser(updatedUser);
                                          showSuccess('User upgraded to admin!');
                                        } catch (err) {
                                          showError('Failed to upgrade user: ' + (err.response?.data?.error || err.message));
                                        } finally {
                                          setUpgradeLoading(false);
                                        }
                                      }}
                                    >
                                      <span className="relative z-10 flex items-center gap-2">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                        {upgradeLoading ? 'Upgrading...' : 'Upgrade to Admin'}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Recent Activity */}
                            <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30">
                              <RecentActivityWidget activities={userActivities} loading={userActivitiesLoading} title="Your Recent Activity" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Privacy & Safety',
                  content: (
                    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl space-y-8">
                      <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <ShieldCheckIcon className="w-6 h-6 text-primary" />
                          Content Deletion Setting
                        </h3>
                        
                        {contentDeletionLoading ? (
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <div className="text-neutral-400">Loading settings...</div>
                          </div>
                        ) : (
                          <form className="space-y-4">
                            <div className="space-y-4">
                              <label className="flex items-start gap-4 p-4 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/30 transition-all cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="contentDeletion" 
                                  value="when_viewed" 
                                  checked={contentDeletion === 'when_viewed'} 
                                  onChange={() => handleContentDeletionChange('when_viewed')} 
                                  disabled={contentDeletionLoading}
                                  className="mt-1 w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary focus:ring-2"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">Delete once viewed</div>
                                  <div className="text-sm text-neutral-400">As soon as the other person has viewed the image, delete it completely.</div>
                                </div>
                              </label>
                              
                              <label className="flex items-start gap-4 p-4 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/30 transition-all cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="contentDeletion" 
                                  value="30_days" 
                                  checked={contentDeletion === '30_days'} 
                                  onChange={() => handleContentDeletionChange('30_days')} 
                                  disabled={contentDeletionLoading}
                                  className="mt-1 w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary focus:ring-2"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">Delete after 30 days</div>
                                  <div className="text-sm text-neutral-400">Keep the image for 30 days, then automatically delete it.</div>
                                </div>
                              </label>
                              
                              <label className="flex items-start gap-4 p-4 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/30 transition-all cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="contentDeletion" 
                                  value="never" 
                                  checked={contentDeletion === 'never'} 
                                  onChange={() => handleContentDeletionChange('never')} 
                                  disabled={contentDeletionLoading}
                                  className="mt-1 w-4 h-4 text-primary bg-neutral-700 border-neutral-600 focus:ring-primary focus:ring-2"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-1">Never delete</div>
                                  <div className="text-sm text-neutral-400">Keep the image indefinitely (not recommended for privacy).</div>
                                </div>
                              </label>
                            </div>
                          </form>
                        )}
                      </div>
                      
                      <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <NoSymbolIcon className="w-6 h-6 text-red-400" />
                          Block Settings
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-700/30">
                            <div>
                              <div className="font-semibold text-white">Account Status</div>
                              <div className="text-sm text-neutral-400">
                                {isBlocked ? 'Your account is currently blocked' : 'Your account is active'}
                              </div>
                            </div>
                            <button
                              onClick={handleBlockToggle}
                              disabled={blocking}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                isBlocked 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              {blocking ? 'Processing...' : (isBlocked ? 'Unblock Account' : 'Block Account')}
                            </button>
                          </div>
                          
                          {blockError && (
                            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-300">
                              {blockError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  label: 'Change Password',
                  content: <ChangePasswordForm />,
                }
              ]}
              value={tabIdx}
              onChange={setTabIdx}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      setMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Change Password</h3>
            <p className="text-neutral-400 text-sm">Update your account password</p>
          </div>
          
          <div>
            <label htmlFor="oldPassword" className="block font-semibold mb-2 text-primary text-sm">Current Password</label>
            <input
              type="password"
              id="oldPassword"
              className="w-full rounded-lg border border-neutral-700 px-4 py-3 bg-neutral-800/50 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              placeholder="Enter your current password"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block font-semibold mb-2 text-primary text-sm">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="w-full rounded-lg border border-neutral-700 px-4 py-3 bg-neutral-800/50 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />
          </div>
          
          {message && (
            <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 text-green-300" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" />
                {message}
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4 text-red-300" role="alert" aria-live="assertive">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl px-6 py-3 font-semibold hover:from-primary-dark hover:to-primary transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Changing Password...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-5 h-5" />
                Change Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 