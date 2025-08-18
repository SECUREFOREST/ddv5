import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlayIcon,
  FireIcon,
  UserGroupIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  StarIcon,
  HeartIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  CogIcon,
  FlagIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { validateApiResponse, safeExtract } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { useCacheUtils } from '../utils/cache';
import { useRealtimeEvents } from '../utils/realtime';
import { DIFFICULTY_OPTIONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import api from '../api/axios';

const TABS = [
  { key: 'in_progress', label: 'Perform', icon: ClockIcon, color: 'from-blue-500 to-blue-600' },
  { key: 'pending', label: 'Demand', icon: ChartBarIcon, color: 'from-purple-500 to-purple-600' },
  { key: 'completed', label: 'Completed', icon: TrophyIcon, color: 'from-green-500 to-green-600' },
];

const ROLE_FORMS = {
  submissive: {
    title: "Perform Deviant Dare",
    description: "Describe what you will do and select difficulty level",
    icon: HeartIcon,
    color: "from-pink-600 to-rose-600",
    path: "/modern/offer-submission"
  },
  dominant: {
    title: "Demand Their Submission", 
    description: "Write a command and select difficulty level",
    icon: SparklesIcon,
    color: "from-purple-600 to-indigo-600",
    path: "/modern/dares/create/dom"
  },
  switch: {
    title: "The Loser Submits Game",
    description: "Play rock-paper-scissors - loser performs winner's demand",
    icon: PlayIcon,
    color: "from-green-600 to-emerald-600",
    path: "/modern/switches/create"
  }
};

const ModernDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('in_progress');
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [daresLoading, setDaresLoading] = useState(false);
  const [userRole, setUserRole] = useState('submissive');
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Activate caching for dashboard data
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();
  
  // Activate real-time updates for dashboard
  const { subscribeToEvents } = useRealtimeEvents();

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;
    
    // Check cache first
    const cacheKey = `dashboard_${userId}_${tab}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setDares(cachedData.dares || []);
      setStats(cachedData.stats || null);
      setActivities(cachedData.activities || []);
      setDaresLoading(false);
      setStatsLoading(false);
      setActivitiesLoading(false);
      return;
    }
    
    setLoading(true);
    setStatsLoading(true);
    setDaresLoading(true);
    
    try {
      // Use retry mechanism for all API calls
      const [createdRes, participatingRes, switchRes, statsRes, activitiesRes] = await Promise.allSettled([
        retryApiCall(() => api.get('/dares', { params: { status: tab, creator: userId } })),
        retryApiCall(() => api.get('/dares', { params: { status: tab, participant: userId } })),
        retryApiCall(() => api.get('/dares', { params: { status: tab, assignedSwitch: userId } })),
        retryApiCall(() => api.get(`/stats/users/${userId}`)),
        retryApiCall(() => api.get('/activity-feed/activities', { params: { limit: 10, userId } }))
      ]);
      
      // Handle successful responses with proper validation
      const allDares = [];
      
      if (createdRes.status === 'fulfilled') {
        const responseData = createdRes.value.data;
        const dares = responseData.dares || responseData;
        const createdData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
        allDares.push(...createdData);
      }
      
      if (participatingRes.status === 'fulfilled') {
        const responseData = participatingRes.value.data;
        const dares = responseData.dares || responseData;
        const participatingData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
        allDares.push(...participatingData);
      }
      
      if (switchRes.status === 'fulfilled') {
        const responseData = switchRes.value.data;
        const dares = responseData.dares || responseData;
        const switchData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
        allDares.push(...switchData);
      }
      
      // Deduplicate by _id
      const uniqueDares = Object.values(
        allDares.reduce((acc, dare) => {
          if (dare && dare._id) {
            acc[dare._id] = dare;
          }
          return acc;
        }, {})
      );
      
      setDares(uniqueDares);
      setDaresLoading(false);
      
      // Handle stats
      let statsData = null;
      if (statsRes.status === 'fulfilled') {
        statsData = validateApiResponse(statsRes.value, API_RESPONSE_TYPES.STATS);
        setStats(statsData);
      } else {
        console.error('Failed to fetch stats:', statsRes.reason);
        setStats(null);
      }
      setStatsLoading(false);
      
      // Handle activities
      let activitiesData = [];
      if (activitiesRes.status === 'fulfilled') {
        const responseData = activitiesRes.value.data;
        const activities = responseData.activities || responseData;
        activitiesData = validateApiResponse(activities, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setActivities(activitiesData);
      } else {
        console.error('Failed to fetch activities:', activitiesRes.reason);
        setActivities([]);
      }
      setActivitiesLoading(false);
      
      // Cache the successful data
      setCachedData(cacheKey, {
        dares: uniqueDares,
        stats: statsData,
        activities: activitiesData
      }, 5 * 60 * 1000); // 5 minutes cache
    } catch (error) {
      console.error('Dashboard loading error:', error);
      const errorMessage = handleApiError(error, 'dashboard');
      setDares([]);
      setStats(null);
      setActivities([]);
      showError(errorMessage);
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setDaresLoading(false);
    }
  }, [user, tab, showSuccess, showError, getCachedData, setCachedData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const userId = user.id || user._id;
    if (!userId) return;

    // Subscribe to relevant real-time events
    const unsubscribe = subscribeToEvents([
      'dare_created',
      'dare_updated', 
      'dare_completed',
      'switch_game_created',
      'switch_game_updated',
      'activity_created'
    ], (event) => {
      // Refresh dashboard data when relevant events occur
      if (event.userId === userId || event.affectsUser === userId) {
        fetchDashboardData();
        invalidateCache(`dashboard_${userId}_${tab}`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, subscribeToEvents, invalidateCache, fetchDashboardData, tab]);

  // Determine user's primary role based on their activity
  useEffect(() => {
    if (stats) {
      const subCount = stats.daresCompletedAsPerformer || 0;
      const domCount = stats.daresCreated || 0;
      const switchCount = stats.switchGamesPlayed || 0;
      
      if (domCount > subCount && domCount > switchCount) {
        setUserRole('dominant');
      } else if (switchCount > subCount && switchCount > domCount) {
        setUserRole('switch');
      } else {
        setUserRole('submissive');
      }
    }
  }, [stats]);

  const currentRoleForm = ROLE_FORMS[userRole];
  const RoleIcon = currentRoleForm.icon;

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <HeartIcon className="w-5 h-5" />,
      arousing: <SparklesIcon className="w-5 h-5" />,
      explicit: <FireIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <ShieldCheckIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <StarIcon className="w-5 h-5" />;
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
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-neutral-400 text-sm">Your personal command center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <FireIcon className="w-4 h-4" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <FireIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Welcome back!</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Ready for your next challenge, {user?.fullName || user?.username}?
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Manage your dares, track your progress, and discover new challenges
          </p>
        </div>

        {/* Role-Based Action Form */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`p-3 bg-gradient-to-r ${currentRoleForm.color} rounded-xl`}>
              <RoleIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{currentRoleForm.title}</h3>
              <p className="text-neutral-400">{currentRoleForm.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Role Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Choose Your Role</h4>
              <div className="space-y-3">
                {Object.entries(ROLE_FORMS).map(([role, form]) => {
                  const FormIcon = form.icon;
                  return (
                    <button
                      key={role}
                      onClick={() => setUserRole(role)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        userRole === role
                          ? `border-primary bg-gradient-to-r ${form.color} text-white shadow-lg`
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FormIcon className="w-6 h-6" />
                        <div>
                          <div className="font-semibold">{form.title}</div>
                          <div className="text-sm opacity-75">{form.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Action */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold text-white mb-4">Quick Action</h4>
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-gradient-to-r ${currentRoleForm.color} rounded-xl`}>
                    <RoleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">{currentRoleForm.title}</h5>
                    <p className="text-sm text-neutral-400">{currentRoleForm.description}</p>
                  </div>
                </div>
                <Link
                  to={currentRoleForm.path}
                  className={`inline-block bg-gradient-to-r ${currentRoleForm.color} text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2`}
                >
                  <PlusIcon className="w-5 h-5" />
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats ? (
          <div className="space-y-8 mb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Dares Completed */}
              <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm rounded-2xl border border-primary/30 p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <TrophyIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-primary">Dares Completed</h4>
                    <p className="text-neutral-400 text-sm">Total completed challenges</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-neutral-700 h-10 rounded"></div>
                  ) : (
                    stats?.daresCount || 0
                  )}
                </div>
              </div>
              
              {/* Average Grade */}
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-2xl border border-green-600/30 p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-600/20 rounded-xl">
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-400">Avg. Grade</h4>
                    <p className="text-neutral-400 text-sm">Average performance score</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-neutral-700 h-10 rounded"></div>
                  ) : (
                    stats?.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'
                  )}
                </div>
              </div>
              
              {/* Active Dares */}
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 backdrop-blur-sm rounded-2xl border border-blue-600/30 p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <ClockIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-400">Active Dares</h4>
                    <p className="text-neutral-400 text-sm">Currently in progress</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {daresLoading ? (
                    <div className="animate-pulse bg-neutral-700 h-10 rounded"></div>
                  ) : (
                    dares.length
                  )}
                </div>
              </div>
              
              {/* Switch Games */}
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-2xl border border-purple-600/30 p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <PlayIcon className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400">Switch Games</h4>
                    <p className="text-neutral-400 text-sm">Games played</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-white">
                  {statsLoading ? (
                    <div className="animate-pulse bg-neutral-700 h-10 rounded"></div>
                  ) : (
                    stats?.switchGamesPlayed || 0
                  )}
                </div>
              </div>
            </div>
            
            {/* Role Balance Card */}
            {(stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-2xl border border-purple-600/30 p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-purple-600/20 rounded-xl">
                    <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-purple-400">Role Balance</h3>
                    <p className="text-neutral-400">Your dominant/submissive ratio</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dominant */}
                  <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-purple-300">Dominant</span>
                      <span className="text-3xl font-bold text-purple-400">
                        {stats.dominantPercent || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.dominantPercent || 0}%` }}
                      />
                    </div>
                    <div className="text-sm text-purple-400">
                      {stats.dominantCount || 0} dares
                    </div>
                  </div>
                  
                  {/* Submissive */}
                  <div className="bg-pink-900/30 rounded-xl p-6 border border-pink-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-pink-300">Submissive</span>
                      <span className="text-3xl font-bold text-pink-400">
                        {stats.submissivePercent || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-pink-900/50 rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.submissivePercent || 0}%` }}
                      />
                    </div>
                    <div className="text-sm text-pink-400">
                      {stats.submissiveCount || 0} dares
                    </div>
                  </div>
                </div>
                <div className="text-sm text-neutral-400 mt-6 text-center">
                  Based on {stats.totalCount || 0} total dares
                </div>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-neutral-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Recent Activity */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <ClockIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
              <p className="text-neutral-400">Your latest dare activities</p>
            </div>
          </div>
          
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-neutral-700/50 rounded-xl p-6 border border-neutral-600/30">
                  <div className="h-4 bg-neutral-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-400 text-lg mb-2">No recent activities</div>
              <p className="text-neutral-500 text-sm">Start creating dares to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-600/30 hover:bg-neutral-700/70 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-neutral-600/50 rounded-lg">
                      <UserIcon className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-neutral-200 text-sm">
                        {activity.type === 'dare' && (
                          <span>Created dare: <span className="font-bold text-primary">{activity.dare?.description || 'Unknown dare'}</span></span>
                        )}
                        {activity.type === 'comment' && (
                          <span>Commented: <span className="italic text-neutral-300">{activity.details?.text || 'Unknown comment'}</span></span>
                        )}
                        {activity.type === 'grade' && (
                          <span>Graded: <span className="font-bold text-primary">{activity.dare?.description || 'Unknown dare'}</span> ({activity.details?.grade || 'N/A'})</span>
                        )}
                        {!['dare', 'comment', 'grade'].includes(activity.type) && (
                          <span>Performed action: <span className="font-bold text-primary">{activity.type}</span></span>
                        )}
                      </div>
                      {activity.createdAt && (
                        <div className="text-xs text-neutral-400 mt-2">
                          <span
                            className="cursor-help hover:text-neutral-300 transition-colors"
                            title={formatRelativeTimeWithTooltip(activity.createdAt).tooltip}
                          >
                            {formatRelativeTimeWithTooltip(activity.createdAt).display}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dares Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 rounded-xl">
              <FireIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Your Dares</h3>
              <p className="text-neutral-400">Manage your active and completed challenges</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-neutral-700 mb-8">
            {TABS.map(t => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.key}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-200 border-b-2 ${
                    tab === t.key 
                      ? `border-primary text-primary bg-primary/10` 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  onClick={() => setTab(t.key)}
                >
                  <TabIcon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Dares Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-neutral-700/50 rounded-xl p-6 border border-neutral-600/30">
                  <div className="h-4 bg-neutral-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {dares.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-12 border border-neutral-600/30">
                    <div className="text-neutral-400 text-xl mb-4">No dares found</div>
                    <p className="text-neutral-500 text-sm">No dares found for this category</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {dares.map(dare => (
                    <div key={dare._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-600/30 hover:bg-neutral-700/70 transition-all duration-300 transform hover:scale-[1.02]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2">
                            {dare.description || 'No description'}
                          </h4>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-2 bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white rounded-full px-3 py-1 text-sm font-semibold border border-white/20`}>
                              {getDifficultyIcon(dare.difficulty)} {dare.difficulty}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              dare.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              dare.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {dare.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {dare.tags && dare.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {dare.tags.map(tag => (
                                <span key={tag} className="bg-neutral-600/50 text-neutral-300 rounded-lg px-2 py-1 text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-neutral-400">
                        <div className="flex items-center gap-4">
                          {dare.creator && (
                            <span>Creator: {dare.creator?.fullName || dare.creator?.username}</span>
                          )}
                          {dare.performer && (
                            <span>Performer: {dare.performer?.fullName || dare.performer?.username}</span>
                          )}
                        </div>
                        {dare.createdAt && (
                          <span className="cursor-help" title={formatRelativeTimeWithTooltip(dare.createdAt).tooltip}>
                            {formatRelativeTimeWithTooltip(dare.createdAt).display}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard; 