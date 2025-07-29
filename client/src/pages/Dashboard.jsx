import React, { useState, useEffect, Suspense } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card, { StatsCard } from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { ChartBarIcon, TrophyIcon, ClockIcon, CheckCircleIcon, FireIcon, UserIcon, TrendingUpIcon, StarIcon } from '@heroicons/react/24/solid';
import { StatsSkeleton, ListSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import Button from '../components/Button';
const DashboardChart = React.lazy(() => import('../components/DashboardChart'));

const TABS = [
  { key: 'in_progress', label: 'Perform', icon: ClockIcon },
  { key: 'pending', label: 'Demand', icon: ChartBarIcon },
  { key: 'completed', label: 'Completed', icon: TrophyIcon },
];

export default function Dashboard() {
  const [tab, setTab] = useState('in_progress');
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    if (!userId) return;
    
    setLoading(true);
    Promise.all([
      api.get('/dares', { params: { status: tab, creator: userId } }),
      api.get('/dares', { params: { status: tab, participant: userId } }),
      api.get('/dares', { params: { status: tab, assignedSwitch: userId } }),
      api.get(`/stats/users/${userId}`),
      api.get('/activity-feed/activities', { params: { limit: 10, userId } })
    ]).then(([createdRes, participatingRes, switchRes, statsRes, activitiesRes]) => {
      // Combine all dares and deduplicate
      const allDares = [
        ...(Array.isArray(createdRes.data) ? createdRes.data : []),
        ...(Array.isArray(participatingRes.data) ? participatingRes.data : []),
        ...(Array.isArray(switchRes.data) ? switchRes.data : [])
      ];
      
      // Deduplicate by _id
      const uniqueDares = Object.values(
        allDares.reduce((acc, dare) => {
          acc[dare._id] = dare;
          return acc;
        }, {})
      );
      
      setDares(uniqueDares);
      setStats(statsRes.data);
      setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      showSuccess('Dashboard updated successfully!');
    }).catch((error) => {
      setDares([]);
      setStats(null);
      setActivities([]);
      showError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard loading error:', error);
    }).finally(() => setLoading(false));
  }, [user, tab, showSuccess, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-12">
          {/* Enhanced Header with Better Spacing */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-3xl shadow-2xl shadow-primary/25">
                <FireIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Ready for your next challenge, {user?.fullName || user?.username}?
            </p>
          </div>

          {/* Enhanced Stats Overview with Better Layout */}
          {stats ? (
            <div className="space-y-12">
              {/* Performance Chart with Enhanced Design */}
              <Card variant="elevated" className="p-8">
                <div className="flex items-center gap-6 mb-10">
                  <div className="p-4 bg-primary/20 rounded-2xl">
                    <ChartBarIcon className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Performance Overview</h2>
                    <p className="text-lg text-neutral-400">Your dare completion statistics</p>
                  </div>
                </div>
                
                <Suspense fallback={
                  <div className="bg-neutral-800/50 rounded-2xl p-12 border border-neutral-700/30">
                    <div className="text-neutral-400 text-center text-lg">Loading chart...</div>
                  </div>
                }>
                  <DashboardChart stats={stats} />
                </Suspense>
              </Card>
              
              {/* Enhanced Stats Cards with Better Spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatsCard
                  title="Dares Completed"
                  value={stats.daresCount}
                  subtitle="Total challenges"
                  icon={<TrophyIcon className="w-8 h-8 text-primary" />}
                  trend={12}
                  className="bg-gradient-to-br from-primary/20 to-primary-dark/20 border-primary/30"
                />
                
                <StatsCard
                  title="Avg. Grade"
                  value={stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
                  subtitle="Performance score"
                  icon={<StarIcon className="w-8 h-8 text-green-400" />}
                  trend={-5}
                  className="bg-gradient-to-br from-green-600/20 to-green-700/20 border-green-600/30"
                />
                
                <StatsCard
                  title="Active Dares"
                  value={dares.length}
                  subtitle="In progress"
                  icon={<ClockIcon className="w-8 h-8 text-blue-400" />}
                  className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border-blue-600/30"
                />
                
                <StatsCard
                  title="Success Rate"
                  value={`${stats.successRate || 0}%`}
                  subtitle="Completion rate"
                  icon={<TrendingUpIcon className="w-8 h-8 text-yellow-400" />}
                  trend={8}
                  className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border-yellow-600/30"
                />
              </div>
            </div>
          ) : loading ? (
            <StatsSkeleton />
          ) : null}

          {/* Enhanced Recent Activity with Better Design */}
          <Card variant="elevated">
            <div className="flex items-center gap-6 mb-10">
              <div className="p-4 bg-blue-600/20 rounded-2xl">
                <ClockIcon className="w-10 h-10 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Recent Activity</h2>
                <p className="text-lg text-neutral-400">Your latest dare activities</p>
              </div>
            </div>
            
            {activities.length > 0 ? (
              <div className="space-y-6">
                {activities.slice(0, 5).map((activity, index) => (
                  <div key={activity._id || index} className="flex items-start gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/30 hover:bg-neutral-800/50 transition-all duration-200">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FireIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium mb-1">{activity.description}</p>
                      <p className="text-sm text-neutral-400">
                        {formatRelativeTimeWithTooltip(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-neutral-500" />
                </div>
                <p className="text-neutral-400 text-lg">No recent activity</p>
                <p className="text-neutral-500 text-sm mt-2">Start creating or accepting dares to see activity here</p>
              </div>
            )}
          </Card>

          {/* Enhanced Dares Section with Better Tabs */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Dares</h2>
                <p className="text-lg text-neutral-400">Manage your current challenges</p>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/dare/create'}
              >
                Create New Dare
              </Button>
            </div>
            
            {/* Enhanced Tab Navigation */}
            <div className="flex space-x-2 bg-neutral-800/50 rounded-2xl p-2">
              {TABS.map((tabItem) => {
                const Icon = tabItem.icon;
                return (
                  <button
                    key={tabItem.key}
                    onClick={() => setTab(tabItem.key)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                      tab === tabItem.key
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tabItem.label}
                  </button>
                );
              })}
            </div>

            {/* Dares List with Enhanced Loading */}
            {loading ? (
              <ListSkeleton count={3} />
            ) : dares.length > 0 ? (
              <div className="space-y-6">
                {dares.map((dare) => (
                  <DareCard
                    key={dare._id}
                    {...dare}
                    currentUserId={user?.id || user?._id}
                  />
                ))}
              </div>
            ) : (
              <Card variant="glass" className="text-center py-16">
                <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FireIcon className="w-10 h-10 text-neutral-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Dares Found</h3>
                <p className="text-neutral-400 text-lg mb-8 max-w-md mx-auto">
                  {tab === 'in_progress' && "You don't have any dares in progress. Start by creating or accepting a dare!"}
                  {tab === 'pending' && "No pending dares found. Create a new dare to get started!"}
                  {tab === 'completed' && "No completed dares yet. Complete your first dare to see it here!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => window.location.href = '/dare/create'}
                  >
                    Create Your First Dare
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => window.location.href = '/dare/select'}
                  >
                    Find a Dare
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 