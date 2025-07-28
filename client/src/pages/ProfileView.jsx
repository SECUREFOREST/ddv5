import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UserIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

export default function ProfileView() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [blockStatus, setBlockStatus] = useState('idle'); // idle | blocking | blocked | error
  const [blockError, setBlockError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/stats/users/${userId}`),
      api.get('/activity-feed/activities', { params: { userId, limit: 10 } })
    ]).then(([userRes, statsRes, activitiesRes]) => {
      setProfile(userRes.data);
      setStats(statsRes.data);
      setUserActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    }).catch(() => {
      setError('Failed to load profile.');
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleBlock = async () => {
    setBlockStatus('blocking');
    setBlockError('');
    try {
      await api.post(`/users/${userId}/block`);
      setBlockStatus('blocked');
      showNotification('User blocked successfully!', 'success');
    } catch (err) {
      setBlockStatus('error');
      showNotification(err.response?.data?.error || 'Failed to block user.', 'error');
    }
  };

  const isOwnProfile = user && user._id === userId;
  const isBlocked = user && user.blockedUsers && user.blockedUsers.includes(userId);

  const handleUnblock = async () => {
    setBlockStatus('blocking');
    setBlockError('');
    try {
      await api.post(`/users/${userId}/unblock`);
      setBlockStatus('idle');
      // Remove userId from blockedUsers in context (optional: reload user)
      if (user && user.blockedUsers) {
        const idx = user.blockedUsers.indexOf(userId);
        if (idx !== -1) user.blockedUsers.splice(idx, 1);
      }
    } catch (err) {
      setBlockStatus('error');
      setBlockError(err.response?.data?.error || 'Failed to unblock user.');
    }
  };

  if (loading) return <div className="max-w-md w-full mx-auto mt-16 text-center text-neutral-400">Loading...</div>;
  if (!profile) return <div className="max-w-md w-full mx-auto mt-16 text-center text-danger font-medium">User not found.</div>;

  // If blocked, show message and block all interactions
  if (isBlocked) {
    return (
      <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-[15px] mb-8 overflow-hidden text-center">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-14 sm:h-16 mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-primary" aria-hidden="true" /> User Profile
          </h1>
        </div>
        {/* Visually distinct status badge below header */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 bg-red-900/90 border border-red-700 text-red-200 rounded-full px-4 py-1 font-semibold text-lg animate-fade-in">
            Blocked
          </span>
        </div>
  
        <div className="flex flex-col items-center min-w-[160px] mb-6">
          {profile.avatar ? (
            <img src={profile.avatar} alt="avatar" className="w-24 h-24 rounded-full mb-2 object-cover border-2 border-primary " />
          ) : (
            <div className="w-24 h-24 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-4xl font-bold mb-2 border-2 border-primary ">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <div className="font-medium text-[#eee] text-lg">{profile.username}</div>
        </div>
        <div className="text-warning font-semibold text-lg mt-4">You have blocked this user.</div>
        <div className="mt-4">
          <button
            className={`px-4 py-2 rounded bg-warning text-warning-contrast font-semibold text-sm hover:bg-warning-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
            onClick={handleUnblock}
            disabled={blockStatus === 'blocking'}
          >
            {blockStatus === 'blocking' ? 'Unblocking...' : 'Unblock User'}
          </button>
          {blockStatus === 'error' && (
            <div className="text-danger text-xs mt-2">{blockError}</div>
          )}
        </div>
      </div>
    );
  }

  // Role badge helper
  function RoleBadge({ roles }) {
    if (!roles) return null;
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-1 bg-primary text-primary-contrast rounded-full px-3 py-1 text-xs font-bold border border-primary ml-2">
          <ShieldCheckIcon className="w-4 h-4" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-neutral-700 text-neutral-100 rounded-full px-3 py-1 text-xs font-bold border border-neutral-700 ml-2">
        <UserIcon className="w-4 h-4" /> User
      </span>
    );
  }

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-8 mb-8 overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-primary" aria-hidden="true" /> User Profile
          </h1>
        </div>
        {/* Visually distinct status badge below header */}
        <div className="flex justify-center mb-4">
          <RoleBadge roles={profile.roles || []} />
        </div>
  
        <div className="flex flex-wrap gap-8 mb-8">
          <div className="flex flex-col items-center min-w-[160px]">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-32 h-32 rounded-full mb-2 object-cover border-2 border-primary " />
            ) : (
              <div className="w-32 h-32 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-5xl font-bold mb-2 border-2 border-primary ">
                {profile.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-[220px]">
            <div className="font-bold text-xl text-primary mb-2">{profile.username}</div>
            {/* User tags section */}
            {Array.isArray(profile.tags) && profile.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-blue-900 text-blue-200 rounded-full px-3 py-1 text-xs font-semibold border border-blue-700">
                    {/* Optionally add a tag icon here if you want: <TagIcon className="w-3 h-3" /> */}
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {profile.bio && (
              <div className="mt-2">
                <strong>Bio:</strong>
                <div className="mt-1"><Markdown>{profile.bio}</Markdown></div>
              </div>
            )}
            {profile.gender && (
              <div className="mt-2"><strong>Gender:</strong> {profile.gender}</div>
            )}
            {profile.dob && (
              <div className="mt-2">
                <strong>Birth Date:</strong> 
                <span
                  className="cursor-help ml-1"
                  title={formatRelativeTimeWithTooltip(profile.dob).tooltip}
                >
                  {formatRelativeTimeWithTooltip(profile.dob).display}
                </span>
              </div>
            )}
            {profile.interestedIn && profile.interestedIn.length > 0 && (
              <div className="mt-2"><strong>Interested In:</strong> {profile.interestedIn.join(', ')}</div>
            )}
            {profile.limits && profile.limits.length > 0 && (
              <div className="mt-2"><strong>Limits:</strong> {profile.limits.join(', ')}</div>
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
          </div>
        </div>
      </main>
    </div>
  );
} 