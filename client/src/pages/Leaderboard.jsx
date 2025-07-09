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
    <div className="max-w-2xl mx-auto mt-12 bg-neutral-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-primary">Leaderboard</h1>
      <LeaderboardWidget leaders={leaders} loading={loading} title="Leaderboard" />
    </div>
  );
} 