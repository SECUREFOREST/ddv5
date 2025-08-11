import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { ChartBarIcon, TrophyIcon, ClockIcon, CheckCircleIcon, FireIcon, UserIcon, HeartIcon, SparklesIcon, PlayIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { StatsSkeleton, ListSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { useCacheUtils } from '../utils/cache';
import { useRealtimeEvents } from '../utils/realtime';
import { retryApiCall } from '../utils/retry';
import { validateApiResponse, safeExtract } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { MainContent, ContentContainer } from '../components/Layout';
const DashboardChart = React.lazy(() => import('../components/DashboardChart'));

const TABS = [
  { key: 'in_progress', label: 'Perform', icon: ClockIcon },
  { key: 'pending', label: 'Demand', icon: ChartBarIcon },
  { key: 'completed', label: 'Completed', icon: TrophyIcon },
];

const ROLE_FORMS = {
  submissive: {
    title: "Perform Deviant Dare",
    description: "Describe what you will do and select difficulty level",
    icon: HeartIcon,
    color: "from-pink-600 to-rose-600",
    path: "/subs/new"
  },
  dominant: {
    title: "Demand Their Submission", 
    description: "Write a command and select difficulty level",
    icon: SparklesIcon,
    color: "from-purple-600 to-indigo-600",
    path: "/dom-demand/create"
  },
  switch: {
    title: "The Loser Submits Game",
    description: "Play rock-paper-scissors - loser performs winner's demand",
    icon: PlayIcon,
    color: "from-green-600 to-emerald-600",
    path: "/switches/create"
  }
};

export default function Dashboard() {
  const [tab, setTab] = useState('in_progress');
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [daresLoading, setDaresLoading] = useState(false);
  const [userRole, setUserRole] = useState('submissive'); // Default role
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
        const createdData = validateApiResponse(createdRes.value, API_RESPONSE_TYPES.DARE_ARRAY);
        allDares.push(...createdData);
      }
      
      if (participatingRes.status === 'fulfilled') {
        const participatingData = validateApiResponse(participatingRes.value, API_RESPONSE_TYPES.DARE_ARRAY);
        allDares.push(...participatingData);
      }
      
      if (switchRes.status === 'fulfilled') {
        const switchData = validateApiResponse(switchRes.value, API_RESPONSE_TYPES.DARE_ARRAY);
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
        activitiesData = validateApiResponse(activitiesRes.value, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
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
  }, [user, tab, showSuccess, showError]);

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

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-2xl shadow-2xl shadow-primary/25">
                <FireIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Welcome back!</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Ready for your next challenge, {user?.fullName || user?.username}?
            </p>
          </div>

          {/* Role-Based Action Form - OSA Style */}
          <Card className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 bg-gradient-to-r ${currentRoleForm.color} rounded-xl`}>
                <RoleIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentRoleForm.title}</h2>
                <p className="text-neutral-400">{currentRoleForm.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Choose Your Role</h3>
                <div className="space-y-3">
                  {Object.entries(ROLE_FORMS).map(([role, form]) => {
                    const FormIcon = form.icon;
                    return (
                      <button
                        key={role}
                        onClick={() => setUserRole(role)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          userRole === role
                            ? `border-primary bg-gradient-to-r ${form.color} text-white`
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
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Action</h3>
                <div className="bg-neutral-800/80 rounded-xl p-6 border border-neutral-700/50">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 bg-gradient-to-r ${currentRoleForm.color} rounded-xl`}>
                      <RoleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{currentRoleForm.title}</h4>
                      <p className="text-sm text-neutral-400">{currentRoleForm.description}</p>
                    </div>
                  </div>
                  <Link
                    to={currentRoleForm.path}
                    className={`inline-block bg-gradient-to-r ${currentRoleForm.color} text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          {stats ? (
            <div className="space-y-8">
              {/* Performance Chart */}
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <ChartBarIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Performance Overview</h2>
                    <p className="text-neutral-400">Your dare completion statistics</p>
                  </div>
                </div>
                
                <Suspense fallback={
                  <div className="bg-neutral-800/50 rounded-xl p-8 border border-neutral-700/30">
                    <div className="text-neutral-400 text-center">Loading chart...</div>
                  </div>
                }>
                  <DashboardChart stats={stats} />
                </Suspense>
              </Card>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Role Balance Card - OSA Style */}
                {(stats.dominantPercent !== undefined || stats.submissivePercent !== undefined) && (
                  <Card className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border-purple-600/30 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-purple-600/20 rounded-xl">
                        <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400">Role Balance</h3>
                        <p className="text-neutral-400 text-sm">Your dominant/submissive ratio</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Dominant */}
                      <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-purple-300">Dominant</span>
                          <span className="text-2xl font-bold text-purple-400">
                            {stats.dominantPercent || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-purple-900/50 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.dominantPercent || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-purple-400">
                          {stats.dominantCount || 0} dares
                        </div>
                      </div>
                      
                      {/* Submissive */}
                      <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-pink-300">Submissive</span>
                          <span className="text-2xl font-bold text-pink-400">
                            {stats.submissivePercent || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-pink-900/50 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${stats.submissivePercent || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-pink-400">
                          {stats.submissiveCount || 0} dares
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-400 mt-4 text-center">
                      Based on {stats.totalCount || 0} total dares
                    </div>
                  </Card>
                )}
                
                <Card className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border-primary/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <TrophyIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Dares Completed</h3>
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
                </Card>
                
                <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-600/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-600/20 rounded-xl">
                      <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-400">Avg. Grade</h3>
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
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-600/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-600/20 rounded-xl">
                      <ClockIcon className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400">Active Dares</h3>
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
                </Card>
              </div>
            </div>
          ) : loading ? (
            <StatsSkeleton />
          ) : null}

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <ClockIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                <p className="text-neutral-400">Your latest dare activities</p>
              </div>
            </div>
            
            {activitiesLoading ? (
              <ListSkeleton count={3} />
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-lg mb-2">No recent activities</div>
                <p className="text-neutral-500 text-sm">Start creating dares to see activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/30 hover:bg-neutral-800/70 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-neutral-700/50 rounded-lg">
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
          </Card>

          {/* Dares Tabs */}
          <Card>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/20 rounded-xl">
                <FireIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Dares</h2>
                <p className="text-neutral-400">Manage your active and completed challenges</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap border-b border-neutral-700 mb-8">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-200 border-b-2 ${
                    tab === t.key 
                      ? 'border-primary text-primary bg-primary/10' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  onClick={() => setTab(t.key)}
                >
                  <t.icon className="w-5 h-5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dares Content */}
            {loading ? (
              <ListSkeleton count={3} />
            ) : (
              <div>
                {dares.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-neutral-800/50 rounded-xl p-12 border border-neutral-700/30">
                      <div className="text-neutral-400 text-xl mb-4">No dares found</div>
                      <p className="text-neutral-500 text-sm">No dares found for this category</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {dares.map(dare => (
                      <div key={dare._id} className="transform hover:scale-[1.02] transition-transform duration-200">
                        <DareCard
                          description={dare.description}
                          difficulty={dare.difficulty}
                          tags={dare.tags || []}
                          status={dare.status}
                          creator={dare.creator}
                          performer={dare.performer}
                          actions={[]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 