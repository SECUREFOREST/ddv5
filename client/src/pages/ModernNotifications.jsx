import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BookOpenIcon,
  UserIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import api from '../api/axios';

const ModernNotifications = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add pagination
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, paginatedData, setTotalItems } = usePagination(1, 20);
  
  // Get paginated items
  const paginatedItems = paginatedData(notifications || []);
  
  // Update total items when notifications change
  React.useEffect(() => {
    setTotalItems(Array.isArray(notifications) ? notifications.length : 0);
  }, [notifications, setTotalItems]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setGeneralError('');
      
      // Use retry mechanism for notifications fetch
      const response = await retryApiCall(() => api.get('/notifications'));
      
      if (response.data) {
        const responseData = response.data;
        const notifications = responseData.notifications || responseData;
        const notificationsData = validateApiResponse(notifications, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setNotifications(notificationsData);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Notifications loading error:', error);
      const errorMessage = handleApiError(error, 'notifications');
      setGeneralError(errorMessage);
      showError(errorMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on current filter and search
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;
    
    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(n => {
        const message = getNotificationMessage(n).toLowerCase();
        const sender = (n.sender?.fullName || n.sender?.username || '').toLowerCase();
        return message.includes(searchTerm.toLowerCase()) || sender.includes(searchTerm.toLowerCase());
      });
    }
    
    return filtered;
  }, [notifications, filter, searchTerm]);

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    setGeneralError('');
    try {
      // Use retry mechanism for mark as read
      await retryApiCall(() => api.put(`/notifications/${id}/read`));
      fetchNotifications();
      showSuccess('Notification marked as read.');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to mark notification as read.';
      showError(errorMessage);
    }
    setActionLoading(false);
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) {
        showSuccess('All notifications are already read.');
        return;
      }
      
      await Promise.all(
        unreadNotifications.map(n => 
          retryApiCall(() => api.put(`/notifications/${n._id}/read`))
        )
      );
      
      fetchNotifications();
      showSuccess(`Marked ${unreadNotifications.length} notifications as read.`);
    } catch (err) {
      showError('Failed to mark all notifications as read.');
    } finally {
      setActionLoading(false);
    }
  };

  // Replace legacy notification message generator with the new one
  function getNotificationMessage(n) {
    const senderName = n.sender?.fullName || n.sender?.username || 'someone';
    switch (n.type) {
      case 'dare_created':
        return `Your dare has been created${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_graded':
        return `Your dare has been graded${n.sender ? ' by ' + senderName : ''}.`;
      case 'proof_submitted':
        return `Proof has been submitted for your dare by ${senderName}.`;
      case 'dare_approved':
        return `Your dare has been approved${n.sender ? ' by ' + senderName : ''}!`;
      case 'dare_rejected':
        return `Your dare has been rejected${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_fulfilled':
        return `Your dare has been fulfilled${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_withdrawn':
        return `A dare has been withdrawn${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_switch':
        return `A switch game event occurred${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_claimed':
        return `Your dare has been claimed${n.sender ? ' by ' + senderName : ''}.`;
      case 'dare_completed':
        return `Your dare has been completed${n.sender ? ' by ' + senderName : ''}.`;
      case 'role_change':
        return n.message || `Your role has changed${n.sender ? ' by ' + senderName : ''}.`;
      case 'user_blocked':
        return `You have been blocked by ${senderName}.`;
      case 'user_banned':
        return `Your account has been banned by ${senderName}.`;
      case 'comment_reply':
        return `You have a new reply from ${senderName}.`;
      case 'comment_moderated':
        return `Your comment has been moderated${n.sender ? ' by ' + senderName : ''}.`;
      case 'appeal_submitted':
        return `An appeal has been submitted${n.sender ? ' by ' + senderName : ''}.`;
      case 'appeal_resolved':
        return `An appeal has been resolved${n.sender ? ' by ' + senderName : ''}.`;
      case 'report_submitted':
        return `A report has been submitted${n.sender ? ' by ' + senderName : ''}.`;
      case 'report_resolved':
        return `A report has been resolved${n.sender ? ' by ' + senderName : ''}.`;
      default:
        return n.message || 'You have a new notification.';
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'dare_created':
      case 'dare_approved':
      case 'dare_rejected':
      case 'dare_fulfilled':
      case 'dare_completed':
        return FireIcon;
      case 'proof_submitted':
      case 'dare_claimed':
        return EyeIcon;
      case 'comment_reply':
        return ChatBubbleLeftIcon;
      case 'role_change':
        return UserIcon;
      case 'user_blocked':
      case 'user_banned':
        return ExclamationTriangleIcon;
      case 'appeal_submitted':
      case 'appeal_resolved':
        return HandRaisedIcon;
      case 'report_submitted':
      case 'report_resolved':
        return FlagIcon;
      default:
        return BellIcon;
    }
  }

  function getNotificationAction(n) {
    switch (n.type) {
      case 'dare_created':
      case 'dare_approved':
      case 'dare_rejected':
      case 'dare_fulfilled':
      case 'dare_completed':
        return n.dareId ? `/modern/dares/${n.dareId}` : '/modern/dares';
      case 'proof_submitted':
        return n.dareId ? `/modern/dares/${n.dareId}` : '/modern/dares';
      case 'dare_claimed':
        return n.dareId ? `/modern/dares/${n.dareId}` : '/modern/dares';
      case 'comment_reply':
        return n.commentId ? `/modern/comments/${n.commentId}` : '/modern/activity-feed';
      case 'role_change':
        return '/modern/profile';
      case 'user_blocked':
      case 'user_banned':
        return '/modern/profile';
      case 'appeal_submitted':
      case 'appeal_resolved':
        return '/modern/appeals';
      case 'report_submitted':
      case 'report_resolved':
        return '/modern/reports';
      default:
        return null;
    }
  }

  function batchNotifications(notifications) {
    const batched = [];
    const grouped = {};
    
    notifications.forEach(notification => {
      const key = `${notification.type}_${notification.sender?._id || 'system'}_${notification.dareId || 'none'}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(notification);
    });
    
    Object.values(grouped).forEach(group => {
      if (group.length === 1) {
        batched.push(group[0]);
      } else {
        const first = group[0];
        const count = group.length;
        batched.push({
          ...first,
          count,
          message: `${count} similar notifications`
        });
      }
    });
    
    return batched;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-white text-xl">Loading Notifications...</div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const batchedNotifications = batchNotifications(filteredNotifications);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-neutral-400 text-sm">Stay updated with your latest activities</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <BellIcon className="w-4 h-4" />
                  <span>{unreadCount} unread</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <BellIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Notifications</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Stay updated with your latest activities
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Keep track of all your platform activities, dare updates, and community interactions in one place.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: notifications.length - unreadCount }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === tab.key
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
              <BellIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          {batchedNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <BellIcon className="w-10 h-10 text-neutral-400" />
              </div>
              <div className="text-neutral-400 text-xl mb-4">No notifications found</div>
              <p className="text-neutral-500 text-sm">
                {filter === 'all' 
                  ? "You'll see notifications here when you receive them."
                  : filter === 'unread'
                  ? "All caught up! No unread notifications."
                  : "No read notifications to display."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {batchedNotifications.map((notification, index) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification._id || index}
                    className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                      notification.read
                        ? 'bg-neutral-700/50 border-neutral-600/30'
                        : 'bg-primary/10 border-primary/30 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-xl ${
                        notification.read 
                          ? 'bg-neutral-700/50 text-neutral-400' 
                          : 'bg-primary/20 text-primary'
                      }`}>
                        <NotificationIcon className="w-6 h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-2">
                              {getNotificationMessage(notification)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                {notification.createdAt && formatRelativeTimeWithTooltip(notification.createdAt).display}
                              </div>
                              {notification.sender && (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-4 h-4" />
                                  {notification.sender.fullName || notification.sender.username}
                                </div>
                              )}
                            </div>
                            {notification.count > 1 && (
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                                  +{notification.count - 1} more similar
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkRead(notification._id)}
                                disabled={actionLoading}
                                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Error Messages */}
        {generalError && (
          <div className="mt-8 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
              <div className="text-red-300">{generalError}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernNotifications;
