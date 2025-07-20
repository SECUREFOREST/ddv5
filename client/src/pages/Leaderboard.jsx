import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/users/leaderboard')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Leaderboard</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Search/Filter Bar */}
      <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 shadow-sm w-full max-w-md mx-auto">
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
      <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
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
          <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900 overflow-x-auto rounded shadow">
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th className="p-2 text-left font-semibold">Rank</th>
                <th className="p-2 text-left font-semibold">User</th>
                <th className="p-2 text-left font-semibold">Points</th>
                <th className="p-2 text-left font-semibold">Dares Completed</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user._id} className={`transition-colors duration-100 ${idx % 2 === 0 ? 'bg-neutral-900/80' : 'bg-neutral-800'} hover:bg-neutral-700 group`}>
                  <td className="p-2 font-bold text-primary">{idx + 1}</td>
                  <td className="p-2 flex items-center gap-2">
                    <Avatar user={user} size={32} />
                    <span className="font-semibold">{user.username}</span>
                  </td>
                  <td className="p-2 text-neutral-300">{user.points}</td>
                  <td className="p-2 text-neutral-300">{user.daresCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 