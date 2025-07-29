import React, { useEffect, useState, Suspense } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { MagnifyingGlassIcon, TrophyIcon, FireIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';

const LeaderboardWidget = React.lazy(() => import('../components/LeaderboardWidget'));

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setLoading(true);
    api.get('/stats/leaderboard')
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        showSuccess('Leaderboard loaded successfully!');
      })
      .catch((err) => {
        setError('Failed to load leaderboard.');
        showError('Failed to load leaderboard. Please try again.');
        console.error('Leaderboard loading error:', err);
      })
      .finally(() => setLoading(false));
  }, []); // Remove toast functions from dependencies

  const filteredUsers = users.filter(u =>
    u.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Leaderboard</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              See who's leading the challenge
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search leaderboard users"
              />
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            {loading ? (
              <ListSkeleton count={10} />
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-8">
                  <div className="text-red-400 text-xl mb-4">Failed to load leaderboard</div>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-neutral-800/50 rounded-xl p-8 border border-neutral-700/30">
                  <div className="text-neutral-400 text-xl mb-4">No users found</div>
                  <p className="text-neutral-500 text-sm">
                    {search ? 'Try adjusting your search terms.' : 'The leaderboard is empty.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <FireIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Top Performers</h2>
                    <p className="text-neutral-400">Ranked by dare completion</p>
                  </div>
                </div>
                
                <Suspense fallback={<ListSkeleton count={5} />}>
                  <LeaderboardWidget 
                    leaders={filteredUsers.map(u => ({
                      id: u.user?.id,
                      username: u.user?.username,
                      fullName: u.user?.fullName,
                      avatar: u.user?.avatar,
                      daresCount: u.daresCount
                    }))} 
                    loading={loading} 
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
                <div className="text-sm text-primary-300">Total Participants</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {filteredUsers.reduce((sum, u) => sum + (u.daresCount || 0), 0)}
                </div>
                <div className="text-sm text-green-300">Total Dares Completed</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {filteredUsers[0]?.daresCount || 0}
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