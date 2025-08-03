import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ArrowRightIcon, LockClosedIcon, ClockIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import { DIFFICULTY_OPTIONS } from '../constants';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

const PRIVACY_OPTIONS = [
  { value: 'when_viewed', label: 'Delete once viewed', desc: 'As soon as the other person has viewed the image, delete it completely.', icon: <LockClosedIcon className="w-5 h-5 text-primary" /> },
  { value: '30_days', label: 'Delete in 30 days', desc: 'All pics are deleted thirty days after you upload them, whether they have been viewed or not.', icon: <ClockIcon className="w-5 h-5 text-yellow-400" /> },
  { value: 'never', label: 'Never delete', desc: 'Keep your images on the site permanently. Not recommended. Images will be deleted if you fail to log in for 2 months.', icon: <TrashIcon className="w-5 h-5 text-danger" /> },
];

const DIFFICULTY_ICONS = {
  titillating: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  arousing: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  explicit: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  edgy: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  hardcore: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
};

export default function DarePerform() {
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
  const [expireAfterView, setExpireAfterView] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeError, setGradeError] = useState('');
  const [grading, setGrading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [fetchingDare, setFetchingDare] = useState(false);
  const [fetchDareError, setFetchDareError] = useState('');
  const [privacy, setPrivacy] = useState('when_viewed');

  const handleConsent = useCallback(async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    
    try {
      const response = await api.get(`/dares/random?difficulty=${difficulty}`);
      
      if (response.data && response.data._id) {
        // Prevent creator from performing their own dare
        const isCreator = user && ((typeof response.data.creator === 'object' ? response.data.creator._id : response.data.creator) === user.id);
        if (isCreator) {
          setNoDare(true);
          showError('You cannot perform your own dares. Try a different difficulty.');
        } else {
          setDare(response.data);
          setConsented(true);
          showSuccess('Dare loaded successfully!');

        }
      } else {
        setNoDare(true);
        showError('No dares available for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to load random dare:', error);
      setNoDare(true);
      showError('Failed to load dare. Please try again.');
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
  };

  const fetchDare = useCallback(async (dareId) => {
    if (!dareId) return;
    
    try {
      setFetchingDare(true);
      setFetchDareError('');
      
      const response = await api.get(`/dares/${dareId}`);
      
      if (response.data) {
        setDare(response.data);
        setConsented(true);
        showSuccess('Dare loaded successfully!');
        
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load dare:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load dare.';
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
      await api.post(`/dares/${dare._id}/grade`, {
        targetId,
        grade,
        feedback,
      });
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

  if (fetchingDare) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={5} />
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
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Perform a Dare</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge yourself with exciting dares
            </p>
          </div>

          {!consented ? (
            /* Consent Form */
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Choose Your Challenge</h2>
                <p className="text-neutral-300 mb-6">
                  Select a difficulty level and consent to perform a random dare
                </p>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-white mb-4">Difficulty Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        difficulty === option.value
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {DIFFICULTY_ICONS[option.value]}
                        <div className="text-left">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm opacity-75">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="mb-8">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2 mt-1"
                  />
                  <label htmlFor="consent" className="text-white">
                    I consent to perform a dare of the selected difficulty level. I understand that I can decline any dare that makes me uncomfortable.
                  </label>
                </div>
              </div>

              {/* Get Dare Button */}
              <div className="text-center">
                <button
                  onClick={handleConsent}
                  disabled={!consentChecked || loading}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
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
              </div>
            </div>
          ) : dare ? (
            /* Dare Display and Proof Submission */
            <div className="space-y-8">
              {/* Dare Card */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-xl">
                    {DIFFICULTY_ICONS[dare.difficulty]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Your Dare</h2>
                    <div className="text-neutral-300 mb-4">{dare.description}</div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <span>Difficulty: {dare.difficulty}</span>
                      {dare.creator && (
                        <span>Created by: {dare.creator.fullName || dare.creator.username}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleTryDifferent}
                    className="bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                  >
                    Try Different Dare
                  </button>
                </div>
              </div>

              {/* Proof Submission */}
              <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6">Submit Proof</h3>
                
                <form onSubmit={handleProofSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="proof-text" className="block font-semibold mb-2 text-white">Proof Description</label>
                    <textarea
                      id="proof-text"
                      value={proof}
                      onChange={(e) => setProof(e.target.value)}
                      className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                      placeholder="Describe how you completed the dare..."
                    />
                  </div>

                  <div>
                    <label htmlFor="proof-file" className="block font-semibold mb-2 text-white">Proof File (Optional)</label>
                    <input
                      type="file"
                      id="proof-file"
                      onChange={(e) => setProofFile(e.target.files[0])}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      accept="image/*,video/*"
                    />
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

                  <button
                    type="submit"
                    disabled={proofLoading || (!proof && !proofFile)}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  >
                    {proofLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon className="w-6 h-6" />
                        Submit Proof
                      </>
                    )}
                  </button>
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
              </div>
            </div>
          ) : noDare ? (
            /* No Dare Available */
            <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl text-center">
              <div className="text-neutral-400 text-xl mb-4">No dares available</div>
              <p className="text-neutral-500 text-sm mb-6">
                No dares are available for the selected difficulty level. Try a different difficulty or create your own dare.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleTryDifferent}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Try Different Difficulty
                </button>
                <Link
                  to="/dares/create"
                  className="bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Create Dare
                </Link>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
} 