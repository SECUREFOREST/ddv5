import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

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
      <div className="max-w-lg mx-auto mt-20 p-8 bg-[#222] border border-[#282828] rounded shadow text-center text-danger text-xl font-bold">
        Access Denied: Admins Only
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
    d && typeof d.title === 'string' && d.title.toLowerCase().includes(dareSearch.toLowerCase()) ||
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

  // State for user edit modal
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', role: '' });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [deleteUserError, setDeleteUserError] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = () => {
    setDataLoading(true);
    setError('');
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
    try {
      await api.post(`/dares/${dareId}/approve`);
      fetchDares();
    } catch (err) {
      alert('Failed to approve dare.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async (dareId) => {
    setActionLoading(true);
    try {
      await api.post(`/dares/${dareId}/reject`);
      fetchDares();
    } catch (err) {
      alert('Failed to reject dare.');
    } finally {
      setActionLoading(false);
    }
  };
  const handleDeleteDare = async (dareId) => {
    if (!window.confirm('Delete this dare?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/dares/${dareId}`);
      fetchDares();
    } catch (err) {
      alert('Failed to delete dare.');
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
  }, [tabIdx]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setActionLoading(true);
    setDeleteUserError('');
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setDeleteUserError(err.response?.data?.error || 'Failed to delete user');
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
    try {
      // Only send editable fields
      const { username, email, role, roles } = editUserData;
      const payload = { username, email };
      if (roles) payload.roles = roles;
      if (role) payload.role = role;
      await api.patch(`/users/${editUserId}`, payload);
      fetchUsers();
      closeEditUserModal();
    } catch (err) {
      setEditUserError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Error display at the top */}
      {error && (
        <div className="text-danger text-sm font-medium mb-2" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
      <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 w-full">
        <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <Tabs
          tabs={[
            {
              label: 'Users',
              content: (
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <input
                        className="border border-neutral-900 rounded px-3 py-1 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                      />
                      <button
                        className="bg-primary text-primary-contrast px-3 py-1 rounded text-sm font-semibold hover:bg-primary-dark"
                        onClick={handleUserSearch}
                      >
                        Search
                      </button>
                    </div>
                    {deleteUserError && (
                      <div className="mb-4 text-danger text-sm font-semibold" role="alert" aria-live="assertive">{deleteUserError}</div>
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
                          ).slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE).map((u) => (
                            <tr key={u._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                              <td className="p-2 font-medium text-primary">{u.username}</td>
                              <td className="p-2 text-neutral-400">{u.email}</td>
                              <td className="p-2 text-info font-bold">{u.role}</td>
                              <td className="p-2">
                                {u.active ? <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold">Active</span> : <span className="inline-block bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold">Inactive</span>}
                              </td>
                              <td className="p-2">
                                <button className="bg-warning text-warning-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-warning-dark mr-2" onClick={() => handleEditUser(u._id)}>Edit</button>
                                <button className="bg-danger text-danger-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-danger-dark" onClick={() => handleDeleteUser(u._id)}>Delete</button>
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
                        for (const id of selectedDares) {
                          const dare = dares.find(d => d._id === id);
                          if (dare?.status === 'pending') {
                            try { await api.post(`/dares/${id}/approve`); } catch {}
                          }
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
                      }}
                    >
                      Approve Selected
                    </button>
                    <button
                        className="bg-warning text-warning-contrast px-3 py-1 rounded text-sm font-semibold hover:bg-warning-dark"
                      disabled={selectedDares.length === 0 || actionLoading}
                      onClick={async () => {
                        setActionLoading(true);
                        for (const id of selectedDares) {
                          const dare = dares.find(d => d._id === id);
                          if (dare?.status === 'pending') {
                            try { await api.post(`/dares/${id}/reject`); } catch {}
                          }
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
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
                        for (const id of selectedDares) {
                          try { await api.delete(`/dares/${id}`); } catch {}
                        }
                        fetchDares();
                        clearSelectedDares();
                        setActionLoading(false);
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
                            <th className="p-2 text-left font-semibold">Title</th>
                            <th className="p-2 text-left font-semibold">Creator</th>
                            <th className="p-2 text-left font-semibold">Status</th>
                            <th className="p-2 text-left font-semibold">Difficulty</th>
                            <th className="p-2 text-left font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                          {dares
                            .filter(d =>
                              (d && typeof d.title === 'string' && d.title.toLowerCase().includes(dareSearch.toLowerCase())) ||
                              (d && d.creator?.username && d.creator.username.toLowerCase().includes(dareSearch.toLowerCase()))
                            )
                            .slice(darePage * DARES_PER_PAGE, (darePage + 1) * DARES_PER_PAGE)
                            .map(d => (
                              <tr key={d?._id || Math.random()} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                                <td className="p-2"><input type="checkbox" checked={selectedDares.includes(d?._id)} onChange={() => toggleDare(d?._id)} /></td>
                                <td className="p-2 font-medium text-primary">{d && typeof d.title === 'string' ? d.title : '-'}</td>
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
                    <Card>
                      <div className="text-lg font-semibold text-neutral-700">Total Users</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalUsers}</div>
                    </Card>
                    <Card>
                      <div className="text-lg font-semibold text-neutral-700">Total Dares</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalDares}</div>
                    </Card>
                    <Card>
                      <div className="text-lg font-semibold text-neutral-700">Total Comments</div>
                      <div className="text-2xl font-bold text-primary">{siteStats.totalComments}</div>
                    </Card>
                    <Card>
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
                                      className="border border-neutral-900 rounded px-2 py-1 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
      <Modal
        open={!!editUserId}
        onClose={closeEditUserModal}
        title={null}
        actions={null}
        size="sm"
        role="dialog"
        aria-modal="true"
      >
        <div className="max-w-sm mx-auto bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px]">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Edit User</h1>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleEditUserSave(); }}>
            <div>
              <label htmlFor="edit-username" className="block font-semibold mb-1 text-primary">Username</label>
              <input
                type="text"
                name="username"
                id="edit-username"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                value={editUserData.role}
                onChange={handleEditUserChange}
              />
            </div>
            {editUserError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{editUserError}</div>}
            <div className="flex gap-2 mt-4">
              <button type="button" className="w-1/2 bg-neutral-700 text-neutral-100 px-4 py-2 rounded font-semibold" onClick={closeEditUserModal} disabled={editUserLoading}>Cancel</button>
              <button type="submit" className="w-1/2 bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" disabled={editUserLoading}>{editUserLoading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 