import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

import Avatar from '../components/Avatar';
import { ShieldCheckIcon, MagnifyingGlassIcon, ChartBarIcon, UserGroupIcon, FireIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

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
  const { showSuccess, showError } = useToast();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ListSkeleton count={5} />
        </div>
      </div>
    );
  }
  
  if (!user || !user.roles?.includes('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                    <ShieldCheckIcon className="w-10 h-10 text-white" />
        </div>
                </div>
                <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
                <p className="text-red-300 text-lg">This area is restricted to administrators only.</p>
              </div>
            </div>
          </div>
        </div>
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
  const [userSearchId, setUserSearchId] = useState("");
  const [dareSearchId, setDareSearchId] = useState('');
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
  
  // Additional state for missing functionality
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [resolvingReportId, setResolvingReportId] = useState(null);
  
  const [appeals, setAppeals] = useState([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealsError, setAppealsError] = useState('');
  const [resolvingAppealId, setResolvingAppealId] = useState(null);
  const [appealOutcome, setAppealOutcome] = useState('');
  
  const [switchGames, setSwitchGames] = useState([]);
  const [switchGamesLoading, setSwitchGamesLoading] = useState(true);
  const [switchGameSearch, setSwitchGameSearch] = useState('');
  const [switchGameSearchId, setSwitchGameSearchId] = useState('');
  
  // User edit modal state
  const [editUserId, setEditUserId] = useState(null);
  const [editUserData, setEditUserData] = useState({ username: '', email: '', roles: [] });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');



  const fetchUsers = useCallback((searchId = "") => {
    setDataLoading(true);
    api.get('/users', { params: { search: searchId } })
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setUsers([]);
        showError('Failed to load users. Please try again.');
        console.error('Users loading error:', error);
      })
      .finally(() => setDataLoading(false));
  }, [showError]);

  const fetchDares = useCallback((searchId = "") => {
    setDaresLoading(true);
    api.get('/dares', { params: { search: searchId } })
      .then(res => {
        setDares(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setDares([]);
        showError('Failed to load dares. Please try again.');
        console.error('Dares loading error:', error);
      })
      .finally(() => setDaresLoading(false));
  }, [showError]);

  const fetchReports = useCallback(() => {
    setReportsLoading(true);
    setReportsError('');
    api.get('/reports')
      .then(res => {
        setReports(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setReports([]);
        if (error.response?.status === 401) {
          setReportsError('Access denied. You may not have permission to view reports.');
        } else {
          setReportsError('Failed to load reports. Please try again.');
          showError('Failed to load reports. Please try again.');
        }
        console.error('Reports loading error:', error);
      })
      .finally(() => setReportsLoading(false));
  }, [showError]);

  const handleResolveReport = async (id) => {
    try {
      await api.post(`/reports/${id}/resolve`);
      showSuccess('Report resolved successfully!');
      fetchReports();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to resolve report.';
      showError(errorMessage);
    }
  };

  const fetchAppeals = useCallback(() => {
    setAppealsLoading(true);
    setAppealsError('');
    api.get('/appeals')
      .then(res => {
        setAppeals(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setAppeals([]);
        if (error.response?.status === 401) {
          setAppealsError('Access denied. You may not have permission to view appeals.');
        } else {
          setAppealsError('Failed to load appeals. Please try again.');
          showError('Failed to load appeals. Please try again.');
        }
        console.error('Appeals loading error:', error);
      })
      .finally(() => setAppealsLoading(false));
  }, [showError]);

  const fetchAuditLog = useCallback(() => {
    setAuditLogLoading(true);
    api.get('/audit-log')
      .then(res => {
        setAuditLog(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setAuditLog([]);
        if (error.response?.status === 401) {
          setAuditLogError('Access denied. You may not have permission to view audit log.');
        } else {
          setAuditLogError('Failed to load audit log.');
          showError('Failed to load audit log. Please try again.');
        }
        console.error('Audit log loading error:', error);
      })
      .finally(() => setAuditLogLoading(false));
  }, [showError]);

  const handleResolveAppeal = async (id) => {
    try {
      await api.post(`/appeals/${id}/resolve`);
      showSuccess('Appeal resolved successfully!');
      fetchAppeals();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to resolve appeal.';
      showError(errorMessage);
    }
  };

  const handleApprove = async (dareId) => {
    setActionLoading(true);
    try {
      await api.post(`/dares/${dareId}/approve`);
      showSuccess('Dare approved successfully!');
      fetchDares();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to approve dare.';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dareId) => {
    setActionLoading(true);
    try {
      await api.post(`/dares/${dareId}/reject`);
      showSuccess('Dare rejected successfully!');
      fetchDares();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reject dare.';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDare = (dare) => {
    if (!window.confirm(`Delete dare: ${dare.description}?`)) return;
        setActionLoading(true);
    api.delete(`/dares/${dare._id}`)
      .then(() => {
        showSuccess('Dare deleted successfully!');
          fetchDares();
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || 'Failed to delete dare.';
        showError(errorMessage);
      })
      .finally(() => setActionLoading(false));
  };

  const handleDeleteSwitchGame = (game) => {
    if (!window.confirm(`Delete switch game: ${game.title}?`)) return;
        setActionLoading(true);
    api.delete(`/switches/${game._id}`)
      .then(() => {
        showSuccess('Switch game deleted successfully!');
          fetchSwitchGames();
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || 'Failed to delete switch game.';
        showError(errorMessage);
      })
      .finally(() => setActionLoading(false));
  };

  const fetchSwitchGames = useCallback((searchId = "") => {
    setSwitchGamesLoading(true);
    api.get('/switches', { params: { search: searchId } })
      .then(res => {
        setSwitchGames(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        setSwitchGames([]);
        showError('Failed to load switch games. Please try again.');
        console.error('Switch games loading error:', error);
      })
      .finally(() => setSwitchGamesLoading(false));
  }, [showError]);

  const handleDelete = (userId) => {
    if (!window.confirm(`Delete user: ${userId}?`)) return;
        setActionLoading(true);
    api.delete(`/users/${userId}`)
      .then(() => {
        showSuccess('User deleted successfully!');
          fetchUsers();
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || 'Failed to delete user.';
        showError(errorMessage);
      })
      .finally(() => setActionLoading(false));
  };

  const handleUserSearch = () => {
    fetchUsers(userSearchId);
  };

  const handleDeleteUser = (userId) => {
    handleDelete(userId);
  };

  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setEditUserId(userId);
      setEditUserData({
        username: user.username || '',
        email: user.email || '',
        roles: user.roles || [],
      });
      setEditUserError('');
    }
  };

  const closeEditUserModal = () => {
    setEditUserId(null);
    setEditUserData({ username: '', email: '', roles: [] });
    setEditUserError('');
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditUserSave = async () => {
    setEditUserLoading(true);
    setEditUserError('');
    try {
      const { username, email, roles } = editUserData;
      const payload = { username, email };
      if (roles && Array.isArray(roles)) payload.roles = roles;
      
      await api.patch(`/users/${editUserId}`, payload);
      showSuccess('User updated successfully!');
      fetchUsers();
      closeEditUserModal();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update user.';
      setEditUserError(errorMessage);
      showError(errorMessage);
    } finally {
      setEditUserLoading(false);
    }
  };

  const openConfirmModal = (message, onConfirmCallback) => {
    if (window.confirm(message)) {
      onConfirmCallback();
    }
  };

  useEffect(() => {
    // Load all data on component mount
    fetchUsers();
    fetchDares();
    fetchAuditLog();
    fetchReports();
    fetchAppeals();
    fetchSwitchGames();
    
    // Fetch site stats
    setSiteStatsLoading(true);
    setSiteStatsError('');
    api.get('/stats/site')
      .then(res => {
        setSiteStats(res.data);
      })
      .catch((error) => {
        setSiteStatsError('Failed to load site stats.');
        showError('Failed to load site stats. Please try again.');
        console.error('Site stats loading error:', error);
      })
      .finally(() => setSiteStatsLoading(false));
  }, [fetchUsers, fetchDares, fetchAuditLog, fetchReports, fetchAppeals, fetchSwitchGames]); // Include all fetch functions

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
      </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Manage users, dares, and system settings
            </p>
          </div>

          {/* Stats Overview */}
          {siteStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
                  <div className="text-2xl font-bold text-primary">{siteStats.totalUsers || 0}</div>
                </div>
                <div className="text-sm text-primary-300">Total Users</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <FireIcon className="w-6 h-6 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{siteStats.totalDares || 0}</div>
                </div>
                <div className="text-sm text-green-300">Total Dares</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-400">{siteStats.activeDares || 0}</div>
                </div>
                <div className="text-sm text-blue-300">Active Dares</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 rounded-xl p-6 border border-yellow-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                  <div className="text-2xl font-bold text-yellow-400">{siteStats.pendingReports || 0}</div>
                </div>
                <div className="text-sm text-yellow-300">Pending Reports</div>
              </div>
        </div>
      )}

          {/* Admin Tabs */}
          <Tabs
            tabs={[
              {
                label: 'Users',
                content: (
                  <div className="space-y-6">
                    {/* User Search */}
                    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                      <input
                        type="text"
                              className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                            />
                          </div>
                        </div>
                      <button
                        onClick={handleUserSearch}
                          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                      >
                        Search
                      </button>
                    </div>
                    </div>

                    {/* Users List */}
                    {dataLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {users.map(user => (
                            <div key={user._id} className="flex items-center gap-4 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <Avatar user={user} size={40} />
                            <div className="flex-1">
                                <div className="font-semibold text-white">{user.fullName || user.username}</div>
                                <div className="text-sm text-neutral-400">@{user.username}</div>
                            </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditUser(user._id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Edit
                                </button>
                                                                  <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                              </div>
                            </div>
                            ))}
                    </div>
                    </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Dares',
                content: (
                  <div className="space-y-6">
                    {/* Dare Search */}
                    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                      <input
                              type="text"
                              className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Search dares..."
                        value={dareSearch}
                        onChange={e => setDareSearch(e.target.value)}
                      />
                    </div>
                            </div>
                        <button
                          onClick={() => fetchDares(dareSearchId)}
                          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                        >
                          Search
                        </button>
                          </div>
                      </div>

                    {/* Dares List */}
                    {daresLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {dares.map(dare => (
                            <div key={dare._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{dare.description}</div>
                                  <div className="text-sm text-neutral-400">
                                    Created by: {dare.creator?.username || 'Unknown'}
                    </div>
                                  <div className="text-sm text-neutral-400">
                                    Status: {dare.status}
                    </div>
                  </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApprove(dare._id)}
                                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(dare._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDare(dare)}
                                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                    </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Audit Log',
                content: (
                  <div className="space-y-6">
                    {/* Audit Log Search */}
                    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                      <input
                              type="text"
                              className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        placeholder="Search audit log..."
                        value={auditLogSearch}
                        onChange={e => setAuditLogSearch(e.target.value)}
                      />
                    </div>
                        </div>
                      </div>
                    </div>

                    {/* Audit Log List */}
                    {auditLogLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {auditLog.map(log => (
                            <div key={log._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{log.action}</div>
                                  <div className="text-sm text-neutral-400">
                                    User: {log.user?.username || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    {log.createdAt && formatRelativeTimeWithTooltip(log.createdAt).display}
                                  </div>
                                  {log.details && (
                                    <div className="text-sm text-neutral-400 mt-2">
                                      {log.details}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                    </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Reports',
                content: (
                  <div className="space-y-6">
                    {reportsLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {reports.map(report => (
                            <div key={report._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{report.type}</div>
                                  <div className="text-sm text-neutral-400">
                                    Target: {report.targetId}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Reporter: {report.reporter?.username || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Reason: {report.reason}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Status: {report.status}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {report.status === 'open' && (
                                    <button
                                      onClick={() => handleResolveReport(report._id)}
                                      disabled={resolvingReportId === report._id}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                      {resolvingReportId === report._id ? 'Resolving...' : 'Resolve'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Appeals',
                content: (
                  <div className="space-y-6">
                    {appealsLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {appeals.map(appeal => (
                            <div key={appeal._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{appeal.type}</div>
                                  <div className="text-sm text-neutral-400">
                                    Target: {appeal.targetId}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    User: {appeal.user?.username || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Reason: {appeal.reason}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Status: {appeal.status}
                                  </div>
                                  {appeal.outcome && (
                                    <div className="text-sm text-neutral-400">
                                      Outcome: {appeal.outcome}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  {appeal.status === 'open' && (
                                    <div className="flex flex-col gap-2">
                                      <input
                                        type="text"
                                        placeholder="Outcome"
                                        value={resolvingAppealId === appeal._id ? appealOutcome : ''}
                                        onChange={e => setAppealOutcome(e.target.value)}
                                        className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white"
                                        disabled={resolvingAppealId !== appeal._id}
                                      />
                                      <button
                                        onClick={() => handleResolveAppeal(appeal._id)}
                                        disabled={resolvingAppealId === appeal._id && !appealOutcome}
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                      >
                                        {resolvingAppealId === appeal._id ? 'Resolving...' : 'Resolve'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Switch Games',
                content: (
                  <div className="space-y-6">
                    {/* Switch Games Search */}
                    <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
                            </div>
                            <input
                              type="text"
                              className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                              placeholder="Search switch games..."
                              value={switchGameSearch}
                              onChange={e => setSwitchGameSearch(e.target.value)}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => fetchSwitchGames(switchGameSearchId)}
                          className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Switch Games List */}
                    {switchGamesLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                        <div className="space-y-4">
                          {switchGames.map(game => (
                            <div key={game._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{game.title || 'Switch Game'}</div>
                                  <div className="text-sm text-neutral-400">
                                    Creator: {game.creator?.username || 'Unknown'}
                                  </div>
                                  <div className="text-sm text-neutral-400">
                                    Status: {game.status}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteSwitchGame(game)}
                                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                label: 'Stats',
                content: (
                  <div className="space-y-6">
                    {siteStatsLoading ? (
                      <ListSkeleton count={5} />
                    ) : siteStatsError ? (
                      <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
                        {siteStatsError}
                      </div>
                    ) : siteStats ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30">
                          <div className="flex items-center gap-3 mb-2">
                            <UserGroupIcon className="w-6 h-6 text-primary" />
                            <div className="text-2xl font-bold text-primary">{siteStats.totalUsers || 0}</div>
                          </div>
                          <div className="text-sm text-primary-300">Total Users</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30">
                          <div className="flex items-center gap-3 mb-2">
                            <FireIcon className="w-6 h-6 text-green-400" />
                            <div className="text-2xl font-bold text-green-400">{siteStats.totalDares || 0}</div>
                          </div>
                          <div className="text-sm text-green-300">Total Dares</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30">
                          <div className="flex items-center gap-3 mb-2">
                            <ChartBarIcon className="w-6 h-6 text-blue-400" />
                            <div className="text-2xl font-bold text-blue-400">{siteStats.totalComments || 0}</div>
                          </div>
                          <div className="text-sm text-blue-300">Total Comments</div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 rounded-xl p-6 border border-yellow-600/30">
                          <div className="flex items-center gap-3 mb-2">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                            <div className="text-2xl font-bold text-yellow-400">{siteStats.pendingReports || 0}</div>
                          </div>
                          <div className="text-sm text-yellow-300">Pending Reports</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-neutral-400 text-xl mb-4">No stats available</div>
                        <p className="text-neutral-500 text-sm">
                          Site statistics will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
            value={tabIdx}
            onChange={setTabIdx}
          />
      </main>
      </div>

      {/* User Edit Modal */}
      <Modal
        open={!!editUserId}
        onClose={closeEditUserModal}
        title="Edit User"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-4">
            <div>
            <label htmlFor="edit-username" className="block font-semibold mb-1 text-white">Username</label>
              <input
                type="text"
                name="username"
                id="edit-username"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                value={editUserData.username}
                onChange={handleEditUserChange}
                required
              />
            </div>
            <div>
            <label htmlFor="edit-email" className="block font-semibold mb-1 text-white">Email</label>
              <input
                type="email"
                name="email"
                id="edit-email"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                value={editUserData.email}
                onChange={handleEditUserChange}
                required
              />
            </div>
            <div>
            <label htmlFor="edit-roles" className="block font-semibold mb-1 text-white">Roles (comma-separated)</label>
              <input
                type="text"
                name="roles"
                id="edit-roles"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                value={Array.isArray(editUserData.roles) ? editUserData.roles.join(', ') : ''}
                onChange={(e) => {
                  const roles = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                  setEditUserData(prev => ({ ...prev, roles }));
                }}
                placeholder="admin, moderator, user"
              />
            </div>
          {editUserError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
              {editUserError}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={closeEditUserModal}
              disabled={editUserLoading}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditUserSave}
              disabled={editUserLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {editUserLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 