import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MainContent, ContentContainer } from '../components/Layout';
import { ListSkeleton } from '../components/Skeleton';
import { UserIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import BlockButton from '../components/BlockButton';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

export default function ProfileView() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [blockStatus, setBlockStatus] = useState('idle'); // idle | blocking | blocked | error
  const [blockError, setBlockError] = useState('');
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();
  
  // Activate caching for profile view data
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    // Check cache first
    const cacheKey = `profile_view_${userId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setProfile(cachedData.profile || null);
      setStats(cachedData.stats || null);
      setUserActivities(cachedData.activities || []);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const [userRes, statsRes, activitiesRes] = await Promise.allSettled([
        retryApiCall(() => api.get(`/users/${userId}`)),
        retryApiCall(() => api.get(`/stats/users/${userId}`)),
        retryApiCall(() => api.get('/activity-feed/activities', { params: { userId, limit: 10 } }))
      ]);
      
      // Handle user profile response
      let profileData = null;
      if (userRes.status === 'fulfilled') {
        if (userRes.value.data) {
          profileData = userRes.value.data;
          setProfile(profileData);
        } else {
          throw new Error('No user data received');
        }
      } else {
        console.error('Failed to fetch user profile:', userRes.reason);
        setProfile(null);
      }
      
      // Handle stats response
      let statsData = null;
      if (statsRes.status === 'fulfilled') {
        if (statsRes.value.data) {
          statsData = statsRes.value.data;
          setStats(statsData);
        } else {
          setStats(null);
        }
      } else {
        console.error('Failed to fetch user stats:', statsRes.reason);
        setStats(null);
      }
      
      // Handle activities response
      let activitiesData = [];
      if (activitiesRes.status === 'fulfilled') {
        activitiesData = validateApiResponse(activitiesRes.value, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setUserActivities(activitiesData);
      } else {
        console.error('Failed to fetch user activities:', activitiesRes.reason);
        setUserActivities([]);
      }
      
      // Cache the successful data
      if (profileData || statsData || activitiesData.length > 0) {
        setCachedData(cacheKey, {
          profile: profileData,
          stats: statsData,
          activities: activitiesData
        });
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('Failed to load profile data');
      handleApiError(error, showError);
    } finally {
      setLoading(false);
    }
  }, [userId, getCachedData, setCachedData, showError]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleBlock = async () => {
    try {
      setBlockStatus('blocking');
      setBlockError('');
      
      await api.post(`/users/${userId}/block`);
      showSuccess('User blocked successfully');
      setBlockStatus('blocked');
      
      // Invalidate cache to refresh data
      invalidateCache(`profile_view_${userId}`);
      
    } catch (error) {
      console.error('Error blocking user:', error);
      setBlockError('Failed to block user');
      setBlockStatus('error');
      handleApiError(error, showError);
    }
  };

  const handleUnblock = async () => {
    try {
      setBlockStatus('blocking');
      setBlockError('');
      
      await api.delete(`/users/${userId}/block`);
      showSuccess('User unblocked successfully');
      setBlockStatus('idle');
      
      // Invalidate cache to refresh data
      invalidateCache(`profile_view_${userId}`);
      
    } catch (error) {
      console.error('Error unblocking user:', error);
      setBlockError('Failed to unblock user');
      setBlockStatus('error');
      handleApiError(error, showError);
    }
  };

  // Check if this is the current user's own profile
  const isOwnProfile = user && user.id === userId;
  
  // Check if the user is blocked
  const isBlocked = profile && profile.blocked;

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <MainContent className="max-w-2xl mx-auto px-4 py-8">
            <div className="text-center">
              <ListSkeleton count={3} />
            </div>
          </MainContent>
        </ContentContainer>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">User Not Found</h2>
            <p className="text-neutral-300">The requested user profile could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // If blocked, show message and block all interactions
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-neutral-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">Profile</h1>
            </div>
          </div>

          {/* Blocked Status Card */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 bg-red-900/20 border border-red-600/30 text-red-300 rounded-full px-4 py-2 text-sm font-medium">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Blocked User
              </span>
            </div>

            <div className="flex flex-col items-center mb-4">
              <Avatar 
                user={profile} 
                size={80} 
                className="mb-3 border-2 border-red-400"
              />
              <div className="font-medium text-white text-lg">{profile.fullName || profile.username}</div>
            </div>

            <div className="text-neutral-300 text-base mb-4">You have blocked this user.</div>
            
            <button
              className="bg-red-600 text-white rounded px-4 py-2 font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUnblock}
              disabled={blockStatus === 'blocking'}
            >
              {blockStatus === 'blocking' ? 'Unblocking...' : 'Unblock User'}
            </button>
            
            {blockStatus === 'error' && (
              <div className="text-red-400 text-sm mt-3">{blockError}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Role badge helper
  function RoleBadge({ roles }) {
    if (!roles) return null;
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-600/30 text-purple-300 rounded-full px-3 py-1 text-sm font-medium">
          <ShieldCheckIcon className="w-4 h-4" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 bg-neutral-800 border border-neutral-600 text-neutral-300 rounded-full px-3 py-1 text-sm font-medium">
        <UserIcon className="w-4 h-4" /> User
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-gray-800 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <MainContent className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-neutral-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">Profile</h1>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex justify-center mb-6">
            <RoleBadge roles={profile.roles || []} />
          </div>

          {/* Profile Card */}
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              {/* Avatar Section */}
              <div className="mb-4">
                <Avatar 
                  user={profile} 
                  size={80} 
                  className="border-2 border-neutral-600"
                />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white mb-1">{profile.fullName || profile.username}</h2>
                <p className="text-sm text-neutral-400">@{profile.username}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              {/* Role Balance Display - OSA Style */}
              {stats && (stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-neutral-400" />
                    Role Balance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dominant Percentage */}
                    <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-300">Dominant</span>
                        <span className="text-xl font-bold text-white">
                          {stats.dominantPercent || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-neutral-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.dominantPercent || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {stats.dominantCount || 0} dares as dominant
                      </div>
                    </div>
                    
                    {/* Submissive Percentage */}
                    <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-300">Submissive</span>
                        <span className="text-xl font-bold text-white">
                          {stats.submissivePercent || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-2">
                        <div 
                          className="bg-neutral-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.submissivePercent || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {stats.submissiveCount || 0} dares as submissive
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-400 mt-3 text-center">
                    Based on {stats.totalCount || 0} total completed dares
                  </div>
                </div>
              )}
              
              {/* User Tags */}
              {Array.isArray(profile.tags) && profile.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-neutral-800 text-neutral-300 rounded-full px-3 py-1 text-sm font-medium border border-neutral-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Bio</h3>
                  <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                    <Markdown>{profile.bio}</Markdown>
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.gender && (
                  <div>
                    <h3 className="font-semibold text-white mb-1">Gender</h3>
                    <p className="text-neutral-300">{profile.gender}</p>
                  </div>
                )}
                
                {profile.dob && (
                  <div>
                    <h3 className="font-semibold text-white mb-1">Birth Date</h3>
                    <p className="text-neutral-300 cursor-help" title={formatRelativeTimeWithTooltip(profile.dob).tooltip}>
                      {formatRelativeTimeWithTooltip(profile.dob).display}
                    </p>
                  </div>
                )}
                
                {profile.interestedIn && profile.interestedIn.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-1">Interested In</h3>
                    <p className="text-neutral-300">{profile.interestedIn.join(', ')}</p>
                  </div>
                )}
                
                {profile.limits && profile.limits.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-1">Limits</h3>
                    <p className="text-neutral-300">{profile.limits.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 text-center">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600 text-center">
                  <div className="text-sm font-medium text-neutral-300 mb-1">Dares Completed</div>
                  <div className="text-2xl font-bold text-white">{stats.daresCount}</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-600 text-center">
                  <div className="text-sm font-medium text-neutral-300 mb-1">Average Grade</div>
                  <div className="text-2xl font-bold text-white">
                    {stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Block User Section */}
          {!isOwnProfile && (
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-white mb-4 text-center">User Management</h2>
              <div className="bg-neutral-800 border border-neutral-600 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold text-base mb-1">Block User</h4>
                    <p className="text-neutral-300 text-sm">
                      Block this user to hide their content and profile from you. This action can be undone at any time.
                    </p>
                  </div>
                </div>
                <BlockButton 
                  userId={userId}
                  username={profile.username}
                  onBlockChange={(blocked) => {
                    // Update local state if needed
                  }}
                  className="w-full px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white border-red-500 rounded"
                />
              </div>
            </div>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 