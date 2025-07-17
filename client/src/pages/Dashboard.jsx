import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DareCard from '../components/DareCard';
import ProgressBar from '../components/ProgressBar';
import LeaderboardWidget from '../components/LeaderboardWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';
import DashboardChart from '../components/DashboardChart';
import { Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

const TABS = [
  { key: 'in_progress', label: 'Perform' },
  { key: 'waiting_for_participant', label: 'Available' },
  { key: 'pending', label: 'Demand' },
  { key: 'completed', label: 'Completed' },
];

export default function Dashboard() {
  const [tab, setTab] = useState('in_progress');
  const [dares, setDares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/dares', { params: { status: tab } })
      .then(res => setDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setDares([]); setError('Failed to load dares.'); })
      .finally(() => setLoading(false));
  }, [tab, user]);

  useEffect(() => {
    if (!user) return;
    api.get(`/stats/users/${user.id}`)
      .then(res => setStats(res.data))
      .catch(() => { setStats(null); setError('Failed to load stats.'); });
  }, [user]);

  useEffect(() => {
    api.get('/stats/leaderboard', { params: { limit: 5 } })
      .then(res => setLeaders(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setLeaders([]); setError('Failed to load leaderboard.'); })
      .finally(() => setLeadersLoading(false));
  }, []);

  useEffect(() => {
    if (!user || !(user.id || user._id)) return;
    api.get('/stats/activities', { params: { limit: 10, userId: user.id || user._id } })
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setActivities([]); setError('Failed to load recent activities.'); })
      .finally(() => setActivitiesLoading(false));
  }, [user]);

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <Squares2X2Icon className="w-7 h-7 text-primary" aria-hidden="true" /> Dashboard
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-blue-900/90 border border-blue-700 text-blue-200 rounded-full px-4 py-1 font-semibold shadow-lg text-lg animate-fade-in">
          <Squares2X2Icon className="w-6 h-6" /> Your Dashboard
        </span>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      <div>
        {error && <Banner type="error" message={error} onClose={() => setError('')} />}
        {loading && (
          <div className="text-center text-neutral-400 mb-4" role="status" aria-live="polite">Loading...</div>
        )}
        {stats && (
          <>
            <div className="mb-6">
              <DashboardChart stats={stats} />
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Card className="flex-1 min-w-0" />
              <Card className="flex-1 min-w-0" />
              <Card className="flex-1 min-w-0" />
            </div>
          </>
        )}
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 min-w-0">
            <RecentActivityWidget activities={activities} loading={activitiesLoading} title="Recent Activity" />
          </div>
          <div className="flex-1 min-w-0">
            <LeaderboardWidget leaders={leaders} loading={leadersLoading} title="Leaderboard" />
          </div>
        </div>
      </div>
    </div>
  );
} 