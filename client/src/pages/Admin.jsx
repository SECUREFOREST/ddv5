import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Tabs from '../components/Tabs';
import Card from '../components/Card';

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [acts, setActs] = useState([]);
  const [actsLoading, setActsLoading] = useState(true);
  const [siteStats, setSiteStats] = useState(null);
  const [siteStatsLoading, setSiteStatsLoading] = useState(true);
  const [siteStatsError, setSiteStatsError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [actSearch, setActSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const USERS_PER_PAGE = 10;
  const [actPage, setActPage] = useState(0);
  const ACTS_PER_PAGE = 10;
  const [selectedUsers, setSelectedUsers] = useState([]);
  const allFilteredUserIds = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
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
  const [selectedActs, setSelectedActs] = useState([]);
  const allFilteredActIds = acts.filter(a =>
    a.title.toLowerCase().includes(actSearch.toLowerCase()) ||
    (a.creator?.username || '').toLowerCase().includes(actSearch.toLowerCase())
  ).map(a => a._id);
  const isAllActsSelected = allFilteredActIds.length > 0 && allFilteredActIds.every(id => selectedActs.includes(id));
  const toggleAllActs = () => {
    if (isAllActsSelected) setSelectedActs(selectedActs.filter(id => !allFilteredActIds.includes(id)));
    else setSelectedActs([...new Set([...selectedActs, ...allFilteredActIds])]);
  };
  const toggleAct = (id) => {
    setSelectedActs(selectedActs.includes(id)
      ? selectedActs.filter(aid => aid !== id)
      : [...selectedActs, id]);
  };
  const clearSelectedActs = () => setSelectedActs([]);
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

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  const fetchActs = () => {
    setActsLoading(true);
    api.get('/acts')
      .then(res => setActs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActs([]))
      .finally(() => setActsLoading(false));
  };

  const fetchReports = () => {
    setReportsLoading(true);
    setReportsError('');
    api.get('/reports')
      .then(res => setReports(Array.isArray(res.data) ? res.data : []))
      .catch(() => setReportsError('Failed to load reports.'))
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
    setAppealsError('');
    api.get('/appeals')
      .then(res => setAppeals(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAppealsError('Failed to load appeals.'))
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

  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (tabIdx === 1) fetchActs();
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

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch {}
    setActionLoading(false);
  };

  const handleAdjustCredits = async (userId, currentCredits) => {
    const value = window.prompt('Enter new credit value:', currentCredits);
    if (value === null) return;
    const credits = parseInt(value, 10);
    if (isNaN(credits)) return alert('Invalid number');
    setActionLoading(true);
    try {
      await api.put(`/credits/${userId}`, { credits });
      fetchUsers();
    } catch {}
    setActionLoading(false);
  };

  const handleApprove = async (actId) => {
    setActionLoading(true);
    try {
      await api.post(`/acts/${actId}/approve`);
      fetchActs();
    } catch {}
    setActionLoading(false);
  };
  const handleReject = async (actId) => {
    setActionLoading(true);
    try {
      await api.post(`/acts/${actId}/reject`);
      fetchActs();
    } catch {}
    setActionLoading(false);
  };
  const handleDeleteAct = async (actId) => {
    if (!window.confirm('Delete this act?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/acts/${actId}`);
      fetchActs();
    } catch {}
    setActionLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
      <Tabs
        tabs={[
          {
            label: 'Users',
            content: (
              <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input
                      className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                    <select className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400" value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    disabled={selectedUsers.length === 0 || actionLoading}
                    onClick={async () => {
                      if (!window.confirm('Delete selected users?')) return;
                      setActionLoading(true);
                      for (const id of selectedUsers) {
                        try { await api.delete(`/users/${id}`); } catch {}
                      }
                      fetchUsers();
                      clearSelectedUsers();
                      setActionLoading(false);
                    }}
                  >
                    Delete Selected
                  </button>
                  <button
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    disabled={selectedUsers.length === 0 || actionLoading}
                    onClick={async () => {
                      const value = window.prompt('Enter new credit value for selected users:');
                      if (value === null) return;
                      setActionLoading(true);
                      for (const id of selectedUsers) {
                          try { await api.put(`/credits/${id}`, { credits: parseInt(value, 10) }); } catch {}
                      }
                      fetchUsers();
                      clearSelectedUsers();
                      setActionLoading(false);
                    }}
                  >
                      Adjust Credits
                  </button>
                  <button
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-300"
                      onClick={() => exportToCsv('users.csv', users)}
                  >
                    Export CSV
                  </button>
                </div>
                  <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full bg-white text-sm">
                          <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2"><input type="checkbox" checked={isAllSelected} onChange={toggleAll} /></th>
                          <th className="p-2 text-left">Username</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Credits</th>
                          <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                        {users
                          .filter(u =>
                            (userStatusFilter === 'all' || (userStatusFilter === 'active' ? u.active : !u.active)) &&
                              (u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                              u.email.toLowerCase().includes(userSearch.toLowerCase()))
                          )
                          .slice(userPage * USERS_PER_PAGE, (userPage + 1) * USERS_PER_PAGE)
                          .map(u => (
                            <tr key={u._id} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="p-2"><input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => toggleUser(u._id)} /></td>
                              <td className="p-2">{u.username}</td>
                              <td className="p-2">{u.email}</td>
                              <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${u.active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                              <td className="p-2">{u.credits}</td>
                              <td className="p-2 space-x-2">
                                <button className="bg-red-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50" disabled={actionLoading} onClick={() => handleDelete(u._id)}>Delete</button>
                                <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50" disabled={actionLoading} onClick={() => handleAdjustCredits(u._id, u.credits)}>Adjust Credits</button>
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
            label: 'Acts',
            content: (
              <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input
                      className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="Search acts..."
                      value={actSearch}
                      onChange={e => setActSearch(e.target.value)}
                    />
                  <button
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    disabled={selectedActs.length === 0 || actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      for (const id of selectedActs) {
                        const act = acts.find(a => a._id === id);
                        if (act?.status === 'pending') {
                          try { await api.post(`/acts/${id}/approve`); } catch {}
                        }
                      }
                      fetchActs();
                      clearSelectedActs();
                      setActionLoading(false);
                    }}
                  >
                    Approve Selected
                  </button>
                  <button
                      className="bg-yellow-400 text-gray-900 px-3 py-1 rounded text-sm disabled:opacity-50"
                    disabled={selectedActs.length === 0 || actionLoading}
                    onClick={async () => {
                      setActionLoading(true);
                      for (const id of selectedActs) {
                        const act = acts.find(a => a._id === id);
                        if (act?.status === 'pending') {
                          try { await api.post(`/acts/${id}/reject`); } catch {}
                        }
                      }
                      fetchActs();
                      clearSelectedActs();
                      setActionLoading(false);
                    }}
                  >
                    Reject Selected
                  </button>
                  <button
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                    disabled={selectedActs.length === 0 || actionLoading}
                    onClick={async () => {
                      if (!window.confirm('Delete selected acts?')) return;
                      setActionLoading(true);
                      for (const id of selectedActs) {
                        try { await api.delete(`/acts/${id}`); } catch {}
                      }
                      fetchActs();
                      clearSelectedActs();
                      setActionLoading(false);
                    }}
                  >
                    Delete Selected
                  </button>
                  <button
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-300"
                      onClick={() => exportToCsv('acts.csv', acts)}
                  >
                    Export CSV
                  </button>
                </div>
                  <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full bg-white text-sm">
                          <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2"><input type="checkbox" checked={isAllActsSelected} onChange={toggleAllActs} /></th>
                          <th className="p-2 text-left">Title</th>
                          <th className="p-2 text-left">Creator</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Difficulty</th>
                          <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                        {acts
                          .filter(a =>
                              a.title.toLowerCase().includes(actSearch.toLowerCase()) ||
                              (a.creator?.username || '').toLowerCase().includes(actSearch.toLowerCase())
                          )
                          .slice(actPage * ACTS_PER_PAGE, (actPage + 1) * ACTS_PER_PAGE)
                          .map(a => (
                            <tr key={a._id} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="p-2"><input type="checkbox" checked={selectedActs.includes(a._id)} onChange={() => toggleAct(a._id)} /></td>
                              <td className="p-2">{a.title}</td>
                              <td className="p-2">{a.creator?.username || 'Unknown'}</td>
                              <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : a.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{a.status}</span></td>
                              <td className="p-2">{a.difficulty}</td>
                              <td className="p-2 space-x-2">
                                {a.status === 'pending' && (
                                    <>
                                    <button className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50" disabled={actionLoading} onClick={() => handleApprove(a._id)}>Approve</button>
                                    <button className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs disabled:opacity-50" disabled={actionLoading} onClick={() => handleReject(a._id)}>Reject</button>
                                    </>
                                  )}
                                <button className="bg-red-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50" disabled={actionLoading} onClick={() => handleDeleteAct(a._id)}>Delete</button>
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
                <div className="text-gray-500">Loading site stats...</div>
              ) : siteStatsError ? (
                <div className="text-red-500">{siteStatsError}</div>
              ) : siteStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <div className="text-lg font-semibold text-gray-700">Total Users</div>
                    <div className="text-2xl font-bold text-blue-700">{siteStats.totalUsers}</div>
                  </Card>
                  <Card>
                    <div className="text-lg font-semibold text-gray-700">Total Acts</div>
                    <div className="text-2xl font-bold text-blue-700">{siteStats.totalActs}</div>
                  </Card>
                  <Card>
                    <div className="text-lg font-semibold text-gray-700">Total Comments</div>
                    <div className="text-2xl font-bold text-blue-700">{siteStats.totalComments}</div>
                  </Card>
                  <Card>
                    <div className="text-lg font-semibold text-gray-700">Total Credits Awarded</div>
                    <div className="text-2xl font-bold text-blue-700">{siteStats.totalCredits}</div>
                  </Card>
                </div>
              ) : (
                <div className="text-gray-500">No site stats available.</div>
              )
            ),
          },
          {
            label: 'Audit Log',
            content: (
              <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input
                      className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400"
                      placeholder="Search audit log..."
                      value={auditLogSearch}
                      onChange={e => setAuditLogSearch(e.target.value)}
                    />
                  <button
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-300"
                      onClick={() => exportToCsv('audit_log.csv', auditLog)}
                  >
                    Export CSV
                  </button>
                  <button
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-300"
                      onClick={() => exportToCsv('audit_log_all.csv', auditLog)}
                  >
                    Export All
                  </button>
                </div>
                  <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full bg-white text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2 text-left">Action</th>
                          <th className="p-2 text-left">User</th>
                          <th className="p-2 text-left">Target</th>
                          <th className="p-2 text-left">Timestamp</th>
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
                            <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="p-2">{log.action}</td>
                              <td className="p-2">{log.user?.username || 'System'}</td>
                              <td className="p-2">{log.target}</td>
                              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
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
                  <div className="text-gray-500">Loading reports...</div>
                ) : reportsError ? (
                  <div className="text-red-500">{reportsError}</div>
                ) : (
                  <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full bg-white text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Target ID</th>
                          <th className="p-2 text-left">Reporter</th>
                          <th className="p-2 text-left">Reason</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(r => (
                          <tr key={r._id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="p-2">{r.type}</td>
                            <td className="p-2">{r.targetId}</td>
                            <td className="p-2">{r.reporter?.username || r.reporter?.email || 'Unknown'}</td>
                            <td className="p-2">{r.reason}</td>
                            <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${r.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{r.status}</span></td>
                            <td className="p-2">
                              {r.status === 'open' && (
                                <button
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
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
                  <div className="text-gray-500">Loading appeals...</div>
                ) : appealsError ? (
                  <div className="text-red-500">{appealsError}</div>
                ) : (
                  <div className="overflow-x-auto rounded shadow">
                    <table className="min-w-full bg-white text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-left">Target ID</th>
                          <th className="p-2 text-left">User</th>
                          <th className="p-2 text-left">Reason</th>
                          <th className="p-2 text-left">Status</th>
                          <th className="p-2 text-left">Outcome</th>
                          <th className="p-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appeals.map(a => (
                          <tr key={a._id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="p-2">{a.type}</td>
                            <td className="p-2">{a.targetId}</td>
                            <td className="p-2">{a.user?.username || a.user?.email || 'Unknown'}</td>
                            <td className="p-2">{a.reason}</td>
                            <td className="p-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${a.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{a.status}</span></td>
                            <td className="p-2">{a.outcome || '-'}</td>
                            <td className="p-2">
                              {a.status === 'open' && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring focus:border-blue-400"
                                    placeholder="Outcome (required)"
                                    value={resolvingAppealId === a._id ? appealOutcome : ''}
                                    onChange={e => setAppealOutcome(e.target.value)}
                                    style={{ width: 120 }}
                                    disabled={resolvingAppealId !== a._id}
                                  />
                                  <button
                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
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
    </div>
  );
} 