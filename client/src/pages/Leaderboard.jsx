import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LeaderboardWidget from '../components/LeaderboardWidget';
import { Banner } from '../components/Modal';
import { TrophyIcon, ClockIcon } from '@heroicons/react/24/solid';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/stats/leaderboard')
      .then(res => setLeaders(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setLeaders([]); setError('Failed to load leaderboard.'); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <TrophyIcon className="w-7 h-7 text-yellow-400" /> Leaderboard
        </h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {error && <Banner type="error" message={error} onClose={() => setError('')} />}
      <div className="overflow-x-auto">
        <LeaderboardWidget leaders={leaders} loading={loading} />
      </div>
      {/* Optionally, add a timestamp/meta at the bottom if available */}
      <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-neutral-400" />
          Updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
} 