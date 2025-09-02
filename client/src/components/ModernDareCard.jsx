import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  SparklesIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  TagIcon,
  StarIcon
} from '@heroicons/react/24/outline';

// Difficulty constants
const DIFFICULTY_COLORS = {
  titillating: 'from-pink-400 to-pink-600',
  arousing: 'from-purple-500 to-purple-700',
  explicit: 'from-red-500 to-red-700',
  edgy: 'from-yellow-400 to-yellow-600',
  hardcore: 'from-gray-800 to-black'
};

const DIFFICULTY_ICONS = {
  titillating: HeartIcon,
  arousing: SparklesIcon,
  explicit: FireIcon,
  edgy: ExclamationTriangleIcon,
  hardcore: ShieldCheckIcon
};

// Helper functions
const getDifficultyInfo = (difficulty) => {
  const Icon = DIFFICULTY_ICONS[difficulty] || StarIcon;
  const color = DIFFICULTY_COLORS[difficulty] || 'from-neutral-500 to-neutral-600';
  
  return { Icon, color };
};

const renderTags = (tags) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.slice(0, 3).map((tag, index) => (
        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg text-xs">
          <TagIcon className="w-3 h-3" />
          {tag}
        </span>
      ))}
      {tags.length > 3 && (
        <span className="px-2 py-1 bg-neutral-600/50 text-neutral-400 border border-neutral-500/30 rounded-lg text-xs">
          +{tags.length - 3} more
        </span>
      )}
    </div>
  );
};

