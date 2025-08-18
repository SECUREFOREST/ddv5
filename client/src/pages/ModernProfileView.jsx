import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  ArrowLeftIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon,
  ChartBarIcon,
  CalendarIcon,
  MapPinIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  UserGroupIcon,
  BoltIcon,
  CrownIcon,
  MedalIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import api from '../api/axios';

const ModernProfileView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [blockStatus, setBlockStatus] = useState('idle');
  const [blockError, setBlockError] = useState('');
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();
  
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
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
      
      let activitiesData = [];
      if (activitiesRes.status === 'fulfilled') {
        const responseData = activitiesRes.value.data;
        const activities = responseData.activities || responseData;
        activitiesData = validateApiResponse(activities, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setUserActivities(activitiesData);
      } else {
        console.error('Failed to fetch user activities:', activitiesRes.reason);
        setUserActivities([]);
      }
      
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
      
      invalidateCache(`profile_view_${userId}`);
      
    } catch (error) {
      console.error('Error unblocking user:', error);
      setBlockError('Failed to unblock user');
      setBlockStatus('error');
      handleApiError(error, showError);
    }
  };

  const isOwnProfile = user && user.id === userId;
  const isBlocked = profile && profile.blocked;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">User Not Found</h2>
          <p className="text-white/70 mb-6">The requested user profile could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Blocked User Profile</h1>
            <p className="text-neutral-400 text-lg mb-8">You have blocked this user and cannot view their profile.</p>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-neutral-700/50 rounded-full flex items-center justify-center border-2 border-red-400">
                  <UserIcon className="w-10 h-10 text-neutral-400" />
                </div>
              </div>
              <div className="font-medium text-white text-xl mb-4">{profile.fullName || profile.username}</div>
              <div className="text-neutral-400 text-base mb-6">@{profile.username}</div>
              
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUnblock}
                disabled={blockStatus === 'blocking'}
              >
                {blockStatus === 'blocking' ? 'Unblocking...' : 'Unblock User'}
              </button>
              
              {blockStatus === 'error' && (
                <div className="text-red-400 text-sm mt-4">{blockError}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const RoleBadge = ({ roles }) => {
    if (!roles) return null;
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg">
          <ShieldCheckIcon className="w-4 h-4" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 bg-neutral-700/50 text-neutral-300 rounded-full px-4 py-2 text-sm font-medium border border-neutral-600/50">
        <UserIcon className="w-4 h-4" /> User
      </span>
    );
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
                <h1 className="text-2xl font-bold text-white">User Profile</h1>
                <p className="text-neutral-400 text-sm">View user details and statistics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Profile View</span>
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
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">User Profile</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                {profile.fullName || profile.username}
              </p>
            </div>
          </div>
          
          {/* Role Badge */}
          <div className="flex justify-center mb-6">
            <RoleBadge roles={profile.roles || []} />
          </div>
          
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Discover user statistics, preferences, and activity history
          </p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center border-4 border-neutral-700/50 shadow-2xl">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.fullName || profile.username} 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-white" />
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-3xl font-bold text-white mb-2">{profile.fullName || profile.username}</h3>
              <p className="text-xl text-neutral-400 mb-4">@{profile.username}</p>
              
              {/* User Tags */}
              {Array.isArray(profile.tags) && profile.tags.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                  {profile.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-neutral-700/50 text-neutral-300 rounded-full px-3 py-1 text-sm font-medium border border-neutral-600/50">
                      <TagIcon className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Bio */}
              {profile.bio && (
                <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
                  <p className="text-neutral-200 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Role Balance Card */}
        {stats && (stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              Role Balance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dominant Percentage */}
              <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <CrownIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-300">Dominant</div>
                    <div className="text-3xl font-bold text-blue-400">{stats.dominantPercent || 0}%</div>
                  </div>
                </div>
                <div className="w-full bg-blue-700/30 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${stats.dominantPercent || 0}%` }}
                  />
                </div>
                <div className="text-sm text-blue-300">
                  {stats.dominantCount || 0} dares as dominant
                </div>
              </div>
              
              {/* Submissive Percentage */}
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
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500 shadow-lg"
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

        {/* Statistics Grid */}
        {stats && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-primary" />
              Performance Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{stats.daresCount || 0}</div>
                <div className="text-sm text-green-300">Dares Completed</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30 text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
                </div>
                <div className="text-sm text-yellow-300">Average Grade</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalCount || 0}</div>
                <div className="text-sm text-purple-300">Total Activities</div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <InformationCircleIcon className="w-6 h-6 text-primary" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.gender && (
              <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <UserIcon className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-300">Gender</span>
                </div>
                <div className="text-white font-medium">{profile.gender}</div>
              </div>
            )}
            
            {profile.dob && (
              <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarIcon className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-300">Birth Date</span>
                </div>
                <div className="text-white font-medium cursor-help" title={formatRelativeTimeWithTooltip(profile.dob).tooltip}>
                  {formatRelativeTimeWithTooltip(profile.dob).display}
                </div>
              </div>
            )}
            
            {profile.interestedIn && profile.interestedIn.length > 0 && (
              <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <HeartIcon className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-300">Interested In</span>
                </div>
                <div className="text-white font-medium">{profile.interestedIn.join(', ')}</div>
              </div>
            )}
            
            {profile.limits && profile.limits.length > 0 && (
              <div className="bg-neutral-700/50 rounded-xl p-4 border border-neutral-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-300">Limits</span>
                </div>
                <div className="text-white font-medium">{profile.limits.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        {!isOwnProfile && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              User Management
            </h3>
            <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-2">Block User</h4>
                  <p className="text-neutral-300 text-base leading-relaxed">
                    Block this user to hide their content and profile from you. This action can be undone at any time.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBlock}
                  disabled={blockStatus === 'blocking' || blockStatus === 'blocked'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  <EyeSlashIcon className="w-5 h-5" />
                  {blockStatus === 'blocked' ? 'User Blocked' : 'Block User'}
                </button>
                
                {blockStatus === 'blocked' && (
                  <button
                    onClick={handleUnblock}
                    disabled={blockStatus === 'blocking'}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-5 h-5" />
                    {blockStatus === 'blocking' ? 'Unblocking...' : 'Unblock User'}
                  </button>
                )}
              </div>
              
              {blockStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-medium">{blockError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={fetchProfileData}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            disabled={loading}
          >
            <BoltIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernProfileView; 