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
      <LeaderboardWidget leaders={leaders} loading={loading} title="Leaderboard" />
  );
} 