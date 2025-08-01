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

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
};

const validateRoles = (roles) => {
  const validRoles = ['admin', 'moderator', 'user'];
  return Array.isArray(roles) && roles.every(role => validRoles.includes(role));
};

// Status mapping utilities
const mapDareStatus = (status) => {
  const statusMap = {
    'waiting_for_participant': 'pending',
    'in_progress': 'active',
    'completed': 'completed',
    'forfeited': 'forfeited',
    'approved': 'approved',
    'rejected': 'rejected'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'bg-yellow-600/20 text-yellow-400',
    'active': 'bg-blue-600/20 text-blue-400',
    'completed': 'bg-green-600/20 text-green-400',
    'forfeited': 'bg-red-600/20 text-red-400',
    'approved': 'bg-green-600/20 text-green-400',
    'rejected': 'bg-red-600/20 text-red-400'
  };
  return colorMap[status] || 'bg-gray-600/20 text-gray-400';
};

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

function Admin() {
  const { user, loading, refreshToken } = useAuth();
  const { showSuccess, showError } = useToast();

  // All useState hooks must be called at the top level, before any early returns
  const [authVerified, setAuthVerified] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Add flag to prevent multiple API calls
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [tabIdx, setTabIdx] = useState(0);
  const [apiStatus, setApiStatus] = useState({
    users: 'unknown',
    dares: 'unknown',
    reports: 'unknown',
    appeals: 'unknown',
    auditLog: 'unknown',
    switchGames: 'unknown',
    siteStats: 'unknown'
  });
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
  const [auditLogSearch, setAuditLogSearch] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editUserError, setEditUserError] = useState('');
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });
  const [operationLoading, setOperationLoading] = useState({
    users: false,
    dares: false,
    reports: false,
    appeals: false,
    switchGames: false
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const USERS_PER_PAGE = 10;
  const DARES_PER_PAGE = 10;

  // Permission check utility
  const checkAdminPermission = useCallback(() => {
    console.log('checkAdminPermission called with user:', user);
    console.log('User roles:', user?.roles);
    
    // Check if user exists and has admin role
    if (!user) {
      console.log('No user found');
      showError('Authentication required. Please log in again.');
      return false;
    }
    
    // Check if user has roles property and includes admin
    if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes('admin')) {
      console.log('User does not have admin role. Roles:', user.roles);
      showError('Admin access required. You do not have permission to perform this action.');
      return false;
    }
    
    console.log('Admin permission granted');
    return true;
  }, [user, showError]);

  // Enhanced error handling utility
  const handleApiError = useCallback((error, operation) => {
    console.error(`${operation} error:`, error);
    
    if (error.response?.status === 401) {
      // For admin endpoints, don't show error toast, just log
      console.log(`Authentication required for ${operation}. Continuing with limited functionality.`);
      return 'auth_required';
    } else if (error.response?.status === 403) {
      showError('Access denied. You do not have permission to perform this action.');
      return 'permission_denied';
    } else if (error.response?.status === 404) {
      console.log(`Resource not found for ${operation}.`);
      return 'not_found';
    } else if (error.code === 'ECONNABORTED') {
      console.log(`Request timed out for ${operation}.`);
      return 'timeout';
    } else {
      console.log(`Failed to ${operation}. Continuing with limited functionality.`);
      return 'general_error';
    }
  }, [showError]);

  // Fetch site statistics
  const fetchSiteStats = useCallback(() => {
    setApiStatus(prev => ({ ...prev, siteStats: 'loading' }));
    setSiteStatsLoading(true);
    api.get('/stats/site')
      .then(res => {
        setSiteStats(res.data);
        setApiStatus(prev => ({ ...prev, siteStats: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, siteStats: 'error' }));
        handleApiError(err, 'load site stats');
      })
      .finally(() => setSiteStatsLoading(false));
  }, [handleApiError]);

  // All useCallback hooks must be called before any early returns
  const fetchUsers = useCallback((searchId = "") => {
    if (!checkAdminPermission()) return;
    
    setDataLoading(true);
    setApiStatus(prev => ({ ...prev, users: 'loading' }));
    api.get('/users', { params: { search: searchId } })
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setApiStatus(prev => ({ ...prev, users: 'success' }));
      })
      .catch((error) => {
        setUsers([]);
        setApiStatus(prev => ({ ...prev, users: 'error' }));
        handleApiError(error, 'load users');
      })
      .finally(() => setDataLoading(false));
  }, [checkAdminPermission, handleApiError]);

  const fetchDares = useCallback(() => {
    setApiStatus(prev => ({ ...prev, dares: 'loading' }));
    setDaresLoading(true);
    api.get('/dares')
      .then(res => {
        setDares(res.data);
        setApiStatus(prev => ({ ...prev, dares: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, dares: 'error' }));
        handleApiError(err, 'load dares');
      })
      .finally(() => setDaresLoading(false));
  }, [handleApiError]);

  const fetchReports = useCallback(() => {
    setApiStatus(prev => ({ ...prev, reports: 'loading' }));
    setReportsLoading(true);
    api.get('/reports')
      .then(res => {
        setReports(res.data);
        setApiStatus(prev => ({ ...prev, reports: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, reports: 'error' }));
        handleApiError(err, 'load reports');
      })
      .finally(() => setReportsLoading(false));
  }, [handleApiError]);

  const fetchAppeals = useCallback(() => {
    setApiStatus(prev => ({ ...prev, appeals: 'loading' }));
    setAppealsLoading(true);
    api.get('/appeals')
      .then(res => {
        setAppeals(res.data);
        setApiStatus(prev => ({ ...prev, appeals: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, appeals: 'error' }));
        handleApiError(err, 'load appeals');
      })
      .finally(() => setAppealsLoading(false));
  }, [handleApiError]);

  const fetchAuditLog = useCallback(() => {
    setApiStatus(prev => ({ ...prev, auditLog: 'loading' }));
    setAuditLogLoading(true);
    api.get('/audit-log')
      .then(res => {
        setAuditLog(res.data);
        setApiStatus(prev => ({ ...prev, auditLog: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, auditLog: 'error' }));
        handleApiError(err, 'load audit log');
      })
      .finally(() => setAuditLogLoading(false));
  }, [handleApiError]);

  const fetchSwitchGames = useCallback(() => {
    setApiStatus(prev => ({ ...prev, switchGames: 'loading' }));
    setSwitchGamesLoading(true);
    api.get('/switches')
      .then(res => {
        setSwitchGames(res.data);
        setApiStatus(prev => ({ ...prev, switchGames: 'success' }));
      })
      .catch(err => {
        setApiStatus(prev => ({ ...prev, switchGames: 'error' }));
        handleApiError(err, 'load switch games');
      })
      .finally(() => setSwitchGamesLoading(false));
  }, [handleApiError]);
  
  // All useEffect hooks must be called before any early returns
  // Add immediate bypass effect for users with admin role
  useEffect(() => {
    if (!authVerified && user && user.roles && user.roles.includes('admin')) {
      console.log('User has admin role, bypassing verification via useEffect');
      setAuthVerified(true);
    }
  }, [authVerified, user]);

  // Real-time search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tabIdx === 0 && userSearch) {
        fetchUsers(userSearch);
      } else if (tabIdx === 1 && dareSearch) {
        fetchDares(dareSearch);
      } else if (tabIdx === 5 && switchGameSearch) {
        fetchSwitchGames(switchGameSearch);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [userSearch, dareSearch, switchGameSearch, tabIdx]);

  // Real-time updates for critical data
  useEffect(() => {
    const interval = setInterval(() => {
      if (tabIdx === 3) fetchReports();
      if (tabIdx === 4) fetchAppeals();
      if (tabIdx === 2) fetchAuditLog(); // Refresh audit log periodically
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [tabIdx, fetchReports, fetchAppeals, fetchAuditLog]);
  
  // Add localStorage fallback effect
  useEffect(() => {
    if (!authVerified && !user) {
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          console.log('Found user in localStorage:', parsedUser);
          if (parsedUser.roles && parsedUser.roles.includes('admin')) {
            console.log('User from localStorage has admin role, bypassing verification via useEffect');
            setAuthVerified(true);
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [authVerified, user]);

  // Main data loading effect
  useEffect(() => {
    console.log('Admin useEffect triggered');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Auth verified:', authVerified);
    console.log('Data loaded:', dataLoaded);
    
    // Only load data when user is authenticated and has admin role
    if (!user || !user.roles?.includes('admin')) {
      console.log('User not found or not admin, returning early');
      return;
    }

    // Check if access token is available
    const accessToken = localStorage.getItem('accessToken');
    console.log('Access token present:', !!accessToken);
    
    // If no access token but user is authenticated, try to refresh the token
    if (!accessToken && user) {
      console.log('No access token found, but user is authenticated. Attempting to refresh token...');
      if (refreshToken) {
        api.post('/auth/refresh-token', { refreshToken })
          .then(res => {
            localStorage.setItem('accessToken', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            console.log('Token refreshed successfully');
            // Continue with data loading
            setDataLoaded(true);
            Promise.allSettled([
              fetchUsers(),
              fetchDares(),
              fetchReports(),
              fetchAppeals(),
              fetchAuditLog(),
              fetchSwitchGames(),
              fetchSiteStats()
            ]).then((results) => {
              console.log('Admin data loading results:', results);
              const successful = results.filter(r => r.status === 'fulfilled').length;
              const failed = results.filter(r => r.status === 'rejected').length;
              console.log(`Admin data loading: ${successful} successful, ${failed} failed`);
            }).finally(() => {
              setIsInitializing(false);
            });
            showSuccess('Admin interface loaded successfully!');
          })
          .catch(err => {
            console.log('Token refresh failed:', err);
            // Don't show error for token refresh failure, just continue with limited functionality
            console.log('Continuing with limited admin functionality due to token refresh failure');
            setDataLoaded(true);
            setIsInitializing(false);
          });
        return;
      } else {
        console.log('No refresh token found');
        // Don't show error, just continue with limited functionality
        console.log('Continuing with limited admin functionality');
        setDataLoaded(true);
        setIsInitializing(false);
        return;
      }
    }
    
    if (!accessToken) {
      console.log('No access token found');
      showError('Authentication token not found. Please log in again.');
      return;
    }

    // Only proceed with API calls if auth is verified and data hasn't been loaded yet
    if (!authVerified || dataLoaded) {
      console.log('Auth not verified yet or data already loaded, waiting...');
      return;
    }

    console.log('Auth verified, loading admin data...');
    
    // Check if user has roles, if not, fetch user data with roles
    if (!user.roles || !Array.isArray(user.roles)) {
      console.log('User object missing roles, fetching user data...');
      api.get('/users/me')
        .then(res => {
          console.log('Fetched user data with roles:', res.data);
          // Update the user context with the fetched data
          // This will trigger a re-render with the proper user data
        })
        .catch(err => {
          console.log('Failed to fetch user data:', err);
          showError('Failed to verify user permissions. Please log in again.');
          return;
        });
      return;
    }
    
    // Check if user has admin role
    if (!user.roles.includes('admin')) {
      console.log('User does not have admin role. Current roles:', user.roles);
      showError('Admin access required. You do not have permission to access this area.');
      return;
    }
    
    // Set data loaded flag to prevent multiple calls
    setDataLoaded(true);
    
    // Load all admin data with error handling
    Promise.allSettled([
      fetchUsers(),
      fetchDares(),
      fetchReports(),
      fetchAppeals(),
      fetchAuditLog(),
      fetchSwitchGames(),
      fetchSiteStats()
    ]).then((results) => {
      console.log('Admin data loading results:', results);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      console.log(`Admin data loading: ${successful} successful, ${failed} failed`);
    }).finally(() => {
      setIsInitializing(false);
    });
    
    // Show success message that admin interface is working
    showSuccess('Admin interface loaded successfully!');
  }, [user, authVerified, dataLoaded, fetchUsers, fetchDares, fetchAuditLog, fetchReports, fetchAppeals, fetchSwitchGames, fetchSiteStats, showError, showSuccess]); // Include dataLoaded in dependencies

  // Cleanup effect to reset data loaded flag when component unmounts
  useEffect(() => {
    return () => {
      setDataLoaded(false);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'f':
            e.preventDefault();
            // Focus search input based on current tab
            const searchInput = document.querySelector(`input[placeholder*="Search"]`);
            if (searchInput) searchInput.focus();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
            e.preventDefault();
            setTabIdx(parseInt(e.key) - 1);
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  if (loading || isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="flex items-center justify-center mb-8">
                <LoadingSpinner variant="spinner" size="lg" color="primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Loading Admin Panel</h2>
              <p className="text-white/70">Please wait while we verify your permissions and load data...</p>
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
    console.log('=== AUTH VERIFICATION DEBUG ===');
    console.log('User object:', user);
    console.log('User from localStorage:', localStorage.getItem('user'));
    console.log('Loading state:', loading);
    console.log('Auth verified:', authVerified);
    
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
  
  const handleResolveReport = async (id) => {
    if (!checkAdminPermission()) return;
    
    setResolvingReportId(id);
    try {
      await api.patch(`/reports/${id}`, { status: 'resolved' });
      showSuccess('Report resolved successfully!');
      fetchReports(); // Refresh the reports list
    } catch (err) {
      const errorType = handleApiError(err, 'resolve report');
      if (errorType === 'auth_required') {
        showError('Authentication required. Please log in again.');
      } else if (errorType === 'permission_denied') {
        showError('You do not have permission to resolve reports.');
      }
    } finally {
      setResolvingReportId(null);
    }
  };

  const handleResolveAppeal = async (id) => {
    if (!checkAdminPermission()) return;
    
    if (!appealOutcome.trim()) {
      showError('Please provide an outcome for the appeal.');
      return;
    }
    
    setResolvingAppealId(id);
    try {
      await api.patch(`/appeals/${id}`, { outcome: appealOutcome.trim() });
      showSuccess('Appeal resolved successfully!');
      setAppealOutcome('');
      fetchAppeals(); // Refresh the appeals list
    } catch (err) {
      const errorType = handleApiError(err, 'resolve appeal');
      if (errorType === 'auth_required') {
        showError('Authentication required. Please log in again.');
      } else if (errorType === 'permission_denied') {
        showError('You do not have permission to resolve appeals.');
      }
    } finally {
      setResolvingAppealId(null);
    }
  };

  const handleApprove = async (dareId) => {
    if (!checkAdminPermission()) return;
    
    setActionLoading(true);
    try {
      await api.post(`/dares/${dareId}/approve`);
      showSuccess('Dare approved successfully!');
      fetchDares(); // Refresh the dares list
    } catch (err) {
      const errorType = handleApiError(err, 'approve dare');
      if (errorType === 'auth_required') {
        showError('Authentication required. Please log in again.');
      } else if (errorType === 'permission_denied') {
        showError('You do not have permission to approve dares.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dareId) => {
    if (!checkAdminPermission()) return;
    
    setActionLoading(true);
    try {
      await api.post(`/dares/${dareId}/reject`);
      showSuccess('Dare rejected successfully!');
      fetchDares(); // Refresh the dares list
    } catch (err) {
      const errorType = handleApiError(err, 'reject dare');
      if (errorType === 'auth_required') {
        showError('Authentication required. Please log in again.');
      } else if (errorType === 'permission_denied') {
        showError('You do not have permission to reject dares.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDare = (dare) => {
    if (!checkAdminPermission()) return;
    
    showConfirmation(
      'Delete Dare',
      `Are you sure you want to delete dare: "${dare.description}"? This action cannot be undone.`,
      async () => {
        setActionLoading(true);
        try {
          await api.delete(`/dares/${dare._id}`);
          showSuccess('Dare deleted successfully!');
          fetchDares(); // Refresh the dares list
        } catch (err) {
          const errorType = handleApiError(err, 'delete dare');
          if (errorType === 'auth_required') {
            showError('Authentication required. Please log in again.');
          } else if (errorType === 'permission_denied') {
            showError('You do not have permission to delete dares.');
          }
        } finally {
          setActionLoading(false);
        }
      },
      'danger'
    );
  };

  const handleDeleteSwitchGame = (game) => {
    if (!checkAdminPermission()) return;
    
    showConfirmation(
      'Delete Switch Game',
      `Are you sure you want to delete switch game: "${game.title || 'Untitled'}"? This action cannot be undone.`,
      async () => {
        setActionLoading(true);
        try {
          await api.delete(`/switches/${game._id}`);
          showSuccess('Switch game deleted successfully!');
          fetchSwitchGames(); // Refresh the switch games list
        } catch (err) {
          const errorType = handleApiError(err, 'delete switch game');
          if (errorType === 'auth_required') {
            showError('Authentication required. Please log in again.');
          } else if (errorType === 'permission_denied') {
            showError('You do not have permission to delete switch games.');
          }
        } finally {
          setActionLoading(false);
        }
      },
      'danger'
    );
  };

  const handleDelete = (userId) => {
    if (!checkAdminPermission()) return;
    
    const user = users.find(u => u._id === userId);
    const userName = user ? (user.fullName || user.username) : userId;
    
    showConfirmation(
      'Delete User',
      `Are you sure you want to delete user: "${userName}"? This action cannot be undone.`,
      async () => {
        setActionLoading(true);
        try {
          await api.delete(`/users/${userId}`);
          showSuccess('User deleted successfully!');
          fetchUsers(); // Refresh the users list
        } catch (err) {
          const errorType = handleApiError(err, 'delete user');
          if (errorType === 'auth_required') {
            showError('Authentication required. Please log in again.');
          } else if (errorType === 'permission_denied') {
            showError('You do not have permission to delete users.');
          }
        } finally {
          setActionLoading(false);
        }
      },
      'danger'
    );
  };

  const handleUserSearch = () => {
    fetchUsers(userSearch);
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
    if (!checkAdminPermission()) return;
    
    // Input validation
    const { username, email, roles } = editUserData;
    
    if (!validateUsername(username)) {
      setEditUserError('Username must be 3-20 characters and contain only letters, numbers, and underscores.');
      return;
    }
    
    if (!validateEmail(email)) {
      setEditUserError('Please enter a valid email address.');
      return;
    }
    
    if (!validateRoles(roles)) {
      setEditUserError('Roles must be valid: admin, moderator, or user.');
      return;
    }
    
    setEditUserLoading(true);
    setEditUserError('');
    try {
      const payload = { username, email };
      if (roles && Array.isArray(roles)) payload.roles = roles;
      
      await api.patch(`/users/${editUserId}`, payload);
      showSuccess('User updated successfully!');
      fetchUsers(); // Refresh the users list
      closeEditUserModal();
    } catch (err) {
      const errorType = handleApiError(err, 'update user');
      if (errorType === 'auth_required') {
        setEditUserError('Authentication required. Please log in again.');
      } else if (errorType === 'permission_denied') {
        setEditUserError('You do not have permission to update users.');
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to update user.';
        setEditUserError(errorMessage);
      }
    } finally {
      setEditUserLoading(false);
    }
  };

  // Confirmation modal helpers
  const showConfirmation = (title, message, onConfirm, type = 'danger') => {
    setConfirmAction({ show: true, title, message, onConfirm, type });
  };

  const closeConfirmation = () => {
    setConfirmAction({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
  };

  const handleConfirmAction = () => {
    if (confirmAction.onConfirm) {
      confirmAction.onConfirm();
    }
    closeConfirmation();
  };

  // Bulk action helpers
  const handleBulkAction = async (action, items) => {
    if (!checkAdminPermission()) return;
    
    const itemType = tabIdx === 0 ? 'users' : tabIdx === 1 ? 'dares' : 'switch games';
    const actionText = action === 'delete' ? 'delete' : action === 'approve' ? 'approve' : 'reject';
    
    showConfirmation(
      `Bulk ${actionText}`,
      `Are you sure you want to ${actionText} ${items.length} ${itemType}? This action cannot be undone.`,
      async () => {
        setOperationLoading(prev => ({ ...prev, [itemType]: true }));
        
        try {
          let endpoint = '';
          let payload = {};
          
          if (tabIdx === 0) {
            endpoint = '/bulk/users';
            payload = { action, userIds: items.map(item => item._id || item.id) };
          } else if (tabIdx === 1) {
            endpoint = '/bulk/dares';
            payload = { action, dareIds: items.map(item => item._id || item.id) };
          } else {
            endpoint = '/bulk/switch-games';
            payload = { action, gameIds: items.map(item => item._id || item.id) };
          }
          
          const response = await api.post(endpoint, payload);
          const results = response.data;
          
          // Show results
          if (results.success > 0) {
            showSuccess(`Successfully ${actionText} ${results.success} ${itemType}`);
          }
          if (results.failed > 0) {
            showError(`Failed to ${actionText} ${results.failed} ${itemType}`);
          }
          
          // Refresh data
          if (tabIdx === 0) fetchUsers();
          else if (tabIdx === 1) fetchDares();
          else fetchSwitchGames();
          
          setSelectedItems([]);
        } catch (error) {
          const errorType = handleApiError(error, `${actionText} ${itemType}`);
          if (errorType === 'auth_required') {
            showError('Authentication required. Please log in again.');
          } else if (errorType === 'permission_denied') {
            showError('You do not have permission to perform bulk operations.');
          }
        } finally {
          setOperationLoading(prev => ({ ...prev, [itemType]: false }));
        }
      },
      'danger'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-8">
          {/* Live Status Indicator */}
          <div aria-live="polite" aria-label="Admin operations status" className="sr-only">
            {Object.values(operationLoading).some(loading => loading) && (
              <span>Processing admin operations...</span>
            )}
          </div>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-2xl shadow-2xl shadow-red-500/25">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-xl sm:text-2xl text-neutral-300 mb-4">
              Manage users, dares, and system settings
            </p>
            
            {/* API Status Indicator */}
            <div className="text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span>API Status:</span>
                {Object.entries(apiStatus).map(([key, status]) => (
                  <span key={key} className={`px-2 py-1 rounded text-xs ${
                    status === 'success' ? 'bg-green-600/20 text-green-400' :
                    status === 'error' ? 'bg-red-600/20 text-red-400' :
                    status === 'loading' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {key}: {status}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Keyboard Shortcuts Hint */}
            <div className="text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3 inline-block">
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <span>💡 Keyboard shortcuts:</span>
                <span>Ctrl+F to search</span>
                <span>Ctrl+1-6 to switch tabs</span>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          {siteStats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-primary group-hover:scale-105 transition-transform duration-200">{siteStats.totalUsers || 0}</div>
                      <div className="text-xs sm:text-sm text-primary-300">Total Users</div>
                    </div>
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-600/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-green-400 group-hover:scale-105 transition-transform duration-200">{siteStats.totalDares || 0}</div>
                      <div className="text-xs sm:text-sm text-green-300">Total Dares</div>
                    </div>
                    <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                      <FireIcon className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-600/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-blue-400 group-hover:scale-105 transition-transform duration-200">{siteStats.activeDares || 0}</div>
                      <div className="text-xs sm:text-sm text-blue-300">Active Dares</div>
                    </div>
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                </Card>
                
                <Card className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border-yellow-600/30 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-yellow-400 group-hover:scale-105 transition-transform duration-200">{siteStats.pendingReports || 0}</div>
                      <div className="text-xs sm:text-sm text-yellow-300">Pending Reports</div>
                    </div>
                    <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setTabIdx(3)}
                  className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-xl text-white hover:scale-105 transition-all group"
                >
                  <ExclamationTriangleIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold">Review Reports</div>
                  <div className="text-sm opacity-80">{siteStats.pendingReports || 0} pending</div>
                </button>
                
                <button 
                  onClick={() => setTabIdx(4)}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 p-4 rounded-xl text-white hover:scale-105 transition-all group"
                >
                  <ExclamationTriangleIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold">Handle Appeals</div>
                  <div className="text-sm opacity-80">{appeals.length} active</div>
                </button>
                
                <button 
                  onClick={() => setTabIdx(1)}
                  className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl text-white hover:scale-105 transition-all group"
                >
                  <FireIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold">Manage Dares</div>
                  <div className="text-sm opacity-80">{dares.length} total</div>
                </button>
                
                <button 
                  onClick={() => setTabIdx(0)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl text-white hover:scale-105 transition-all group"
                >
                  <UserGroupIcon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-semibold">Manage Users</div>
                  <div className="text-sm opacity-80">{users.length} total</div>
                </button>
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
                        {/* Bulk Actions */}
                        {selectedItems.length > 0 && (
                          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/30 mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold">
                                {selectedItems.length} users selected
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleBulkAction('delete', selectedItems)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all"
                                >
                                  Delete Selected
                                </button>
                                <button
                                  onClick={() => setSelectedItems([])}
                                  className="bg-neutral-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-neutral-700 transition-all"
                                >
                                  Clear Selection
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          {users.map(user => (
                            <div key={user._id} className="flex items-center gap-4 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/50 transition-all">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(user._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, user._id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== user._id));
                                  }
                                }}
                                className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                              />
                              <Avatar user={user} size={40} />
                              <div className="flex-1">
                                <div className="font-semibold text-white">{user.fullName || user.username}</div>
                                <div className="text-sm text-neutral-400">@{user.username}</div>
                                {user.roles && user.roles.length > 0 && (
                                  <div className="text-xs text-neutral-500">
                                    Roles: {user.roles.join(', ')}
                                  </div>
                                )}
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
                                    onClick={() => showConfirmation(
                                      'Delete User',
                                      `Are you sure you want to delete user "${user.fullName || user.username}"? This action cannot be undone.`,
                                      () => handleDeleteUser(user._id),
                                      'danger'
                                    )}
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
                              onClick={() => fetchDares(dareSearch)}
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
                        {/* Export and Bulk Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                          <button
                            onClick={() => exportToCsv('dares.csv', dares.map(dare => ({
                              ID: dare._id,
                              Description: dare.description,
                              Creator: dare.creator?.username || 'Unknown',
                              Status: dare.status,
                              Created: dare.createdAt ? new Date(dare.createdAt).toLocaleDateString() : 'Unknown'
                            })))}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg text-sm hover:from-purple-700 hover:to-purple-600 transition-all flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                          </button>
                          
                          <div className="text-sm text-neutral-400 flex items-center gap-2">
                            <span>Total: {dares.length} dares</span>
                            <span>•</span>
                            <span>Pending: {dares.filter(d => mapDareStatus(d.status) === 'pending').length}</span>
                            <span>•</span>
                            <span>Approved: {dares.filter(d => mapDareStatus(d.status) === 'approved').length}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {dares.map(dare => (
                            <div key={dare._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/50 transition-all">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold text-white mb-2">{dare.description}</div>
                                  <div className="text-sm text-neutral-400 mb-1">
                                    Created by: {dare.creator?.username || 'Unknown'}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(mapDareStatus(dare.status))}`}>
                                      {mapDareStatus(dare.status)}
                                    </span>
                                    {dare.createdAt && (
                                      <span className="text-xs text-neutral-500">
                                        {formatRelativeTimeWithTooltip(dare.createdAt).display}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {mapDareStatus(dare.status) === 'pending' && (
                                    <>
                                      <ActionLoading
                                        loading={actionLoading}
                                        loadingText="Approving..."
                                      >
                                        <button
                                          onClick={() => showConfirmation(
                                            'Approve Dare',
                                            `Are you sure you want to approve this dare?`,
                                            () => handleApprove(dare._id),
                                            'info'
                                          )}
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
                                          onClick={() => showConfirmation(
                                            'Reject Dare',
                                            `Are you sure you want to reject this dare?`,
                                            () => handleReject(dare._id),
                                            'warning'
                                          )}
                                          disabled={actionLoading}
                                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Reject
                                        </button>
                                      </ActionLoading>
                                    </>
                                  )}
                                  <ActionLoading
                                    loading={actionLoading}
                                    loadingText="Deleting..."
                                  >
                                    <button
                                      onClick={() => showConfirmation(
                                        'Delete Dare',
                                        `Are you sure you want to delete this dare? This action cannot be undone.`,
                                        () => handleDeleteDare(dare),
                                        'danger'
                                      )}
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
                                      {typeof log.details === 'object'
                                        ? <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                                        : log.details}
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
                              onClick={() => fetchSwitchGames(switchGameSearch)}
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

      {/* Confirmation Modal */}
      <Modal
        open={confirmAction.show}
        onClose={closeConfirmation}
        title={confirmAction.title}
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              confirmAction.type === 'danger' ? 'bg-red-600/20' : 
              confirmAction.type === 'warning' ? 'bg-yellow-600/20' : 'bg-blue-600/20'
            }`}>
              <ExclamationTriangleIcon className={`w-8 h-8 ${
                confirmAction.type === 'danger' ? 'text-red-400' : 
                confirmAction.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`} />
            </div>
            <p className="text-neutral-300 text-lg">{confirmAction.message}</p>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={closeConfirmation}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                confirmAction.type === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : confirmAction.type === 'warning'
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>

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

export default Admin;