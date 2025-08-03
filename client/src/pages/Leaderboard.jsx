import React, { useEffect, useState, Suspense, useCallback } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { MagnifyingGlassIcon, TrophyIcon, FireIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';

const LeaderboardWidget = React.lazy(() => import('../components/LeaderboardWidget'));

const LEADERBOARD_TABS = [
  { key: 'all', label: 'All Users', icon: TrophyIcon },
  { key: 'subs', label: 'Subs Leaderboard', icon: HeartIcon },
  { key: 'doms', label: 'Doms Leaderboard', icon: SparklesIcon },
];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { showSuccess, showError } = useToast();

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/stats/leaderboard');
      
      if (response.data) {
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
        showSuccess('Leaderboard loaded successfully!');

      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Leaderboard loading error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load leaderboard.';
      setError(errorMessage);
      showError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Filter users based on active tab and search
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                         u.user?.fullName?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'subs':
        // Filter for submissive users (completed dares as performer)
        return u.user?.roles?.includes('submissive') || u.daresCompletedAsPerformer > 0;
      case 'doms':
        // Filter for dominant users (created dares)
        return u.user?.roles?.includes('dominant') || u.daresCreated > 0;
      default:
        return true; // Show all users
    }
  });

  const getTabIcon = (tab) => {
    const TabIcon = tab.icon;
    return <TabIcon className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-2xl shadow-2xl shadow-primary/25">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Leaderboards</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Track the top performers in each role
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center border-b border-neutral-700 mb-8">
            {LEADERBOARD_TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === tab.key 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {getTabIcon(tab)}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Search by username or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search leaderboard"
              />
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-xl mb-4">Error Loading Leaderboard</div>
                <p className="text-neutral-500 text-sm">{error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <FireIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {activeTab === 'subs' ? 'Top Submissives' : 
                       activeTab === 'doms' ? 'Top Dominants' : 
                       'Top Performers'}
                    </h2>
                    <p className="text-neutral-400">
                      {activeTab === 'subs' ? 'Ranked by completed dares' : 
                       activeTab === 'doms' ? 'Ranked by created dares' : 
                       'Ranked by overall performance'}
                    </p>
                  </div>
                </div>
                
                <Suspense fallback={<ListSkeleton count={5} />}>
                  <LeaderboardWidget 
                    leaders={filteredUsers.map(u => ({
                      id: u.user?.id,
                      username: u.user?.username,
                      fullName: u.user?.fullName,
                      avatar: u.user?.avatar,
                      daresCount: activeTab === 'subs' ? u.daresCompletedAsPerformer : 
                                  activeTab === 'doms' ? u.daresCreated : 
                                  u.daresCount,
                      role: u.user?.roles?.[0] || 'user'
                    }))} 
                    loading={loading} 
                    title={activeTab === 'subs' ? 'Subs Leaderboard' : 
                           activeTab === 'doms' ? 'Doms Leaderboard' : 
                           'Overall Leaderboard'}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {filteredUsers.length}
                </div>
                <div className="text-sm text-primary-300">
                  {activeTab === 'subs' ? 'Top Submissives' : 
                   activeTab === 'doms' ? 'Top Dominants' : 
                   'Total Participants'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {filteredUsers.reduce((sum, u) => {
                    const count = activeTab === 'subs' ? u.daresCompletedAsPerformer : 
                                 activeTab === 'doms' ? u.daresCreated : 
                                 u.daresCount || 0;
                    return sum + count;
                  }, 0)}
                </div>
                <div className="text-sm text-green-300">
                  {activeTab === 'subs' ? 'Total Dares Completed' : 
                   activeTab === 'doms' ? 'Total Dares Created' : 
                   'Total Dares'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {filteredUsers[0] ? 
                    (activeTab === 'subs' ? filteredUsers[0].daresCompletedAsPerformer : 
                     activeTab === 'doms' ? filteredUsers[0].daresCreated : 
                     filteredUsers[0].daresCount) || 0 : 0}
                </div>
                <div className="text-sm text-blue-300">Top Score</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 