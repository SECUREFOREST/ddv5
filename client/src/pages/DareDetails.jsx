import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Markdown from '../components/Markdown';
import Modal from '../components/Modal';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/DareCard';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';

export default function DareDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
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
      setReportMessage('Report submitted. Thank you for helping keep the community safe.');
      setReportReason('');
      setTimeout(() => setShowReportModal(false), 1500);
    } catch (err) {
      setReportError(err.response?.data?.error || 'Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    api.get(`/dares/${id}`)
      .then(res => setDare(res.data))
      .catch(() => setDare(null))
      .finally(() => setLoading(false));
  }, [id, refresh]);

  // Remove all comment-related state, handlers, and UI

  // Assume dare.performer is the username of the performer
  const isPerformer = user && dare && user.id === (dare.performer?._id || dare.performer);
  const canAccept = user && dare && !dare.performer && dare.status === 'open' && !roleRestricted;
  const canSubmitProof = isPerformer && dare.status !== 'completed' && !submittedProof;
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  const handleAcceptDare = async () => {
    setAcceptLoading(true);
    setAcceptError('');
    try {
      await api.post(`/dares/${dare._id}/accept`);
      setRefresh(r => r + 1);
    } catch (err) {
      setAcceptError(err.response?.data?.error || 'Failed to accept dare.');
    } finally {
      setAcceptLoading(false);
    }
  };

  // Only the performer is considered a participant for rejection
  const isPerformerParticipant = user && dare && dare.performer && user.username === dare.performer;

  const handleReject = async (e) => {
    e.preventDefault();
    setRejectError('');
    setRejecting(true);
    try {
      const res = await api.post(`/dares/${dare._id}/reject`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDare(res.data.dare);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      setRejectError(err.response?.data?.error || 'Failed to reject dare.');
    } finally {
      setRejecting(false);
    }
  };

  // Role restriction logic
  const roleRestricted = dare && dare.allowedRoles && dare.allowedRoles.length > 0 && (!user || !user.roles || !user.roles.some(r => dare.allowedRoles.includes(r)));

  // Proof expiration logic
  const proofExpired = dare && dare.proofExpiresAt && new Date() > new Date(dare.proofExpiresAt);

  // Check if user has already graded this dare
  const hasGraded = user && dare && dare.grades && dare.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id));

  // Check if user has already graded the other party
  const hasGradedPerformer = user && dare && dare.grades && dare.performer && dare.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === dare.performer._id || g.target === dare.performer._id || g.target === dare.performer));
  const hasGradedCreator = user && dare && dare.grades && dare.creator && dare.grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === dare.creator._id || g.target === dare.creator._id || g.target === dare.creator));

  // New handleGrade for bidirectional grading
  const handleGrade = async (e, targetId) => {
    e.preventDefault();
    setGradeError('');
    setGeneralError('');
    setGeneralSuccess('');
    if (!grade) {
      setGradeError('Please select a grade.');
      setGeneralError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/dares/${id}/grade`, { grade: Number(grade), feedback, target: targetId });
      setGrade('');
      setFeedback('');
      setRefresh(r => r + 1);
      setGeneralSuccess('Grade submitted successfully!');
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
      setGeneralError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  if (loading) return <div className="text-[#888]">Loading...</div>;
  if (!dare) return <div className="text-danger font-semibold">Dare not found.</div>;

  // Sharable link logic
  const dareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dares/${id}` : `/dares/${id}`;
  const handleShareClick = () => {
    const input = document.getElementById('sharable-link-input');
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  };

  // Slot/cooldown logic
  const inCooldown = user && user.actCooldownUntil && new Date(user.actCooldownUntil) > new Date();
  const atSlotLimit = user && user.openDares >= 5;

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
      await api.post('/appeals', { type: 'dare', targetId: dare._id, reason: appealReason });
      setAppealMessage('Appeal submitted. An admin will review your request.');
      setAppealReason('');
      setTimeout(() => setShowAppealModal(false), 1500);
    } catch (err) {
      setAppealError(err.response?.data?.error || 'Failed to submit appeal.');
    } finally {
      setAppealLoading(false);
    }
  };

  const isAdmin = user && user.roles && user.roles.includes('admin');
  const isModerator = user && user.roles && user.roles.includes('moderator');

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
      setEditCommentId(null);
      setEditCommentText('');
      setRefresh(r => r + 1);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to edit comment.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setRefresh(r => r + 1);
    } catch {}
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
      await api.patch(`/comments/${moderateCommentId}/moderate`, { reason: moderationReason });
      setShowModerateModal(false);
      setModerateCommentId(null);
      setModerationReason('');
      setRefresh(r => r + 1);
    } catch (err) {
      setModerateError(err.response?.data?.error || 'Failed to moderate comment.');
    } finally {
      setModerateLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofError("");
    setProofLoading(true);
    setProofProgress(0);
    try {
      if (!proof && !proofFile) {
        setProofError("Please provide proof text or upload a file.");
        setProofLoading(false);
        return;
      }
      const formData = new FormData();
      if (proof) formData.append("text", proof);
      if (proofFile) formData.append("file", proofFile);
      await api.post(`/dares/${id}/proof`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setProofProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      setShowProofModal(false);
      setProof("");
      setProofFile(null);
      setSubmittedProof(null); // Will refresh below
      setRefresh(r => r + 1);
    } catch (err) {
      setProofError(err.response?.data?.error || "Failed to submit proof.");
    } finally {
      setProofLoading(false);
      setProofProgress(0);
    }
  };

  // Show grading form if user is creator, dare is completed, and not yet graded by creator for performer
  const isCreator = user && dare && (user.id === (dare.creator?._id || dare.creator));
  const canGrade = isCreator && dare.status === 'completed' && dare.performer && !hasGradedPerformer;

  // Find grades given and received
  const myGivenGrade = dare && dare.grades && user && dare.grades.find(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === (dare.performer?._id || dare.performer) || g.target === (dare.performer?._id || dare.performer)));
  const myReceivedGrade = dare && dare.grades && user && dare.grades.find(g => g.target && (g.target._id === user.id || g.target === user.id));
  const allGrades = dare && dare.grades && dare.grades.length > 0 ? dare.grades : [];

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      {/* Header: Description & Status */}
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">{dare?.description} <StatusBadge status={dare?.status} /></h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-neutral-400 text-sm">
          <span>By <b>{dare?.creator?.username || 'Unknown'}</b></span>
          <span>| Participant: <b>{dare?.performer?.username || 'None yet'}</b></span>
          <span>| Difficulty: <b>{dare?.difficulty}</b></span>
        </div>
      </div>
      {/* Share Link */}
      <div className="flex items-center gap-2 mb-4">
        <input
          id="sharable-link-input"
          className="w-full max-w-xs rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary mr-2"
          type="text"
          value={dareUrl}
          readOnly
          onFocus={e => e.target.select()}
        />
        <button className="bg-primary text-primary-contrast rounded px-3 py-1 font-semibold text-xs hover:bg-primary-dark" onClick={handleShareClick}>
          Share
        </button>
      </div>
      {/* Markdown Description */}
      <div className="bg-neutral-900 rounded p-4 mb-4">
        <Markdown>{dare?.description || ''}</Markdown>
      </div>
      {/* Proof Section */}
      {dare?.proof && (dare.proof.text || dare.proof.fileUrl) && (
        <div className="bg-neutral-900 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Proof</h2>
          {dare.proof.text && (
            <div className="mb-2 text-neutral-100">{dare.proof.text}</div>
          )}
          {dare.proof.fileUrl && (
            <div className="flex justify-center">
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(dare.proof.fileName || dare.proof.fileUrl) ? (
                <img
                  src={dare.proof.fileUrl.startsWith('http') ? dare.proof.fileUrl : `https://api.deviantdare.com${dare.proof.fileUrl}`}
                  alt="Proof"
                  className="max-w-full rounded shadow mb-2"
                  style={{ maxHeight: 400 }}
                />
              ) : (
                <video
                  src={dare.proof.fileUrl.startsWith('http') ? dare.proof.fileUrl : `https://api.deviantdare.com${dare.proof.fileUrl}`}
                  controls
                  className="max-w-full rounded shadow mb-2"
                  style={{ maxHeight: 400 }}
                />
              )}
            </div>
          )}
        </div>
      )}
      {/* Grades Section */}
      <div className="bg-neutral-900 rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Grades & Feedback</h2>
        {dare?.grades && dare.grades.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {dare.grades.map((g, i) => (
              <li key={i} className="flex items-center gap-3 bg-neutral-800 rounded p-2">
                <Avatar user={g.user} size={24} />
                <span className="font-semibold">{g.user?.username || 'Unknown'}</span>
                <span className="text-xs text-gray-400">
                  ({g.user && dare.creator && (g.user._id === dare.creator._id || g.user === dare.creator._id || g.user === dare.creator) ? 'Creator' : 'Performer'})
                </span>
                <span className="mx-2">→</span>
                <Avatar user={g.target} size={24} />
                <span className="font-semibold">{g.target?.username || 'Unknown'}</span>
                <span className="text-xs text-gray-400">
                  ({g.target && dare.creator && (g.target._id === dare.creator._id || g.target === dare.creator._id || g.target === dare.creator) ? 'Creator' : 'Performer'})
                </span>
                <span className="ml-4 bg-primary text-white rounded px-2 py-1 text-xs font-semibold">
                  {g.grade}
                </span>
                {g.feedback && <span className="text-gray-400 ml-2">({g.feedback})</span>}
                {g.createdAt && (
                  <span className="ml-2 text-xs text-gray-500">{new Date(g.createdAt).toLocaleString()}</span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 mb-4 text-center">No grades yet.</div>
        )}
        {/* Grading Forms */}
        {user && dare && dare.creator && dare.performer && !proofExpired && (
          <>
            {/* Creator grades performer */}
            {user.id === (dare.creator._id || dare.creator) && !hasGradedPerformer && (
              <form onSubmit={e => handleGrade(e, dare.performer._id || dare.performer)} className="space-y-4 mb-4">
                <label className="block font-semibold mb-1 text-primary">Grade the Participant</label>
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button
                      type="button"
                      key={num}
                      className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-colors ${Number(grade) === num ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-primary/20'}`}
                      onClick={() => setGrade(num)}
                      aria-label={`Score ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (optional)" />
                {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={grading || !grade}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
            {/* Performer grades creator */}
            {user.id === (dare.performer._id || dare.performer) && !hasGradedCreator && (
              <form onSubmit={e => handleGrade(e, dare.creator._id || dare.creator)} className="space-y-4 mb-4">
                <label className="block font-semibold mb-1 text-primary">Grade the Creator</label>
                <div className="flex gap-2 mb-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <button
                      type="button"
                      key={num}
                      className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 transition-colors ${Number(grade) === num ? 'bg-primary text-primary-contrast border-primary' : 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:bg-primary/20'}`}
                      onClick={() => setGrade(num)}
                      aria-label={`Score ${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback (optional)" />
                {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={grading || !grade}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
      {/* Actions Section */}
      <div className="space-y-4 mb-6">
        {canAccept && (
          <button className="w-full bg-success text-success-contrast rounded px-4 py-2 font-semibold hover:bg-success-dark" onClick={dare ? handleAcceptDare : undefined} disabled={acceptLoading || !dare}>
            {acceptLoading ? 'Accepting...' : 'Accept & Perform This Dare'}
          </button>
        )}
        {canSubmitProof && !inCooldown && !atSlotLimit && !roleRestricted && (
          <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={() => setShowProofModal(true)}>
            Submit Proof of Completion
          </button>
        )}
        {isPerformerParticipant && dare.status !== 'rejected' && (
          <button className="w-full bg-danger text-danger-contrast rounded px-4 py-2 font-semibold hover:bg-danger-dark" onClick={() => setShowRejectModal(true)}>
            Reject Dare
          </button>
        )}
      </div>
      {/* Slot/cooldown enforcement messages */}
      {inCooldown && (
        <div className="bg-warning bg-opacity-10 text-warning rounded px-4 py-3 my-5">
          <b>You are in cooldown after a recent rejection.</b><br />
          You can start or perform new dares after your cooldown expires:
          <Countdown target={user.actCooldownUntil} />
        </div>
      )}
      {atSlotLimit && (
        <div className="bg-warning bg-opacity-10 text-warning rounded px-4 py-3 my-5">
          <b>You have reached the maximum of 5 open dares.</b><br />
          Complete or reject a dare to free up a slot.
        </div>
      )}
      {roleRestricted && (
        <div className="bg-warning bg-opacity-10 text-warning rounded px-4 py-3 my-5">
          <b>You do not have the required role to participate in this dare.</b><br />
          Allowed roles: {dare && dare.allowedRoles ? dare.allowedRoles.join(', ') : ''}
        </div>
      )}
      {/* Modals Section */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Dare" role="dialog" aria-modal="true">
        <form onSubmit={handleReject} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Reason for rejection:</label>
            <textarea
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter the reason for rejection (required)"
              required
            />
          </div>
          {rejectError && <div className="text-red-500 text-sm">{rejectError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowRejectModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-red-500 text-white rounded px-4 py-2 font-semibold text-sm hover:bg-red-600" disabled={rejecting}>
              {rejecting ? 'Rejecting...' : 'Reject Dare'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showProofModal} onClose={() => setShowProofModal(false)} title="Submit Proof of Completion" role="dialog" aria-modal="true">
        <form onSubmit={handleProofSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Describe what you did (optional):</label>
            <textarea
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={4}
              placeholder="Describe your proof, add context, or leave blank if uploading a file."
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Upload image or video proof:</label>
            <input
              type="file"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              onChange={e => setProofFile(e.target.files[0])}
              accept="image/*,video/mp4,video/webm,video/quicktime"
            />
            <small className="text-gray-400">Accepted file types: images (jpg, png, gif) or video (mp4, mov, webm). Max size: 50MB.</small>
          </div>
          {proofLoading && (
            <div className="w-full bg-gray-200 rounded h-2 mb-2">
              <div className="bg-primary h-2 rounded" style={{ width: `${proofProgress}%` }} />
            </div>
          )}
          {proofError && <div className="text-red-500 text-sm">{proofError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowProofModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={proofLoading}>
              {proofLoading ? (proofProgress > 0 ? `Uploading... ${proofProgress}%` : 'Submitting...') : 'Submit Proof'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showReportModal} onClose={() => setShowReportModal(false)} title="Report Comment" role="dialog" aria-modal="true">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Reason for reporting:</label>
            <textarea
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={3}
              placeholder="Enter the reason for reporting (required)"
              required
            />
          </div>
          {reportMessage && <div className="text-green-600 text-sm">{reportMessage}</div>}
          {reportError && <div className="text-red-500 text-sm">{reportError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowReportModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-red-500 text-white rounded px-4 py-2 font-semibold text-sm hover:bg-red-600" disabled={reportLoading}>
              {reportLoading ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showAppealModal} onClose={() => setShowAppealModal(false)} title="Appeal Rejected Dare" role="dialog" aria-modal="true">
        <form onSubmit={handleAppealSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-primary">Reason for appeal:</label>
            <textarea
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={appealReason}
              onChange={e => setAppealReason(e.target.value)}
              rows={3}
              placeholder="Enter the reason for your appeal (required)"
              required
            />
          </div>
          {appealMessage && <div className="text-success text-sm font-medium">{appealMessage}</div>}
          {appealError && <div className="text-danger text-sm font-medium">{appealError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-neutral-700 text-neutral-100 rounded px-4 py-2 font-semibold text-sm hover:bg-neutral-900" onClick={() => setShowAppealModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={appealLoading}>
              {appealLoading ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={editCommentId !== null} onClose={() => setEditCommentId(null)} title="Edit Comment" role="dialog" aria-modal="true">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Edit your comment:</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={editCommentText}
              onChange={e => setEditCommentText(e.target.value)}
              required
            />
          </div>
          {editError && <div className="text-red-500 text-sm">{editError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setEditCommentId(null)}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showModerateModal} onClose={() => setShowModerateModal(false)} title="Moderate/Hide Comment" role="dialog" aria-modal="true">
        <form onSubmit={handleModerateSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Reason for hiding/moderating:</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={moderationReason}
              onChange={e => setModerationReason(e.target.value)}
              required
            />
          </div>
          {moderateError && <div className="text-red-500 text-sm">{moderateError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowModerateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="bg-yellow-500 text-white rounded px-4 py-2 font-semibold text-sm hover:bg-yellow-600" disabled={moderateLoading}>
              {moderateLoading ? 'Hiding...' : 'Hide'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 