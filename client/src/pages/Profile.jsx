import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Markdown from '../components/Markdown';
import Tabs from '../components/Tabs';
import RecentActivityWidget from '../components/RecentActivityWidget';
import TagsInput from '../components/TagsInput';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';

export default function Profile() {
  const { user, accessToken, logout, loading, setUser } = useAuth();
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
  const [blockedUsersInfo, setBlockedUsersInfo] = useState([]);
  const [unblockStatus, setUnblockStatus] = useState({}); // { userId: 'idle' | 'unblocking' | 'error' }
  const [gender, setGender] = useState(user?.gender || '');
  const [dob, setDob] = useState(user?.dob ? user.dob.slice(0, 10) : '');
  const [interestedIn, setInterestedIn] = useState(user?.interestedIn || []);
  const [limits, setLimits] = useState(user?.limits || []);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(avatar || '');
  const [avatarSaved, setAvatarSaved] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  // Add block/unblock state
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState('');
  const [isBlocked, setIsBlocked] = useState(user?.blocked || false);
  // Add role tab state
  const [roleTab, setRoleTab] = useState('about');
  // Prepare stub stats for dominant/submissive
  const dominantStats = stats?.natures?.dominant || { withEveryone: {}, withYou: {}, tasks: [] };
  const submissiveStats = stats?.natures?.submissive || { withEveryone: {}, withYou: {}, tasks: [] };

  useEffect(() => {
    if (loading) return;
    console.log('user in useEffect:', user);
    console.log('user.id:', user?.id, 'user._id:', user?._id);
    if (!user || !(user.id || user._id)) return;
    const userId = user.id || user._id;
    api.get('/stats/users/' + userId)
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
    // Fetch dares created by user
    const fetchCreated = api.get('/dares', { params: { creator: userId } });
    // Fetch dares where user is a participant
    const fetchParticipating = api.get('/dares', { params: { participant: userId } });
    // Fetch dares assigned via switch games
    const fetchSwitch = api.get('/dares', { params: { assignedSwitch: userId } });
    Promise.all([fetchCreated, fetchParticipating, fetchSwitch])
      .then(([createdRes, participatingRes, switchRes]) => {
        const allDares = [
          ...(createdRes.data || []),
          ...(participatingRes.data || []),
          ...(switchRes.data || [])
        ];
        // Deduplicate by _id
        const uniqueDares = Object.values(
          allDares.reduce((acc, dare) => {
            acc[dare._id] = dare;
            return acc;
          }, {})
        );
        setDares(uniqueDares);
      })
      .catch(() => setDares([]));
    api.get('/stats/activities', { params: { userId, limit: 10 } })
      .then(res => setUserActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUserActivities([]))
      .finally(() => setUserActivitiesLoading(false));
    // Fetch info for blocked users
    if (user.blockedUsers && user.blockedUsers.length > 0) {
      Promise.all(user.blockedUsers.map(uid => api.get(`/users/${uid}`)))
        .then(resArr => setBlockedUsersInfo(resArr.map(r => r.data)))
        .catch(() => setBlockedUsersInfo([]));
    } else {
      setBlockedUsersInfo([]);
    }
  }, [user, loading]);

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('user at save:', user);
    console.log('user.id:', user?.id, 'user._id:', user?._id);
    if (!user || !(user.id || user._id)) {
      setError('User not loaded. Please refresh and try again.');
      setGeneralError('User not loaded. Please refresh and try again.');
      return;
    }
    const userId = user.id || user._id;
    setSaving(true);
    setError('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.patch(`/users/${userId}`, { username, avatar, bio, gender, dob, interestedIn, limits, fullName });
      console.log('user before reload:', user);
      window.location.reload(); // reload to update context
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setGeneralError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (blockedUserId) => {
    setUnblockStatus(s => ({ ...s, [blockedUserId]: 'unblocking' }));
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.post(`/users/${blockedUserId}/unblock`);
      // Remove from local blockedUsers and blockedUsersInfo
      if (user && user.blockedUsers) {
        const idx = user.blockedUsers.indexOf(blockedUserId);
        if (idx !== -1) user.blockedUsers.splice(idx, 1);
      }
      setBlockedUsersInfo(info => info.filter(u => u._id !== blockedUserId));
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'idle' }));
      setGeneralSuccess('User unblocked successfully!');
    } catch (err) {
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'error' }));
      setGeneralError(err.response?.data?.error || 'Failed to unblock user.');
    }
  };

  const handleInterestedIn = (val) => {
    setInterestedIn(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]);
  };

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload-input').click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      // Auto-upload avatar
      if (user && (user.id || user._id)) {
        const userId = user.id || user._id;
        const formData = new FormData();
        formData.append('file', file);
        setSaving(true);
        setError('');
        setAvatarSaved(false);
        setGeneralError('');
        setGeneralSuccess('');
        try {
          const uploadRes = await api.post('/users/' + userId + '/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setAvatar(uploadRes.data.url);
          setAvatarSaved(true);
          setTimeout(() => setAvatarSaved(false), 2000);
          setGeneralSuccess('Profile picture saved!');
        } catch (uploadErr) {
          setError('Failed to upload avatar.');
          setGeneralError('Failed to upload avatar.');
        } finally {
          setSaving(false);
        }
      }
    }
  };

  // Block/unblock handler
  const handleBlockToggle = async () => {
    setBlocking(true);
    setBlockError('');
    try {
      const action = isBlocked ? 'unblock' : 'block';
      await api.post(`/blocks/${user?._id}/${action}`);
      setIsBlocked(!isBlocked);
    } catch (err) {
      setBlockError('Failed to update block status.');
    } finally {
      setBlocking(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>
      <div>
        <Tabs
          tabs={[
            {
              label: 'About',
              content: (
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                  <div className="flex flex-col items-center min-w-[160px] mb-6 md:mb-0">
                    <input
                      id="avatar-upload-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarChange}
                    />
                    <div className="relative group">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="avatar"
                          className="w-24 h-24 rounded-full mb-2 object-cover cursor-pointer"
                          onClick={handleAvatarClick}
                        />
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-4xl font-bold mb-2 cursor-pointer"
                          onClick={handleAvatarClick}
                        >
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-full pointer-events-none select-none transition-opacity">Edit</span>
                    </div>
                    {avatarSaved && (
                      <div className="text-success text-xs mt-2">Profile picture saved!</div>
                    )}
                    <button className="bg-primary text-primary-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-primary-dark" onClick={() => setTabIdx(2)}>
                      Edit Profile
                    </button>
                    <button className="bg-danger text-danger-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-danger-dark" onClick={logout}>
                      Logout
                    </button>
                    {/* Add Upgrade/Downgrade Admin button */}
                    {user.roles?.includes('admin') ? (
                      <button
                        className="bg-danger text-danger-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-danger-dark"
                        onClick={async () => {
                          if (!user || !(user.id || user._id)) return;
                          const userId = user.id || user._id;
                          try {
                            await api.patch(`/users/${userId}`, { roles: ['user'] });
                            // Update user in AuthContext and localStorage
                            const updatedUser = { ...user, roles: ['user'] };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            if (typeof setUser === 'function') setUser(updatedUser);
                            alert('User downgraded to regular user!');
                          } catch (err) {
                            alert('Failed to downgrade user: ' + (err.response?.data?.error || err.message));
                          }
                        }}
                      >
                        Downgrade to User
                      </button>
                    ) : (
                      <button
                        className="bg-warning text-warning-contrast rounded-none px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-warning-dark"
                        onClick={async () => {
                          if (!user || !(user.id || user._id)) return;
                          const userId = user.id || user._id;
                          try {
                            await api.patch(`/users/${userId}`, { roles: ['admin'] });
                            // Update user in AuthContext and localStorage
                            const updatedUser = { ...user, roles: ['admin'] };
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            if (typeof setUser === 'function') setUser(updatedUser);
                            alert('User upgraded to admin!');
                          } catch (err) {
                            alert('Failed to upgrade user: ' + (err.response?.data?.error || err.message));
                          }
                        }}
                      >
                        Upgrade to Admin
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">About Me</h2>
                    <div className="mb-2">{bio || <span className="text-neutral-400">No bio yet.</span>}</div>
                    <div><strong>Username:</strong> {user.username}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    {user.gender && (
                      <div className="mt-2"><strong>Gender:</strong> {user.gender}</div>
                    )}
                    {user.dob && (
                      <div className="mt-2"><strong>Birth Date:</strong> {new Date(user.dob).toLocaleDateString()}</div>
                    )}
                    {user.interestedIn && user.interestedIn.length > 0 && (
                      <div className="mt-2"><strong>Interested In:</strong> {user.interestedIn.join(', ')}</div>
                    )}
                    {user.limits && user.limits.length > 0 && (
                      <div className="mt-2"><strong>Limits:</strong> {user.limits.join(', ')}</div>
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
                      <RecentActivityWidget activities={userActivities} loading={userActivitiesLoading} title="Your Recent Activity" />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Dominant',
              content: (
                <div>
                  <h3 className="text-lg font-bold mb-2">Dominant Stats</h3>
                  <div className="mb-2">With everyone: <span className="font-mono">{JSON.stringify(dominantStats.withEveryone)}</span></div>
                  <div className="mb-2">With you: <span className="font-mono">{JSON.stringify(dominantStats.withYou)}</span></div>
                  <div className="mb-2">Tasks:</div>
                  <ul className="list-disc ml-6">
                    {(dominantStats.tasks || []).map((t, i) => <li key={i}>{t.description || JSON.stringify(t)}</li>)}
                  </ul>
                </div>
              ),
            },
            {
              label: 'Submissive',
              content: (
                <div>
                  <h3 className="text-lg font-bold mb-2">Submissive Stats</h3>
                  <div className="mb-2">With everyone: <span className="font-mono">{JSON.stringify(submissiveStats.withEveryone)}</span></div>
                  <div className="mb-2">With you: <span className="font-mono">{JSON.stringify(submissiveStats.withYou)}</span></div>
                  <div className="mb-2">Tasks:</div>
                  <ul className="list-disc ml-6">
                    {(submissiveStats.tasks || []).map((t, i) => <li key={i}>{t.description || JSON.stringify(t)}</li>)}
                  </ul>
                </div>
              ),
            },
          ]}
          value={['about', 'dominant', 'submissive'].indexOf(roleTab)}
          onChange={idx => setRoleTab(['about', 'dominant', 'submissive'][idx])}
        />
      </div>
      {/* Blocked Users Section */}
      {blockedUsersInfo.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2 text-primary">Blocked Users</h2>
          <ul className="space-y-3">
            {blockedUsersInfo.map(bu => (
              <li key={bu._id} className="flex items-center gap-3 bg-neutral-900 rounded p-3">
                {bu.avatar ? (
                  <img src={bu.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center text-lg font-bold">
                    {bu.username[0].toUpperCase()}
                  </div>
                )}
                <span className="inline-flex items-center gap-2">
                  <Avatar user={bu} size={28} />
                  {bu.username || '[deleted]'}
                </span>
                <button
                  className="ml-auto px-3 py-1 rounded bg-warning text-warning-contrast font-semibold text-xs hover:bg-warning-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleUnblock(bu._id)}
                  disabled={unblockStatus[bu._id] === 'unblocking'}
                >
                  {unblockStatus[bu._id] === 'unblocking' ? 'Unblocking...' : 'Unblock'}
                </button>
                {unblockStatus[bu._id] === 'error' && (
                  <span className="text-danger text-xs ml-2">Error</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {user && user._id !== profileUser._id && (
        <button className={`btn btn-default ml-2 ${isBlocked ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`} onClick={handleBlockToggle} disabled={blocking} aria-label={isBlocked ? 'Unblock user' : 'Block user'}>
          {blocking ? <span className="fa fa-spinner fa-spin mr-1" /> : <span className="fa fa-ban mr-1" />} {isBlocked ? 'Unblock' : 'Block'}
        </button>
      )}
      {blockError && <div className="text-red-600 text-xs mt-1">{blockError}</div>}
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