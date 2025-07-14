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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/dares', { params: { status: tab } })
      .then(res => setDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDares([]))
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
      .then(res => setLeaders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLeaders([]))
      .finally(() => setLeadersLoading(false));
  }, []);

  useEffect(() => {
    if (!user || !(user.id || user._id)) return;
    api.get('/stats/activities', { params: { limit: 10, userId: user.id || user._id } })
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, [user]);

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Dashboard</h1>
      </div>
      <div>
        {loading && (
          <div className="text-center text-neutral-400 mb-4" role="status" aria-live="polite">Loading...</div>
        )}
        {stats && (
          <>
            <div className="mb-6">
              <DashboardChart stats={stats} />
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <Card className="flex-1 min-w-[180px]" />
              <Card className="flex-1 min-w-[180px]" />
              <Card className="flex-1 min-w-[180px]" />
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