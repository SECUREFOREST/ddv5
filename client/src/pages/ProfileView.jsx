import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MainContent, ContentContainer } from '../components/Layout';
import { ListSkeleton } from '../components/Skeleton';
import { UserIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import BlockButton from '../components/BlockButton';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';

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
        if (activitiesRes.value.data) {
          activitiesData = Array.isArray(activitiesRes.value.data) ? activitiesRes.value.data : [];
          setUserActivities(activitiesData);
        } else {
          setUserActivities([]);
        }
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
        }, 15 * 60 * 1000); // 15 minutes cache
      }
      
      // Check if any critical requests failed
      if (userRes.status === 'rejected') {
        setError('Failed to load profile.');
        showError('Failed to load profile.');
      }
      
    } catch (error) {
      console.error('Profile data loading error:', error);
      setError('Failed to load profile.');
      showError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId, showError]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleBlock = async () => {
    setBlockStatus('blocking');
    setBlockError('');
    try {
      // Use retry mechanism for user blocking
      await retryApiCall(() => api.post(`/users/${userId}/block`));
      setBlockStatus('blocked');
      // Invalidate cache when user is blocked
      invalidateCache(`profile_view_${userId}`);
      showSuccess('User blocked successfully!');
    } catch (err) {
      setBlockStatus('error');
      showError(err.response?.data?.error || 'Failed to block user.');
    }
  };

  const isOwnProfile = user && user._id === userId;
  const isBlocked = user && user.blockedUsers && user.blockedUsers.includes(userId);

  const handleUnblock = async () => {
    setBlockStatus('blocking');
    setBlockError('');
    try {
      // Use retry mechanism for user unblocking
      await retryApiCall(() => api.post(`/users/${userId}/unblock`));
      setBlockStatus('idle');
      // Invalidate cache when user is unblocked
      invalidateCache(`profile_view_${userId}`);
      showSuccess('User unblocked successfully!');
      // Remove userId from blockedUsers in context (optional: reload user)
      if (user && user.blockedUsers) {
        const idx = user.blockedUsers.indexOf(userId);
        if (idx !== -1) user.blockedUsers.splice(idx, 1);
      }
    } catch (err) {
      setBlockStatus('error');
      setBlockError(err.response?.data?.error || 'Failed to unblock user.');
      showError(err.response?.data?.error || 'Failed to unblock user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ListSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
            <p className="text-white/80">The requested user profile could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  // If blocked, show message and block all interactions
  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">User Profile</h1>
            </div>
          </div>

          {/* Blocked Status Card */}
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center mb-8">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-300 rounded-full px-6 py-3 font-semibold text-lg">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Blocked User
              </span>
            </div>

            <div className="flex flex-col items-center mb-6">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-red-400" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-4xl font-bold mb-4 border-2 border-red-400">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
              <div className="font-medium text-white text-xl">{profile.username}</div>
            </div>

            <div className="text-white/80 text-lg mb-6">You have blocked this user.</div>
            
            <button
              className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-3 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUnblock}
              disabled={blockStatus === 'blocking'}
            >
              {blockStatus === 'blocking' ? 'Unblocking...' : 'Unblock User'}
            </button>
            
            {blockStatus === 'error' && (
              <div className="text-red-300 text-sm mt-4">{blockError}</div>
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
        <span className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-full px-4 py-2 text-sm font-semibold">
          <ShieldCheckIcon className="w-5 h-5" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-full px-4 py-2 text-sm font-semibold">
        <UserIcon className="w-5 h-5" /> User
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <MainContent className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">User Profile</h1>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex justify-center mb-8">
            <RoleBadge roles={profile.roles || []} />
          </div>

          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center lg:items-start">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-white/20" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/10 text-white flex items-center justify-center text-5xl font-bold mb-4 border-4 border-white/20">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
                <div className="text-center lg:text-left">
                  <h2 className="font-bold text-2xl text-white mb-2">{profile.username}</h2>
                  {profile.fullName && profile.fullName !== profile.username && (
                    <p className="text-white/70 text-lg">{profile.fullName}</p>
                  )}
                </div>
                
                {/* Block/Unblock Button - Prominent OSA-style */}
                {!isOwnProfile && (
                  <div className="mt-4">
                    <BlockButton 
                      userId={userId}
                      username={profile.username}
                      onBlockChange={(blocked) => {
                        // Update local state if needed
                      }}
                      className="w-full px-6 py-3 text-lg font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                {/* Role Balance Display - OSA Style */}
                {stats && (stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
                  <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                      <ShieldCheckIcon className="w-6 h-6 text-primary" />
                      Role Balance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dominant Percentage */}
                      <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl p-4 border border-purple-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-purple-300">Dominant</span>
                          <span className="text-2xl font-bold text-purple-400">
                            {stats.dominantPercent || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-purple-900/30 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.dominantPercent || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-purple-400 mt-2">
                          {stats.dominantCount || 0} dares as dominant
                        </div>
                      </div>
                      
                      {/* Submissive Percentage */}
                      <div className="bg-gradient-to-r from-pink-600/20 to-pink-700/20 rounded-xl p-4 border border-pink-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-pink-300">Submissive</span>
                          <span className="text-2xl font-bold text-pink-400">
                            {stats.submissivePercent || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-pink-900/30 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${stats.submissivePercent || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-pink-400 mt-2">
                          {stats.submissiveCount || 0} dares as submissive
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-400 mt-4 text-center">
                      Based on {stats.totalCount || 0} total completed dares
                    </div>
                  </div>
                )}
                
                {/* User Tags */}
                {Array.isArray(profile.tags) && profile.tags.length > 0 && (
                  <div>
                    <h3 className="font-bold text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 rounded-full px-3 py-1 text-sm font-semibold border border-blue-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="font-bold text-white mb-3">Bio</h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <Markdown>{profile.bio}</Markdown>
                    </div>
                  </div>
                )}

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.gender && (
                    <div>
                      <h3 className="font-bold text-white mb-2">Gender</h3>
                      <p className="text-white/80">{profile.gender}</p>
                    </div>
                  )}
                  
                  {profile.dob && (
                    <div>
                      <h3 className="font-bold text-white mb-2">Birth Date</h3>
                      <p className="text-white/80 cursor-help" title={formatRelativeTimeWithTooltip(profile.dob).tooltip}>
                        {formatRelativeTimeWithTooltip(profile.dob).display}
                      </p>
                    </div>
                  )}
                  
                  {profile.interestedIn && profile.interestedIn.length > 0 && (
                    <div>
                      <h3 className="font-bold text-white mb-2">Interested In</h3>
                      <p className="text-white/80">{profile.interestedIn.join(', ')}</p>
                    </div>
                  )}
                  
                  {profile.limits && profile.limits.length > 0 && (
                    <div>
                      <h3 className="font-bold text-white mb-2">Limits</h3>
                      <p className="text-white/80">{profile.limits.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                  <div className="text-lg font-semibold text-white mb-2">Dares Completed</div>
                  <div className="text-4xl font-bold text-purple-300">{stats.daresCount}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                  <div className="text-lg font-semibold text-white mb-2">Average Grade</div>
                  <div className="text-4xl font-bold text-purple-300">
                    {stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {userActivities.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Recent Activity</h2>
              <RecentActivityWidget activities={userActivities} />
            </div>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 