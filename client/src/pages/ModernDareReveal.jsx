import React, { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XMarkIcon, 
  PhotoIcon, 
  PlayCircleIcon, 
  TagIcon, 
  ArrowPathIcon, 
  ArrowRightIcon, 
  EyeIcon,
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  FireIcon,
  SparklesIcon,
  EyeDropperIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  HeartIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_ICONS, PRIVACY_OPTIONS } from '../constants.jsx';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { retryApiCall } from '../utils/retry';
import { useContentDeletion } from '../hooks/useContentDeletion';
import api from '../api/axios';

const STATUS_STEPS = [
  { key: 'in_progress', label: 'In Progress', icon: <ClockIcon className="w-5 h-5" />, color: 'text-blue-400' },
  { key: 'completed', label: 'Completed', icon: <CheckCircleIcon className="w-5 h-5" />, color: 'text-green-400' },
  { key: 'chickened_out', label: 'Chickened Out', icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'text-red-400' },
];

const ModernDareReveal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dareId = params.id || location.state?.dareId;
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const { contentDeletion, updateContentDeletion } = useContentDeletion();
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [proofModalOpen, setProofModalOpen] = useState(false);

  const fetchDare = useCallback(async () => {
    if (authLoading) return;
    if (!dareId) {
      navigate('/modern/dares/select');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${dareId}`));
      
      if (response.data && response.data._id) {
        const performerId = response.data.performer?._id || response.data.performer;
        if (!user || !performerId || String(performerId) !== String(user._id)) {
          setDare(null);
          showError('You are not authorized to view this dare.');
        } else {
          setDare(response.data);
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

  useEffect(() => {
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
        formData.append('contentDeletion', contentDeletion);
        // Use retry mechanism for proof submission with file
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }));
      } else {
        // Use retry mechanism for proof submission with text
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, { text: proof, contentDeletion }));
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
      // Use retry mechanism for chicken out
      await retryApiCall(() => api.post(`/dares/${dare._id}/chicken-out`));
      setGeneralSuccess('Successfully chickened out!');
      showSuccess('Successfully chickened out!');
      // Memory-safe timeout for navigation
      setTimeout(() => {
        navigate('/modern/dares/select');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to chicken out.';
      setChickenOutError(errorMessage);
      showError(errorMessage);
    } finally {
      setChickenOutLoading(false);
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
      titillating: <SparklesIcon className="w-6 h-6" />,
      arousing: <EyeDropperIcon className="w-6 h-6" />,
      explicit: <FireIcon className="w-6 h-6" />,
      edgy: <ExclamationTriangleIcon className="w-6 h-6" />,
      hardcore: <RocketLaunchIcon className="w-6 h-6" />
    };
    return icons[difficultyValue] || <StarIcon className="w-6 h-6" />;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dare details...</div>
        </div>
      </div>
    );
  }

  if (!dare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Dare Not Found</h2>
          <p className="text-neutral-400 mb-6">The dare you're looking for could not be found or you don't have permission to view it.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200"
          >
            Go Back
          </button>
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
                <h1 className="text-2xl font-bold text-white">Dare Reveal</h1>
                <p className="text-neutral-400 text-sm">View and complete your challenge</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>Dare Revealed</span>
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
              <EyeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Dare Reveal</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                View and complete your challenge
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Now that you've consented, here's what you need to do. Complete the dare and submit your proof.
          </p>
        </div>

        {/* Status Progress */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Progress Status</h3>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  dare.status === step.key 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'bg-neutral-700/50 text-neutral-400'
                }`}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-semibold transition-colors duration-300 ${
                    dare.status === step.key ? step.color : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </div>
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div className={`w-16 h-0.5 transition-colors duration-300 ${
                    dare.status === step.key ? 'bg-primary' : 'bg-neutral-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dare Card */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-8">
          <div className="flex items-start gap-6 mb-8">
            <div className={`bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} p-4 rounded-2xl shadow-xl`}>
              {getDifficultyIcon(dare.difficulty)}
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-4">Your Dare</h3>
              <div className="text-neutral-300 text-lg leading-relaxed mb-6">{dare.description}</div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-400 mb-6">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4" />
                  <span>Difficulty: {dare.difficulty}</span>
                </div>
                {dare.creator && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>Created by: {dare.creator?.fullName || dare.creator?.username || 'Unknown User'}</span>
                  </div>
                )}
                {dare.createdAt && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Created: {formatRelativeTimeWithTooltip(dare.createdAt).display}</span>
                  </div>
                )}
              </div>
              
              {/* Proof Expiration Info */}
              {dare.proofExpiresAt && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">Proof Expiration</span>
                  </div>
                  <div className="text-sm text-yellow-300">
                    Proof will expire on {new Date(dare.proofExpiresAt).toLocaleDateString()}
                  </div>
                </div>
              )}
              
              {/* Consent Status for Dom Demands */}
              {dare.dareType === 'domination' && dare.requiresConsent && (
                <div className="mt-4 bg-gradient-to-r from-green-600/20 to-green-700/20 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-400">Consent Recorded</span>
                  </div>
                  <div className="text-sm text-green-300">
                    You have consented to view this dom demand
                    {dare.consentedAt && ` on ${new Date(dare.consentedAt).toLocaleDateString()}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setProofModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:scale-105 shadow-lg hover:shadow-primary/25 flex items-center gap-3"
            >
              <PhotoIcon className="w-5 h-5" />
              Submit Proof
            </button>
            
            <button
              onClick={handleChickenOut}
              disabled={chickenOutLoading}
              className="px-8 py-4 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 border border-red-500/30 rounded-xl font-semibold transition-all duration-300 hover:from-red-700/30 hover:to-red-800/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              {chickenOutLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-neutral-800/95 backdrop-blur-sm rounded-2xl border border-neutral-700/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
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
                      className="w-full h-32 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
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
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
                    <div className="text-sm text-neutral-400 mt-2">
                      Max file size: 50MB • Supported: Images, Videos
                    </div>
                  </div>

                  {/* OSA-Style Content Expiration Settings */}
                  <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-start gap-4 mb-4">
                      <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                        <p className="text-neutral-300 leading-relaxed">
                          Choose how long this proof content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {PRIVACY_OPTIONS.map((option) => (
                        <label key={option.value} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                          contentDeletion === option.value 
                            ? 'border-yellow-500 bg-yellow-500/10' 
                            : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                        }`}>
                          <input 
                            type="radio" 
                            name="contentDeletion" 
                            value={option.value} 
                            checked={contentDeletion === option.value} 
                            onChange={(e) => updateContentDeletion(e.target.value)} 
                            className="w-5 h-5 text-yellow-600 bg-neutral-700 border-neutral-600 rounded-full focus:ring-yellow-500 focus:ring-2" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{option.icon}</span>
                              <span className="font-semibold text-white">{option.label}</span>
                            </div>
                            <p className="text-sm text-neutral-300">{option.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setProofModalOpen(false)}
                      className="flex-1 px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={proofLoading || (!proof && !proofFile)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium transition-all duration-200 hover:from-primary-dark hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {proofLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ArrowRightIcon className="w-4 h-4" />
                          Submit Proof
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {proofError && (
                  <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-400">
                      <ExclamationTriangleIcon className="w-5 h-5" />
                      <span className="font-medium">{proofError}</span>
                    </div>
                  </div>
                )}

                {proofSuccess && (
                  <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">{proofSuccess}</span>
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Error/Success Messages */}
        {generalError && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">{generalError}</span>
            </div>
          </div>
        )}
        
        {generalSuccess && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">{generalSuccess}</span>
            </div>
          </div>
        )}

        {chickenOutError && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="font-medium">{chickenOutError}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernDareReveal; 