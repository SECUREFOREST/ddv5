import React from 'react';
import { Link } from 'react-router-dom';

function StatusBadge({ status }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let text = 'Unknown';
  switch (status) {
    case 'waiting_for_participant':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Waiting for Participant';
      break;
    case 'in_progress':
      badgeClass = 'bg-info text-info-contrast rounded-none';
      text = 'In Progress';
      break;
    case 'completed':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Completed';
      break;
    case 'forfeited':
      badgeClass = 'bg-danger text-danger-contrast rounded-none';
      text = 'Forfeited';
      break;
    case 'expired':
      badgeClass = 'bg-warning text-warning-contrast rounded-none';
      text = 'Expired';
      break;
    default:
      text = status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold ml-2 ${badgeClass}`}>{text}</span>
  );
}

export default function SwitchGameCard({ game, currentUserId, actions, className = '', onSubmitProof, onReviewProof, onGrade, onForfeit, ...props }) {
  if (!game) return null;
  const isWinner = currentUserId && game.winner && (game.winner._id === currentUserId || game.winner === currentUserId);
  const isLoser = currentUserId && game.loser && (game.loser._id === currentUserId || game.loser === currentUserId);
  const isCreator = game.creator && (game.creator._id === currentUserId || game.creator.id === currentUserId);
  const isParticipant = game.participant && (game.participant._id === currentUserId || game.participant.id === currentUserId);
  // Determine available actions
  const canSubmitProof = isLoser && game.status === 'completed' && (!game.proof || !game.proof.submitted);
  const canReviewProof = isWinner && game.status === 'completed' && game.proof && game.proof.submitted && !game.proof.reviewed;
  const canGrade = (isWinner || isLoser) && game.status === 'completed' && game.grades && !game.grades.some(g => g.user === currentUserId);
  const canForfeit = isLoser && game.status === 'in_progress';
  return (
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()} {...props}>
      <div className="flex items-center justify-between bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h3 className="text-lg font-semibold truncate w-4/5" title={game.creatorDare?.description || 'Switch Game'}>
          {game.creatorDare?.description || 'Switch Game'}
        </h3>
        <div className="flex items-center">
          <StatusBadge status={game.status} />
        </div>
      </div>
      <div className="mb-2 text-[#eee] text-sm">
        <span className="font-semibold">Creator:</span> {game.creator?.username || 'Unknown'}
        {game.participant && (
          <span className="ml-4 font-semibold">Participant:</span>
        )} {game.participant?.username || ''}
      </div>
      <div className="mb-2 text-xs text-gray-400">
        Winner: {game.winner ? (game.winner.username || 'Unknown') : 'N/A'}
        {isWinner && <span className="ml-2 text-green-600 font-semibold">(You won)</span>}
      </div>
      <div className="mb-2 text-xs text-gray-400">
        Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A'}
      </div>
      {/* Details Section */}
      <div className="mt-2 text-xs text-neutral-400">
        {game.proof && (
          <div>Proof: {game.proof.submitted ? 'Submitted' : 'Not submitted'}{game.proof.reviewed ? ' (Reviewed)' : ''}</div>
        )}
        {game.grades && game.grades.length > 0 && (
          <div>Grade: {game.grades.map(g => g.grade).join(', ')}{game.feedback && ` | Feedback: ${game.feedback}`}</div>
        )}
      </div>
      {/* Actions Section */}
      <div className="flex items-center justify-end gap-2 mt-2">
        {canSubmitProof && <button className="bg-primary text-primary-contrast rounded px-2 py-1 text-xs font-semibold" onClick={onSubmitProof}>Submit Proof</button>}
        {canReviewProof && <button className="bg-info text-info-contrast rounded px-2 py-1 text-xs font-semibold" onClick={onReviewProof}>Review Proof</button>}
        {canGrade && <button className="bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold" onClick={onGrade}>Grade</button>}
        {canForfeit && <button className="bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold" onClick={onForfeit}>Forfeit</button>}
        {actions}
      </div>
    </div>
  );
} 