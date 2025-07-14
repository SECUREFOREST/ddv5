import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Markdown from '../components/Markdown';
import Modal from '../components/Modal';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/DareCard';
import { Banner } from '../components/Modal';

export default function DareDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
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

  const handleComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    setGeneralError('');
    setGeneralSuccess('');
    if (!comment.trim()) {
      setCommentError('Comment cannot be empty.');
      setGeneralError('Comment cannot be empty.');
      return;
    }
    setCommentLoading(true);
    try {
      await api.post(`/dares/${id}/comment`, { text: comment });
      setComment('');
      setRefresh(r => r + 1);
      setGeneralSuccess('Comment added!');
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to add comment');
      setGeneralError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleGrade = async (e) => {
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
      await api.post(`/dares/${id}/grade`, { grade: Number(grade), feedback });
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

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#888] flex items-center justify-center gap-2">{dare?.description} <StatusBadge status={dare?.status} /></h1>
        <div className="flex items-center gap-2">
          <input
            id="sharable-link-input"
            className="w-full max-w-xs rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary mr-2"
            type="text"
            value={dareUrl}
            readOnly
            onFocus={e => e.target.select()}
          />
          <button className="bg-gray-200 text-gray-800 rounded px-3 py-1 font-semibold text-xs hover:bg-gray-300" onClick={handleShareClick}>
            Share
          </button>
        </div>
      </div>
      <div>
        <div className="bg-neutral-900 rounded p-4 mb-4">
          <Markdown>{dare?.description || ''}</Markdown>
        </div>
        {canAccept && (
          <div className="my-5">
            <button className="w-full bg-success text-success-contrast rounded px-4 py-2 font-semibold hover:bg-success-dark" onClick={dare ? handleAcceptDare : undefined} disabled={acceptLoading || !dare}>
              {acceptLoading ? 'Accepting...' : 'Accept & Perform This Dare'}
            </button>
            {acceptError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{acceptError}</div>}
          </div>
        )}
        <div className="text-neutral-400 mb-4 text-center">
          By {dare?.creator?.username || 'Unknown'} |
          Participant: {dare?.performer?.username || 'None yet'} |
          Status: <StatusBadge status={dare?.status} /> |
          Difficulty: {dare?.difficulty}
        </div>
        {/* Proof expiration countdown and message */}
        {dare && dare.proofExpiresAt && !proofExpired && (
          <div className="bg-info bg-opacity-10 text-info rounded px-4 py-3 my-5 text-center">
            <b>Proof review period:</b> <Countdown target={dare.proofExpiresAt} />
          </div>
        )}
        {dare && proofExpired && (
          <div className="bg-warning bg-opacity-10 text-warning rounded px-4 py-3 my-5 text-center">
            <b>Proof review period expired.</b> Grading and approval are no longer allowed.
          </div>
        )}
        {/* Proof Section */}
        {dare?.proof && (dare.proof.text || dare.proof.fileUrl) && (
          <div className="bg-neutral-900 rounded p-4 mb-6">
            <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Proof</h2>
            {dare.proof.text && (
              <div className="mb-2 text-neutral-100">{dare.proof.text}</div>
            )}
            {dare.proof.fileUrl && (
              <>
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
                <div>
                  <a
                    href={dare.proof.fileUrl.startsWith('http') ? dare.proof.fileUrl : `https://api.deviantdare.com${dare.proof.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Download Proof
                  </a>
                </div>
              </>
            )}
          </div>
        )}
        {/* Grades Section */}
        <div className="bg-neutral-900 rounded p-4 mb-6">
          <div className="border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Grades</h2>
          </div>
          <div>
            {dare?.grades && dare.grades.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {dare.grades.map((g, i) => (
                  <li key={i} className="flex items-center gap-2 bg-neutral-800 rounded p-2">
                    <span className="bg-primary text-white rounded px-2 py-1 text-xs font-semibold">Grade:</span> {g.grade} {g.feedback && <span className="text-gray-400 ml-2">({g.feedback})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 mb-4 text-center">No grades yet.</div>
            )}
            {user && !proofExpired && (
              <form onSubmit={handleGrade} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-primary">Your Grade (1-10)</label>
                  <input type="number" min="1" max="10" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={grade} onChange={e => setGrade(e.target.value)} required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-primary">Feedback (optional)</label>
                  <input className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={feedback} onChange={e => setFeedback(e.target.value)} />
                </div>
                {gradeError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{gradeError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={grading}>
                  {grading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </form>
            )}
          </div>
        </div>
        {/* Comments Section */}
        <div className="bg-neutral-900 text-neutral-100 border border-[#282828] px-[15px] py-[10px] rounded-lg shadow-sm p-4 mb-6">
          <div className="border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold text-center mb-4 text-[#888]">Comments</h2>
          </div>
          <div>
            {dare?.comments && dare.comments.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {dare.comments.map((c, i) => (
                  <li key={i} className="bg-neutral-800 rounded p-3">
                    {c.deleted ? (
                      <span className="text-gray-400">This comment was deleted.</span>
                    ) : c.hidden ? (
                      <span className="text-gray-400">This comment was hidden by a moderator.</span>
                    ) : editCommentId === c._id ? (
                      <form onSubmit={handleEditSubmit} className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                          value={editCommentText}
                          onChange={e => setEditCommentText(e.target.value)}
                          required
                        />
                        <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-3 py-2 font-semibold text-xs hover:bg-primary-dark" disabled={editLoading}>
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="w-full bg-gray-200 text-gray-800 rounded px-3 py-2 font-semibold text-xs hover:bg-gray-300" onClick={() => setEditCommentId(null)}>
                          Cancel
                        </button>
                        {editError && <div className="text-danger text-xs font-medium">{editError}</div>}
                      </form>
                    ) : (
                      <>
                        <span className="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs font-semibold mr-2">{c.author?.username || 'Unknown'}:</span> <Markdown className="inline">{c.text}</Markdown>
                        <span className="text-gray-400 ml-2 text-xs">{new Date(c.createdAt).toLocaleString()}</span>
                        {c.editedAt && <span className="text-gray-400 ml-2 text-xs">(edited)</span>}
                        {user && (user.id === c.author?._id || isAdmin) && !c.deleted && !c.hidden && (
                          <>
                            <button
                              className="ml-2 text-primary underline text-xs focus:outline-none"
                              onClick={() => openEditModal(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="ml-2 text-red-500 underline text-xs focus:outline-none"
                              onClick={() => handleDeleteComment(c._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {(isAdmin || isModerator) && !c.deleted && !c.hidden && (
                          <button
                            className="ml-2 text-yellow-500 underline text-xs focus:outline-none"
                            onClick={() => openModerateModal(c._id)}
                          >
                            Hide
                          </button>
                        )}
                        {user && (
                          <button
                            className="ml-4 text-red-500 underline text-xs focus:outline-none"
                            onClick={() => openReportModal(c._id)}
                          >
                            Report
                          </button>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 mb-4 text-center">No comments yet.</div>
            )}
            {user && (
              <form onSubmit={handleComment} className="space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-primary">Add a Comment</label>
                  <textarea className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={comment} onChange={e => setComment(e.target.value)} required />
                </div>
                {commentError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{commentError}</div>}
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark">
                  Submit Comment
                </button>
              </form>
            )}
          </div>
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
        {/* Only show proof submission if not in cooldown, not at slot limit, and not role restricted */}
        {canSubmitProof && !inCooldown && !atSlotLimit && !roleRestricted && (
          <div className="my-5">
            <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={() => setShowProofModal(true)}>
              Submit Proof of Completion
            </button>
          </div>
        )}
        {submittedProof && (
          <div className="alert alert-info" style={{ margin: '20px 0' }}>
            <b>Proof submitted:</b>
            {submittedProof.text && <div style={{ margin: '8px 0' }}>{submittedProof.text}</div>}
            {submittedProof.fileUrl && (
              <div style={{ marginTop: 8 }}>
                {submittedProof.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={submittedProof.fileUrl} alt="Proof" style={{ maxWidth: 240, display: 'block', borderRadius: 8, marginBottom: 8 }} />
                ) : submittedProof.fileUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video controls style={{ maxWidth: 320, borderRadius: 8, marginBottom: 8 }}>
                    <source src={submittedProof.fileUrl} type={`video/${submittedProof.fileUrl.split('.').pop()}`} />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <a href={submittedProof.fileUrl} target="_blank" rel="noopener noreferrer">
                    {submittedProof.fileName || 'Download file'}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
        {isPerformerParticipant && dare.status !== 'rejected' && (
          <div style={{ margin: '20px 0' }}>
            <button className="btn btn-danger" onClick={() => setShowRejectModal(true)}>
              Reject Dare
            </button>
          </div>
        )}
      </div> {/* <-- Close main content div before modals */}
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