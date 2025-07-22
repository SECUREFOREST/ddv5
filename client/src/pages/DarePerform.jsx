import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, ArrowRightIcon, LockClosedIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';
import { DIFFICULTY_OPTIONS } from '../constants';

const PRIVACY_OPTIONS = [
  { value: 'when_viewed', label: 'Delete once viewed', desc: 'As soon as the other person has viewed the image, delete it completely.', icon: <LockClosedIcon className="w-5 h-5 text-primary" /> },
  { value: '30_days', label: 'Delete in 30 days', desc: 'All pics are deleted thirty days after you upload them, whether they have been viewed or not.', icon: <ClockIcon className="w-5 h-5 text-yellow-400" /> },
  { value: 'never', label: 'Never delete', desc: 'Keep your images on the site permanently. Not recommended. Images will be deleted if you fail to log in for 2 months.', icon: <TrashIcon className="w-5 h-5 text-danger" /> },
];

export default function DarePerform() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
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

  const handleConsent = async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    try {
      const res = await api.get(`/dares/random?difficulty=${difficulty}`);
      if (res.data && res.data._id) {
        // Prevent creator from performing their own dare
        const isCreator = user && ((typeof res.data.creator === 'object' ? res.data.creator._id : res.data.creator) === user.id);
        if (isCreator) {
          setNoDare(true);
        } else {
          setDare(res.data);
          setConsented(true);
        }
      } else {
        setNoDare(true);
      }
    } catch (err) {
      setNoDare(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofLoading(true);
    if (!proof && !proofFile) {
      showNotification('Please provide proof text or upload a file.', 'error');
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
      setExpireAfterView(false);
      showNotification('Proof submitted successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to submit proof.', 'error');
    } finally {
      setProofLoading(false);
    }
  };

  const handleTryDifferent = () => {
    setNoDare(false);
    setConsented(false);
    setConsentChecked(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
  };

  // Fetch dare details with grades after proof submission
  const fetchDare = async (dareId) => {
    setFetchingDare(true);
    try {
      const res = await api.get(`/dares/${dareId}`);
      setDare(res.data);
      setGrades(res.data.grades || []);
    } catch (err) {
      showNotification('Failed to load updated dare details. Please refresh the page.', 'error');
    } finally {
      setFetchingDare(false);
    }
  };

  // After proof submission, fetch dare details
  React.useEffect(() => {
    if (proofSuccess && dare?._id) {
      fetchDare(dare._id);
    }
  }, [proofSuccess, dare?._id]);

  // Grading logic
  const hasGradedPerformer = user && dare && grades && dare.performer && grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === dare.performer._id || g.target === dare.performer._id || g.target === dare.performer));
  const hasGradedCreator = user && dare && grades && dare.creator && grades.some(g => g.user && (g.user._id === user.id || g.user === user.id) && g.target && (g.target._id === dare.creator._id || g.target === dare.creator._id || g.target === dare.creator));
  const handleGrade = async (e, targetId) => {
    e.preventDefault();
    setGradeError('');
    if (!grade) {
      setGradeError('Please select a grade.');
      return;
    }
    setGrading(true);
    try {
      await api.post(`/dares/${dare._id}/grade`, { grade: Number(grade), feedback, target: targetId });
      setGrade('');
      setFeedback('');
      fetchDare(dare._id);
    } catch (err) {
      setGradeError(err.response?.data?.error || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  // Helper to normalize MongoDB IDs
  const getId = (obj) => (typeof obj === 'object' && obj !== null ? obj._id : obj);
  const isCreator = user && dare && getId(dare.creator) === user.id;
  const isPerformer = user && dare && getId(dare.performer) === user.id;

  // Improved debug log for updated dare state
  React.useEffect(() => {
    if (dare && proofSuccess) {
      console.log('Updated dare after proof submission:', dare);
    }
  }, [dare, proofSuccess]);

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-neutral-700 rounded-full h-2 mt-4 mb-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: consented ? '100%' : '50%' }} />
      </div>
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <FireIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Perform Dare
        </h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">{consented ? 'Step 2 of 2: Submit Proof' : 'Step 1 of 2: Consent & Get Dare'}</div>


      {!consented ? (
        <form role="form" aria-labelledby="dare-perform-title" onSubmit={e => { e.preventDefault(); handleConsent(); }} className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
          <h1 id="dare-perform-title" className="text-2xl font-bold mb-4">Perform Dare</h1>
          {/* Difficulty Selection */}
          <div>
            <label htmlFor="difficulty" className="block font-semibold mb-1 text-primary">Select Difficulty</label>
            <div className="flex flex-col gap-2">
              {DIFFICULTY_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors
                  ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                  <input
                    type="radio"
                    name="difficulty"
                    value={opt.value}
                    checked={difficulty === opt.value}
                    onChange={() => setDifficulty(opt.value)}
                    className="accent-primary bg-[#1a1a1a]"
                    id={`difficulty-${opt.value}`}
                    aria-required="true"
                  />
                  {opt.icon}
                  <b>{opt.label}</b>
                  <span className="text-xs text-neutral-400 ml-2">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Consent Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="perform-consent"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              className="mr-2 bg-[#1a1a1a]"
              required
              aria-required="true"
            />
            <label htmlFor="perform-consent" className="text-sm">I consent to perform a random dare.</label>
          </div>
          <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
            <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" disabled={loading || !consentChecked}>
              {loading ? (
                <span>
                  <span className="inline-block w-4 h-4 border-2 border-t-transparent border-primary-contrast rounded-full animate-spin align-middle mr-2"></span>
                  Loading...
                </span>
              ) : (
                <>
                  Get Dare <ArrowRightIcon className="inline w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
          {noDare && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">No dare found for this difficulty. Try a different one.</div>}
        </form>
      ) : dare ? (
        <div>
          <div className="mb-4 p-4 bg-neutral-900 rounded text-neutral-100 border border-neutral-800">
            <div className="font-semibold text-primary mb-2">Your Dare:</div>
            <div className="text-lg font-bold mb-2">{dare.description}</div>
            <div className="text-sm text-neutral-400 flex items-center gap-2">Difficulty: {DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty)?.icon} <b>{dare.difficulty}</b></div>
          </div>
          {/* Privacy Options */}
          <div className="mb-6">
            <label htmlFor="privacy" className="block font-semibold mb-1 text-primary">Content Deletion / Privacy</label>
            <div className="flex flex-col gap-2">
              {PRIVACY_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${privacy === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                  <input
                    type="radio"
                    name="privacy"
                    value={opt.value}
                    checked={privacy === opt.value}
                    onChange={() => setPrivacy(opt.value)}
                    className="mt-1 accent-primary bg-[#1a1a1a]"
                    id={`privacy-${opt.value}`}
                    aria-required="true"
                  />
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <b>{opt.label}</b>
                  </span>
                  <span className="text-xs text-neutral-400 ml-2">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Proof submission */}
          <form onSubmit={handleProofSubmit} className="space-y-4 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
            <div>
              <label htmlFor="perform-proof-text" className="block font-semibold mb-1 text-primary">Proof (text, link, or upload)</label>
              <textarea
                id="perform-proof-text"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                value={proof}
                onChange={e => setProof(e.target.value)}
                rows={3}
                placeholder="Describe your proof, add a link, or leave blank if uploading a file."
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="perform-proof-file" className="block font-semibold mb-1 text-primary">Upload image or video proof (optional)</label>
              <input
                id="perform-proof-file"
                type="file"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                onChange={e => setProofFile(e.target.files[0])}
                accept="image/*,video/mp4,video/webm,video/quicktime"
                aria-required="false"
              />
              <small className="text-gray-400">Accepted: images (jpg, png, gif) or video (mp4, mov, webm). Max size: 50MB.</small>
            </div>
            {proofError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{proofError}</div>}
            {proofSuccess && <div className="text-success text-sm font-medium" role="status" aria-live="polite">{proofSuccess}</div>}
            <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
              <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" disabled={proofLoading} aria-busy={proofLoading}>
                {proofLoading ? (
                  <span>
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-primary-contrast rounded-full animate-spin align-middle mr-2"></span>
                    Submitting...
                  </span>
                ) : (
                  <>
                    Submit Proof <ArrowRightIcon className="inline w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
          {/* Chicken Out button, only if dare is in progress */}
          {dare.status === 'in_progress' && (
            <button
              className="w-full mt-4 bg-danger text-danger-contrast rounded px-4 py-2 font-semibold hover:bg-danger-dark disabled:opacity-50"
              // onClick={handleChickenOut} // Not implemented in this file
              disabled={false}
              aria-busy={false}
            >
              {/* {chickenOutLoading ? 'Chickening Out...' : 'Chicken Out'} */}
              Chicken Out
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
} 