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
      .then(res => setUserActivities(res.data))
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
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">Profile</h1>
      </div>
      <div className="panel-body">
      <Tabs
        tabs={[
          {
            label: 'Overview',
            content: (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 32 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160 }}>
                  {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="avatar" style={{ width: 96, height: 96, borderRadius: '50%', marginBottom: 8 }} />
                  ) : (
                      <div className="avatar" style={{ width: 96, height: 96, borderRadius: '50%', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 'bold', marginBottom: 8 }}>
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                    <button className="btn btn-default" style={{ marginTop: 8, width: 120 }} onClick={() => setTabIdx(2)}>
                    Edit Profile
                  </button>
                    <button className="btn btn-danger" style={{ marginTop: 8, width: 120 }} onClick={logout}>
                      Logout
                    </button>
                </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div><strong>Username:</strong> {user.username}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                  <div>
                      <strong>Bio:</strong>
                    {user.bio ? (
                        <div style={{ marginTop: 4 }}><Markdown>{user.bio}</Markdown></div>
                    ) : (
                        <span className="text-muted" style={{ marginLeft: 8 }}>No bio provided.</span>
                    )}
                  </div>
                  {stats && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                        <div className="panel panel-default" style={{ flex: 1, padding: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>Acts Completed</div>
                          <div style={{ fontSize: 24 }}>{stats.actsCount}</div>
                        </div>
                        <div className="panel panel-default" style={{ flex: 1, padding: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>Credits</div>
                          <div style={{ fontSize: 24 }}>{stats.totalCredits}</div>
                      </div>
                        <div className="panel panel-default" style={{ flex: 1, padding: 12 }}>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>Avg. Grade</div>
                          <div style={{ fontSize: 24 }}>{stats.avgGrade !== null ? stats.avgGrade.toFixed(2) : '-'}</div>
                      </div>
                      </div>
                  )}
                    <div style={{ marginTop: 24 }}>
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
                  <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Your Acts</h2>
                {acts.length === 0 ? (
                    <div className="text-muted">No acts found.</div>
                ) : (
                    <ul className="list-group">
                    {acts.map(act => (
                        <li key={act._id} className="list-group-item">
                          <div style={{ fontWeight: 'bold', fontSize: 18 }}>{act.title}</div>
                          <div className="text-muted">{act.description}</div>
                          <div style={{ fontSize: 13, marginTop: 4 }}>Status: <StatusBadge status={act.status} /></div>
                          <span className="label label-default" style={{ marginTop: 4 }}>{act.difficulty}</span>
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
                <div style={{ maxWidth: 400 }}>
                  <form onSubmit={handleSave}>
                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                  </div>
                    <div className="form-group">
                      <label>Avatar URL</label>
                      <input type="text" className="form-control" value={avatar} onChange={e => setAvatar(e.target.value)} />
                  </div>
                    <div className="form-group">
                      <label>Bio (Markdown supported)</label>
                    <textarea
                        className="form-control"
                      rows={5}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                    />
                      <div className="well" style={{ marginTop: 8 }}>
                        <span className="text-muted" style={{ fontSize: 12 }}>Preview:</span>
                      <Markdown>{bio}</Markdown>
                    </div>
                  </div>
                    {error && <div className="text-danger" style={{ marginBottom: 10 }}>{error}</div>}
                    <button type="submit" className="btn btn-primary btn-block" disabled={saving} style={{ width: '100%' }}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </form>
                <hr style={{ margin: '32px 0' }} />
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