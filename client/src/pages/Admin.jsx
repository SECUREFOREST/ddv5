import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { ShieldCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';

function exportToCsv(filename, rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(','),
    ...rows.map(row => keys.map(k => '"' + String(row[k] ?? '').replace(/"/g, '""') + '"').join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !user.roles?.includes('admin')) {
    return (
      <div className="max-w-md sm:max-w-2xl lg:max-w-3xl w-full mx-auto mt-12 sm:mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-8 mb-8 overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-between h-16 mb-2 px-6 rounded-t-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-danger tracking-tight flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7 text-danger" aria-hidden="true" /> Admin Panel
            <span className="inline-flex items-center gap-2 bg-danger/90 border border-danger text-danger-contrast rounded-full px-4 py-1 font-bold ml-4 text-base animate-fade-in">
              <ShieldCheckIcon className="w-5 h-5" /> Admin Only
            </span>
          </h1>
        </div>
        <div className="border-t border-neutral-800 my-4 w-full" />
        <div className="text-danger text-xl font-bold mt-8">Access Denied: Admins Only</div>
      </div>
    );
  }
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [dares, setDares] = useState([]);
  const [daresLoading, setDaresLoading] = useState(true);
  const [siteStats, setSiteStats] = useState(null);
  const [siteStatsLoading, setSiteStatsLoading] = useState(true);
  const [siteStatsError, setSiteStatsError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [dareSearch, setDareSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const USERS_PER_PAGE = 10;
  const [darePage, setDarePage] = useState(0);
  const DARES_PER_PAGE = 10;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const allFilteredUserIds = users.filter(u =>
    (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
  ).map(u => u._id);
  const isAllSelected = allFilteredUserIds.length > 0 && allFilteredUserIds.every(id => selectedUsers.includes(id));
  const toggleAll = () => {
    if (isAllSelected) setSelectedUsers(selectedUsers.filter(id => !allFilteredUserIds.includes(id)));
    else setSelectedUsers([...new Set([...selectedUsers, ...allFilteredUserIds])]);
  };
  const toggleUser = (id) => {
    setSelectedUsers(selectedUsers.includes(id)
      ? selectedUsers.filter(uid => uid !== id)
      : [...selectedUsers, id]);
  };
  const clearSelectedUsers = () => setSelectedUsers([]);
  const [selectedDares, setSelectedDares] = useState([]);
  const allFilteredDareIds = dares.filter(d =>
    d && typeof d.description === 'string' && d.description.toLowerCase().includes(dareSearch.toLowerCase()) ||
    (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))
  ).map(d => d._id);
  const isAllDaresSelected = allFilteredDareIds.length > 0 && allFilteredDareIds.every(id => selectedDares.includes(id));
  const toggleAllDares = () => {
    if (isAllDaresSelected) setSelectedDares(selectedDares.filter(id => !allFilteredDareIds.includes(id)));
    else setSelectedDares([...new Set([...selectedDares, ...allFilteredDareIds])]);
  };
  const toggleDare = (id) => {
    setSelectedDares(selectedDares.includes(id)
      ? selectedDares.filter(did => did !== id)
      : [...selectedDares, id]);
  };
  const clearSelectedDares = () => setSelectedDares([]);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLogLoading, setAuditLogLoading] = useState(true);
  const [auditLogError, setAuditLogError] = useState('');
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [auditLogPage, setAuditLogPage] = useState(0);
  const AUDIT_LOGS_PER_PAGE = 10;
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [appeals, setAppeals] = useState([]);
  const [appealsLoading, setAppealsLoading] = useState(false);
  const [appealsError, setAppealsError] = useState('');
  const [resolvingAppealId, setResolvingAppealId] = useState(null);
  const [appealOutcome, setAppealOutcome] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for user edit modal
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', role: '' });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [deleteUserError, setDeleteUserError] = useState('');

  const { showNotification } = useNotification();

  const fetchUsers = () => {
    setDataLoading(true);
    setError('');
    setSuccess('');
    api.get('/users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setUsers([]);
        showNotification(err.response?.data?.error || 'Failed to load users.', 'error');
      })
      .finally(() => setDataLoading(false));
  };

  const fetchDares = () => {
    setDaresLoading(true);
    setError('');
    setSuccess('');
    Promise.all([
      api.get('/dares'),
      api.get('/switches')
    ])
      .then(([daresRes, switchesRes]) => {
        const dares = Array.isArray(daresRes.data) ? daresRes.data : [];
        const switchGames = Array.isArray(switchesRes.data) ? switchesRes.data.map(sg => ({ ...sg, isSwitchGame: true })) : [];
        setDares([...dares, ...switchGames]);
      })
      .catch(err => {
        setDares([]);
        showNotification(err.response?.data?.error || 'Failed to load dares.', 'error');
      })
      .finally(() => setDaresLoading(false));
  };

  const fetchReports = () => {
    setReportsLoading(true);
    setError('');
    setSuccess('');
    api.get('/reports')
      .then(res => setReports(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setReports([]);
        showNotification(err.response?.data?.error || 'Failed to load reports.', 'error');
      })
      .finally(() => setReportsLoading(false));
  };

  const handleResolveReport = async (id) => {
    setResolvingReportId(id);
    try {
      await api.patch(`/reports/${id}`);
      fetchReports();
    } catch {}
    setResolvingReportId(null);
  };

  const fetchAppeals = () => {
    setAppealsLoading(true);
    setError('');
    setSuccess('');
    api.get('/appeals')
      .then(res => setAppeals(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setAppeals([]);
        showNotification(err.response?.data?.error || 'Failed to load appeals.', 'error');
      })
      .finally(() => setAppealsLoading(false));
  };

  const handleResolveAppeal = async (id) => {
    setResolvingAppealId(id);
    try {
      await api.patch(`/appeals/${id}`, { outcome: appealOutcome });
      setAppealOutcome('');
      fetchAppeals();
    } catch {}
    setResolvingAppealId(null);
  };

  // Add handlers for dare actions
  const handleApprove = async (dareId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/dares/${dareId}/approve`);
      showNotification('Dare approved successfully!', 'success');
      fetchDares();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to approve dare.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async (dareId) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post(`/dares/${dareId}/reject`);
      showNotification('Dare rejected successfully!', 'success');
      fetchDares();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to reject dare.', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteDare = async (dare) => {
    if (!window.confirm('Delete this item?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      if (dare.isSwitchGame) {
        await api.delete(`/switches/${dare._id}`);
      } else {
        await api.delete(`/dares/${dare._id}`);
      }
      showNotification('Item deleted successfully!', 'success');
      fetchDares();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete item.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const [switchGames, setSwitchGames] = useState([]);
  const [switchGamesLoading, setSwitchGamesLoading] = useState(true);
  const [switchGameSearch, setSwitchGameSearch] = useState('');
  const [switchGamePage, setSwitchGamePage] = useState(0);
  const SWITCH_GAMES_PER_PAGE = 10;
  const [switchGameSearchId, setSwitchGameSearchId] = useState('');

  const fetchSwitchGames = () => {
    setSwitchGamesLoading(true);
    api.get('/switches')
      .then(res => setSwitchGames(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSwitchGames([]))
      .finally(() => setSwitchGamesLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (tabIdx === 1) fetchDares();
    if (tabIdx === 2) fetchSwitchGames();
    if (tabIdx === 3) {
      setSiteStatsLoading(true);
      setSiteStatsError('');
      api.get('/stats/site')
        .then(res => setSiteStats(res.data))
        .catch(() => setSiteStatsError('Failed to load site stats.'))
        .finally(() => setSiteStatsLoading(false));
    }
    if (tabIdx === 4) fetchReports();
    if (tabIdx === 5) fetchAppeals();
    // eslint-disable-next-line
  }, [tabIdx]);

  // Clear error when switching tabs
  useEffect(() => {
    setError('');
    setSuccess('');
  }, [tabIdx]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setActionLoading(true);
    setDeleteUserError('');
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${userId}`);
      showNotification('User deleted successfully!', 'success');
      fetchUsers();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete user', 'error');
    }
    setActionLoading(false);
  };

  // Add a no-op handleUserSearch to prevent ReferenceError
  const handleUserSearch = () => {
    // Optionally, you could refetch users from the server here if needed
    // For now, this is a no-op since filtering is local
  };

  // Add handleDeleteUser to call handleDelete
  const handleDeleteUser = (userId) => {
    handleDelete(userId);
  };

  // Open modal and populate data
  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setEditUserId(userId);
      setEditUserData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
      });
      setEditUserError('');
    }
  };

  // Close modal
  const closeEditUserModal = () => {
    setEditUserId(null);
    setEditUserData({ username: '', email: '', role: '' });
    setEditUserError('');
  };

  // Handle form changes
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Save user changes
  const handleEditUserSave = async () => {
    setEditUserLoading(true);
    setEditUserError('');
    setError('');
    setSuccess('');
    try {
      // Only send editable fields
      const { username, email, role, roles } = editUserData;
      const payload = { username, email };
      if (roles) payload.roles = roles;
      if (role) payload.role = role;
      await api.patch(`/users/${editUserId}`, payload);
      showNotification('User updated successfully!', 'success');
      fetchUsers();
      closeEditUserModal();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update user', 'error');
    } finally {
      setEditUserLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-2xl lg:max-w-3xl w-full mx-auto mt-12 sm:mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-8 mb-8 overflow-hidden flex flex-col min-h-[70vh]">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-between h-16 mb-2 px-6 rounded-t-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <ShieldCheckIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Admin Panel
          <span className="inline-flex items-center gap-2 bg-danger/90 border border-danger text-danger-contrast rounded-full px-4 py-1 font-bold ml-4 text-base animate-fade-in">
            <ShieldCheckIcon className="w-5 h-5" /> Admin Only
          </span>
        </h1>
      </div>
      {/* Add a toast/banner for feedback */}
      {(success || error) && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300
          ${success ? 'bg-success text-success-contrast' : 'bg-danger text-danger-contrast'}`}
          role="alert"
          aria-live="polite"
          tabIndex={0}
        >
          {success || error}
        </div>
      )}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        {/* Card-like section for tab content */}
        <div className="p-6 bg-neutral-900 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
          <Tabs
            tabs={[
              {
                label: 'Users',
                content: (
                  <div>
                    {/* Section header */}
                    <div className="text-xl font-bold text-primary mb-4">User Management</div>
                    {/* Search bar */}
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 w-full max-w-md mx-auto">
                      <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 mr-2" />
                      <input
                        type="text"
                        className="flex-1 border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400 bg-[#1a1a1a]"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        aria-label="Search users"
                      />
                      <input
                        className="w-48 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400 ml-2"
                        placeholder="Search by ID..."
                        value={userSearchId || ''}
                        onChange={e => setUserSearchId(e.target.value)}
                      />
                      <button
                        className="bg-danger text-danger-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-danger-dark focus:outline-none focus:ring-2 focus:ring-danger-contrast transition"
                        onClick={handleUserSearch}
                        type="button"
                      >
                        Search
                      </button>
                    </div>
                    {deleteUserError && (
                      <div className="mb-4 text-danger text-sm font-semibold" role="alert" aria-live="assertive">{deleteUserError}</div>
                    )}
                    {/* Show loading skeletons when data is loading */}
                    {dataLoading && (
                      <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg mb-2">
                            <div className="w-9 h-9 rounded-full bg-neutral-700" />
                            <div className="flex-1">
                              <div className="h-3 bg-neutral-700 rounded w-1/2 mb-1" />
                              <div className="h-2 bg-neutral-800 rounded w-1/3" />
                            </div>
                            <div className="w-16 h-3 bg-neutral-700 rounded" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="overflow-x-auto rounded ">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                        <caption className="sr-only">User Management</caption>
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th scope="col" className="p-2 text-left font-semibold">Username</th>
                            <th scope="col" className="p-2 text-left font-semibold">Email</th>
                            <th scope="col" className="p-2 text-left font-semibold">Role</th>
                            <th scope="col" className="p-2 text-left font-semibold">Status</th>
                            <th scope="col" className="p-2 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter(u =>
                              (userSearchId
                                ? u._id === userSearchId
                                : (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
                                  (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
                              )
                            )
                            .slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE)
                            .map((user, idx) => (
                            <tr
                              key={user._id}
                              className={`transition-colors duration-100 ${idx % 2 === 0 ? 'bg-neutral-900/80' : 'bg-neutral-800'} hover:bg-neutral-700 group`}
                            >
                              <td className="p-2 text-primary font-semibold">
                                <a href={`/profile/${user._id}`} className="underline hover:text-danger focus:text-danger transition-colors" tabIndex={0} aria-label={`View profile for ${user.username}`}>{user.fullName || user.username || 'Unknown'}</a>
                              </td>
                              <td className="p-2 text-neutral-300">{user.email}</td>
                              <td className="p-2">
                                {user.role === 'admin' ? (
                                  <span className="inline-flex items-center gap-1 bg-danger/20 text-danger font-bold rounded px-2 py-1 text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7m0 8h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                                    Admin
                                  </span>
                                ) : user.role === 'moderator' ? (
                                  <span className="inline-flex items-center gap-1 bg-info/20 text-info font-bold rounded px-2 py-1 text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Moderator
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-success/20 text-success font-bold rounded px-2 py-1 text-xs">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    User
                                  </span>
                                )}
                              </td>
                              <td className="p-2">
                                {!user.banned ? (
                                  <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold">Active</span>
                                ) : (
                                  <span className="inline-block bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold">Inactive</span>
                                )}
                              </td>
                              <td className="p-2">
                                <button className="bg-warning text-warning-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-warning-dark mr-2 focus:outline-none focus:ring-2 focus:ring-warning shadow-lg" onClick={() => handleEditUser(user._id)} aria-label={`Edit user ${user.username}`}>Edit</button>
                                <button className="bg-danger text-danger-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-danger-dark disabled:opacity-60 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-danger shadow-lg" onClick={() => handleDeleteUser(user._id)} disabled={actionLoading} aria-label={`Delete user ${user.username}`}>
                                  {actionLoading ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : null}
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      <button onClick={() => setUserPage(p => Math.max(0, p - 1))} disabled={userPage === 0} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Previous</button>
                      <span className="text-neutral-300">Page {userPage + 1} of {Math.max(1, Math.ceil(users.filter(u => (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) || (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))).length / USERS_PER_PAGE))}</span>
                      <button onClick={() => setUserPage(p => p + 1)} disabled={(userPage + 1) * USERS_PER_PAGE >= users.filter(u => (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) || (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))).length} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Next</button>
                    </div>
                  </div>
                ),
              },
              {
                label: 'Dares',
                content: (
                  <div>
                    {/* Section header */}
                    <div className="text-xl font-bold text-primary mb-4">Dare Management</div>
                    {/* Search bar */}
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 w-full max-w-md mx-auto">
                      <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 mr-2" />
                      <input
                        className="flex-1 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400"
                        placeholder="Search dares..."
                        value={dareSearch}
                        onChange={e => setDareSearch(e.target.value)}
                      />
                      <input
                        className="w-48 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400 ml-2"
                        placeholder="Search by ID..."
                        value={dareSearchId || ''}
                        onChange={e => setDareSearchId(e.target.value)}
                      />
                    </div>
                    {/* Show loading skeletons when data is loading */}
                    {daresLoading && (
                      <div className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg mb-2">
                            <div className="w-9 h-9 rounded-full bg-neutral-700" />
                            <div className="flex-1">
                              <div className="h-3 bg-neutral-700 rounded w-1/2 mb-1" />
                              <div className="h-2 bg-neutral-800 rounded w-1/3" />
                            </div>
                            <div className="w-16 h-3 bg-neutral-700 rounded" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="overflow-x-auto rounded ">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                        <caption className="sr-only">Dare Management</caption>
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th scope="col" className="p-2"><input type="checkbox" checked={isAllDaresSelected} onChange={toggleAllDares} className="bg-[#1a1a1a]" /></th>
                            <th scope="col" className="p-2 text-left font-semibold">Description</th>
                            <th scope="col" className="p-2 text-left font-semibold">Creator</th>
                            <th scope="col" className="p-2 text-left font-semibold">Status</th>
                            <th scope="col" className="p-2 text-left font-semibold">Difficulty</th>
                            <th scope="col" className="p-2 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dares
                            .filter(d =>
                              (dareSearchId
                                ? d._id === dareSearchId
                                : (d && typeof d.description === 'string' && d.description.toLowerCase().includes(dareSearch.toLowerCase())) ||
                                  (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))
                              )
                            )
                            .slice(darePage * DARES_PER_PAGE, (darePage + 1) * DARES_PER_PAGE)
                            .map(d => (
                              <tr key={d?._id || Math.random()} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2"><input type="checkbox" checked={selectedDares.includes(d?._id)} onChange={() => toggleDare(d?._id)} className="bg-[#1a1a1a]" /></td>
                                <td className="p-2 text-neutral-100">{d && typeof d.description === 'string' ? d.description : '-'}</td>
                                <td className="p-2 text-neutral-400">{d && d.creator?.fullName ? d.creator.fullName : (d.creator?.username || 'Unknown')}</td>
                                <td className="p-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${d && d.status === 'pending' ? 'bg-warning text-warning-contrast' : d && d.status === 'approved' ? 'bg-success text-success-contrast' : d && d.status === 'waiting_for_participant' ? 'bg-success text-success-contrast' : 'bg-danger text-danger-contrast'}`}>{d && d.status === 'waiting_for_participant' ? 'Waiting for Participant' : d && d.status}</span>
                                </td>
                                <td className="p-2 text-neutral-400">{d && d.difficulty ? d.difficulty : '-'}</td>
                                <td className="p-2 space-x-2">
                                  {d && d.status === 'pending' && (
                                      <>
                                      <button className="bg-success text-success-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-success-dark shadow-lg" disabled={actionLoading} onClick={() => handleApprove(d._id)}>Approve</button>
                                      <button className="bg-warning text-warning-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-warning-dark shadow-lg" disabled={actionLoading} onClick={() => handleReject(d._id)}>Reject</button>
                                      </>
                                    )}
                                  <button className="bg-danger text-danger-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-danger-dark shadow-lg" disabled={actionLoading} onClick={() => handleDeleteDare(d)} aria-label={`Delete item ${d.description}`}>Delete</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                    </div>
                    <div className="flex justify-center gap-2 mt-4">
                      <button onClick={() => setDarePage(p => Math.max(0, p - 1))} disabled={darePage === 0} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Previous</button>
                      <span className="text-neutral-300">Page {darePage + 1} of {Math.max(1, Math.ceil(dares.filter(d => (d && typeof d.description === 'string' && d.description.toLowerCase().includes(dareSearch.toLowerCase())) || (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))).length / DARES_PER_PAGE))}</span>
                      <button onClick={() => setDarePage(p => p + 1)} disabled={(darePage + 1) * DARES_PER_PAGE >= dares.filter(d => (d && typeof d.description === 'string' && d.description.toLowerCase().includes(dareSearch.toLowerCase())) || (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))).length} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Next</button>
                    </div>
                  </div>
                ),
              },
              {
                label: 'Switch Games',
                content: (
                  <div>
                    <div className="text-xl font-bold text-primary mb-4">Switch Game Management</div>
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 w-full max-w-md mx-auto">
                      <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 mr-2" />
                      <input
                        className="flex-1 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400"
                        placeholder="Search switch games..."
                        value={switchGameSearch}
                        onChange={e => setSwitchGameSearch(e.target.value)}
                      />
                      <input
                        className="w-48 bg-[#1a1a1a] border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400 ml-2"
                        placeholder="Search by ID..."
                        value={switchGameSearchId || ''}
                        onChange={e => setSwitchGameSearchId(e.target.value)}
                      />
                    </div>
                    {switchGamesLoading ? (
                      <div className="flex flex-col gap-2">Loading switch games...</div>
                    ) : (
                      <div className="overflow-x-auto rounded ">
                        <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                          <caption className="sr-only">Switch Game Management</caption>
                          <thead>
                            <tr className="bg-neutral-900 text-primary">
                              <th scope="col" className="p-2 text-left font-semibold">ID</th>
                              <th scope="col" className="p-2 text-left font-semibold">Description</th>
                              <th scope="col" className="p-2 text-left font-semibold">Creator</th>
                              <th scope="col" className="p-2 text-left font-semibold">Status</th>
                              <th scope="col" className="p-2 text-left font-semibold">Difficulty</th>
                              <th scope="col" className="p-2 text-left font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {switchGames
                              .filter(g =>
                                (switchGameSearchId
                                  ? g._id === switchGameSearchId
                                  : (g.creatorDare?.description && g.creatorDare.description.toLowerCase().includes(switchGameSearch.toLowerCase())) ||
                                    (g.creator?.username && g.creator.username.toLowerCase().includes(switchGameSearch.toLowerCase())) ||
                                    (g._id && g._id.toLowerCase().includes(switchGameSearch.toLowerCase()))
                                )
                              )
                              .slice(switchGamePage * SWITCH_GAMES_PER_PAGE, (switchGamePage + 1) * SWITCH_GAMES_PER_PAGE)
                              .map(g => (
                                <tr key={g._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                  <td className="p-2 text-xs text-neutral-400">{g._id}</td>
                                  <td className="p-2 text-neutral-100">{g.creatorDare?.description || '-'}</td>
                                  <td className="p-2 text-neutral-400">{g.creator?.fullName || g.creator?.username || 'Unknown'}</td>
                                  <td className="p-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${g.status === 'pending' ? 'bg-warning text-warning-contrast' : g.status === 'approved' ? 'bg-success text-success-contrast' : g.status === 'waiting_for_participant' ? 'bg-success text-success-contrast' : 'bg-danger text-danger-contrast'}`}>{g.status === 'waiting_for_participant' ? 'Waiting for Participant' : g.status}</span>
                                  </td>
                                  <td className="p-2 text-neutral-400">{g.creatorDare?.difficulty || '-'}</td>
                                  <td className="p-2 space-x-2">
                                    <button className="bg-danger text-danger-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-danger-dark shadow-lg" disabled={actionLoading} onClick={() => handleDeleteDare({ ...g, isSwitchGame: true })} aria-label={`Delete switch game ${g._id}`}>Delete</button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <div className="flex justify-center gap-2 mt-4">
                          <button onClick={() => setSwitchGamePage(p => Math.max(0, p - 1))} disabled={switchGamePage === 0} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Previous</button>
                          <span className="text-neutral-300">Page {switchGamePage + 1} of {Math.max(1, Math.ceil(switchGames.filter(g => (g.creatorDare?.description && g.creatorDare.description.toLowerCase().includes(switchGameSearch.toLowerCase())) || (g.creator?.username && g.creator.username.toLowerCase().includes(switchGameSearch.toLowerCase())) || (g._id && g._id.toLowerCase().includes(switchGameSearch.toLowerCase()))).length / SWITCH_GAMES_PER_PAGE))}</span>
                          <button onClick={() => setSwitchGamePage(p => p + 1)} disabled={(switchGamePage + 1) * SWITCH_GAMES_PER_PAGE >= switchGames.filter(g => (g.creatorDare?.description && g.creatorDare.description.toLowerCase().includes(switchGameSearch.toLowerCase())) || (g.creator?.username && g.creator.username.toLowerCase().includes(switchGameSearch.toLowerCase())) || (g._id && g._id.toLowerCase().includes(switchGameSearch.toLowerCase()))).length} className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-800">Next</button>
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Stats',
                content: (
                  siteStatsLoading ? (
                    <div className="text-neutral-400">Loading site stats...</div>
                  ) : siteStatsError ? (
                    <div className="text-danger-500">{siteStatsError}</div>
                  ) : siteStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <Card className="shadow-lg hover:transition-all duration-200">
                        <div className="text-lg font-semibold text-neutral-700">Total Users</div>
                        <div className="text-2xl font-bold text-primary">{siteStats.totalUsers}</div>
                      </Card>
                      <Card className="shadow-lg hover:transition-all duration-200">
                        <div className="text-lg font-semibold text-neutral-700">Total Dares</div>
                        <div className="text-2xl font-bold text-primary">{siteStats.totalDares}</div>
                      </Card>
                      <Card className="shadow-lg hover:transition-all duration-200">
                        <div className="text-lg font-semibold text-neutral-700">Total Comments</div>
                        <div className="text-2xl font-bold text-primary">{siteStats.totalComments}</div>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-neutral-400">No site stats available.</div>
                  )
                ),
              },
              {
                label: 'Audit Log',
                content: (
                  <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <input
                          className="border border-neutral-900 rounded px-3 py-1 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                          placeholder="Search audit log..."
                          value={auditLogSearch}
                          onChange={e => setAuditLogSearch(e.target.value)}
                        />
                      <button
                          className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded text-sm border border-neutral-300 hover:bg-neutral-300"
                          onClick={() => exportToCsv('audit_log.csv', auditLog)}
                      >
                        Export CSV
                      </button>
                      <button
                          className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded text-sm border border-neutral-300 hover:bg-neutral-300"
                          onClick={() => exportToCsv('audit_log_all.csv', auditLog)}
                      >
                        Export All
                      </button>
                    </div>
                      <div className="overflow-x-auto rounded ">
                        <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                          <caption className="sr-only">Audit Log</caption>
                          <thead>
                            <tr className="bg-neutral-900 text-primary">
                              <th scope="col" className="p-2 text-left font-semibold">Action</th>
                              <th scope="col" className="p-2 text-left font-semibold">User</th>
                              <th scope="col" className="p-2 text-left font-semibold">Target</th>
                              <th scope="col" className="p-2 text-left font-semibold">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLog
                              .filter(log =>
                              log.action.toLowerCase().includes(auditLogSearch.toLowerCase()) ||
                              (log.user?.fullName || log.user?.username || '').toLowerCase().includes(auditLogSearch.toLowerCase()) ||
                              (log.target || '').toLowerCase().includes(auditLogSearch.toLowerCase())
                              )
                              .slice(auditLogPage * AUDIT_LOGS_PER_PAGE, (auditLogPage + 1) * AUDIT_LOGS_PER_PAGE)
                            .map((log, i) => (
                                <tr key={i} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                  <td className="p-2 font-medium text-primary">{log.action}</td>
                                  <td className="p-2 text-neutral-400">{log.user?.fullName || log.user?.username || 'Unknown'}</td>
                                  <td className="p-2 text-neutral-400">{log.target}</td>
                                  <td className="p-2 text-neutral-400">{new Date(log.timestamp).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    {/* Pagination and other controls can be similarly refactored */}
                  </div>
                ),
              },
              {
                label: 'Reports',
                content: (
                  <div>
                    {reportsLoading ? (
                      <div className="text-neutral-400">Loading reports...</div>
                    ) : reportsError ? (
                      <div className="text-danger-500">{reportsError}</div>
                    ) : (
                      <div className="overflow-x-auto rounded ">
                        <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                          <caption className="sr-only">Reports</caption>
                          <thead>
                            <tr className="bg-neutral-900 text-primary">
                              <th scope="col" className="p-2 text-left font-semibold">Type</th>
                              <th scope="col" className="p-2 text-left font-semibold">Target ID</th>
                              <th scope="col" className="p-2 text-left font-semibold">Reporter</th>
                              <th scope="col" className="p-2 text-left font-semibold">Reason</th>
                              <th scope="col" className="p-2 text-left font-semibold">Status</th>
                              <th scope="col" className="p-2 text-left font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map(r => (
                              <tr key={r._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2 font-medium text-primary">{r.type}</td>
                                <td className="p-2 text-neutral-400">{r.targetId}</td>
                                <td className="p-2 text-neutral-400">{r.reporter?.fullName || r.reporter?.username || r.reporter?.email || 'Unknown'}</td>
                                <td className="p-2 text-neutral-400">{r.reason}</td>
                                <td className="p-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${r.status === 'open' ? 'bg-warning text-warning-contrast' : 'bg-success text-success-contrast'}`}>{r.status}</span>
                                </td>
                                <td className="p-2">
                                  {r.status === 'open' && (
                                    <button
                                      className="bg-success text-success-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-success-dark"
                                      disabled={resolvingReportId === r._id}
                                      onClick={() => handleResolveReport(r._id)}
                                    >
                                      {resolvingReportId === r._id ? 'Resolving...' : 'Resolve'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Appeals',
                content: (
                  <div>
                    {appealsLoading ? (
                      <div className="text-neutral-400">Loading appeals...</div>
                    ) : appealsError ? (
                      <div className="text-danger-500">{appealsError}</div>
                    ) : (
                      <div className="overflow-x-auto rounded ">
                        <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900" role="table">
                          <caption className="sr-only">Appeals</caption>
                          <thead>
                            <tr className="bg-neutral-900 text-primary">
                              <th scope="col" className="p-2 text-left font-semibold">Type</th>
                              <th scope="col" className="p-2 text-left font-semibold">Target ID</th>
                              <th scope="col" className="p-2 text-left font-semibold">User</th>
                              <th scope="col" className="p-2 text-left font-semibold">Reason</th>
                              <th scope="col" className="p-2 text-left font-semibold">Status</th>
                              <th scope="col" className="p-2 text-left font-semibold">Outcome</th>
                              <th scope="col" className="p-2 text-left font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appeals.map(a => (
                              <tr key={a._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2 font-medium text-primary">{a.type}</td>
                                <td className="p-2 text-neutral-400">{a.targetId}</td>
                                <td className="p-2 text-neutral-400">{a.user?.username || a.user?.email || 'Unknown'}</td>
                                <td className="p-2 text-neutral-400">{a.reason}</td>
                                <td className="p-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${a.status === 'open' ? 'bg-warning text-warning-contrast' : 'bg-success text-success-contrast'}`}>{a.status}</span>
                                </td>
                                <td className="p-2 text-neutral-400">{a.outcome || '-'}</td>
                                <td className="p-2">
                                  {a.status === 'open' && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        className="border border-neutral-900 rounded px-2 py-1 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
                                        placeholder="Outcome (required)"
                                        value={resolvingAppealId === a._id ? appealOutcome : ''}
                                        onChange={e => setAppealOutcome(e.target.value)}
                                        style={{ width: 120 }}
                                        disabled={resolvingAppealId !== a._id}
                                      />
                                      <button
                                        className="bg-success text-success-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-success-dark"
                                        disabled={resolvingAppealId === a._id && !appealOutcome}
                                        onClick={() => handleResolveAppeal(a._id)}
                                      >
                                        {resolvingAppealId === a._id ? 'Resolving...' : 'Resolve'}
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
            value={tabIdx}
            onChange={setTabIdx}
          />
        </div>
      </main>
      {/* Modal styling to match DareReveal */}
      <Modal
        open={!!editUserId}
        onClose={closeEditUserModal}
        title={null}
        actions={null}
        size="sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-sm mx-auto bg-neutral-800 border border-neutral-700 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-primary">Edit User</h1>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditUserSave(); }}>
            <div>
              <label htmlFor="edit-username" className="block font-semibold mb-1 text-primary">Username</label>
              <input
                type="text"
                name="username"
                id="edit-username"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
                value={editUserData.username}
                onChange={handleEditUserChange}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block font-semibold mb-1 text-primary">Email</label>
              <input
                type="email"
                name="email"
                id="edit-email"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
                value={editUserData.email}
                onChange={handleEditUserChange}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-role" className="block font-semibold mb-1 text-primary">Role</label>
              <input
                type="text"
                name="role"
                id="edit-role"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
                value={editUserData.role}
                onChange={handleEditUserChange}
              />
            </div>
            {editUserError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{editUserError}</div>}
            <div className="flex gap-2 mt-4">
              <button type="button" className="w-1/2 bg-neutral-700 text-neutral-100 px-4 py-2 rounded font-semibold shadow-lg" onClick={closeEditUserModal} disabled={editUserLoading}>Cancel</button>
              <button type="submit" className="w-1/2 bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast shadow-lg" disabled={editUserLoading}>{editUserLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 