import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import { UserIcon, ShieldCheckIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import BlockButton from '../components/BlockButton';

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

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const [userRes, statsRes, activitiesRes] = await Promise.allSettled([
        api.get(`/users/${userId}`),
        api.get(`/stats/users/${userId}`),
        api.get('/activity-feed/activities', { params: { userId, limit: 10 } })
      ]);
      
      // Handle user profile response
      if (userRes.status === 'fulfilled') {
        if (userRes.value.data) {
          setProfile(userRes.value.data);

        } else {
          throw new Error('No user data received');
        }
      } else {
        console.error('Failed to fetch user profile:', userRes.reason);
        setProfile(null);
      }
      
      // Handle stats response
      if (statsRes.status === 'fulfilled') {
        if (statsRes.value.data) {
          setStats(statsRes.value.data);
        } else {
          setStats(null);
        }
      } else {
        console.error('Failed to fetch user stats:', statsRes.reason);
        setStats(null);
      }
      
      // Handle activities response
      if (activitiesRes.status === 'fulfilled') {
        if (activitiesRes.value.data) {
          const activitiesData = Array.isArray(activitiesRes.value.data) ? activitiesRes.value.data : [];
          setUserActivities(activitiesData);

        } else {
          setUserActivities([]);
        }
      } else {
        console.error('Failed to fetch user activities:', activitiesRes.reason);
        setUserActivities([]);
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
      await api.post(`/users/${userId}/block`);
      setBlockStatus('blocked');
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
      await api.post(`/users/${userId}/unblock`);
      setBlockStatus('idle');
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
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-4xl mx-auto px-4 py-8">
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
        </div>
      </main>
    </div>
  );
} 