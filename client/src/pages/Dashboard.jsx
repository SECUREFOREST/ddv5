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
    if (!user) return;
    api.get('/activities', { params: { limit: 10, userId: user.id } })
      .then(res => {
        if (Array.isArray(res.data)) {
          setActivities(res.data);
        } else {
          setActivities([]);
        }
      })
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, []);

  return (
    <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4">
      <div className="border-b pb-2 mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div>
        {stats && (
          <>
            <div className="mb-6">
              <DashboardChart stats={stats} />
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold">Acts Completed</div>
                <div className="text-2xl">{stats.actsCount}</div>
              </Card>
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold">Credits</div>
                <div className="text-2xl">{stats.totalCredits}</div>
              </Card>
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold">Avg. Grade</div>
                <div className="text-2xl">{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
              </Card>
              <div className="flex-1 min-w-[180px] flex flex-col gap-4">
                <ProgressBar
                  value={Math.min(100, Math.round((stats.actsCount / 100) * 100))}
                  label={`Progress to 100 Acts Completed (${stats.actsCount}/100)`}
                />
                <LeaderboardWidget leaders={leaders} loading={leadersLoading} title="Top 5 Leaderboard" />
                <div className="mt-2 text-right">
                  <Link to="/leaderboard" className="text-primary text-sm underline">View full leaderboard &rarr;</Link>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-8 mb-8">
          <Card className="flex-1">
            <RecentActivityWidget activities={activities} loading={activitiesLoading} title="Recent Activity" />
          </Card>
        </div>
        <ul className="flex border-b mb-4">
          {TABS.map(t => (
            <li key={t.key} className={tab === t.key ? 'border-b-2 border-primary text-primary font-semibold -mb-px' : 'text-gray-500'}>
              <a
                href="#"
                className="px-4 py-2 inline-block focus:outline-none"
                onClick={e => { e.preventDefault(); setTab(t.key); }}
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
        {loading ? (
          <div>Loading acts...</div>
        ) : (
          <div>
            {acts.length === 0 ? (
              <div className="text-gray-400">No acts found for this tab.</div>
            ) : (
              <ul className="space-y-4">
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