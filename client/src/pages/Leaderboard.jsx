import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LeaderboardWidget from '../components/LeaderboardWidget';
import { Banner } from '../components/Modal';

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
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center">Leaderboard</h1>
      </div>
      {error && <Banner type="error" message={error} onClose={() => setError('')} />}
      <div className="overflow-x-auto">
        <LeaderboardWidget leaders={leaders} loading={loading} title="Leaderboard" />
      </div>
    </div>
  );
} 