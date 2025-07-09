import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Markdown from '../components/Markdown';
import Modal from '../components/Modal';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/ActCard';

export default function ActDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [act, setAct] = useState(null);
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
  const [submittedProof, setSubmittedProof] = useState(act?.proof || null);
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
    api.get(`/acts/${id}`)
      .then(res => setAct(res.data))
      .catch(() => setAct(null))
      .finally(() => setLoading(false));
  }, [id, refresh]);

  const handleComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    try {
      await api.post(`/acts/${id}/comment`, { text: comment });
      setComment('');
      setRefresh(r => r + 1);
    } catch (err) {
      setCommentError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setGradeError('');
    setGrading(true);
    try {
      await api.post(`/acts/${id}/grade`, { grade: Number(grade), feedback });
      setGrade('');
      setFeedback('');
      setRefresh(r => r + 1);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  // Assume act.performer is the username of the performer
  const isPerformer = user && act && user.id === (act.performer?._id || act.performer);
  const canAccept = user && act && !act.performer && act.status === 'open' && !roleRestricted;
  const canSubmitProof = isPerformer && act.status !== 'completed' && !submittedProof;
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  const handleAcceptAct = async () => {
    setAcceptLoading(true);
    setAcceptError('');
    try {
      await api.post(`/acts/${act._id}/accept`);
      setRefresh(r => r + 1);
    } catch (err) {
      setAcceptError(err.response?.data?.error || 'Failed to accept act.');
    } finally {
      setAcceptLoading(false);
    }
  };

  // Only the performer is considered a participant for rejection
  const isPerformerParticipant = user && act && act.performer && user.username === act.performer;

  const handleReject = async (e) => {
    e.preventDefault();
    setRejectError('');
    setRejecting(true);
    try {
      const res = await api.post(`/acts/${act._id}/reject`, { reason: rejectReason }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAct(res.data.act);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      setRejectError(err.response?.data?.error || 'Failed to reject act.');
    } finally {
      setRejecting(false);
    }
  };

  // Role restriction logic
  const roleRestricted = act.allowedRoles && act.allowedRoles.length > 0 && (!user || !user.roles || !user.roles.some(r => act.allowedRoles.includes(r)));

  // Proof expiration logic
  const proofExpired = act.proofExpiresAt && new Date() > new Date(act.proofExpiresAt);

  if (loading) return <div>Loading...</div>;
  if (!act) return <div className="text-danger">Act not found.</div>;

  // Sharable link logic
  const actUrl = typeof window !== 'undefined' ? `${window.location.origin}/acts/${id}` : `/acts/${id}`;
  const handleShareClick = () => {
    const input = document.getElementById('sharable-link-input');
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  };

  // Slot/cooldown logic
  const inCooldown = user && user.actCooldownUntil && new Date(user.actCooldownUntil) > new Date();
  const atSlotLimit = user && user.openActs >= 5;

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
      await api.post('/appeals', { type: 'act', targetId: act._id, reason: appealReason });
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

  return (
    <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4">
      <div className="border-b pb-2 mb-4 flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">{act.title} <StatusBadge status={act.status} /></h1>
        <div className="flex items-center gap-2">
          <input
            id="sharable-link-input"
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary mr-2"
            type="text"
            value={actUrl}
            readOnly
            onFocus={e => e.target.select()}
          />
          <button className="bg-gray-200 text-gray-800 rounded px-3 py-1 font-semibold text-xs hover:bg-gray-300" onClick={handleShareClick}>
            Share
          </button>
        </div>
      </div>
      <div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mb-4">
          <Markdown>{act.description}</Markdown>
        </div>
        {canAccept && (
          <div style={{ margin: '20px 0' }}>
            <button className="btn btn-success" onClick={handleAcceptAct} disabled={acceptLoading}>
              {acceptLoading ? 'Accepting...' : 'Accept & Perform This Act'}
            </button>
            {acceptError && <div className="text-danger help-block" style={{ marginTop: 8 }}>{acceptError}</div>}
          </div>
        )}
        <div className="text-muted" style={{ marginBottom: 10 }}>
          By {act.creator?.username || 'Unknown'} | Status: <StatusBadge status={act.status} /> | Difficulty: {act.difficulty}
        </div>
        {/* Proof expiration countdown and message */}
        {act.proofExpiresAt && !proofExpired && (
          <div className="alert alert-info" style={{ margin: '20px 0' }}>
            <b>Proof review period:</b> <Countdown target={act.proofExpiresAt} />
          </div>
        )}
        {proofExpired && (
          <div className="alert alert-warning" style={{ margin: '20px 0' }}>
            <b>Proof review period expired.</b> Grading and approval are no longer allowed.
          </div>
        )}
        {/* Disable grading/approval after proof expiration */}
        <div className="panel panel-default">
          <div className="panel-heading">
            <h2 className="panel-title" style={{ fontSize: 18 }}>Grades</h2>
          </div>
          <div className="panel-body">
        {act.grades && act.grades.length > 0 ? (
              <ul className="list-group">
            {act.grades.map((g, i) => (
                  <li key={i} className="list-group-item">
                    <span className="label label-primary">Grade:</span> {g.grade} {g.feedback && <span className="text-muted">({g.feedback})</span>}
              </li>
            ))}
          </ul>
        ) : (
              <div className="text-muted">No grades yet.</div>
        )}
            {user && !proofExpired && (
              <form onSubmit={handleGrade} style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>Your Grade (1-10)</label>
                  <input type="number" min="1" max="10" className="form-control" value={grade} onChange={e => setGrade(e.target.value)} required />
            </div>
                <div className="form-group">
                  <label>Feedback (optional)</label>
                  <input className="form-control" value={feedback} onChange={e => setFeedback(e.target.value)} />
            </div>
                {gradeError && <div className="text-danger help-block">{gradeError}</div>}
                <button type="submit" className="btn btn-primary" disabled={grading}>
              {grading ? 'Submitting...' : 'Submit Grade'}
            </button>
          </form>
        )}
      </div>
        </div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <h2 className="panel-title" style={{ fontSize: 18 }}>Comments</h2>
          </div>
          <div className="panel-body">
        {act.comments && act.comments.length > 0 ? (
              <ul className="list-group">
            {act.comments.map((c, i) => (
                  <li key={i} className="list-group-item">
                    {c.deleted ? (
                      <span className="text-muted">This comment was deleted.</span>
                    ) : c.hidden ? (
                      <span className="text-muted">This comment was hidden by a moderator.</span>
                    ) : editCommentId === c._id ? (
                      <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={editCommentText}
                          onChange={e => setEditCommentText(e.target.value)}
                          required
                          style={{ width: 220, display: 'inline-block', marginRight: 8 }}
                        />
                        <button type="submit" className="btn btn-xs btn-primary" disabled={editLoading}>
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" className="btn btn-xs btn-default" onClick={() => setEditCommentId(null)}>
                          Cancel
                        </button>
                        {editError && <div className="text-danger help-block">{editError}</div>}
                      </form>
                    ) : (
                      <>
                        <span className="label label-default">{c.author?.username || 'Unknown'}:</span> <Markdown className="inline">{c.text}</Markdown>
                        <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span>
                        {c.editedAt && <span className="text-muted" style={{ marginLeft: 8, fontSize: 11 }}>(edited)</span>}
                        {user && (user.id === c.author?._id || isAdmin) && !c.deleted && !c.hidden && (
                          <>
                            <button
                              className="btn btn-xs btn-link"
                              style={{ marginLeft: 8 }}
                              onClick={() => openEditModal(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-link text-danger"
                              style={{ marginLeft: 4 }}
                              onClick={() => handleDeleteComment(c._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {(isAdmin || isModerator) && !c.deleted && !c.hidden && (
                          <button
                            className="btn btn-xs btn-link text-warning"
                            style={{ marginLeft: 4 }}
                            onClick={() => openModerateModal(c._id)}
                          >
                            Hide
                          </button>
                        )}
                        {user && (
                          <button
                            className="btn btn-xs btn-link text-danger"
                            style={{ marginLeft: 12 }}
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
              <div className="text-muted">No comments yet.</div>
        )}
        {user && (
              <form onSubmit={handleComment} style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label>Add a Comment</label>
                  <textarea className="form-control" value={comment} onChange={e => setComment(e.target.value)} required />
            </div>
                {commentError && <div className="text-danger help-block">{commentError}</div>}
                <button type="submit" className="btn btn-primary">
              Submit Comment
            </button>
          </form>
        )}
      </div>
        </div>
        {/* Slot/cooldown enforcement messages */}
        {inCooldown && (
          <div className="alert alert-warning" style={{ margin: '20px 0' }}>
            <b>You are in cooldown after a recent rejection.</b><br />
            You can start or perform new acts after your cooldown expires:
            <Countdown target={user.actCooldownUntil} />
          </div>
        )}
        {atSlotLimit && (
          <div className="alert alert-warning" style={{ margin: '20px 0' }}>
            <b>You have reached the maximum of 5 open acts.</b><br />
            Complete or reject an act to free up a slot.
          </div>
        )}
        {roleRestricted && (
          <div className="alert alert-warning" style={{ margin: '20px 0' }}>
            <b>You do not have the required role to participate in this act.</b><br />
            Allowed roles: {act.allowedRoles.join(', ')}
          </div>
        )}
        {/* Only show proof submission if not in cooldown, not at slot limit, and not role restricted */}
        {canSubmitProof && !inCooldown && !atSlotLimit && !roleRestricted && (
          <div style={{ margin: '20px 0' }}>
            <button className="btn btn-warning" onClick={() => setShowProofModal(true)}>
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
        {isPerformerParticipant && act.status !== 'rejected' && (
          <div style={{ margin: '20px 0' }}>
            <button className="btn btn-danger" onClick={() => setShowRejectModal(true)}>
              Reject Act
            </button>
          </div>
        )}
        <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Act">
          <form onSubmit={handleReject}>
            <div className="form-group">
              <label>Reason for rejection:</label>
              <textarea
                className="form-control"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Enter the reason for rejection (required)"
                required
              />
            </div>
            {rejectError && <div className="text-danger help-block">{rejectError}</div>}
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-danger" disabled={rejecting}>
                {rejecting ? 'Rejecting...' : 'Reject Act'}
              </button>
            </div>
          </form>
        </Modal>
        {/* Show rejection reason and cooldown if rejected */}
        {act.status === 'rejected' && act.rejection && (
          <div className="alert alert-danger" style={{ margin: '20px 0' }}>
            <b>Act was rejected.</b>
            <div><b>Reason:</b> {act.rejection.reason}</div>
            {act.rejection.cooldownUntil && (
              <div>
                <b>Cooldown until:</b> {new Date(act.rejection.cooldownUntil).toLocaleString()}
              </div>
            )}
            {user && (
              <button className="btn btn-warning" style={{ marginTop: 12 }} onClick={openAppealModal}>
                Appeal This Decision
              </button>
            )}
          </div>
        )}
      </div>
      <Modal open={showProofModal} onClose={() => setShowProofModal(false)} title="Submit Proof of Completion">
        <form onSubmit={handleProofSubmit}>
          <div className="form-group">
            <label>Describe what you did (optional):</label>
            <textarea
              className="form-control"
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={4}
              placeholder="Describe your proof, add context, or leave blank if uploading a file."
            />
          </div>
          <div className="form-group">
            <label>Upload image or video proof:</label>
            <input
              type="file"
              className="form-control"
              onChange={e => setProofFile(e.target.files[0])}
              accept="image/*,video/mp4,video/webm,video/quicktime"
            />
            <small className="form-text text-muted">
              Accepted file types: images (jpg, png, gif) or video (mp4, mov, webm). Max size: 50MB.
            </small>
          </div>
          {proofError && <div className="text-danger help-block">{proofError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowProofModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Proof
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showReportModal} onClose={() => setShowReportModal(false)} title="Report Comment">
        <form onSubmit={handleReportSubmit}>
          <div className="form-group">
            <label>Reason for reporting:</label>
            <textarea
              className="form-control"
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              rows={3}
              placeholder="Enter the reason for reporting (required)"
              required
            />
          </div>
          {reportMessage && <div className="text-success help-block">{reportMessage}</div>}
          {reportError && <div className="text-danger help-block">{reportError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowReportModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={reportLoading}>
              {reportLoading ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showAppealModal} onClose={() => setShowAppealModal(false)} title="Appeal Rejected Act">
        <form onSubmit={handleAppealSubmit}>
          <div className="form-group">
            <label>Reason for appeal:</label>
            <textarea
              className="form-control"
              value={appealReason}
              onChange={e => setAppealReason(e.target.value)}
              rows={3}
              placeholder="Enter the reason for your appeal (required)"
              required
            />
          </div>
          {appealMessage && <div className="text-success help-block">{appealMessage}</div>}
          {appealError && <div className="text-danger help-block">{appealError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowAppealModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={appealLoading}>
              {appealLoading ? 'Submitting...' : 'Submit Appeal'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={editCommentId !== null} onClose={() => setEditCommentId(null)} title="Edit Comment">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>Edit your comment:</label>
            <input
              type="text"
              className="form-control"
              value={editCommentText}
              onChange={e => setEditCommentText(e.target.value)}
              required
            />
          </div>
          {editError && <div className="text-danger help-block">{editError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setEditCommentId(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal open={showModerateModal} onClose={() => setShowModerateModal(false)} title="Moderate/Hide Comment">
        <form onSubmit={handleModerateSubmit}>
          <div className="form-group">
            <label>Reason for hiding/moderating:</label>
            <input
              type="text"
              className="form-control"
              value={moderationReason}
              onChange={e => setModerationReason(e.target.value)}
              required
            />
          </div>
          {moderateError && <div className="text-danger help-block">{moderateError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowModerateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-warning" disabled={moderateLoading}>
              {moderateLoading ? 'Hiding...' : 'Hide'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 