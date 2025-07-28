import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';
import { Banner } from '../components/Modal';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { UserIcon, ShieldCheckIcon, PencilIcon, NoSymbolIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Markdown from '../components/Markdown';
import RecentActivityWidget from '../components/RecentActivityWidget';
import TagsInput from '../components/TagsInput';
import { ClockIcon } from '@heroicons/react/24/solid';

function mapPrivacyValue(val) {
  if (val === 'when_viewed') return 'delete_after_view';
  if (val === '30_days') return 'delete_after_30_days';
  if (val === 'never') return 'never_delete';
  return val;
}

export default function Profile() {
  const { user, accessToken, logout, loading, setUser } = useAuth();
  const { showNotification } = useNotification();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [dares, setDares] = useState([]);
  const [created, setCreated] = useState([]);
  const [participating, setParticipating] = useState([]);
  const [switchGames, setSwitch] = useState([]);
  const [switchCreated, setSwitchCreated] = useState([]);
  const [switchParticipating, setSwitchParticipating] = useState([]);
  const [tabIdx, setTabIdx] = useState(0);
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
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
  // Prepare stub stats for dominant/submissive
  const dominantStats = stats?.natures?.dominant || { withEveryone: {}, withYou: {}, tasks: [] };
  const submissiveStats = stats?.natures?.submissive || { withEveryone: {}, withYou: {}, tasks: [] };
  // Add state for content deletion setting
  const [contentDeletion, setContentDeletion] = useState('');
  const [contentDeletionLoading, setContentDeletionLoading] = useState(false);
  const [contentDeletionError, setContentDeletionError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Initialize form fields when user data loads
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setBio(user.bio || '');
      setGender(user.gender || '');
      setDob(user.dob ? user.dob.slice(0, 10) : '');
      setInterestedIn(user.interestedIn || []);
      setLimits(user.limits || []);
      setFullName(user.fullName || '');
      setAvatarPreview(user.avatar || '');
      setIsBlocked(user.blocked || false);
    }
  }, [user]);

  // Refresh user data on mount to ensure we have the latest data
  useEffect(() => {
    if (user && (user.id || user._id)) {
      const userId = user.id || user._id;
      api.get(`/users/${userId}`)
        .then(res => {
          const updatedUser = res.data;
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        })
        .catch(err => {
          console.error('Failed to refresh user data:', err);
        });
    }
  }, []);

  // Fetch content deletion setting on mount
  useEffect(() => {
    setContentDeletionLoading(true);
    api.get('/safety/content_deletion')
      .then(res => setContentDeletion(res.data?.value || ''))
      .catch(() => setContentDeletionError('Failed to load content deletion setting.'))
      .finally(() => setContentDeletionLoading(false));
  }, []);

  const handleContentDeletionChange = async (val) => {
    setContentDeletionLoading(true);
    setContentDeletionError('');
    try {
      await api.post('/safety/content_deletion', { value: mapPrivacyValue(val) });
      setContentDeletion(val);
    } catch {
      setContentDeletionError('Failed to update setting.');
    } finally {
      setContentDeletionLoading(false);
    }
  };

  // Helper function to get user ID consistently
  const getUserId = (user) => {
    return user?.id || user?._id || user?.userId;
  };

  // Fetch user stats
  useEffect(() => {
    if (!user) return;
    const userId = getUserId(user);
    if (!userId) return;
    setStatsLoading(true);
    setUserActivitiesLoading(true);
    Promise.all([
      api.get('/stats/users/' + userId),
      api.get('/dares', { params: { creator: userId } }),
      api.get('/dares', { params: { participant: userId } }),
      api.get('/dares', { params: { assignedSwitch: userId } }),
      api.get('/switches', { params: { creator: userId } }),
      api.get('/switches', { params: { participant: userId } }),
      api.get('/activity-feed/activities', { params: { userId, limit: 10 } })
    ]).then(([statsRes, createdRes, participatingRes, switchRes, switchCreatedRes, switchParticipatingRes, activitiesRes]) => {
      setStats(statsRes.data);
      setCreated(Array.isArray(createdRes.data) ? createdRes.data : []);
      setParticipating(Array.isArray(participatingRes.data) ? participatingRes.data : []);
      setSwitch(Array.isArray(switchRes.data) ? switchRes.data : []);
      setSwitchCreated(Array.isArray(switchCreatedRes.data) ? switchCreatedRes.data : []);
      setSwitchParticipating(Array.isArray(switchParticipatingRes.data) ? switchParticipatingRes.data : []);
      setUserActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    }).catch(() => {
      setStatsError('Failed to load stats.');
    }).finally(() => {
      setStatsLoading(false);
      setUserActivitiesLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
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
    if (!user) {
      showNotification('User not loaded. Please refresh and try again.', 'error');
      return;
    }
    const userId = getUserId(user);
    if (!userId) {
      showNotification('User ID not found. Please refresh and try again.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/users/${userId}`, { username, avatar, bio, gender, dob, interestedIn, limits, fullName });
      window.location.reload(); // reload to update context
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (blockedUserId) => {
    setUnblockStatus(s => ({ ...s, [blockedUserId]: 'unblocking' }));
    try {
      await api.post(`/users/${blockedUserId}/unblock`);
      // Remove from local blockedUsers and blockedUsersInfo
      if (user && user.blockedUsers) {
        const idx = user.blockedUsers.indexOf(blockedUserId);
        if (idx !== -1) user.blockedUsers.splice(idx, 1);
      }
      setBlockedUsersInfo(info => info.filter(u => u._id !== blockedUserId));
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'idle' }));
      showNotification('User unblocked successfully!', 'success');
    } catch (err) {
      setUnblockStatus(s => ({ ...s, [blockedUserId]: 'error' }));
      showNotification(err.response?.data?.error || 'Failed to unblock user.', 'error');
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
        formData.append('avatar', file);
        setSaving(true);
        try {
          const uploadRes = await api.post('/users/' + userId + '/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const newAvatarUrl = uploadRes.data.avatar;
          setAvatar(newAvatarUrl);
          setAvatarSaved(true);
          setTimeout(() => setAvatarSaved(false), 2000);
          showNotification('Profile picture saved!', 'success');
          
          // Update user object in AuthContext and localStorage
          const updatedUser = { ...user, avatar: newAvatarUrl };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (uploadErr) {
          showNotification('Failed to upload avatar.', 'error');
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
      await api.post(`/users/blocks/${user?._id}/${action}`);
      setIsBlocked(!isBlocked);
    } catch (err) {
      setBlockError('Failed to update block status.');
    } finally {
      setBlocking(false);
    }
  };

  if (!user) return null;

  // Helper for visually distinct status badge
  function RoleBadge({ roles }) {
    if (!roles) return null;
    if (roles.includes('admin')) {
      return (
        <span className="inline-flex items-center gap-1 bg-yellow-900/90 border border-yellow-700 text-yellow-200 rounded-full px-3 py-1 font-semibold text-sm ml-2">
          <ShieldCheckIcon className="w-4 h-4" /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-blue-900/90 border border-blue-700 text-blue-200 rounded-full px-3 py-1 font-semibold text-sm ml-2">
        <UserIcon className="w-4 h-4" /> User
      </span>
    );
  }

  // Compute role percentages
  const dominantPercent = user?.natureRatio?.domination ?? null;
  const submissivePercent = user?.natureRatio?.submission ?? null;

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-8 mb-8 overflow-hidden">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-primary" /> Profile
          <RoleBadge roles={user.roles} />
        </h1>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <Tabs
          tabs={[
            {
              label: 'About',
              content: (
                loading ? (
                  <div className="flex flex-col md:flex-row gap-8 mb-8">
                    <div className="flex flex-col items-center min-w-[160px] mb-6 md:mb-0">
                      <div className="w-24 h-24 rounded-full bg-neutral-700 animate-pulse mb-4" />
                      <div className="h-4 w-24 bg-neutral-700 rounded mb-2 animate-pulse" />
                      <div className="h-4 w-24 bg-neutral-800 rounded mb-2 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2" />
                      ))}
                    </div>
                  </div>
                ) : (
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
                        <Avatar user={user} size={128} onClick={handleAvatarClick} border shadow alt={`Avatar for ${user?.fullName || user?.username || 'user'}`} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-full pointer-events-none select-none transition-opacity">Edit</span>
                      </div>
                      {avatarSaved && (
                        <div className="text-success text-xs mt-2">Profile picture saved!</div>
                      )}
                      <button className="bg-primary text-primary-contrast rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-contrast shadow-lg" onClick={() => { setTabIdx(0); setEditMode(true); }}>
                        Edit Profile
                      </button>
                      <button className="bg-danger text-danger-contrast rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-danger-dark focus:outline-none focus:ring-2 focus:ring-danger-contrast shadow-lg" onClick={logout}>
                        Logout
                      </button>
                      {/* Add Upgrade/Downgrade Admin button */}
                      {user.roles?.includes('admin') ? (
                        <button
                          className="bg-danger text-danger-contrast rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-danger-dark focus:outline-none focus:ring-2 focus:ring-danger-contrast"
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
                          className="bg-warning text-warning-contrast rounded px-4 py-2 mt-2 w-32 font-semibold text-sm hover:bg-warning-dark focus:outline-none focus:ring-2 focus:ring-warning-contrast"
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
                      {editMode ? (
                        <form role="form" aria-labelledby="profile-edit-title" onSubmit={handleSave} className="space-y-6">
                          <h1 id="profile-edit-title" className="text-2xl font-bold mb-4">Edit Profile</h1>
                          <div>
                            <label htmlFor="username" className="block font-semibold mb-1 text-primary">Username</label>
                            <input type="text" id="username" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={username} onChange={e => setUsername(e.target.value)} required aria-required="true" aria-label="Username" />
                          </div>
                          <div>
                            <label htmlFor="fullName" className="block font-semibold mb-1 text-primary">Full Name</label>
                            <input
                              id="fullName"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                              aria-label="Full Name"
                            />
                          </div>
                          <div>
                            <label htmlFor="bio" className="block font-semibold mb-1 text-primary">Bio</label>
                            <textarea id="bio" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Write something about yourself..." aria-label="Bio" aria-required="true" />
                          </div>
                          <div>
                            <label htmlFor="gender" className="block font-semibold mb-1 text-primary">Gender</label>
                            <select
                              id="gender"
                              value={gender}
                              onChange={e => setGender(e.target.value)}
                              className="w-full rounded border border-neutral-900 px-3 py-2 text-neutral-100 focus:outline-none focus:ring focus:border-primary bg-[#1a1a1a]"
                              required
                              aria-label="Gender"
                              aria-required="true"
                            >
                              <option value="">Select...</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="dob" className="block font-semibold mb-1 text-primary">Birth Date</label>
                            <input type="date" id="dob" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={dob} onChange={e => setDob(e.target.value)} required aria-required="true" aria-label="Birth Date" />
                          </div>
                          <div>
                            <label htmlFor="interestedIn" className="block font-semibold mb-1 text-primary">Interested In</label>
                            <TagsInput id="interestedIn" value={interestedIn} onChange={setInterestedIn} suggestions={['male', 'female', 'other']} aria-label="Interested In" aria-required="true" />
                          </div>
                          <div>
                            <label htmlFor="limits" className="block font-semibold mb-1 text-primary">Limits</label>
                            <TagsInput id="limits" value={limits} onChange={setLimits} suggestions={['pain', 'public', 'humiliation', 'bondage']} aria-label="Limits" aria-required="true" />
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button type="submit" className="bg-primary text-primary-contrast rounded-none px-4 py-2 font-semibold hover:bg-primary-dark shadow-lg" disabled={saving}>Save</button>
                            <button type="button" className="bg-neutral-700 text-neutral-100 rounded-none px-4 py-2 font-semibold hover:bg-neutral-800 shadow-lg" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h2 className="text-xl font-bold mb-2">About Me</h2>
                          <div className="mb-2">{bio || <span className="text-neutral-400">No bio yet.</span>}</div>
                          <div><strong>Username:</strong> {user.username}</div>
                          <div><strong>Full Name:</strong> {user.fullName}</div>
                          <div><strong>Email:</strong> {user.email}</div>
                          {user.gender && (
                            <div className="mt-2"><strong>Gender:</strong> {user.gender}</div>
                          )}
                          {user.dob && (
                            <div className="mt-2">
                              <strong>Birth Date:</strong> 
                              <span
                                className="cursor-help ml-1"
                                title={formatRelativeTimeWithTooltip(user.dob).tooltip}
                              >
                                {formatRelativeTimeWithTooltip(user.dob).display}
                              </span>
                            </div>
                          )}
                          {user.interestedIn && user.interestedIn.length > 0 && (
                            <div className="mt-2"><strong>Interested In:</strong> {user.interestedIn.join(', ')}</div>
                          )}
                          {user.limits && user.limits.length > 0 && (
                            <div className="mt-2"><strong>Limits:</strong> {user.limits.join(', ')}</div>
                          )}
                        </>
                      )}
                      <div className="mt-6">
                        <RecentActivityWidget activities={userActivities} loading={userActivitiesLoading} title="Your Recent Activity" />
                      </div>
                    </div>
                  </div>
                )
              ),
            },
            {
              label: 'Privacy & Safety',
              content: (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Content Deletion Setting</h3>
                  {contentDeletionLoading ? (
                    <div className="text-neutral-400">Loading...</div>
                  ) : (
                    <form>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-start gap-2">
                          <input type="radio" name="contentDeletion" value="when_viewed" checked={contentDeletion === 'when_viewed'} onChange={() => handleContentDeletionChange('when_viewed')} disabled={contentDeletionLoading} />
                          <span>
                            <b>Delete once viewed</b><br/>
                            <span className="text-xs text-neutral-400">As soon as the other person has viewed the image, delete it completely.</span>
                          </span>
                        </label>
                        <label className="flex items-start gap-2">
                          <input type="radio" name="contentDeletion" value="30_days" checked={contentDeletion === '30_days'} onChange={() => handleContentDeletionChange('30_days')} disabled={contentDeletionLoading} />
                          <span>
                            <b>Delete in 30 days</b><br/>
                            <span className="text-xs text-neutral-400">All pics are deleted thirty days after you upload them, whether they have been viewed or not.</span>
                          </span>
                        </label>
                        <label className="flex items-start gap-2">
                          <input type="radio" name="contentDeletion" value="never" checked={contentDeletion === 'never'} onChange={() => handleContentDeletionChange('never')} disabled={contentDeletionLoading} />
                          <span>
                            <b>Never delete</b><br/>
                            <span className="text-xs text-neutral-400">Keep your images on the site permanently. We don't necessarily recommend this setting. Please note images will be deleted if you fail to log in for 2 months.</span>
                          </span>
                        </label>
                      </div>
                      {contentDeletionError && <div className="text-danger mt-2">{contentDeletionError}</div>}
                    </form>
                  )}
                </div>
              )
            },
            {
              label: 'Change Password',
              content: <ChangePasswordForm />,
            }
          ]}
          value={tabIdx}
          onChange={setTabIdx}
        />
      </main>
      {/* Blocked Users Section */}
      {blockedUsersInfo.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2 text-primary">Blocked Users</h2>
          <ul className="space-y-3">
            {blockedUsersInfo.map(bu => (
              <li key={bu._id} className="flex items-center gap-3 bg-neutral-900 rounded p-3">
                <Avatar user={bu} size={28} alt={`Avatar for ${bu?.fullName || bu?.username || 'user'}`} />
                <span className="inline-flex items-center gap-2">
                  {bu.fullName || bu.username || 'Anonymous'}
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
      {false && (
        <button className={`btn btn-default ml-2 ${isBlocked ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`} onClick={handleBlockToggle} disabled={blocking} aria-label={isBlocked ? 'Unblock user' : 'Block user'}>
          {blocking ? <ArrowPathIcon className="w-4 h-4 text-white mr-1" /> : <NoSymbolIcon className="w-4 h-4 text-white mr-1" />} {isBlocked ? 'Unblock' : 'Block'}
        </button>
      )}
      {blockError && <div className="text-red-600 text-xs mt-1">{blockError}</div>}
      {/* Meta/timestamps at the bottom */}
      <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-4 h-4 text-neutral-400" />
          Joined: 
          <span
            className="cursor-help ml-1"
            title={user.createdAt ? formatRelativeTimeWithTooltip(user.createdAt).tooltip : 'N/A'}
          >
            {user.createdAt ? formatRelativeTimeWithTooltip(user.createdAt).display : 'N/A'}
          </span>
        </div>
        {user.updatedAt && (
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-blue-400" />
            Last Updated: 
            <span
              className="cursor-help ml-1"
              title={formatRelativeTimeWithTooltip(user.updatedAt).tooltip}
            >
              {formatRelativeTimeWithTooltip(user.updatedAt).display}
            </span>
          </div>
        )}
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