import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

import Avatar from '../components/Avatar';
import { io } from 'socket.io-client';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { retryApiCall } from '../utils/retry';
import { useRealtimeNotificationSubscription } from '../utils/realtime';
import { MainContent, ContentContainer } from '../components/Layout';
import { ErrorAlert } from '../components/Alert';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

export default function Notifications() {
  const { user, accessToken } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimeout = useRef(null);
  
  // Activate real-time notifications
  const { subscribeToNotifications } = useRealtimeNotificationSubscription();

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
        const notificationsData = validateApiResponse(response, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setNotifications(notificationsData);
        showSuccess('Notifications loaded successfully!');

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

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!accessToken) return;
    
    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      showSuccess('New notification received!');
    });

    return () => {
      unsubscribe();
    };
  }, [accessToken, subscribeToNotifications, showSuccess]);

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

  function getNotificationAction(n) {
    switch (n.type) {
      case 'dare_created':
      case 'dare_approved':
      case 'dare_rejected':
      case 'dare_fulfilled':
      case 'dare_completed':
        return n.dareId ? `/dares/${n.dareId}` : '/dares';
      case 'proof_submitted':
        return n.dareId ? `/dares/${n.dareId}` : '/dares';
      case 'dare_claimed':
        return n.dareId ? `/dares/${n.dareId}` : '/dares';
      case 'comment_reply':
        return n.commentId ? `/comments/${n.commentId}` : '/activity';
      case 'role_change':
        return '/profile';
      case 'user_blocked':
      case 'user_banned':
        return '/profile';
      case 'appeal_submitted':
      case 'appeal_resolved':
        return '/appeals';
      case 'report_submitted':
      case 'report_resolved':
        return '/reports';
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
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <ContentContainer>
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={10} />
          </div>
        </ContentContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <BellIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Notifications</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Stay updated with your latest activities
            </p>
          </div>

          {/* Notifications List */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">No notifications yet</div>
                <p className="text-neutral-500 text-sm">
                  You'll see notifications here when you receive them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {batchNotifications(paginatedItems).map((notification, index) => (
                  <div
                    key={notification._id || index}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      notification.read
                        ? 'bg-neutral-800/30 border-neutral-700/30'
                        : 'bg-primary/10 border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar user={notification.sender} size={40} />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-white mb-1">
                              {getNotificationMessage(notification)}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {notification.createdAt && formatRelativeTimeWithTooltip(notification.createdAt).display}
                            </div>
                            {notification.count > 1 && (
                              <div className="text-xs text-primary mt-1">
                                +{notification.count - 1} more similar
                              </div>
                            )}
                          </div>
                          
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
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
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
            <ErrorAlert>
              {generalError}
            </ErrorAlert>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 