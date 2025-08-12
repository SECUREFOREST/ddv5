import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

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
    case 'awaiting_proof':
      badgeClass = 'bg-warning text-warning-contrast rounded-none';
      text = 'Awaiting Proof';
      break;
    case 'proof_submitted':
      badgeClass = 'bg-info text-info-contrast rounded-none';
      text = 'Proof Submitted';
      break;
    case 'completed':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Completed';
      break;
    case 'chickened_out':
      badgeClass = 'bg-danger text-danger-contrast rounded-none';
      text = 'Chickened Out';
      break;
    case 'expired':
      badgeClass = 'bg-red-900 text-red-200 rounded-none';
      text = 'Expired';
      break;
    default:
      text = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold ml-2 ${badgeClass}`}>{text}</span>
  );
}

function Tag({ tag }) {
  return (
    <span className="bg-primary text-primary-contrast px-2 py-1 rounded-none text-xs font-semibold mr-2">{tag}</span>
  );
}

export default function SwitchGameCard({ game, currentUserId, actions, className = '', onSubmitProof, onReviewProof, onGrade, onChickenOut, onFixGameState, ...props }) {
  if (!game) return null;
  
  // Helper function to safely compare ObjectIds
  const isSameUser = (user1, user2) => {
    if (!user1 || !user2) return false;
    const id1 = user1._id || user1;
    const id2 = user2._id || user2;
    return id1.toString() === id2.toString();
  };
  
  const isWinner = currentUserId && game.winner && isSameUser(game.winner, currentUserId);
  const isLoser = currentUserId && game.loser && isSameUser(game.loser, currentUserId);
  const isCreator = game.creator && isSameUser(game.creator, currentUserId);
  const isParticipant = game.participant && isSameUser(game.participant, currentUserId);
  // Determine available actions
  const canSubmitProof = (isLoser || game.bothLose) && game.status === 'awaiting_proof' && (!game.proof || !game.proof.user);
  const canReviewProof = isWinner && game.status === 'proof_submitted' && game.proof && !game.proof.review?.action;
  const canGrade = (isWinner || isLoser) && game.status === 'completed' && game.grades && !game.grades.some(g => isSameUser(g.user, currentUserId));
  const canChickenOut = (isCreator || isParticipant) && game.status === 'in_progress';

  // Helper for clickable profile links
  const userProfileLink = (user) => {
    if (!user) return '#';
    return isSameUser(user, currentUserId) ? '/profile' : `/profile/${user._id}`;
  };

  return (
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()} {...props}>
      {/* Header with description and status */}
      <div className="flex items-center justify-between bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h3 className="text-lg font-semibold truncate w-4/5" title={game.creatorDare?.description || 'Switch Game'}>
          {game.creatorDare?.description || 'Switch Game'}
        </h3>
        <div className="flex items-center">
          {/* No difficulty badge for switch games, but you can add if available: */}
          {/* <DifficultyBadge level={game.difficulty} /> */}
          <StatusBadge status={game.status} />
        </div>
      </div>
      {/* Tags if available */}
      {Array.isArray(game.tags) && game.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap">
          {game.tags.map(tag => <Tag key={tag} tag={tag} />)}
        </div>
      )}
      {/* User info: creator and participant */}
      <div className="flex flex-col gap-2 mt-2">
        <Link
          to={userProfileLink(game.creator)}
          className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
          style={{ textDecoration: 'none' }}
        >
          <span className="text-neutral-400 text-xs mr-2">Creator:</span>
          <Avatar user={game.creator} size={28} className="mr-2" />
          <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">
            {game.creator?.fullName || game.creator?.username || 'Anonymous'}
          </span>
        </Link>
        {game.participant && (
          <Link
            to={userProfileLink(game.participant)}
            className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-2">Participant:</span>
            <Avatar user={game.participant} size={28} className="mr-2" />
            <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">
              {game.participant?.fullName || game.participant?.username || 'Anonymous'}
            </span>
          </Link>
        )}
      </div>
      {/* Game Outcome Section */}
      {game.status === 'awaiting_proof' && (
        <div className="mt-3 p-3 bg-neutral-800/50 border border-neutral-700 rounded">
          <h4 className="text-sm font-semibold text-white mb-2">Game Outcome</h4>
          
          {/* Debug info - remove this after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-3 p-2 bg-red-900/20 border border-red-700/50 rounded text-xs">
              <div className="text-red-300">
                <strong>Debug Info:</strong>
              </div>
              <div className="text-red-200 text-xs">
                Current User ID: {currentUserId}<br/>
                Winner: {game.winner ? (game.winner?.fullName || game.winner?.username || game.winner) : 'null'}<br/>
                Loser: {game.loser ? (game.loser?.fullName || game.loser?.username || game.loser) : 'null'}<br/>
                Both Lose: {game.bothLose ? 'true' : 'false'}<br/>
                Both Win: {game.bothWin ? 'true' : 'false'}<br/>
                Draw Type: {game.drawType || 'null'}<br/>
                Creator Move: {game.creatorDare?.move || 'null'}<br/>
                Participant Move: {game.participantDare?.move || 'null'}<br/>
                Is Winner: {isWinner ? 'true' : 'false'}<br/>
                Is Loser: {isLoser ? 'true' : 'false'}<br/>
                Is Creator: {isCreator ? 'true' : 'false'}<br/>
                Is Participant: {isParticipant ? 'true' : 'false'}
              </div>
            </div>
          )}
          
          {/* Show the moves that were played */}
          <div className="mb-3 p-2 bg-neutral-700/50 rounded text-xs">
            <div className="text-neutral-300 mb-1">
              <strong>Moves Played:</strong>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-neutral-400">Creator:</span>
                <span className="ml-1 text-white">
                  {game.creatorDare?.move ? `🪨 ${game.creatorDare.move.toUpperCase()}` : 'Not played'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Participant:</span>
                <span className="ml-1 text-white">
                  {game.participantDare?.move ? `🪨 ${game.participantDare.move.toUpperCase()}` : 'Not played'}
                </span>
              </div>
            </div>
          </div>
          
          {game.bothLose && (
            <div className="text-amber-400 text-sm">
              🪨 <strong>Rock vs Rock - Both Lose!</strong><br/>
              Both players must perform each other's dares and submit proof.
            </div>
          )}
          {game.bothWin && (
            <div className="text-green-400 text-sm">
              📄 <strong>Paper vs Paper - Both Win!</strong><br/>
              No one has to do anything - it's a draw!
            </div>
          )}
          {game.drawType === 'scissors' && (
            <div className="text-blue-400 text-sm">
              ✂️ <strong>Scissors vs Scissors - Coin Flip Result</strong><br/>
              {game.winner ? `${game.winner?.fullName || game.winner?.username} won the coin flip` : 'Winner determined by coin flip'}
            </div>
          )}
          {!game.bothLose && !game.bothWin && game.drawType !== 'scissors' && (
            <div className="text-sm">
              {game.winner && (
                <div className="text-green-400 mb-1">
                  🏆 <strong>Winner:</strong> {game.winner?.fullName || game.winner?.username}
                  {isWinner && <span className="ml-2 text-green-600 font-semibold">(You won!)</span>}
                </div>
              )}
              {game.loser && (
                <div className="text-red-400 mb-1">
                  ❌ <strong>Loser:</strong> {game.loser?.fullName || game.loser?.username}
                  {isLoser && <span className="ml-2 text-red-600 font-semibold">(You lost - submit proof!)</span>}
                </div>
              )}
              {!game.winner && !game.loser && (
                <div className="text-yellow-400 mb-1">
                  ⚠️ <strong>Game outcome not yet determined</strong><br/>
                  Waiting for both players to submit their moves.
                </div>
              )}
            </div>
          )}
          
          {/* Show what dares need to be performed */}
          <div className="mt-3 p-2 bg-neutral-700/50 rounded text-xs">
            <div className="text-neutral-300 mb-1">
              <strong>Dares to Perform:</strong>
            </div>
            {game.bothLose ? (
              <div className="space-y-2">
                <div>
                  <span className="text-neutral-400">Creator must do:</span>
                  <div className="text-white ml-2 mt-1 p-1 bg-neutral-600 rounded">
                    {game.participantDare?.description || 'No dare description'}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400">Participant must do:</span>
                  <div className="text-white ml-2 mt-1 p-1 bg-neutral-600 rounded">
                    {game.creatorDare?.description || 'No dare description'}
                  </div>
                </div>
              </div>
            ) : game.loser ? (
              <div>
                <span className="text-neutral-400">
                  {game.loser === game.creator ? 'Creator' : 'Participant'} must do:
                </span>
                <div className="text-white ml-2 mt-1 p-1 bg-neutral-600 rounded">
                  {game.loser === game.creator 
                    ? (game.participantDare?.description || 'No dare description')
                    : (game.creatorDare?.description || 'No dare description')
                  }
                </div>
              </div>
            ) : (
              <div className="text-neutral-400">No dares to perform</div>
            )}
          </div>
          
          {/* Show proof expiration info */}
          {game.proofExpiresAt && (
            <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700/50 rounded text-xs">
              <div className="text-amber-400">
                <strong>⏰ Proof Deadline:</strong> {new Date(game.proofExpiresAt).toLocaleString()}
              </div>
              <div className="text-amber-300 text-xs mt-1">
                {new Date(game.proofExpiresAt) > new Date() 
                  ? `Time remaining to submit proof (${game.contentDeletion === 'delete_after_view' ? '24 hours' : 
                                                       game.contentDeletion === 'delete_after_30_days' ? '30 days' : '7 days'})`
                  : 'Proof deadline has passed'
                }
              </div>
            </div>
          )}
          
          {/* Fallback message if no outcome can be determined */}
          {!game.bothLose && !game.bothWin && !game.drawType && !game.winner && !game.loser && (
            <div className="mt-3 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded text-xs">
              <div className="text-yellow-400">
                <strong>⚠️ Game Status Unclear</strong>
              </div>
              <div className="text-yellow-300 text-xs mt-1">
                The game outcome could not be determined. This might be a temporary issue.
                Please check back later or contact support if the problem persists.
              </div>
            </div>
          )}
          
          {/* Warning for inconsistent game state */}
          {game.status === 'awaiting_proof' && game.winner && !game.loser && (
            <div className="mt-3 p-2 bg-red-900/20 border border-red-700/50 rounded text-xs">
              <div className="text-red-400">
                <strong>🚨 Game State Inconsistent</strong>
              </div>
              <div className="text-red-300 text-xs mt-1">
                This game has a winner but is missing the loser information. 
                The game state needs to be fixed to proceed properly.
                {onFixGameState && (
                  <span className="block mt-2">
                    <strong>Solution:</strong> Click the "🔧 Fix Game" button below to resolve this issue.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Section */}
      <div className="mt-2 text-xs text-neutral-400">
        {game.proof && (
          <div>Proof: {game.proof.submitted ? 'Submitted' : 'Not submitted'}{game.proof.reviewed ? ' (Reviewed)' : ''}</div>
        )}
        {game.grades && game.grades.length > 0 && (
          <div>Grade: {game.grades.map(g => g.grade).join(', ')}{game.feedback && ` | Feedback: ${game.feedback}`}</div>
        )}
        {game.status !== 'awaiting_proof' && (
          <div>Winner: {game.winner ? (game.winner?.fullName || game.winner?.username || 'Unknown') : 'N/A'}{isWinner && <span className="ml-2 text-green-600 font-semibold">(You won)</span>}</div>
        )}
        <div>Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A'}</div>
      </div>
      {/* Actions Section */}
      <div className="flex items-center justify-end gap-2 mt-2">
        {canSubmitProof && (
          <button className="bg-primary text-primary-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onSubmitProof}>
            {game.bothLose ? 'Submit Proof' : 'Submit Proof'}
          </button>
        )}
        {canReviewProof && <button className="bg-info text-info-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onReviewProof}>Review Proof</button>}
        {canGrade && <button className="bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onGrade}>Grade</button>}
        {canChickenOut && <button className="bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onChickenOut}>Chicken Out</button>}
        
        {/* Fix Game State Button - show when game is inconsistent */}
        {game.status === 'awaiting_proof' && game.winner && !game.loser && onFixGameState && (
          <button 
            className="bg-yellow-600 text-white rounded px-2 py-1 text-xs font-semibold shadow-lg hover:bg-yellow-700 transition-colors" 
            onClick={onFixGameState}
            title="Fix inconsistent game state"
          >
            🔧 Fix Game
          </button>
        )}
        
        {actions}
      </div>
    </div>
  );
} 