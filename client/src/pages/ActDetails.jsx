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
  const isPerformer = user && act && user.username === act.performer;
  const canSubmitProof = isPerformer && act.status !== 'completed' && !submittedProof;

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proof.trim() && !proofFile) {
      setProofError('Please enter proof of completion or upload a file.');
      return;
    }
    const formData = new FormData();
    formData.append('text', proof);
    if (proofFile) formData.append('file', proofFile);
    try {
      const res = await api.post(`/acts/${act._id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` },
      });
      setSubmittedProof(res.data.proof);
      setShowProofModal(false);
      setProof('');
      setProofFile(null);
      setProofError('');
    } catch (err) {
      setProofError('Failed to submit proof.');
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

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">{act.title} <StatusBadge status={act.status} /></h1>
        <div style={{ marginTop: 10, marginBottom: 10 }}>
          <input
            id="sharable-link-input"
            className="sharable-link"
            type="text"
            value={actUrl}
            readOnly
            style={{ maxWidth: 320, display: 'inline-block', marginRight: 8 }}
            onFocus={e => e.target.select()}
          />
          <button className="btn btn-default btn-xs" onClick={handleShareClick} style={{ verticalAlign: 'top' }}>
            Share
          </button>
        </div>
      </div>
      <div className="panel-body">
        <div className="well">
          <Markdown>{act.description}</Markdown>
        </div>
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
                    <span className="label label-default">{c.author?.username || 'Unknown'}:</span> <Markdown className="inline">{c.text}</Markdown>
                    <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>{new Date(c.createdAt).toLocaleString()}</span>
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
    </div>
  );
} 