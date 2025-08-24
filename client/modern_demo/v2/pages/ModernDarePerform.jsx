import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon, 
  ArrowRightIcon, 
  LockClosedIcon, 
  ClockIcon, 
  TrashIcon, 
  PlayIcon,
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  FlagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  TrophyIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DIFFICULTY_OPTIONS, PRIVACY_OPTIONS, DIFFICULTY_ICONS, ERROR_MESSAGES } from '../../constants.jsx';
import { formatRelativeTimeWithTooltip } from '../../utils/dateUtils';
import { validateFormData, VALIDATION_SCHEMAS } from '../../utils/validation';
import { retryApiCall } from '../../utils/retry';
import { useContentDeletion } from '../../hooks/useContentDeletion';
import api from '../../api/axios';

const ModernDarePerform = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [grading, setGrading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [fetchingDare, setFetchingDare] = useState(false);
  const [fetchDareError, setFetchDareError] = useState('');
  const [privacy, setPrivacy] = useState('when_viewed');
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [completedDare, setCompletedDare] = useState(null);

  const handleConsent = useCallback(async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    setShowCongratulations(false);
    setCompletedDare(null);
    
    try {
      // Use retry mechanism for dare fetch
      const response = await retryApiCall(() => api.get(`/dares/random?difficulty=${difficulty}`));
      
      if (response.data && response.data._id) {
        // Prevent creator from performing their own dare
        const isCreator = user && ((typeof response.data.creator === 'object' ? response.data.creator._id : response.data.creator) === user.id);
        if (isCreator) {
          setNoDare(true);
          showError('You cannot perform your own dares. Try a different difficulty.');
        } else {
          setDare(response.data);
          setConsented(true);
        }
      } else {
        setNoDare(true);
        showError('No dares available for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to load random dare:', error);
      setNoDare(true);
      showError(ERROR_MESSAGES.DARE_LOAD_FAILED);
    } finally {
      setLoading(false);
    }
  }, [difficulty, user, showSuccess, showError]);

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
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }));
      } else {
        await retryApiCall(() => api.post(`/dares/${dare._id}/proof`, { text: proof, contentDeletion }));
      }
      setProof('');
      setProofFile(null);
      setProofSuccess('Proof submitted successfully!');
      showSuccess('Proof submitted successfully!');
      setShowCongratulations(true);
      setCompletedDare(dare);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit proof.';
      setProofError(errorMessage);
      showError(errorMessage);
    } finally {
      setProofLoading(false);
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
    setShowCongratulations(false);
    setCompletedDare(null);
  };

  const handlePerformAnotherDare = () => {
    setShowCongratulations(false);
    setCompletedDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    // Reset to initial state to allow selecting new difficulty
    setConsented(false);
    setDare(null);
    setNoDare(false);
  };

  const fetchDare = useCallback(async (dareId) => {
    if (!dareId) return;
    
    try {
      setFetchingDare(true);
      setFetchDareError('');
      
      const response = await retryApiCall(() => api.get(`/dares/${dareId}`));
      
      if (response.data) {
        setDare(response.data);
        setConsented(true);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load dare:', error);
      const errorMessage = error.response?.data?.error || ERROR_MESSAGES.DARE_LOAD_FAILED;
      setFetchDareError(errorMessage);
      showError(errorMessage);
    } finally {
      setFetchingDare(false);
    }
  }, [showSuccess, showError]);

  const handleGrade = async (e, targetId) => {
    e.preventDefault();
    setGrading(true);
    setGradeError('');
    try {
      await retryApiCall(() => api.post(`/dares/${dare._id}/grade`, {
        targetId,
        grade,
        feedback,
      }));
      setGrade('');
      setFeedback('');
      showSuccess('Grade submitted successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to submit grade.';
      setGradeError(errorMessage);
      showError(errorMessage);
    } finally {
      setGrading(false);
    }
  };

  const getId = (obj) => (typeof obj === 'object' && obj !== null ? obj._id : obj);

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

  if (fetchingDare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading dare details...</div>
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
                <h1 className="text-2xl font-bold text-white">Perform a Dare</h1>
                <p className="text-neutral-400 text-sm">Challenge yourself with exciting tasks</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <PlayIcon className="w-4 h-4" />
                  <span>Performance Mode</span>
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
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Perform a Dare</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Challenge yourself with exciting tasks
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Select difficulty, consent to perform, and complete your chosen challenge
          </p>
        </div>

        {!consented ? (
          /* Consent Form */
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-300">Progress</span>
                <span className="text-sm text-neutral-400">Step 1 of 3</span>
              </div>
              <div className="w-full bg-neutral-700/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500" style={{ width: '33%' }}></div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Choose Your Challenge</h3>
              <p className="text-neutral-300 text-lg">
                Select a difficulty level and consent to perform a random dare
              </p>
            </div>

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
        ) : dare ? (
          /* Dare Display and Proof Submission */
          <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-neutral-300">Progress</span>
                <span className="text-sm text-neutral-400">Step 2 of 3</span>
              </div>
              <div className="w-full bg-neutral-700/50 rounded-full h-3">
                <div className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500" style={{ width: '66%' }}></div>
              </div>
            </div>
            
            {/* Dare Card */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <div className="flex items-start gap-6 mb-6">
                <div className={`bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} p-4 rounded-2xl shadow-xl`}>
                  {getDifficultyIcon(dare.difficulty)}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-4">Your Dare</h3>
                  <div className="text-neutral-300 text-lg leading-relaxed mb-6">{dare.description}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-400 mb-6">
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
              </div>
            </div>

            {/* Proof Submission */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-300">Progress</span>
                  <span className="text-sm text-neutral-400">Step 3 of 3</span>
                </div>
                <div className="w-full bg-neutral-700/50 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                </div>
              </div>
              
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
                  <input
                    type="file"
                    id="proof-file"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    accept="image/*,video/*"
                  />
                  <div className="text-sm text-neutral-400 mt-2">
                    Supported: Images, Videos • Max file size: 50MB
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
                      <ArrowRightIcon className="w-5 h-5" />
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
            </div>
          </div>
        ) : noDare ? (
          /* No Dare Available */
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-12 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No dares available</h2>
            <p className="text-neutral-400 text-lg mb-6">
              No dares are available for the selected difficulty level. Try a different difficulty or create your own dare.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={handleTryDifferent}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Try Different Difficulty
              </button>
              <button
                onClick={() => navigate('/modern/dares/create/dom')}
                className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <FireIcon className="w-5 h-5" />
                Create Dare
              </button>
            </div>
          </div>
        ) : null}
      </div>

             {showCongratulations && completedDare && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
           <div className="bg-neutral-900/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl text-center max-w-2xl mx-4">
             <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <TrophyIcon className="w-12 h-12 text-green-400" />
             </div>
             <h3 className="text-3xl font-bold text-white mb-4">Congratulations! 🎉</h3>
             <p className="text-neutral-300 text-lg mb-4">
               You have successfully completed the dare: <span className="text-white font-semibold">"{completedDare.content || completedDare.description}"</span>
             </p>
             <p className="text-neutral-400 text-base mb-8">
               Great job! Ready for your next challenge?
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                   onClick={handlePerformAnotherDare}
                   className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                 >
                   <PlusIcon className="w-5 h-5" />
                   Perform Another Dare
                 </button>
               <button
                 onClick={() => {
                   setShowCongratulations(false);
                   setCompletedDare(null);
                   navigate('/modern/dashboard');
                 }}
                 className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
               >
                 <ArrowLeftIcon className="w-5 h-5" />
                 Back to Dashboard
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default ModernDarePerform; 