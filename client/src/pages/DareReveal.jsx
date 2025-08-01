import React, { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

import dayjs from 'dayjs';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PhotoIcon, PlayCircleIcon, TagIcon, ArrowPathIcon, ArrowRightIcon, EyeIcon, SparklesIcon, FireIcon, EyeDropperIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

function DifficultyBadge({ level }) {
  const DIFFICULTY_ICONS = {
    titillating: <SparklesIcon className="w-4 h-4" />,
    arousing: <FireIcon className="w-4 h-4" />,
    explicit: <EyeDropperIcon className="w-4 h-4" />,
    edgy: <ExclamationTriangleIcon className="w-4 h-4" />,
    hardcore: <RocketLaunchIcon className="w-4 h-4" />,
  };

  const getBadgeStyle = (level) => {
    switch (level) {
      case 'titillating':
        return 'bg-pink-600/20 border-pink-600/30 text-pink-400';
      case 'arousing':
        return 'bg-purple-600/20 border-purple-600/30 text-purple-400';
      case 'explicit':
        return 'bg-red-600/20 border-red-600/30 text-red-400';
      case 'edgy':
        return 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400';
      case 'hardcore':
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
      default:
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
    }
  };

  const getLabel = (level) => {
    switch (level) {
      case 'titillating': return 'Titillating';
      case 'arousing': return 'Arousing';
      case 'explicit': return 'Explicit';
      case 'edgy': return 'Edgy';
      case 'hardcore': return 'Hardcore';
      default: return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-semibold ${getBadgeStyle(level)}`}>
      {DIFFICULTY_ICONS[level]}
      {getLabel(level)}
    </span>
  );
}

const STATUS_STEPS = [
  { key: 'in_progress', label: 'In Progress', icon: <ClockIcon className="w-5 h-5" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircleIcon className="w-5 h-5" /> },
  { key: 'forfeited', label: 'Forfeited', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
];

export default function DareReveal() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dareId = params.id || location.state?.dareId;
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [proof, setProof] = React.useState('');
  const [proofFile, setProofFile] = React.useState(null);
  const [proofLoading, setProofLoading] = React.useState(false);
  const [proofError, setProofError] = React.useState('');
  const [proofSuccess, setProofSuccess] = React.useState('');
  const [expireAfterView, setExpireAfterView] = React.useState(false);
  const [privacy, setPrivacy] = React.useState('when_viewed');
  const [chickenOutLoading, setChickenOutLoading] = React.useState(false);
  const [chickenOutError, setChickenOutError] = React.useState('');
  const [generalError, setGeneralError] = React.useState('');
  const [generalSuccess, setGeneralSuccess] = React.useState('');
  const [proofModalOpen, setProofModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('proof');

  const fetchDare = useCallback(async () => {
    if (authLoading) return;
    if (!dareId) {
      navigate('/dare/select');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.get(`/dares/${dareId}`);
      
      if (response.data && response.data._id) {
        const performerId = response.data.performer?._id || response.data.performer;
        if (!user || !performerId || String(performerId) !== String(user._id)) {
          setDare(null);
          showError('You are not authorized to view this dare.');
        } else {
          setDare(response.data);
          showSuccess('Dare loaded successfully!');
          console.log('Dare loaded:', response.data._id);
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare loading error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to fetch dare.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dareId, navigate, user, authLoading, showSuccess, showError]);

  React.useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showError('File size must be less than 50MB.');
        e.target.value = '';
        return;
      }
      setProofFile(file);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    setProofError('');
    setProofSuccess('');
    
    if (!proof && !proofFile) {
      showError('Please provide proof text or upload a file.');
      setProofLoading(false);
      return;
    }
    
    try {
      let formData;
      if (proofFile) {
        formData = new FormData();
        if (proof) formData.append('text', proof);
        formData.append('file', proofFile);
        formData.append('expireAfterView', expireAfterView);
        await api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/dares/${dare._id}/proof`, { text: proof, expireAfterView });
      }
      setProof('');
      setProofFile(null);
      setProofSuccess('Proof submitted successfully!');
      showSuccess('Proof submitted successfully!');
      setProofModalOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit proof.';
      setProofError(errorMessage);
      showError(errorMessage);
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    try {
      await api.post(`/dares/${dare._id}/chicken-out`);
      setGeneralSuccess('Successfully chickened out!');
      showSuccess('Successfully chickened out!');
      setTimeout(() => {
        navigate('/dare/select');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to chicken out.';
      setChickenOutError(errorMessage);
      showError(errorMessage);
    } finally {
      setChickenOutLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={6} />
          </div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">Dare Not Found</div>
              <p className="text-neutral-500 text-sm">
                The dare you're looking for could not be found or you don't have permission to view it.
              </p>
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
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <EyeIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Dare Reveal</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              View and complete your dare
            </p>
          </div>

          {/* Status Progress */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              {STATUS_STEPS.map((step, index) => (
                <div key={step.key} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    dare.status === step.key ? 'bg-primary text-white' : 'bg-neutral-700 text-neutral-400'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-sm font-semibold ${
                    dare.status === step.key ? 'text-primary' : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </span>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="w-8 h-0.5 bg-neutral-700 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dare Card */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-xl">
                <DifficultyBadge level={dare.difficulty} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Your Dare</h2>
                <div className="text-neutral-300 mb-4">{dare.description}</div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span>Difficulty: {dare.difficulty}</span>
                  {dare.creator && (
                    <span>Created by: {dare.creator.fullName || dare.creator.username}</span>
                  )}
                  {dare.createdAt && (
                    <span>Created: {formatRelativeTimeWithTooltip(dare.createdAt).display}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setProofModalOpen(true)}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PhotoIcon className="w-5 h-5" />
                Submit Proof
              </button>
              
              <button
                onClick={handleChickenOut}
                disabled={chickenOutLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
              >
                {chickenOutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Chickening Out...
                  </>
                ) : (
                  <>
                    <XMarkIcon className="w-5 h-5" />
                    Chicken Out
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Proof Modal */}
          <Dialog
            open={proofModalOpen}
            onClose={() => setProofModalOpen(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="bg-gradient-to-br from-neutral-900/95 to-neutral-800/95 rounded-2xl p-8 border border-neutral-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <Dialog.Title className="text-2xl font-bold text-white mb-6">
                  Submit Proof
                </Dialog.Title>
                
                <form onSubmit={handleProofSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">
                      Proof Description
                    </label>
                    <textarea
                      id="proof-text"
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                      placeholder="Describe how you completed the dare..."
                    />
                  </div>

                  <div>
                    <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">
                      Proof File (Optional)
                    </label>
                    <input
                      type="file"
                      id="proof-file"
                      onChange={handleProofFileChange}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
                    <div className="text-sm text-neutral-400 mt-1">
                      Max file size: 50MB
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="expire-after-view"
                      checked={expireAfterView}
                      onChange={(e) => setExpireAfterView(e.target.checked)}
                      className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="expire-after-view" className="text-white">
                      Delete proof after viewing
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setProofModalOpen(false)}
                      className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={proofLoading || (!proof && !proofFile)}
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {proofLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ArrowRightIcon className="w-5 h-5" />
                          Submit Proof
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {proofError && (
                  <div className="mt-4 bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
                    {proofError}
                  </div>
                )}

                {proofSuccess && (
                  <div className="mt-4 bg-green-900/20 border border-green-800/30 rounded-xl p-4 text-green-300">
                    {proofSuccess}
                  </div>
                )}
              </Dialog.Panel>
            </div>
          </Dialog>

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

          {chickenOutError && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300">
              {chickenOutError}
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 