import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';

export default function ProfileView() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/stats/users/${userId}`),
      api.get('/activities', { params: { userId, limit: 10 } })
    ])
      .then(([userRes, statsRes, actRes]) => {
        setProfile(userRes.data);
        setStats(statsRes.data);
        setUserActivities(Array.isArray(actRes.data) ? actRes.data : []);
      })
      .catch(() => setError('User not found.'))
      .finally(() => { setLoading(false); setUserActivitiesLoading(false); });
  }, [userId]);

  if (loading) return <div className="max-w-md w-full mx-auto mt-16 text-center text-neutral-400">Loading...</div>;
  if (error || !profile) return <div className="max-w-md w-full mx-auto mt-16 text-center text-danger font-medium">{error || 'User not found.'}</div>;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">User Profile</h1>
      </div>
      <div className="flex flex-wrap gap-8 mb-8">
        <div className="flex flex-col items-center min-w-[160px]">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-24 h-24 rounded-full mb-2 object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-4xl font-bold mb-2">
              {profile.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[220px]">
          <div><strong>Username:</strong> {profile.username}</div>
          {profile.bio && (
            <div className="mt-2">
              <strong>Bio:</strong>
              <div className="mt-1"><Markdown>{profile.bio}</Markdown></div>
            </div>
          )}
          {stats && (
            <div className="flex gap-4 mt-4">
              <div className="bg-neutral-900 rounded p-3 flex-1">
                <div className="text-base font-semibold text-primary">Dares Completed</div>
                <div className="text-2xl text-primary">{stats.daresCount}</div>
              </div>
              <div className="bg-neutral-900 rounded p-3 flex-1">
                <div className="text-base font-semibold text-primary">Avg. Grade</div>
                <div className="text-2xl text-primary">{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
              </div>
            </div>
          )}
          <div className="mt-6">
            <RecentActivityWidget activities={userActivities} loading={userActivitiesLoading} title="Recent Activity" />
          </div>
        </div>
      </div>
    </div>
  );
} 