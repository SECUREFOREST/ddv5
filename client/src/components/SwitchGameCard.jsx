import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { ShareIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

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
  const [proofText, setProofText] = useState('');
  const [expireAfterView, setExpireAfterView] = useState(false);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofFiles, setProofFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { showSuccess, showError } = useToast();
  
  if (!game) return null;
  
  // Share functionality
  const handleShare = () => {
    const link = `${window.location.origin}/switches/claim/${game._id}`;
    navigator.clipboard.writeText(link).then(() => {
      showSuccess('Game link copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy link. Please copy manually.');
    });
  };
  
  // Validate game has required fields based on status
  const hasRequiredFields = game && game.creator && game.status;
  
  // For games that are in progress or completed, participant is required
  const needsParticipant = ['in_progress', 'completed', 'proof_submitted', 'awaiting_proof', 'chickened_out'].includes(game.status);
  const hasParticipantIfNeeded = !needsParticipant || game.participant;
  
  if (!hasRequiredFields || !hasParticipantIfNeeded) {
    return (
      <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()}>
        <div className="text-red-400 text-center py-4">
          ⚠️ Game data is incomplete. Please refresh the page or contact support.
        </div>
      </div>
    );
  }
  
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

  const handleProofSubmit = async () => {
    if (!proofText.trim() && proofFiles.length === 0) {
      // You could add a toast notification here
      return;
    }
    
    setSubmittingProof(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      if (proofText.trim()) {
        formData.append('text', proofText);
      }
      formData.append('expireAfterView', expireAfterView);
      
      // Add all files
      proofFiles.forEach((file, index) => {
        formData.append('files', file);
      });
      
      // Call the onSubmitProof with the FormData
      await onSubmitProof(formData);
      
      // Clear form after successful submission
      setProofText('');
      setExpireAfterView(false);
      setProofFiles([]);
    } catch (error) {
      console.error('Proof submission error:', error);
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      
      if (file.size > maxSize) {
        console.warn(`File ${file.name} is too large. Max size is 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        console.warn(`File ${file.name} is not a supported type.`);
        return false;
      }
      
      return true;
    });
    
    setProofFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index));
  };

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
          {/* Claimable indicator */}
          {game.claimable && game.status === 'waiting_for_participant' && !game.participant && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-medium ml-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Claimable
            </div>
          )}
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
          <div>
            Proof: {game.proof.user ? 'Submitted' : 'Not submitted'}
            {game.proof.review?.action && ` (${game.proof.review.action})`}
            {game.proof.review?.feedback && ` - ${game.proof.review.feedback}`}
          </div>
        )}
        {game.grades && game.grades.length > 0 && (
          <div>Grade: {game.grades.map(g => g.grade).join(', ')}{game.feedback && ` | Feedback: ${game.feedback}`}</div>
        )}
        {game.status !== 'awaiting_proof' && (
          <div>Winner: {game.winner ? (game.winner?.fullName || game.winner?.username || 'Unknown') : 'N/A'}{isWinner && <span className="ml-2 text-green-600 font-semibold">(You won)</span>}</div>
        )}
        <div>Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A'}</div>
      </div>
      {/* Proof Submission Form - Aligned with DOM Demand Creator Design */}
      {canSubmitProof && (
        <div className="mt-6 bg-neutral-800/80 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
          <h4 className="text-lg font-semibold text-white mb-4">Submit Your Proof</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Proof Description
              </label>
              <textarea
                placeholder="Describe how you completed the dare... (This will be visible to the winner for review)"
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                rows={4}
                maxLength={1000}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
              />
              <div className="text-xs text-neutral-500 mt-1 text-right">
                {proofText.length}/1000 characters
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Upload Proof Files
              </label>
              <div className="space-y-3">
                {/* File Input */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id={`file-upload-${game._id}`}
                  />
                  <label
                    htmlFor={`file-upload-${game._id}`}
                    className="flex items-center justify-center w-full px-4 py-3 bg-neutral-800/50 border-2 border-dashed border-neutral-600 rounded-xl text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">📁</div>
                      <div className="text-sm font-medium">Click to upload files</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        Images (JPEG, PNG, GIF, WebP) • Videos (MP4, WebM) • Max 10MB each
                      </div>
                    </div>
                  </label>
                </div>

                {/* File List */}
                {proofFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-400 font-medium">Selected Files:</div>
                    {proofFiles.map((file, index) => (
                      <div key={index} className="p-3 bg-neutral-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-300">
                              {file.type.startsWith('image/') ? '🖼️' : '🎥'} {file.name}
                            </span>
                            <span className="text-xs text-neutral-500">
                              ({(file.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 text-sm p-1 rounded hover:bg-red-900/20 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {/* Image Preview */}
                        {file.type.startsWith('image/') && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview of ${file.name}`}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-600"
                              onLoad={(e) => {
                                // Clean up the object URL after loading
                                setTimeout(() => URL.revokeObjectURL(e.target.src), 1000);
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Video Preview */}
                        {file.type.startsWith('video/') && (
                          <div className="mt-2">
                            <video
                              src={URL.createObjectURL(file)}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-600"
                              controls
                              muted
                              onLoadedMetadata={(e) => {
                                // Clean up the object URL after loading
                                setTimeout(() => URL.revokeObjectURL(e.target.src), 1000);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`expireAfterView-${game._id}`}
                checked={expireAfterView}
                onChange={(e) => setExpireAfterView(e.target.checked)}
                className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor={`expireAfterView-${game._id}`} className="text-sm text-neutral-300">
                Delete proof after winner views it
              </label>
            </div>
            
            <div className="text-center pt-4">
              <button 
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                onClick={handleProofSubmit}
                disabled={submittingProof || (!proofText.trim() && proofFiles.length === 0)}
              >
                {submittingProof ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📸 Submit Proof
                    {proofFiles.length > 0 && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full ml-2">
                        {proofFiles.length} file{proofFiles.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="flex items-center justify-end gap-2 mt-4">
        {/* Share Button - Only show for creator or if game is waiting for participant */}
        {(isCreator || (game.status === 'waiting_for_participant' && !game.participant)) && (
          <button 
            className="bg-green-600 text-white rounded px-2 py-1 text-xs font-semibold shadow-lg hover:bg-green-700 transition-colors flex items-center gap-1" 
            onClick={handleShare}
            title="Share this game"
          >
            <ShareIcon className="w-3 h-3" />
            Share
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