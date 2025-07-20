import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import ActCard from '../components/ActCard';
import ProgressBar from '../components/ProgressBar';
import DashboardChart from '../components/DashboardChart';

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
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/acts', { params: { status: tab } })
      .then(res => setActs(Array.isArray(res.data) ? res.data : []))
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
    if (!user) return;
    api.get('/activities', { params: { limit: 10, userId: user.id } })
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, [user]);

  return (
    <div className="bg-neutral-800 rounded-lg shadow p-4 mb-4">
      <div className="border-b border-neutral-900 pb-2 mb-4">
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      </div>
      <div>
        {stats && (
          <>
            <div className="mb-6">
              <DashboardChart stats={stats} />
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold text-primary">Acts Completed</div>
                <div className="text-2xl text-primary">{stats.actsCount}</div>
              </Card>
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold text-primary">Credits</div>
                <div className="text-2xl text-primary">{stats.totalCredits}</div>
              </Card>
              <Card className="flex-1 min-w-[180px]">
                <div className="text-base font-semibold text-primary">Avg. Grade</div>
                <div className="text-2xl text-primary">{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
              </Card>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-8 mb-8">
          <Card className="flex-1">
            <div className="font-semibold text-primary mb-2">Recent Activity</div>
            {activitiesLoading ? (
              <div className="text-neutral-400">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-neutral-400">No recent activities found.</div>
            ) : (
              <ul className="space-y-2">
                {activities.map((activity, idx) => (
                  <li key={idx} className="text-neutral-200 text-sm">
                    {activity.type === 'act' && <span>Created act: <span className="font-bold">{activity.title}</span></span>}
                    {activity.type === 'comment' && <span>Commented: <span className="italic">{activity.text}</span></span>}
                    {activity.type === 'grade' && <span>Graded: <span className="font-bold">{activity.act?.title}</span> ({activity.grade})</span>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <ul className="flex border-b border-neutral-900 mb-4">
          {TABS.map(t => (
            <li key={t.key} className={tab === t.key ? 'border-b-2 border-primary text-primary font-semibold -mb-px' : 'text-neutral-400'}>
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
          <div className="text-neutral-400">Loading acts...</div>
        ) : (
          <div>
            {acts.length === 0 ? (
              <div className="text-neutral-400">No acts found for this tab.</div>
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