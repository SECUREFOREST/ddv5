import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LeaderboardWidget from '../components/LeaderboardWidget';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/stats/leaderboard')
      .then(res => setLeaders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center">Leaderboard</h1>
      </div>
      <LeaderboardWidget leaders={leaders} loading={loading} title="Leaderboard" />
    </div>
  );
} 