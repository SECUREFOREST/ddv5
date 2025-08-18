import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon, 
  UserGroupIcon, 
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  LockClosedIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS, PRIVACY_OPTIONS } from '../../constants.jsx';
import { retryApiCall } from '../../utils/retry';
import { useContentDeletion } from '../../hooks/useContentDeletion';
import api from '../../api/axios';

const ModernDareParticipant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [difficulty, setDifficulty] = useState('titillating');
  const [consented, setConsented] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [dare, setDare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState('');
  const [proofSuccess, setProofSuccess] = useState('');
  const [noDare, setNoDare] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [fetching, setFetching] = useState(!!id);

  const MAX_PROOF_SIZE_MB = 10;

  // If id param is present, fetch that dare directly
  const fetchDare = useCallback(async () => {
    if (!id) return;
    
    try {
      setFetching(true);
      
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/${id}`));
      
      if (response.data) {
        setDare(response.data);
        setConsented(true);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Dare loading error:', error);
      const errorMessage = error.response?.data?.error || 'Dare not found.';
      setGeneralError(errorMessage);
      setNoDare(true);
      showError(errorMessage);
    } finally {
      setFetching(false);
    }
  }, [id, showSuccess, showError]);

  useEffect(() => {
    fetchDare();
  }, [fetchDare]);

  const handleConsent = useCallback(async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    
    try {
      // Use retry mechanism for random dare fetch
      const response = await retryApiCall(() => api.get(`/dares/random?difficulty=${difficulty}`));
      
      if (response.data && response.data._id) {
        setDare(response.data);
        setConsented(true);
      } else {
        setNoDare(true);
        showError('No dares available for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to fetch random dare:', error);
      setNoDare(true);
      const errorMessage = error.response?.data?.error || 'Failed to fetch dare.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [difficulty, showSuccess, showError]);

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!dare || (!proof && !proofFile)) {
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
      // Memory-safe timeout for state reset
      setTimeout(() => {
        setConsented(false);
        setDare(null);
        setGeneralSuccess('');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to chicken out.';
      setChickenOutError(errorMessage);
      showError(errorMessage);
    } finally {
      setChickenOutLoading(false);
    }
  };

  const handleTryDifferent = () => {
    setConsented(false);
    setDare(null);
    setNoDare(false);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    setGeneralError('');
    setGeneralSuccess('');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
        showError(`File size must be less than ${MAX_PROOF_SIZE_MB}MB.`);
        e.target.value = '';
        return;
      }
      setProofFile(file);
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

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dare...</div>
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
                <h1 className="text-2xl font-bold text-white">Participate in Dare</h1>
                <p className="text-neutral-400 text-sm">Join and perform exciting challenges</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Participant Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {!consented ? (
          /* Consent Form */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
                  <UserGroupIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-4xl sm:text-5xl font-bold text-white">Choose Your Challenge</h2>
                  <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                    Select difficulty and consent to perform
                  </p>
                </div>
              </div>
              <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
                Select a difficulty level and consent to perform a random dare that matches your choice.
              </p>
            </div>

            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              {/* Difficulty Selection */}
              <div className="mb-8">
                <label className="block text-xl font-semibold text-white mb-6">Difficulty Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`group relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        difficulty === option.value
                          ? `border-primary bg-gradient-to-r ${getDifficultyColor(option.value)} text-white shadow-2xl shadow-primary/25`
                          : 'border-neutral-700/50 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600/50 hover:bg-neutral-700/30'
                      }`}
                    >
                      {/* Background Pattern */}
                      <div className={`absolute inset-0 opacity-10 ${
                        difficulty === option.value ? 'bg-white' : 'bg-neutral-600'
                      }`} style={{
                        backgroundImage: 'radial-gradient(circle at 20% 80%, currentColor 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}></div>
                      
                      <div className="relative flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          difficulty === option.value
                            ? 'bg-white/20 text-white'
                            : 'bg-neutral-700/50 text-neutral-400 group-hover:bg-neutral-600/50 group-hover:text-neutral-300'
                        }`}>
                          {DIFFICULTY_ICONS[option.value]}
                        </div>
                        <div className="text-left">
                          <div className={`font-semibold text-lg transition-colors duration-300 ${
                            difficulty === option.value ? 'text-white' : 'text-white group-hover:text-primary'
                          }`}>
                            {option.label}
                          </div>
                          <div className={`text-sm transition-colors duration-300 ${
                            difficulty === option.value ? 'text-white/90' : 'text-neutral-300 group-hover:text-neutral-200'
                          }`}>
                            {option.desc}
                          </div>
                          {option.longDesc && (
                            <div className={`text-xs transition-colors duration-300 ${
                              difficulty === option.value ? 'text-white/80' : 'text-neutral-400 group-hover:text-neutral-300'
                            }`}>
                              {option.longDesc}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {difficulty === option.value && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl p-6 border border-blue-500/30">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <ShieldCheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2 mt-1"
                      />
                      <label htmlFor="consent" className="text-white leading-relaxed">
                        I consent to perform a dare of the selected difficulty level. I understand that I can decline any dare that makes me uncomfortable.
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Get Dare Button */}
              <div className="text-center">
                <button
                  onClick={handleConsent}
                  disabled={!consentChecked || loading}
                  className={`px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 mx-auto ${
                    consentChecked && !loading
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary hover:shadow-primary/25'
                      : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <FireIcon className="w-6 h-6" />
                      Get Random Dare
                    </>
                  )}
                </button>
                
                {!consentChecked && (
                  <p className="text-neutral-500 text-sm mt-3">
                    Please check the consent box to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : dare ? (
          /* Dare Display and Proof Submission */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Dare Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className={`bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} p-4 rounded-2xl shadow-xl`}>
                  {getDifficultyIcon(dare.difficulty)}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4">Your Dare</h2>
                  <div className="text-neutral-300 text-lg leading-relaxed mb-6">{dare.description}</div>
                  <div className="flex items-center gap-6 text-sm text-neutral-400">
                    <span className="flex items-center gap-2">
                      <StarIcon className="w-4 h-4" />
                      Difficulty: {dare.difficulty}
                    </span>
                    {dare.creator && (
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Created by: {dare.creator?.fullName || dare.creator?.username || 'Unknown User'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleTryDifferent}
                  className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Try Different Dare
                </button>
                
                <button
                  onClick={handleChickenOut}
                  disabled={chickenOutLoading}
                  className="px-6 py-3 bg-gradient-to-r from-red-600/20 to-red-700/20 text-red-400 border border-red-500/30 hover:from-red-700/30 hover:to-red-800/30 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chickenOutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      Chickening Out...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-4 h-4" />
                      Chicken Out
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Proof Submission */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-primary" />
                Submit Proof
              </h3>
              
              <form onSubmit={handleProofSubmit} className="space-y-6">
                <div>
                  <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">Proof Description</label>
                  <textarea
                    id="proof-text"
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    className="w-full h-32 px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                    placeholder="Describe how you completed the dare..."
                  />
                </div>

                <div>
                  <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">Proof File (Optional)</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="proof-file"
                      onChange={handleProofFileChange}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
                    <div className="text-sm text-neutral-400 mt-2">
                      Max file size: {MAX_PROOF_SIZE_MB}MB • Supported: Images, Videos
                    </div>
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

                <button
                  type="submit"
                  disabled={proofLoading || (!proof && !proofFile)}
                  className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 ${
                    proof && !proofLoading
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary hover:shadow-primary/25'
                      : 'bg-neutral-700 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {proofLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FireIcon className="w-5 h-5" />
                      Submit Proof
                    </>
                  )}
                </button>
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

              {chickenOutError && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-medium">{chickenOutError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : noDare ? (
          /* No Dare Available */
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-12 shadow-xl text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No dares available</h2>
              <p className="text-neutral-400 text-lg mb-6">
                No dares are available for the selected difficulty level. Try a different difficulty or create your own dare.
              </p>
              <button
                onClick={handleTryDifferent}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Try Different Difficulty
              </button>
            </div>
          </div>
        ) : null}

        {/* General Error/Success Messages */}
        {generalError && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">{generalError}</span>
              </div>
            </div>
          </div>
        )}
        
        {generalSuccess && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">{generalSuccess}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernDareParticipant; 