import React, { useEffect, useState, Suspense } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const LeaderboardWidget = React.lazy(() => import('../components/LeaderboardWidget'));

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/stats/leaderboard')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u =>
    u.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Leaderboard</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Search/Filter Bar */}
      <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 w-full max-w-md mx-auto">
        <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 mr-2" />
        <input
          type="text"
          className="flex-1 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search leaderboard users"
        />
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg mb-2">
                  <div className="w-9 h-9 rounded-full bg-neutral-700" />
                  <div className="flex-1">
                    <div className="h-3 bg-neutral-700 rounded w-1/2 mb-1" />
                    <div className="h-2 bg-neutral-800 rounded w-1/3" />
                  </div>
                  <div className="w-16 h-3 bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-danger text-center mb-4">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-neutral-400 text-center">No users found.</div>
          ) : (
            <div className="mb-8">
              <Suspense fallback={<div className="text-neutral-400 text-center">Loading leaderboard...</div>}>
                <LeaderboardWidget leaders={filteredUsers.map(u => ({
                  id: u.user?.id,
                  username: u.user?.username,
                  fullName: u.user?.fullName,
                  avatar: u.user?.avatar,
                  daresCount: u.daresCount
                }))} loading={loading} />
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 