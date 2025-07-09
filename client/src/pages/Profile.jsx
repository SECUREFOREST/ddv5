import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import Tabs from '../components/Tabs';
import RecentActivityWidget from '../components/RecentActivityWidget';
import StatusBadge from '../components/ActCard';

export default function Profile() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [acts, setActs] = useState([]);
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
    api.get('/acts', { params: { creator: user.id } })
      .then(res => setActs(res.data))
      .catch(() => setActs([]));
    api.get('/activities', { params: { userId: user.id, limit: 10 } })
      .then(res => {
        if (Array.isArray(res.data)) {
          setUserActivities(res.data);
        } else {
          setUserActivities([]);
        }
      })
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
    <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4">
      <div className="border-b pb-2 mb-4">
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
                      <div className="w-24 h-24 rounded-full bg-gray-700 text-white flex items-center justify-center text-4xl font-bold mb-2">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <button className="bg-gray-200 text-gray-800 rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-gray-300" onClick={() => setTabIdx(2)}>
                      Edit Profile
                    </button>
                    <button className="bg-red-500 text-white rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-red-600" onClick={logout}>
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
                        <span className="text-gray-400 ml-2">No bio provided.</span>
                      )}
                    </div>
                    {stats && (
                      <div className="flex gap-4 mt-4">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex-1">
                          <div className="text-base font-semibold">Acts Completed</div>
                          <div className="text-2xl">{stats.actsCount}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex-1">
                          <div className="text-base font-semibold">Credits</div>
                          <div className="text-2xl">{stats.totalCredits}</div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 flex-1">
                          <div className="text-base font-semibold">Avg. Grade</div>
                          <div className="text-2xl">{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
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
              label: 'Your Acts',
              content: (
                <div>
                  <h2 className="text-xl font-bold mb-2">Your Acts</h2>
                  {acts.length === 0 ? (
                    <div className="text-gray-400">No acts found.</div>
                  ) : (
                    <ul className="space-y-4">
                      {acts.map(act => (
                        <li key={act._id} className="bg-gray-50 dark:bg-gray-800 rounded p-4">
                          <div className="font-bold text-lg">{act.title}</div>
                          <div className="text-gray-500 dark:text-gray-400">{act.description}</div>
                          <div className="text-sm mt-1">Status: <StatusBadge status={act.status} /></div>
                          <span className="inline-block bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs font-semibold mt-1">{act.difficulty}</span>
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
                      <label className="block font-semibold mb-1">Username</label>
                      <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Avatar URL</label>
                      <input type="text" className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={avatar} onChange={e => setAvatar(e.target.value)} />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Bio (Markdown supported)</label>
                      <textarea
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
                        rows={5}
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                      <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mt-2">
                        <span className="text-gray-400 text-xs">Preview:</span>
                        <Markdown>{bio}</Markdown>
                      </div>
                    </div>
                    {error && <div className="text-red-500 mb-2">{error}</div>}
                    <button type="submit" className="w-full bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </form>
                  <hr className="my-8" />
                  <ChangePasswordForm />
                </div>
              ),
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
    <form onSubmit={handleChangePassword} style={{ marginTop: 24 }}>
      <h3>Change Password</h3>
      <div className="form-group">
        <label>Old Password</label>
        <input type="password" className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>New Password</label>
        <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      </div>
      {message && <div className="text-success" style={{ marginBottom: 10 }}>{message}</div>}
      {error && <div className="text-danger" style={{ marginBottom: 10 }}>{error}</div>}
      <button type="submit" className="btn btn-secondary btn-block" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
} 