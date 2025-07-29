import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Markdown from '../components/Markdown';
import Modal from '../components/Modal';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/DareCard';

import Avatar from '../components/Avatar';
import { Squares2X2Icon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, TagIcon, FireIcon, UserIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

export default function DareDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const { showSuccess, showError } = useToast();
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
  const [submittedProof, setSubmittedProof] = useState(dare?.proof || null);
  const [proofFile, setProofFile] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState('');
  const [reportError, setReportError] = useState('');
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealError, setAppealError] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [moderateCommentId, setModerateCommentId] = useState(null);
  const [moderationReason, setModerationReason] = useState('');
  const [moderateLoading, setModerateLoading] = useState(false);
  const [moderateError, setModerateError] = useState('');
  const [proofLoading, setProofLoading] = useState(false);
  const [proofProgress, setProofProgress] = useState(0);
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const openReportModal = (commentId) => {
    setReportCommentId(commentId);
    setReportReason('');
    setReportMessage('');
    setReportError('');
    setShowReportModal(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportLoading(true);
    setReportMessage('');
    setReportError('');
    try {
      await api.post(`/comments/${reportCommentId}/report`, { reason: reportReason });
      const successMessage = 'Report submitted. Thank you for helping keep the community safe.';
      setReportMessage(successMessage);
      setReportReason('');
      setTimeout(() => setShowReportModal(false), 1500);
      showSuccess(successMessage);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit report.';
      setReportError(errorMessage);
      showError(errorMessage);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/dares/${id}`)
      .then(res => {
        setDare(res.data);
        showSuccess('Dare details loaded successfully!');
      })
      .catch((error) => {
        setDare(null);
        showError('Failed to load dare details. Please try again.');
        console.error('Dare details loading error:', error);
      })
      .finally(() => setLoading(false));
  }, [id, refresh, showSuccess, showError]);

  // Remove all comment-related state, handlers, and UI

  const handleAcceptDare = async () => {
    try {
      await api.post(`/dares/${id}/accept`);
      showSuccess('Dare accepted successfully!');
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
      await api.post(`/dares/${id}/reject`, { reason: rejectReason });
      showSuccess('Dare rejected successfully.');
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
      await api.post(`/dares/${id}/grade`, {
        targetId,
        grade: parseInt(grade),
        feedback
      });
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

  const openAppealModal = () => {
    setAppealReason('');
    setAppealMessage('');
    setAppealError('');
    setShowAppealModal(true);
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    setAppealLoading(true);
    setAppealMessage('');
    setAppealError('');
    try {
      await api.post(`/dares/${id}/appeal`, { reason: appealReason });
      const successMessage = 'Appeal submitted successfully. We will review your case.';
      setAppealMessage(successMessage);
      setAppealReason('');
      setTimeout(() => setShowAppealModal(false), 2000);
      showSuccess(successMessage);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit appeal.';
      setAppealError(errorMessage);
      showError(errorMessage);
    } finally {
      setAppealLoading(false);
    }
  };

  const openEditModal = (comment) => {
    setEditCommentId(comment._id);
    setEditCommentText(comment.text);
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      await api.patch(`/comments/${editCommentId}`, { text: editCommentText });
      showSuccess('Comment updated successfully!');
      setEditCommentId(null);
      setEditCommentText('');
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update comment.';
      setEditError(errorMessage);
      showError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      showSuccess('Comment deleted successfully!');
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete comment.';
      showError(errorMessage);
    }
  };

  const openModerateModal = (commentId) => {
    setModerateCommentId(commentId);
    setModerationReason('');
    setModerateError('');
    setShowModerateModal(true);
  };

  const handleModerateSubmit = async (e) => {
    e.preventDefault();
    setModerateLoading(true);
    setModerateError('');
    try {
      await api.post(`/comments/${moderateCommentId}/moderate`, { reason: moderationReason });
      showSuccess('Comment moderated successfully!');
      setShowModerateModal(false);
      setModerationReason('');
      setRefresh(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to moderate comment.';
      setModerateError(errorMessage);
      showError(errorMessage);
    } finally {
      setModerateLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    setProofError('');
    try {
      const formData = new FormData();
      formData.append('proof', proof);
      if (proofFile) {
        formData.append('proofFile', proofFile);
      }
      
      await api.post(`/dares/${id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProofProgress(percentCompleted);
        }
      });
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="bg-neutral-800/50 rounded-xl p-12 border border-neutral-700/30">
                <div className="text-neutral-400 text-xl mb-4">Dare Not Found</div>
                <p className="text-neutral-500 text-sm mb-6">
                  The dare you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                  <FireIcon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-white">Dare Details</h1>
                  <StatusBadge status={dare.status} />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-neutral-400 mb-4">
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    {dare.creator?.fullName || dare.creator?.username || 'Anonymous'}
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
                    <Markdown content={dare.description} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dare Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Difficulty and Tags */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-6 h-6 text-primary" />
                  Dare Information
                </h2>
                
                <div className="space-y-4">
                  {dare.difficulty && (
                    <div className="flex items-center gap-3">
                      <span className="text-neutral-400 text-sm">Difficulty:</span>
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                        {dare.difficulty}
                      </span>
                    </div>
                  )}
                  
                  {dare.tags && dare.tags.length > 0 && (
                    <div className="flex items-center gap-3">
                      <TagIcon className="w-4 h-4 text-neutral-400" />
                      <div className="flex flex-wrap gap-2">
                        {dare.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-2 bg-neutral-700/50 text-neutral-300 rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
                
                <div className="flex flex-wrap gap-4">
                  {dare.status === 'pending' && dare.creator?._id !== user?.id && (
                    <button
                      onClick={handleAcceptDare}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Accept Dare
                    </button>
                  )}
                  
                  {dare.status === 'pending' && dare.creator?._id !== user?.id && (
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
                    <Squares2X2Icon className="w-5 h-5" />
                    Share Dare
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Participants */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Participants</h3>
                
                <div className="space-y-3">
                  {dare.creator && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                      <Avatar user={dare.creator} size={32} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {dare.creator.fullName || dare.creator.username}
                        </div>
                        <div className="text-xs text-neutral-400">Creator</div>
                      </div>
                    </div>
                  )}
                  
                  {dare.performer && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                      <Avatar user={dare.performer} size={32} />
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
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm text-neutral-300">Dare Created</div>
                  </div>
                  
                  {dare.status !== 'pending' && (
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
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
              {generalError}
            </div>
          )}
          
          {generalSuccess && (
            <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4 text-green-300">
              {generalSuccess}
            </div>
          )}
        </main>
      </div>

      {/* Reject Dare Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Dare"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label htmlFor="reject-reason" className="block font-semibold mb-1 text-white">Reason for Rejection</label>
            <textarea
              id="reject-reason"
              name="reason"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Please provide a reason for rejecting this dare..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Reject Dare
            </button>
          </div>
        </form>
      </Modal>

      {/* Proof Submission Modal */}
      <Modal
        open={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Submit Proof"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleProofSubmit} className="space-y-4">
          <div>
            <label htmlFor="proof-description" className="block font-semibold mb-1 text-white">Description</label>
            <textarea
              id="proof-description"
              name="description"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Describe how you completed the dare..."
              required
            />
          </div>
          <div>
            <label htmlFor="proof-file" className="block font-semibold mb-1 text-white">Proof File (Optional)</label>
            <input
              type="file"
              id="proof-file"
              name="proofFile"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              accept="image/*,video/*"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowProofModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Submit Proof
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Dare"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label htmlFor="report-reason" className="block font-semibold mb-1 text-white">Reason for Report</label>
            <textarea
              id="report-reason"
              name="reason"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Please provide a reason for reporting this dare..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Submit Report
            </button>
          </div>
        </form>
      </Modal>

      {/* Appeal Modal */}
      <Modal
        open={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        title="Submit Appeal"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleAppealSubmit} className="space-y-4">
          <div>
            <label htmlFor="appeal-reason" className="block font-semibold mb-1 text-white">Appeal Reason</label>
            <textarea
              id="appeal-reason"
              name="reason"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Please provide a reason for your appeal..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowAppealModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Submit Appeal
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Comment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Comment"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-content" className="block font-semibold mb-1 text-white">Comment</label>
            <textarea
              id="edit-content"
              name="content"
              value={editCommentData.content}
              onChange={(e) => setEditCommentData({ ...editCommentData, content: e.target.value })}
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Edit your comment..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Moderate Comment Modal */}
      <Modal
        open={showModerateModal}
        onClose={() => setShowModerateModal(false)}
        title="Moderate Comment"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleModerateSubmit} className="space-y-4">
          <div>
            <label htmlFor="moderate-action" className="block font-semibold mb-1 text-white">Action</label>
            <select
              id="moderate-action"
              name="action"
              value={moderateData.action}
              onChange={(e) => setModerateData({ ...moderateData, action: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              required
            >
              <option value="">Select action...</option>
              <option value="hide">Hide Comment</option>
              <option value="delete">Delete Comment</option>
              <option value="warn">Warn User</option>
            </select>
          </div>
          <div>
            <label htmlFor="moderate-reason" className="block font-semibold mb-1 text-white">Reason</label>
            <textarea
              id="moderate-reason"
              name="reason"
              value={moderateData.reason}
              onChange={(e) => setModerateData({ ...moderateData, reason: e.target.value })}
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Provide a reason for moderation..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowModerateModal(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Moderate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}