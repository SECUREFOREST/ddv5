import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

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
      <div className="max-w-xl w-full mx-auto mt-12 sm:mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-8 mb-8 overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-between h-16 mb-2 px-6 rounded-t-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-danger tracking-tight flex items-center gap-2">
            <ShieldCheckIcon className="w-7 h-7 text-danger" aria-hidden="true" /> Admin Panel
            <span className="inline-flex items-center gap-2 bg-danger/90 border border-danger text-danger-contrast rounded-full px-4 py-1 font-bold shadow ml-4 text-base animate-fade-in">
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

  const fetchUsers = () => {
    setDataLoading(true);
    setError('');
    setSuccess('');
    api.get('/users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setUsers([]);
        setError(err.response?.data?.error || 'Failed to load users.');
      })
      .finally(() => setDataLoading(false));
  };

  const fetchDares = () => {
    setDaresLoading(true);
    setError('');
    setSuccess('');
    api.get('/dares')
      .then(res => setDares(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        setDares([]);
        setError(err.response?.data?.error || 'Failed to load dares.');
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
        setError(err.response?.data?.error || 'Failed to load reports.');
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
        setError(err.response?.data?.error || 'Failed to load appeals.');
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
      setSuccess('Dare approved successfully!');
      fetchDares();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve dare.');
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
      setSuccess('Dare rejected successfully!');
      fetchDares();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject dare.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteDare = async (dareId) => {
    if (!window.confirm('Delete this dare?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/dares/${dareId}`);
      setSuccess('Dare deleted successfully!');
      fetchDares();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete dare.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (tabIdx === 1) fetchDares();
    if (tabIdx === 2) {
      setSiteStatsLoading(true);
      setSiteStatsError('');
      api.get('/stats/site')
        .then(res => setSiteStats(res.data))
        .catch(() => setSiteStatsError('Failed to load site stats.'))
        .finally(() => setSiteStatsLoading(false));
    }
    if (tabIdx === 3) {
      setAuditLogLoading(true);
      setAuditLogError('');
      api.get('/audit-log')
        .then(res => setAuditLog(Array.isArray(res.data) ? res.data : []))
        .catch(() => setAuditLogError('Failed to load audit log.'))
        .finally(() => setAuditLogLoading(false));
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
      setSuccess('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
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
      setSuccess('User updated successfully!');
      fetchUsers();
      closeEditUserModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto mt-12 sm:mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-8 mb-8 overflow-hidden flex flex-col min-h-[70vh]">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-between h-16 mb-2 px-6 rounded-t-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <ShieldCheckIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Admin Panel
          <span className="inline-flex items-center gap-2 bg-danger/90 border border-danger text-danger-contrast rounded-full px-4 py-1 font-bold shadow ml-4 text-base animate-fade-in">
            <ShieldCheckIcon className="w-5 h-5" /> Admin Only
          </span>
        </h1>
      </div>
      <div className="border-t border-neutral-800 my-4 w-full" />
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
      {/* Card-like section for tab content */}
      <div className="p-4 bg-neutral-900 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
        <Tabs
          tabs={[
            {
              label: 'Users',
              content: (
                <div>
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 mb-4 shadow-sm w-full max-w-md mx-auto">
                      <svg className="w-5 h-5 text-neutral-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-neutral-100 placeholder-neutral-400"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        aria-label="Search users"
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
                    {/* Show loading spinner or skeleton when data is loading */}
                    {dataLoading && (
                      <div className="flex justify-center items-center py-8">
                        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span className="ml-3 text-neutral-300">Loading users...</span>
                      </div>
                    )}
                    <div className="overflow-x-auto rounded shadow">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th className="p-2 text-left font-semibold">Username</th>
                            <th className="p-2 text-left font-semibold">Email</th>
                            <th className="p-2 text-left font-semibold">Role</th>
                            <th className="p-2 text-left font-semibold">Status</th>
                            <th className="p-2 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter(u =>
                            (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
                            (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          ).slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE).map((user, idx) => (
                            <tr
                              key={user._id}
                              className={`transition-colors duration-100 ${idx % 2 === 0 ? 'bg-neutral-900/80' : 'bg-neutral-800'} hover:bg-neutral-700 group`}
                            >
                              <td className="p-2 text-primary font-semibold">
                                <a href={`/profile/${user._id}`} className="underline hover:text-danger focus:text-danger transition-colors" tabIndex={0} aria-label={`View profile for ${user.username}`}>{user.username}</a>
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
                                <button className="bg-warning text-warning-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-warning-dark mr-2 focus:outline-none focus:ring-2 focus:ring-warning" onClick={() => handleEditUser(user._id)} aria-label={`Edit user ${user.username}`}>Edit</button>
                                <button className="bg-danger text-danger-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-danger-dark disabled:opacity-60 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-danger" onClick={() => handleDeleteUser(user._id)} disabled={actionLoading} aria-label={`Delete user ${user.username}`}>
                                  {actionLoading ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : null}
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              ),
            },
            {
              label: 'Dares',
              content: (
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <input
                        className="border border-neutral-900 rounded px-3 py-1 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                        placeholder="Search dares..."
                        value={dareSearch}
                        onChange={e => setDareSearch(e.target.value)}
                      />
                    <button
                        className="bg-primary text-primary-contrast px-3 py-1 rounded text-sm font-semibold hover:bg-primary-dark"
                      disabled={selectedDares.length === 0 || actionLoading}
                      onClick={async () => {
                        setActionLoading(true);
                        let success = 0, fail = 0;
                        for (const id of selectedDares) {
                          const dare = dares.find(d => d._id === id);
                          if (dare?.status === 'pending') {
                            try { await api.post(`/dares/${id}/approve`); success++; } catch { fail++; }
                          }
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
                        if (success > 0) alert(`${success} dare(s) approved.`);
                        if (fail > 0) alert(`${fail} dare(s) failed to approve.`);
                      }}
                    >
                      Approve Selected
                    </button>
                    <button
                        className="bg-warning text-warning-contrast px-3 py-1 rounded text-sm font-semibold hover:bg-warning-dark"
                      disabled={selectedDares.length === 0 || actionLoading}
                      onClick={async () => {
                        setActionLoading(true);
                        let success = 0, fail = 0;
                        for (const id of selectedDares) {
                          const dare = dares.find(d => d._id === id);
                          if (dare?.status === 'pending') {
                            try { await api.post(`/dares/${id}/reject`); success++; } catch { fail++; }
                          }
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
                        if (success > 0) alert(`${success} dare(s) rejected.`);
                        if (fail > 0) alert(`${fail} dare(s) failed to reject.`);
                      }}
                    >
                      Reject Selected
                    </button>
                    <button
                        className="bg-danger text-danger-contrast px-3 py-1 rounded text-sm font-semibold hover:bg-danger-dark"
                      disabled={selectedDares.length === 0 || actionLoading}
                      onClick={async () => {
                        if (!window.confirm('Delete selected dares?')) return;
                        setActionLoading(true);
                        let success = 0, fail = 0;
                        for (const id of selectedDares) {
                          try { await api.delete(`/dares/${id}`); success++; } catch { fail++; }
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
                        if (success > 0) alert(`${success} dare(s) deleted.`);
                        if (fail > 0) alert(`${fail} dare(s) failed to delete.`);
                      }}
                    >
                      Delete Selected
                    </button>
                    <button
                        className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded text-sm border border-neutral-300 hover:bg-neutral-300"
                        onClick={() => exportToCsv('dares.csv', dares)}
                    >
                      Export CSV
                    </button>
                  </div>
                    <div className="overflow-x-auto rounded shadow">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
                            <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th className="p-2"><input type="checkbox" checked={isAllDaresSelected} onChange={toggleAllDares} /></th>
                            <th className="p-2 text-left font-semibold">Description</th>
                            <th className="p-2 text-left font-semibold">Creator</th>
                            <th className="p-2 text-left font-semibold">Status</th>
                            <th className="p-2 text-left font-semibold">Difficulty</th>
                            <th className="p-2 text-left font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                          {dares
                            .filter(d =>
                              (d && typeof d.description === 'string' && d.description.toLowerCase().includes(dareSearch.toLowerCase())) ||
                              (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))
                            )
                            .slice(darePage * DARES_PER_PAGE, (darePage + 1) * DARES_PER_PAGE)
                            .map(d => (
                              <tr key={d?._id || Math.random()} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2"><input type="checkbox" checked={selectedDares.includes(d?._id)} onChange={() => toggleDare(d?._id)} /></td>
                                <td className="p-2 font-medium text-primary">{d && typeof d.description === 'string' ? d.description : '-'}</td>
                                <td className="p-2 text-neutral-400">{d && d.creator?.username ? d.creator.username : 'Unknown'}</td>
                                <td className="p-2">
                                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${d && d.status === 'pending' ? 'bg-warning text-warning-contrast' : d && d.status === 'approved' ? 'bg-success text-success-contrast' : d && d.status === 'waiting_for_participant' ? 'bg-success text-success-contrast' : 'bg-danger text-danger-contrast'}`}>{d && d.status === 'waiting_for_participant' ? 'Waiting for Participant' : d && d.status}</span>
                                </td>
                                <td className="p-2 text-neutral-400">{d && d.difficulty ? d.difficulty : '-'}</td>
                                <td className="p-2 space-x-2">
                                  {d && d.status === 'pending' && (
                                      <>
                                      <button className="bg-success text-success-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-success-dark" disabled={actionLoading} onClick={() => handleApprove(d._id)}>Approve</button>
                                      <button className="bg-warning text-warning-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-warning-dark" disabled={actionLoading} onClick={() => handleReject(d._id)}>Reject</button>
                                      </>
                                    )}
                                  <button className="bg-danger text-danger-contrast px-2 py-1 rounded text-xs font-semibold hover:bg-danger-dark" disabled={actionLoading} onClick={() => handleDeleteDare(d._id)}>Delete</button>
                                  </td>
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
              label: 'Stats',
              content: (
                siteStatsLoading ? (
                  <div className="text-neutral-400">Loading site stats...</div>
                ) : siteStatsError ? (
                  <div className="text-danger-500">{siteStatsError}</div>
                ) : siteStats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-200">
                      <div className="text-lg font-semibold text-neutral-700">Total Users</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalUsers}</div>
                    </Card>
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-200">
                      <div className="text-lg font-semibold text-neutral-700">Total Dares</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalDares}</div>
                    </Card>
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-200">
                      <div className="text-lg font-semibold text-neutral-700">Total Comments</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalComments}</div>
                    </Card>
                    <Card className="shadow-lg hover:shadow-2xl transition-all duration-200">
                      <div className="text-lg font-semibold text-neutral-700">Total Credits Awarded</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalCredits}</div>
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
                        className="border border-neutral-900 rounded px-3 py-1 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
                    <div className="overflow-x-auto rounded shadow">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th className="p-2 text-left font-semibold">Action</th>
                            <th className="p-2 text-left font-semibold">User</th>
                            <th className="p-2 text-left font-semibold">Target</th>
                            <th className="p-2 text-left font-semibold">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLog
                            .filter(log =>
                            log.action.toLowerCase().includes(auditLogSearch.toLowerCase()) ||
                            (log.user?.username || '').toLowerCase().includes(auditLogSearch.toLowerCase()) ||
                            (log.target || '').toLowerCase().includes(auditLogSearch.toLowerCase())
                            )
                            .slice(auditLogPage * AUDIT_LOGS_PER_PAGE, (auditLogPage + 1) * AUDIT_LOGS_PER_PAGE)
                          .map((log, i) => (
                              <tr key={i} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2 font-medium text-primary">{log.action}</td>
                                <td className="p-2 text-neutral-400">{log.user?.username || 'System'}</td>
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
                    <div className="overflow-x-auto rounded shadow">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th className="p-2 text-left font-semibold">Type</th>
                            <th className="p-2 text-left font-semibold">Target ID</th>
                            <th className="p-2 text-left font-semibold">Reporter</th>
                            <th className="p-2 text-left font-semibold">Reason</th>
                            <th className="p-2 text-left font-semibold">Status</th>
                            <th className="p-2 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map(r => (
                            <tr key={r._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                              <td className="p-2 font-medium text-primary">{r.type}</td>
                              <td className="p-2 text-neutral-400">{r.targetId}</td>
                              <td className="p-2 text-neutral-400">{r.reporter?.username || r.reporter?.email || 'Unknown'}</td>
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
                    <div className="overflow-x-auto rounded shadow">
                      <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
                        <thead>
                          <tr className="bg-neutral-900 text-primary">
                            <th className="p-2 text-left font-semibold">Type</th>
                            <th className="p-2 text-left font-semibold">Target ID</th>
                            <th className="p-2 text-left font-semibold">User</th>
                            <th className="p-2 text-left font-semibold">Reason</th>
                            <th className="p-2 text-left font-semibold">Status</th>
                            <th className="p-2 text-left font-semibold">Outcome</th>
                            <th className="p-2 text-left font-semibold">Actions</th>
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
        <div className="max-w-sm mx-auto bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-6">
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
              <button type="button" className="w-1/2 bg-neutral-700 text-neutral-100 px-4 py-2 rounded font-semibold" onClick={closeEditUserModal} disabled={editUserLoading}>Cancel</button>
              <button type="submit" className="w-1/2 bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast" disabled={editUserLoading}>{editUserLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 