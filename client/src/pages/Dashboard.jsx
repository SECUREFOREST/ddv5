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
    api.get('/stats/leaderboard', { params: { limit: 5 } })
      .then(res => setLeaders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLeaders([]))
      .finally(() => setLeadersLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/activities', { params: { limit: 10, userId: user.id } })
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, []);

  return (
    <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div>
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <RecentActivityWidget activities={activities} loading={activitiesLoading} />
          </div>
          <div className="flex-1">
            <LeaderboardWidget leaders={leaders} loading={leadersLoading} />
          </div>
        </div>
      </div>
    </div>
  );
} 