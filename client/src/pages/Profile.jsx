import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import Tabs from '../components/Tabs';
import RecentActivityWidget from '../components/RecentActivityWidget';
import StatusBadge from '../components/DareCard';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [dares, setDares] = useState([]);
  const [tabIdx, setTabIdx] = useState(0);
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userActivities, setUserActivities] = useState([]);
  const [userActivitiesLoading, setUserActivitiesLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get(`/stats/users/${user.id}`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
    api.get('/dares', { params: { creator: user.id } })
      .then(res => setDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDares([]));
    api.get('/stats/activities', { params: { userId: user.id, limit: 10 } })
      .then(res => setUserActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUserActivities([]))
      .finally(() => setUserActivitiesLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/users/${user.id}`, { username, avatar, bio });
      window.location.reload(); // reload to update context
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
      <div>
        <Tabs
          tabs={[
            {
              label: 'Overview',
              content: (
                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="flex flex-col items-center min-w-[160px]">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full mb-2 object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-4xl font-bold mb-2">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <button className="bg-primary text-primary-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-primary-dark" onClick={() => setTabIdx(2)}>
                      Edit Profile
                    </button>
                    <button className="bg-danger text-danger-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-danger-dark" onClick={logout}>
                      Logout
                    </button>
                  </div>
                  <div className="flex-1 min-w-[220px]">
                    <div><strong>Username:</strong> {user.username}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div>
                      <strong>Bio:</strong>
                      {user.bio ? (
                        <div className="mt-1"><Markdown>{user.bio}</Markdown></div>
                      ) : (
                        <span className="text-neutral-400 ml-2">No bio provided.</span>
                      )}
                    </div>
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
                      <RecentActivityWidget activities={userActivities} loading={userActivitiesLoading} title="Your Recent Activity" />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Your Dares',
              content: (
                <div>
                  <h2 className="text-xl font-bold mb-2 text-primary">Your Dares</h2>
                  {dares.length === 0 ? (
                    <div className="text-neutral-400">No dares found.</div>
                  ) : (
                    <ul className="space-y-4">
                      {dares.map(dare => (
                        <li key={dare._id} className="bg-neutral-900 rounded p-4">
                          <div className="font-bold text-lg text-primary">{dare.title}</div>
                          <div className="text-neutral-400">{dare.description}</div>
                          <div className="text-sm mt-1">Status: <StatusBadge status={dare.status} /></div>
                          <span className="inline-block bg-info text-info-contrast rounded px-2 py-1 text-xs font-semibold mt-1">{dare.difficulty}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
            },
            {
              label: 'Settings',
              content: (
                <div className="max-w-md">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block font-semibold mb-1 text-primary">Username</label>
                      <input type="text" id="username" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                      <label htmlFor="avatar" className="block font-semibold mb-1 text-primary">Avatar URL</label>
                      <input type="text" id="avatar" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={avatar} onChange={e => setAvatar(e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block font-semibold mb-1 text-primary">Bio (Markdown supported)</label>
                      <textarea
                        id="bio"
                        className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                        rows={5}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="bg-neutral-900 rounded p-2 mt-2">
                        <span className="text-neutral-400 text-xs">Preview:</span>
                        <Markdown>{bio}</Markdown>
                      </div>
                    </div>
                    {error && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>}
                    <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                </div>
              ),
            },
            {
              label: 'Change Password',
              content: <ChangePasswordForm />,
            },
          ]}
          value={tabIdx}
          onChange={setTabIdx}
        />
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      setMessage('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-2xl font-bold text-center mb-6 text-[#888]">Change Password</h3>
        <div>
          <label htmlFor="oldPassword" className="block font-semibold mb-1 text-primary">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block font-semibold mb-1 text-primary">New Password</label>
          <input
            type="password"
            id="newPassword"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        {message && <div className="text-success text-sm font-medium" role="status" aria-live="polite">{message}</div>}
        {error && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{error}</div>}
        <button
          type="submit"
          className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
} 