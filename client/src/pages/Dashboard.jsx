import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import ActCard from '../components/ActCard';
import ProgressBar from '../components/ProgressBar';
import LeaderboardWidget from '../components/LeaderboardWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';
import DashboardChart from '../components/DashboardChart';
import { Link } from 'react-router-dom';

const TABS = [
  { key: 'in_progress', label: 'Perform' },
  { key: 'pending', label: 'Demand' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const [tab, setTab] = useState('in_progress');
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/acts', { params: { status: tab } })
      .then(res => setActs(res.data))
      .catch(() => setActs([]))
      .finally(() => setLoading(false));
  }, [tab, user]);

  useEffect(() => {
    if (!user) return;
    api.get(`/stats/users/${user.id}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, [user]);

  useEffect(() => {
    api.get('/stats/leaderboard', { params: { limit: 5 } })
      .then(res => setLeaders(res.data))
      .catch(() => setLeaders([]))
      .finally(() => setLeadersLoading(false));
  }, []);

  useEffect(() => {
    api.get('/activities', { params: { limit: 10 } })
      .then(res => setActivities(res.data))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, []);

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">Dashboard</h1>
      </div>
      <div className="panel-body">
        {stats && (
          <>
            <div style={{ marginBottom: 24 }}>
              <DashboardChart stats={stats} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Acts Completed</div>
                <div style={{ fontSize: 24 }}>{stats.actsCount}</div>
              </Card>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Credits</div>
                <div style={{ fontSize: 24 }}>{stats.totalCredits}</div>
              </Card>
              <Card style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Avg. Grade</div>
                <div style={{ fontSize: 24 }}>{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
              </Card>
              <div style={{ flex: 1, minWidth: 180 }}>
                <ProgressBar
                  value={Math.min(100, Math.round((stats.actsCount / 100) * 100))}
                  label={`Progress to 100 Acts Completed (${stats.actsCount}/100)`}
                />
                <LeaderboardWidget leaders={leaders} loading={leadersLoading} title="Top 5 Leaderboard" />
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Link to="/leaderboard" style={{ color: '#D60B20', fontSize: 13, textDecoration: 'underline' }}>View full leaderboard &rarr;</Link>
                </div>
              </div>
            </div>
          </>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
          <Card style={{ flex: 1 }}>
            <RecentActivityWidget activities={activities} loading={activitiesLoading} title="Recent Activity" />
          </Card>
        </div>
        <ul className="nav nav-tabs" style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <li key={t.key} className={tab === t.key ? 'active' : ''}>
              <a href="#" onClick={e => { e.preventDefault(); setTab(t.key); }}>{t.label}</a>
            </li>
          ))}
        </ul>
        {loading ? (
          <div>Loading acts...</div>
        ) : (
          <div>
            {acts.length === 0 ? (
              <div className="text-muted">No acts found for this tab.</div>
            ) : (
              <ul className="acts-list">
                {acts.map(act => (
                  <li key={act._id} className="act">
                    <ActCard
                      title={act.title}
                      description={act.description}
                      difficulty={act.difficulty}
                      tags={act.tags || []}
                      status={act.status}
                      user={act.creator}
                      actions={[]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 