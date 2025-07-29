import React, { useState, useEffect, Suspense } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { ChartBarIcon, TrophyIcon, ClockIcon, CheckCircleIcon, FireIcon, UserIcon } from '@heroicons/react/24/solid';
import { StatsSkeleton, ListSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';
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
  }, [user, tab]); // Remove toast functions from dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-8">
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
                  <div className="text-4xl font-bold text-white">{stats.daresCount}</div>
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
                    {stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
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
                  <div className="text-4xl font-bold text-white">{dares.length}</div>
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
                            <span>Created dare: <span className="font-bold text-primary">{activity.title}</span></span>
                          )}
                          {activity.type === 'comment' && (
                            <span>Commented: <span className="italic text-neutral-300">{activity.text}</span></span>
                          )}
                          {activity.type === 'grade' && (
                            <span>Graded: <span className="font-bold text-primary">{activity.dare?.title}</span> ({activity.grade})</span>
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
                          title={dare.title}
                          description={dare.description}
                          difficulty={dare.difficulty}
                          tags={dare.tags || []}
                          status={dare.status}
                          user={dare.creator}
                          actions={[]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
} 