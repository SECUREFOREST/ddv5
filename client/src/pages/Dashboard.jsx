import React, { useState, useEffect, Suspense } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { ChartBarIcon, TrophyIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
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
    }).catch(() => {
      setDares([]);
      setStats(null);
      setActivities([]);
    }).finally(() => setLoading(false));
  }, [user, tab]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      
      <main id="main-content" tabIndex="-1" role="main">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-neutral-400 text-lg">Welcome back, {user?.fullName || user?.username}!</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-primary" />
                Performance Overview
              </h2>
              
              <Suspense fallback={
                <div className="bg-neutral-800/50 rounded-xl p-8 border border-neutral-700/30">
                  <div className="text-neutral-400 text-center">Loading chart...</div>
                </div>
              }>
                <DashboardChart stats={stats} />
              </Suspense>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <TrophyIcon className="w-6 h-6 text-primary" />
                  <span className="text-lg font-semibold text-primary">Dares Completed</span>
                </div>
                <div className="text-3xl font-bold text-white">{stats.daresCount}</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <span className="text-lg font-semibold text-green-400">Avg. Grade</span>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <ClockIcon className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-semibold text-blue-400">Active Dares</span>
                </div>
                <div className="text-3xl font-bold text-white">{dares.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-primary" />
            Recent Activity
          </h2>
          
          {activitiesLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-neutral-400">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-400 text-lg mb-2">No recent activities</div>
              <p className="text-neutral-500 text-sm">Start creating dares to see activity here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, idx) => (
                <div key={idx} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/30 hover:bg-neutral-800/70 transition-all">
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
              ))}
            </div>
          )}
        </div>

        {/* Dares Tabs */}
        <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Your Dares</h2>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-700 mb-6">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                  tab === t.key 
                    ? 'border-b-2 border-primary text-primary bg-primary/10' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
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
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <DareCard key={i} loading />
              ))}
            </div>
          ) : (
            <div>
              {dares.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-neutral-800/50 rounded-xl p-8 border border-neutral-700/30">
                    <div className="text-neutral-400 text-lg mb-2">No dares found</div>
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
        </div>
      </main>
    </div>
  );
} 