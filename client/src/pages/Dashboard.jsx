import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/stats/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Dashboard</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-neutral-900/90 border border-neutral-800 rounded-lg mb-2" />
            ))}
          </div>
        ) : error ? (
          <Banner type="error" message={error} onClose={() => setError('')} />
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow text-center">
              <div className="text-lg font-semibold text-neutral-400">Total Users</div>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow text-center">
              <div className="text-lg font-semibold text-neutral-400">Total Dares</div>
              <div className="text-2xl font-bold text-primary">{stats.totalDares}</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow text-center">
              <div className="text-lg font-semibold text-neutral-400">Total Comments</div>
              <div className="text-2xl font-bold text-primary">{stats.totalComments}</div>
            </div>
            <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800 shadow text-center">
              <div className="text-lg font-semibold text-neutral-400">Total Credits Awarded</div>
              <div className="text-2xl font-bold text-primary">{stats.totalCredits}</div>
            </div>
          </div>
        ) : (
          <div className="text-neutral-400 text-center">No dashboard stats available.</div>
        )}
      </div>
    </div>
  );
} 