// Modern Dare Card Component for Active Dares
export const ModernActiveDareCard = ({ dare, viewMode = 'grid', context, currentUserId, onAction }) => {
  const { Icon: DifficultyIcon, color } = getDifficultyInfo(dare.difficulty);
  const isPublic = typeof dare?.isPublic === 'boolean' ? dare.isPublic : !!dare?.public;
  
  if (viewMode === 'list') {
    // List view - more compact, horizontal layout
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200 group">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200">
                {dare.title || dare.description || 'Untitled Dare'}
              </h3>
              {dare.description && (
                <p className="text-neutral-400 text-sm line-clamp-2">{dare.description}</p>
              )}
            </div>
          </div>

          {/* Difficulty Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white`}>
              <DifficultyIcon className="w-4 h-4" />
              <span className="capitalize">{dare.difficulty}</span>
            </span>
          </div>

          {/* Task Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {dare.creator && (
              <div className="flex items-center space-x-2 text-neutral-400">
                <UserIcon className="w-4 h-4" />
                <span>{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
              </div>
            )}
            {dare.timeLimit && (
              <div className="flex items-center space-x-2 text-neutral-400">
                <ClockIcon className="w-4 h-4" />
                <span>{dare.timeLimit}h</span>
              </div>
            )}
            {dare.participants && (
              <div className="flex items-center space-x-2 text-neutral-400">
                <UserIcon className="w-4 h-4" />
                <span>{dare.participants.length}</span>
              </div>
            )}
            {dare.createdAt && (
              <div className="flex items-center space-x-2 text-neutral-400">
                <ClockIcon className="w-4 h-4" />
                <span>{new Date(dare.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {isPublic ? 'Public' : 'Private'}
            </span>
            <div className="flex gap-2">
              {/* Preserve legacy actions based on context */}
              {context === 'ongoing' && (
                <Link to={`/dare/${dare._id}/participate`}>
                  <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95">
                    <CheckCircleIcon className="w-4 h-4" />
                    Submit Proof
                  </button>
                </Link>
              )}
              {context === 'public' && (
                <Link to={dare.claimToken ? `/claim/${dare.claimToken}` : `/dare/consent/${dare._id}`}>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
                    <PlayIcon className="w-4 h-4" />
                    Claim & Perform
                  </button>
                </Link>
              )}
              {/* Default view details */}
              <Link to={`/dares/${dare._id}`}>
                <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">View Details</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view - existing detailed layout
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200 group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200">
              {dare.title || dare.description || 'Untitled Dare'}
            </h3>
            {dare.description && (
              <p className="text-neutral-400 text-sm line-clamp-2">{dare.description}</p>
            )}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white`}>
            <DifficultyIcon className="w-4 h-4" />
            <span className="capitalize">{dare.difficulty}</span>
          </span>
        </div>

        {/* Task Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {dare.creator && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
            </div>
          )}
          {dare.timeLimit && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <ClockIcon className="w-4 h-4" />
              <span>{dare.timeLimit}h</span>
            </div>
          )}
          {dare.participants && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>{dare.participants.length}</span>
            </div>
          )}
          {dare.createdAt && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <ClockIcon className="w-4 h-4" />
              <span>{new Date(dare.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {renderTags(dare.tags)}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {isPublic ? 'Public' : 'Private'}
          </span>
          <div className="flex gap-2">
            {context === 'ongoing' && (
              <Link to={`/dare/${dare._id}/participate`}>
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95">
                  <CheckCircleIcon className="w-4 h-4" />
                  Submit Proof
                </button>
              </Link>
            )}
            {context === 'public' && (
              <Link to={dare.claimToken ? `/claim/${dare.claimToken}` : `/dare/consent/${dare._id}`}>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
                  <PlayIcon className="w-4 h-4" />
                  Claim & Perform
                </button>
              </Link>
            )}
            <Link to={`/dares/${dare._id}`}>
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">View Details</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Dare Card Component for Completed Dares
export const ModernCompletedDareCard = ({ dare, viewMode = 'grid', context, currentUserId, onAction }) => {
  const { Icon: DifficultyIcon, color } = getDifficultyInfo(dare.difficulty);
  const isPublic = typeof dare?.isPublic === 'boolean' ? dare.isPublic : !!dare?.public;
  
  if (viewMode === 'list') {
    // List view - more compact, horizontal layout
    return (
      <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01] group">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Difficulty Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
              <DifficultyIcon className="w-4 h-4" />
              {dare.difficulty}
            </div>
            
            {/* Status Badge */}
            <div className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold">
              {dare.status ? dare.status.replace(/_/g, ' ') : 'Completed'}
            </div>
            
            {/* Creator Info */}
            {dare.creator && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-white">{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
              </div>
            )}
            
            {/* Completion Date */}
            {dare.completedAt && (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                <span>{new Date(dare.completedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Preserve grading button for creators when proof is unreviewed */}
            {context === 'completed' && dare.proof && !dare.proof.reviewed && dare.creator?._id === currentUserId && (
              <Link to={`/dares/${dare._id}`}>
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95">
                  <StarIcon className="w-4 h-4" />
                  Grade
                </button>
              </Link>
            )}
            <Link to={`/dares/${dare._id}`}>
              <button 
                className="w-full lg:w-auto bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center" 
                aria-label={`View completed dare by ${dare.creator?.fullName || 'User'}`}
              >
                <CheckCircleIcon className="w-5 h-5" />
                View Details
              </button>
            </Link>
          </div>
        </div>
        
        {/* Tags - only show in list view if there are tags */}
        {dare.tags && dare.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-neutral-600/30">
            {dare.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg text-xs">
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {dare.tags.length > 2 && (
              <span className="px-2 py-1 bg-neutral-600/50 text-neutral-400 border border-neutral-500/30 rounded-lg text-xs">
                +{dare.tags.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Grid view - existing detailed layout
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200 group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200">
              {dare.title || dare.description || 'Untitled Dare'}
            </h3>
            {dare.description && (
              <p className="text-neutral-400 text-sm line-clamp-2">{dare.description}</p>
            )}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${color} text-white`}>
            <DifficultyIcon className="w-4 h-4" />
            <span className="capitalize">{dare.difficulty}</span>
          </span>
        </div>

        {/* Task Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {dare.creator && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
            </div>
          )}
          {dare.timeLimit && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <ClockIcon className="w-4 h-4" />
              <span>{dare.timeLimit}h</span>
            </div>
          )}
          {dare.participants && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>{dare.participants.length}</span>
            </div>
          )}
          {dare.createdAt && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <ClockIcon className="w-4 h-4" />
              <span>{new Date(dare.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {renderTags(dare.tags)}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {dare.public ? 'Public' : 'Private'}
          </span>
          <Link to={dare.claimToken ? `/claim/${dare.claimToken}` : `/dares/${dare._id}`}>
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Modern Switch Game Card Component
export const ModernSwitchGameCard = ({ game, viewMode = 'grid', onAction }) => {
  const { Icon: DifficultyIcon, color } = getDifficultyInfo(game.creatorDare?.difficulty || game.difficulty);
  
  if (viewMode === 'list') {
    // List view - more compact, horizontal layout
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-all duration-200">
        <div className="flex items-center space-x-6">
          {/* Difficulty Badge */}
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${color} text-white`}>
              <DifficultyIcon className="w-4 h-4" />
              <span className="capitalize">{game.creatorDare?.difficulty || 'Unknown'}</span>
            </span>
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-white truncate">Switch Game</h3>
            </div>
            <p className="text-neutral-400 text-sm mb-3">Challenge your partner in this exciting game</p>
            
            <div className="flex items-center space-x-6 text-sm text-neutral-400">
              {game.creator && (
                <span className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>{game.creator?.fullName || game.creator?.username || 'User'}</span>
                </span>
              )}
              {game.createdAt && (
                <span className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{new Date(game.createdAt).toLocaleDateString()}</span>
                </span>
              )}
              {game.participant && (
                <span className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>vs {game.participant?.fullName || game.participant?.username || 'User'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Link to={`/switches/${game._id}`}>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                View Details
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view - existing detailed layout
  return (
    <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Difficulty Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
            <DifficultyIcon className="w-4 h-4" />
            {game.creatorDare?.difficulty || 'Unknown'}
          </div>
          
          {/* Creator Info */}
          {game.creator && (
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
              <span className="text-neutral-400 text-sm">Created by</span>
              <Link 
                to={`/profile/${game.creator?._id || game.creator?.id}`} 
                className="flex items-center gap-2 group-hover:underline"
                aria-label={`View profile of ${game.creator?.fullName || 'User'}`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">{game.creator?.fullName || game.creator?.username || 'User'}</span>
              </Link>
            </div>
          )}
        </div>
        
        {/* Action Button */}
        <Link to={`/switches/${game._id}`}>
          <button 
            className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
            aria-label={`View switch game by ${game.creator?.fullName || 'User'}`}
          >
            <PlayIcon className="w-5 h-5" />
            View Details
          </button>
        </Link>
      </div>
      
      {/* Tags */}
      {renderTags(game.creatorDare?.tags || game.tags)}
    </div>
  );
};
