import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  UserIcon,
  ClockIcon,
  TagIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  Squares2X2Icon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  ShareIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { PRIVACY_OPTIONS, ERROR_MESSAGES } from '../constants.jsx';
import api from '../api/axios';

const ModernDareDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Activate caching for dare details
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proof, setProof] = useState('');
  const [proofError, setProofError] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const { contentDeletion, updateContentDeletion } = useContentDeletion();

  const fetchDareDetails = useCallback(async () => {
    if (!id) return;
    
    // Check cache first
    const cacheKey = `dare_details_${id}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setDare(cachedData);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setGeneralError('');
      
      // Use retry mechanism for dare details fetch
      const response = await retryApiCall(() => api.get(`/dares/${id}`));
      
      if (response.data) {
        setDare(response.data);
        // Cache the dare details
        setCachedData(cacheKey, response.data, 10 * 60 * 1000); // 10 minutes cache
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare details loading error:', error);
      const errorMessage = error.response?.data?.error || ERROR_MESSAGES.DARE_DETAILS_LOAD_FAILED;
      setGeneralError(errorMessage);
      showError(errorMessage);
      setDare(null);
    } finally {
      setLoading(false);
    }
  }, [id, showSuccess, showError, getCachedData, setCachedData]);

  useEffect(() => {
    fetchDareDetails();
  }, [fetchDareDetails, refresh]);

  const handleAcceptDare = async () => {
    try {
      await retryApiCall(() => api.post(`/dares/${id}/accept`));
      showSuccess('Dare accepted successfully!');
      invalidateCache(`dare_details_${id}`);
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to accept dare.';
      showError(errorMessage);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setRejecting(true);
    setRejectError('');
    try {
      await retryApiCall(() => api.post(`/dares/${id}/reject`, { reason: rejectReason }));
      showSuccess('Dare rejected successfully.');
      invalidateCache(`dare_details_${id}`);
      setShowRejectModal(false);
      setRejectReason('');
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to reject dare.';
      setRejectError(errorMessage);
      showError(errorMessage);
    } finally {
      setRejecting(false);
    }
  };

  const handleGrade = async (e, targetId) => {
    e.preventDefault();
    setGrading(true);
    setGradeError('');
    try {
      await retryApiCall(() => api.post(`/dares/${id}/grade`, {
        targetId,
        grade: parseInt(grade),
        feedback
      }));
      showSuccess('Grade submitted successfully!');
      setGrade('');
      setFeedback('');
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit grade.';
      setGradeError(errorMessage);
      showError(errorMessage);
    } finally {
      setGrading(false);
    }
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/dare/share/${id}`;
    navigator.clipboard.writeText(shareUrl);
    showSuccess('Share link copied to clipboard!');
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    setProofError('');
    try {
      const formData = new FormData();
      formData.append('proof', proof);
      formData.append('contentDeletion', contentDeletion);
      if (proofFile) {
        formData.append('proofFile', proofFile);
      }
      
      await retryApiCall(() => api.post(`/dares/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProofProgress(percentCompleted);
        }
      }));
      
      showSuccess('Proof submitted successfully!');
      setProof('');
      setProofFile(null);
      setProofProgress(0);
      setShowProofModal(false);
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit proof.';
      setProofError(errorMessage);
      showError(errorMessage);
    } finally {
      setProofLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    try {
      await retryApiCall(() => api.post(`/dares/${id}/report`, { reason: reportReason }));
      showSuccess('Report submitted. Thank you for helping keep the community safe.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit report.';
      showError(errorMessage);
    } finally {
      setReportLoading(false);
    }
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    setAppealLoading(true);
    try {
      await retryApiCall(() => api.post(`/dares/${id}/appeal`, { reason: appealReason }));
      showSuccess('Appeal submitted successfully. We will review your case.');
      setShowAppealModal(false);
      setAppealReason('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit appeal.';
      showError(errorMessage);
    } finally {
      setAppealLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-neutral-400 to-neutral-600';
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting_for_participant: 'text-blue-400',
      in_progress: 'text-yellow-400',
      completed: 'text-green-400',
      rejected: 'text-red-400',
      expired: 'text-gray-400'
    };
    return colors[status] || 'text-neutral-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting_for_participant':
        return <ClockIcon className="w-5 h-5 text-blue-400" />;
      case 'in_progress':
        return <EyeIcon className="w-5 h-5 text-yellow-400" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'expired':
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-neutral-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dare details...</div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dare Not Found</h2>
          <p className="text-neutral-400 mb-6">The dare you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Dare Details</h1>
                <p className="text-neutral-400 text-sm">Task management and participation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                dare.status === 'waiting_for_participant' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : dare.status === 'in_progress'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  : dare.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
              }`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(dare.status)}
                  <span className="capitalize">{dare.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dare Header */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className={`bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} p-4 rounded-2xl shadow-2xl`}>
                    <FireIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-3xl font-bold text-white">Dare Details</h2>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {dare.creator ? (dare.creator.fullName || dare.creator.username || 'Unknown User') : 'Anonymous'}
                    </span>
                    {dare.createdAt && (
                      <span className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        {formatRelativeTimeWithTooltip(dare.createdAt).display}
                      </span>
                    )}
                  </div>
                  
                  {dare.description && (
                    <div className="prose prose-invert max-w-none">
                      <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {dare.description}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dare Information */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-primary" />
                Dare Information
              </h3>
              
              <div className="space-y-4">
                {dare.difficulty && (
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-sm">Difficulty:</span>
                    <span className={`px-3 py-1 bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white rounded-full text-sm font-semibold`}>
                      {dare.difficulty}
                    </span>
                  </div>
                )}
                
                {dare.tags && dare.tags.length > 0 && (
                  <div className="flex items-center gap-3">
                    <TagIcon className="w-4 h-4 text-neutral-400" />
                    <div className="flex flex-wrap gap-2">
                      {dare.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-2 bg-neutral-700/50 text-neutral-300 rounded-lg text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Proof Expiration Info */}
                {dare.proofExpiresAt && (
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-4 h-4 text-yellow-400" />
                    <div className="flex-1">
                      <span className="text-neutral-400 text-sm">Proof expires:</span>
                      <span className="text-yellow-400 text-sm font-semibold ml-2">
                        {new Date(dare.proofExpiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-4">Actions</h3>
              
              <div className="flex flex-wrap gap-4">
                {dare.status === 'waiting_for_participant' && dare.creator?._id !== user?.id && (
                  <button
                    onClick={handleAcceptDare}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Accept Dare
                  </button>
                )}
                
                {dare.status === 'waiting_for_participant' && dare.creator?._id !== user?.id && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    Reject Dare
                  </button>
                )}
                
                <button
                  onClick={handleShareClick}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <ShareIcon className="w-5 h-5" />
                  Share Dare
                </button>

                {dare.creator && dare.creator._id !== user?.id && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-600/30 hover:to-red-700/30 flex items-center gap-2"
                  >
                    <FlagIcon className="w-5 h-5" />
                    Report
                  </button>
                )}
              </div>
            </div>

            {/* Grading Section */}
            {dare.status === 'completed' && dare.creator?._id === user?.id && (
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4">Grade Performance</h3>
                
                <form onSubmit={(e) => handleGrade(e, dare.performer?._id)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Grade (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Feedback</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                        rows={3}
                        placeholder="Provide constructive feedback..."
                      />
                    </div>
                  </div>
                  
                  {gradeError && (
                    <div className="text-red-400 text-sm">{gradeError}</div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={grading || !grade}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {grading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <StarIcon className="w-5 h-5" />
                        Submit Grade
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                Participants
              </h3>
              
              <div className="space-y-3">
                {dare.creator && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {dare.creator.fullName || dare.creator.username || 'Unknown User'}
                      </div>
                      <div className="text-xs text-neutral-400">Creator</div>
                    </div>
                  </div>
                )}
                
                {dare.performer && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {dare.performer.fullName || dare.performer.username}
                      </div>
                      <div className="text-xs text-neutral-400">Performer</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Timeline
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm text-neutral-300">Dare Created</div>
                </div>
                
                {dare.status !== 'waiting_for_participant' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="text-sm text-neutral-300">Dare Accepted</div>
                  </div>
                )}
                
                {dare.status === 'completed' && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm text-neutral-300">Dare Completed</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {generalError && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">{generalError}</span>
            </div>
          </div>
        )}
        
        {generalSuccess && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">{generalSuccess}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Reject Dare</h3>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-white">Reason for Rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Please provide a reason for rejecting this dare..."
                  required
                />
              </div>
              {rejectError && (
                <div className="text-red-400 text-sm">{rejectError}</div>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejecting ? 'Rejecting...' : 'Reject Dare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Report Dare</h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-white">Reason for Report</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Please provide a reason for reporting this dare..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reportLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {showAppealModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700/50 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Submit Appeal</h3>
            <form onSubmit={handleAppealSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-white">Appeal Reason</label>
                <textarea
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Please provide a reason for your appeal..."
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appealLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {appealLoading ? 'Submitting...' : 'Submit Appeal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernDareDetails; 