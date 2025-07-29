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
import LoadingSpinner, { ButtonLoading, ActionLoading } from '../components/LoadingSpinner';

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
  
  // All useState hooks must be called at the top level, before any early returns
  const [authVerified, setAuthVerified] = useState(false);
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
  const [darePage, setDarePage] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDares, setSelectedDares] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');
  const [appeals, setAppeals] = useState([]);
  const [appealsLoading, setAppealsLoading] = useState(true);
  const [appealsError, setAppealsError] = useState('');
  const [auditLog, setAuditLog] = useState([]);
  const [auditLogLoading, setAuditLogLoading] = useState(true);
  const [auditLogError, setAuditLogError] = useState('');
  const [switchGames, setSwitchGames] = useState([]);
  const [switchGamesLoading, setSwitchGamesLoading] = useState(true);
  const [switchGameSearch, setSwitchGameSearch] = useState('');
  const [switchGameSearchId, setSwitchGameSearchId] = useState('');
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [resolvingAppealId, setResolvingAppealId] = useState(null);
  const [appealOutcome, setAppealOutcome] = useState('');
  const [editUserModal, setEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  
  const USERS_PER_PAGE = 10;
  const DARES_PER_PAGE = 10;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="flex items-center justify-center mb-8">
                <LoadingSpinner variant="spinner" size="lg" color="primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Loading Admin Panel</h2>
              <p className="text-white/70">Please wait while we verify your permissions...</p>
            </div>
          </div>
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

  // Show loading state while verifying authentication
  if (!authVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="flex items-center justify-center mb-8">
                <LoadingSpinner variant="spinner" size="lg" color="primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Verifying Admin Access</h2>
              <p className="text-white/70">Please wait while we verify your administrator permissions...</p>
              <div className="mt-4">
                <button 
                  onClick={() => {
                    console.log('Manual auth verification triggered');
                    setAuthVerified(true);
                  }}
                  className="text-sm text-neutral-400 hover:text-white underline"
                >
                  Continue anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
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
  
  const [auditLogSearch, setAuditLogSearch] = useState('');
  
  const [editUserId, setEditUserId] = useState(null);
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
          // Don't show error toast for 401 - let the interceptor handle it
        } else if (error.code === 'ECONNABORTED') {
          setReportsError('Request timed out. Please try again.');
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
          // Don't show error toast for 401 - let the interceptor handle it
        } else if (error.code === 'ECONNABORTED') {
          setAppealsError('Request timed out. Please try again.');
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
          // Don't show error toast for 401 - let the interceptor handle it
        } else if (error.code === 'ECONNABORTED') {
          setAuditLogError('Request timed out. Please try again.');
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
    // Only load data when user is authenticated and has admin role
    if (!user || !user.roles?.includes('admin')) {
      return;
    }

    // Check if access token is available
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      showError('Authentication token not found. Please log in again.');
      return;
    }

    // Add a longer delay to ensure auth state is fully loaded and token is valid
    const timer = setTimeout(async () => {
      try {
        console.log('Starting auth verification...');
        console.log('User object:', user);
        console.log('User roles:', user?.roles);
        
        // First verify the token is still valid by making a simple API call
        console.log('Checking access token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
        
        // Try a simpler approach - just check if we have a valid user with admin role
        if (user && user.roles && user.roles.includes('admin')) {
          console.log('User has admin role, proceeding with verification...');
          
          // Try the API call with a shorter timeout
          const response = await Promise.race([
            api.get('/users/me'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 3000)
            )
          ]);
          console.log('Auth verification successful:', response.data);
          
          // If we get here, the token is valid, so mark auth as verified
          setAuthVerified(true);
          
          // Now load all data
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
              if (error.response?.status === 401) {
                // Handle unauthorized - user might need to re-authenticate
                showError('Authentication expired. Please log in again.');
              } else if (error.code === 'ECONNABORTED') {
                setSiteStatsError('Request timed out. Please try again.');
              } else {
                setSiteStatsError('Failed to load site stats.');
                showError('Failed to load site stats. Please try again.');
              }
              console.error('Site stats loading error:', error);
            })
            .finally(() => setSiteStatsLoading(false));
        } else {
          console.log('User does not have admin role or user is null');
          showError('Access denied. Administrator privileges required.');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        if (error.response?.status === 401) {
          showError('Authentication expired. Please log in again.');
        } else if (error.code === 'ECONNABORTED') {
          console.log('Request timed out, but user has admin role - proceeding anyway');
          setAuthVerified(true);
        } else {
          console.log('Other error occurred, but user has admin role - proceeding anyway');
          setAuthVerified(true);
        }
        console.error('Auth verification error:', error);
      }
    }, 500); // Reduced delay since we're checking user object first

    return () => clearTimeout(timer);
  }, [user, fetchUsers, fetchDares, fetchAuditLog, fetchReports, fetchAppeals, fetchSwitchGames, showError]); // Include showError in dependencies

  // Add a fallback timer to proceed if verification takes too long
  useEffect(() => {
    if (!user || !user.roles?.includes('admin')) return;
    
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback timer triggered - proceeding with admin access');
      setAuthVerified(true);
    }, 5000); // 5 second fallback
    
    return () => clearTimeout(fallbackTimer);
  }, [user]);

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
              <Card className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
                  <div className="text-2xl font-bold text-primary">{siteStats.totalUsers || 0}</div>
                </div>
                <div className="text-sm text-primary-300">Total Users</div>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <FireIcon className="w-6 h-6 text-green-400" />
                  <div className="text-2xl font-bold text-green-400">{siteStats.totalDares || 0}</div>
                </div>
                <div className="text-sm text-green-300">Total Dares</div>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <ChartBarIcon className="w-6 h-6 text-blue-400" />
                  <div className="text-2xl font-bold text-blue-400">{siteStats.activeDares || 0}</div>
                </div>
                <div className="text-sm text-blue-300">Active Dares</div>
              </Card>
              
              <Card className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-yellow-600/30">
                <div className="flex items-center gap-3 mb-2">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                  <div className="text-2xl font-bold text-yellow-400">{siteStats.pendingReports || 0}</div>
                </div>
                <div className="text-sm text-yellow-300">Pending Reports</div>
              </Card>
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
                    <Card header="User Search">
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
                        <ButtonLoading
                          loading={actionLoading}
                          loadingText="Searching..."
                        >
                          <button
                            onClick={handleUserSearch}
                            disabled={actionLoading}
                            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Search
                          </button>
                        </ButtonLoading>
                      </div>
                    </Card>

                    {/* Users List */}
                    {dataLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <Card header="Users List">
                        <div className="space-y-4">
                          {users.map(user => (
                            <div key={user._id} className="flex items-center gap-4 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                              <Avatar user={user} size={40} />
                              <div className="flex-1">
                                <div className="font-semibold text-white">{user.fullName || user.username}</div>
                                <div className="text-sm text-neutral-400">@{user.username}</div>
                              </div>
                              <div className="flex gap-2">
                                <ActionLoading
                                  loading={actionLoading}
                                  loadingText="Editing..."
                                >
                                  <button
                                    onClick={() => handleEditUser(user._id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Edit
                                  </button>
                                </ActionLoading>
                                <ActionLoading
                                  loading={actionLoading}
                                  loadingText="Deleting..."
                                >
                                  <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Delete
                                  </button>
                                </ActionLoading>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                ),
              },
              {
                label: 'Dares',
                content: (
                  <div className="space-y-6">
                                        {/* Dare Search */}
                    <Card header="Dare Search">
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
                        <ButtonLoading
                          loading={actionLoading}
                          loadingText="Searching..."
                        >
                          <button
                            onClick={() => fetchDares(dareSearchId)}
                            disabled={actionLoading}
                            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Search
                          </button>
                        </ButtonLoading>
                      </div>
                    </Card>

                    {/* Dares List */}
                    {daresLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <Card header="Dares List">
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
                                  <ActionLoading
                                    loading={actionLoading}
                                    loadingText="Approving..."
                                  >
                                    <button
                                      onClick={() => handleApprove(dare._id)}
                                      disabled={actionLoading}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Approve
                                    </button>
                                  </ActionLoading>
                                  <ActionLoading
                                    loading={actionLoading}
                                    loadingText="Rejecting..."
                                  >
                                    <button
                                      onClick={() => handleReject(dare._id)}
                                      disabled={actionLoading}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Reject
                                    </button>
                                  </ActionLoading>
                                  <ActionLoading
                                    loading={actionLoading}
                                    loadingText="Deleting..."
                                  >
                                    <button
                                      onClick={() => handleDeleteDare(dare)}
                                      disabled={actionLoading}
                                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Delete
                                    </button>
                                  </ActionLoading>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                ),
              },
              {
                label: 'Audit Log',
                content: (
                  <div className="space-y-6">
                    {/* Audit Log Search */}
                    <Card header="Audit Log Search">
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
                    </Card>

                    {/* Audit Log List */}
                    {auditLogLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <Card header="Audit Log">
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
                      </Card>
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
                      <Card header="Reports">
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
                                    <ActionLoading
                                      loading={resolvingReportId === report._id}
                                      loadingText="Resolving..."
                                    >
                                      <button
                                        onClick={() => handleResolveReport(report._id)}
                                        disabled={resolvingReportId === report._id}
                                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Resolve
                                      </button>
                                    </ActionLoading>
                                  )}
                                </div>
                              </div>
                            </div>
                            ))}
                        </div>
                      </Card>
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
                      <Card header="Appeals">
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
                                      <ActionLoading
                                        loading={resolvingAppealId === appeal._id}
                                        loadingText="Resolving..."
                                      >
                                        <button
                                          onClick={() => handleResolveAppeal(appeal._id)}
                                          disabled={resolvingAppealId === appeal._id && !appealOutcome}
                                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Resolve
                                        </button>
                                      </ActionLoading>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                ),
              },
              {
                label: 'Switch Games',
                content: (
                  <div className="space-y-6">
                    {/* Switch Games Search */}
                    <Card header="Switch Games Search">
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
                        <ButtonLoading
                          loading={actionLoading}
                          loadingText="Searching..."
                        >
                          <button
                            onClick={() => fetchSwitchGames(switchGameSearchId)}
                            disabled={actionLoading}
                            className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Search
                          </button>
                        </ButtonLoading>
                      </div>
                    </Card>

                    {/* Switch Games List */}
                    {switchGamesLoading ? (
                      <ListSkeleton count={10} />
                    ) : (
                      <Card header="Switch Games List">
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
                                  <ActionLoading
                                    loading={actionLoading}
                                    loadingText="Deleting..."
                                  >
                                    <button
                                      onClick={() => handleDeleteSwitchGame(game)}
                                      disabled={actionLoading}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Delete
                                    </button>
                                  </ActionLoading>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
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
            <ButtonLoading
              loading={editUserLoading}
              loadingText="Saving..."
            >
              <button
                onClick={handleEditUserSave}
                disabled={editUserLoading}
                className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Save Changes
              </button>
            </ButtonLoading>
          </div>
        </div>
      </Modal>
    </div>
  );
} 