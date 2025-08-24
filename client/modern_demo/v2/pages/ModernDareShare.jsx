import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShareIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  UserIcon,
  StarIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  FireIcon,
  SparklesIcon,
  EyeDropperIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import { retryApiCall } from '../../utils/retry';
import { ERROR_MESSAGES } from '../../constants.jsx';
import api from '../../api/axios';

const ModernDareShare = () => {
  const { dareId } = useParams();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchDare = useCallback(async () => {
    if (!dareId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${dareId}`));
      
      if (response.data) {
        setDare(response.data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load dare for sharing:', error);
      const errorMessage = error.response?.data?.error || ERROR_MESSAGES.DARE_LOAD_FAILED;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dareId, showError]);

  useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  const dareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dares/${dareId}` : '';

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this dare? This action cannot be undone.')) return;
    setCanceling(true);
    try {
      // Use retry mechanism for dare deletion
      await retryApiCall(() => api.delete(`/dares/${dareId}`));
      setCanceled(true);
      showSuccess('Dare canceled successfully.');
      // Memory-safe timeout for navigation
      setTimeout(() => navigate('/modern/dares'), 1500);
    } catch {
      setError('Failed to cancel dare.');
      showError('Failed to cancel dare.');
    } finally {
      setCanceling(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(dareUrl);
      setCopied(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showError('Failed to copy link. Please copy manually.');
    }
  };

  const getDifficultyColor = (difficultyValue) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficultyValue] || 'from-neutral-400 to-neutral-600';
  };

  const getDifficultyIcon = (difficultyValue) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <EyeDropperIcon className="w-5 h-5" />,
      explicit: <FireIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficultyValue] || <StarIcon className="w-5 h-5" />;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dare</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              onClick={() => navigate('/modern/dares')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Return to Dares
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-8 shadow-2xl text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Dare Canceled Successfully</h2>
            <p className="text-white/80 mb-6">Redirecting to dares page...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
          </div>
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
                <h1 className="text-2xl font-bold text-white">Share Dare</h1>
                <p className="text-neutral-400 text-sm">Share your challenge with others</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ShareIcon className="w-4 h-4" />
                  <span>Sharing Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <ShareIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Share Your Dare</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Challenge others to complete your task
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Share this dare with friends, partners, or the community. Be mindful of who you share with.
          </p>
        </div>

        {/* Share Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Hi {dare.creator?.fullName || dare.creator?.username || 'there'}!
            </h3>
            <p className="text-neutral-300 text-lg">
              Share this link very carefully and responsibly
            </p>
          </div>
          
          {/* Dare Link Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-white mb-3">Share Link</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-neutral-600/50 px-4 py-4 bg-neutral-700/50 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                value={dareUrl}
                readOnly
                onFocus={e => e.target.select()}
                aria-label="Dare share link"
              />
              <button
                onClick={handleCopyLink}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-neutral-600/50 text-neutral-300 hover:bg-neutral-500/50 hover:text-white'
                }`}
                title="Copy link"
              >
                {copied ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircleIcon className="w-4 h-4" />
                Link copied to clipboard!
              </p>
            )}
          </div>

          {/* Difficulty Information */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} rounded-xl flex items-center justify-center`}>
                  {getDifficultyIcon(dare.difficulty)}
                </div>
                <span className="text-white font-semibold text-lg">
                  {dare.difficulty.charAt(0).toUpperCase() + dare.difficulty.slice(1)} Level
                </span>
              </div>
              <p className="text-neutral-300 text-center text-lg">
                The first person to claim this can demand a{' '}
                <span className="font-semibold text-yellow-400">
                  {dare.difficulty.charAt(0).toUpperCase() + dare.difficulty.slice(1)}
                </span>{' '}
                pic of their choice.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Cancel Button */}
            <button
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl px-6 py-4 font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              onClick={handleCancel}
              disabled={canceling}
            >
              {canceling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Canceling...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
                  Cancel This Dare
                </>
              )}
            </button>

            {/* Share Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-4 py-4 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                onClick={handleCopyLink}
              >
                <HeartIcon className="w-5 h-5" />
                Share Privately
              </button>
              <button
                className="bg-neutral-700/50 text-white border border-neutral-600/50 rounded-xl px-4 py-4 font-bold hover:bg-neutral-600/50 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                onClick={handleCopyLink}
              >
                <EyeIcon className="w-5 h-5" />
                Share Publicly
              </button>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sharing Guidelines */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Sharing Guidelines</h4>
                <div className="text-neutral-300 text-sm space-y-2">
                  <p>• Share with trusted friends via email or messaging</p>
                  <p>• Be mindful of privacy and consent</p>
                  <p>• Respect others' boundaries and comfort levels</p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Information */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldExclamationIcon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Safety Reminders</h4>
                <div className="text-neutral-300 text-sm space-y-2">
                  <p>• Only share with consenting adults</p>
                  <p>• Be aware of local laws and regulations</p>
                  <p>• Report any misuse or harassment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* External Sharing */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white text-center mb-6">Share on Social Platforms</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl px-6 py-4 font-bold hover:from-pink-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              onClick={() => window.open('https://fetlife.com', '_blank')}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              Fetlife
            </button>
            
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-4 font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              onClick={handleCopyLink}
            >
              <DocumentDuplicateIcon className="w-5 h-5" />
              Copy Link
            </button>
            
            <button
              className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl px-6 py-4 font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              onClick={() => {
                const text = `Check out this dare: ${dareUrl}`;
                if (navigator.share) {
                  navigator.share({ title: 'Dare Challenge', text, url: dareUrl });
                } else {
                  handleCopyLink();
                }
              }}
            >
              <ShareIcon className="w-5 h-5" />
              Native Share
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-400 text-sm">
              Use the native share button if available on your device, or copy the link manually.
            </p>
          </div>
        </div>

        {/* Return Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/modern/dares')}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Dares
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernDareShare; 