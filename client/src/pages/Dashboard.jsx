import React, { useState, useEffect, Suspense } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
const DashboardChart = React.lazy(() => import('../components/DashboardChart'));

const TABS = [
  { key: 'in_progress', label: 'Perform' },
  { key: 'pending', label: 'Demand' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const [tab, setTab] = useState('in_progress');
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/dares', { params: { status: tab, userId: user.id } })
      .then(res => setDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDares([]))
      .finally(() => setLoading(false));
  }, [tab, user]);

  useEffect(() => {
    if (!user) return;
    const statsRes = api.get(`/stats/users/${user.id}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const activitiesRes = api.get('/activity-feed/activities', { params: { limit: 10, userId: user.id } })
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, [user]);

  return (
    <div className="bg-neutral-800 rounded-lg p-4 mb-4">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="border-b border-neutral-900 pb-2 mb-4">
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        </div>
        <div>
          {stats && (
            <>
              <div className="mb-6">
                <Suspense fallback={<div className="text-neutral-400 text-center">Loading chart...</div>}>
                  <DashboardChart stats={stats} />
                </Suspense>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <Card className="flex-1 min-w-[180px]">
                  <div className="text-base font-semibold text-primary">Dares Completed</div>
                  <div className="text-2xl text-primary">{stats.daresCount}</div>
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
                      {activity.type === 'dare' && <span>Created dare: <span className="font-bold">{activity.title}</span></span>}
                      {activity.type === 'comment' && <span>Commented: <span className="italic">{activity.text}</span></span>}
                      {activity.type === 'grade' && <span>Graded: <span className="font-bold">{activity.dare?.title}</span> ({activity.grade})</span>}
                      {activity.createdAt && (
                        <div className="text-xs text-neutral-400 mt-1">
                          <span
                            className="cursor-help"
                            title={formatRelativeTimeWithTooltip(activity.createdAt).tooltip}
                          >
                            {formatRelativeTimeWithTooltip(activity.createdAt).display}
                          </span>
                        </div>
                      )}
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
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <DareCard key={i} loading />
              ))}
            </div>
          ) : (
            <div>
              {dares.length === 0 ? (
                <div className="text-neutral-400">No dares found for this tab.</div>
              ) : (
                <ul className="space-y-4">
                  {dares.map(dare => (
                    <li key={dare._id} className="dare">
                      <DareCard
                        title={dare.title}
                        description={dare.description}
                        difficulty={dare.difficulty}
                        tags={dare.tags || []}
                        status={dare.status}
                        user={dare.creator}
                        actions={[]}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 