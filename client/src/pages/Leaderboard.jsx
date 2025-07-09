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
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">Leaderboard</h1>
      </div>
      <div className="panel-body">
      <LeaderboardWidget leaders={leaders} loading={loading} title="Leaderboard" />
      </div>
    </div>
  );
} 