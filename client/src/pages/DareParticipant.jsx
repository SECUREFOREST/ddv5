import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import { FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';
import { DIFFICULTY_OPTIONS } from '../constants';

export default function DareParticipant() {
  const { id } = useParams();
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
  const [chickenOutLoading, setChickenOutLoading] = useState(false);
  const [chickenOutError, setChickenOutError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const { showNotification } = useNotification();

  const MAX_PROOF_SIZE_MB = 10;

  const DIFFICULTY_ICONS = {
    titillating: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
    arousing: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
    explicit: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
    edgy: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
    hardcore: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
  };

  // If id param is present, fetch that dare directly
  React.useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/dares/${id}`)
        .then(res => {
          setDare(res.data);
          setConsented(true);
        })
        .catch(() => {
          setGeneralError('Dare not found.');
          setNoDare(true);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleConsent = async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    try {
      const res = await api.get(`/dares/random?difficulty=${difficulty}`);
      if (res.data && res.data._id) {
        setDare(res.data);
        setConsented(true);
      } else {
        setNoDare(true);
        showNotification('No dares available for this difficulty.', 'error');
      }
    } catch (err) {
      setNoDare(true);
      showNotification(err.response?.data?.error || 'Failed to fetch dare.', 'error');
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
      setTimeout(() => {
        setConsented(false);
        setConsentChecked(false);
        setDare(null);
      }, 1500);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to submit proof.', 'error');
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    try {
      await api.post(`/dares/${dare._id}/forfeit`);
      setConsented(false);
      setConsentChecked(false);
      setDare(null);
      setProof('');
      setProofFile(null);
      showNotification('You have successfully chickened out.', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to chicken out.', 'error');
    } finally {
      setChickenOutLoading(false);
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
    setGeneralError('');
    setGeneralSuccess('');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_PROOF_SIZE_MB * 1024 * 1024) {
      setProofError(`File too large. Max size is ${MAX_PROOF_SIZE_MB}MB.`);
      setProofFile(null);
      return;
    }
    setProofFile(file);
  };

  return (
    <div className="w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
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


        <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
        {!consented && (
          <div className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
            {/* Difficulty Selection */}
            <div>
              <label className="block font-semibold mb-1 text-primary">Select Difficulty</label>
              <div className="flex flex-col gap-2">
                {DIFFICULTY_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors
                    ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                    <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} className="accent-primary bg-[#1a1a1a]" />
                    {DIFFICULTY_ICONS[opt.value]}
                    <b>{opt.label}</b>
                    <span className="text-xs text-neutral-400 ml-2">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Consent Checkbox */}
            <div className="flex items-center">
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={consentChecked}
                onChange={e => setConsentChecked(e.target.checked)}
                className="form-checkbox mr-2 bg-[#1a1a1a]"
                aria-required="true"
              />
              <label htmlFor="consent-checkbox" className="text-neutral-100">I consent to receive a random dare and complete it as described.</label>
            </div>
            <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
              <button
                className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
                onClick={handleConsent}
                disabled={loading || !consentChecked}
                aria-busy={loading}
              >
                {loading ? (
                  <span>
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-primary-contrast rounded-full animate-spin align-middle mr-2"></span>
                    Consenting...
                  </span>
                ) : 'Consent'}
              </button>
            </div>
            {noDare && (
              <div className="text-danger text-sm font-medium text-center">
                No available dare found for this difficulty.<br />
                <button className="mt-2 bg-info text-info-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-info-dark transition-colors focus:outline-none focus:ring-2 focus:ring-info-contrast flex items-center gap-2 justify-center text-lg shadow-lg" onClick={handleTryDifferent}>
                  Try a Different Difficulty
                </button>
                <button className="mt-2 ml-2 bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" onClick={handleConsent} disabled={loading || !consentChecked}>
                  Refresh Pool
                </button>
              </div>
            )}
          </div>
        )}
        {consented && dare && (
          <>
            <div className="mb-4 p-4 bg-neutral-900 rounded text-neutral-100 border border-neutral-800">
              <div className="mb-2 font-bold text-primary text-lg">Dare Description</div>
              <div className="mb-2">{dare.description}</div>
              <div className="mb-2 flex items-center gap-2"><span className="font-semibold">Difficulty:</span> {DIFFICULTY_ICONS[dare.difficulty]} <b>{dare.difficulty}</b></div>
            </div>
            <form role="form" aria-labelledby="proof-submit-title" onSubmit={handleProofSubmit} className="space-y-6">
              <h1 id="proof-submit-title" className="text-2xl font-bold mb-4">Submit Proof</h1>
              <div>
                <label className="block font-semibold mb-1 text-primary" htmlFor="proof-text">Proof (text, link, or upload)</label>
                <textarea
                  id="proof-text"
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                  rows={3}
                  placeholder="Describe your proof, add a link, or leave blank if uploading a file."
                  aria-required="true"
                />
              </div>
              <div className="flex items-center mt-2">
                <input
                  id="expireAfterView"
                  type="checkbox"
                  checked={expireAfterView}
                  onChange={e => setExpireAfterView(e.target.checked)}
                  className="mr-2 bg-[#1a1a1a]"
                  aria-required="true"
                />
                <label htmlFor="expireAfterView" className="text-sm">Expire proof 48 hours after it is viewed by the dare creator.</label>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-primary" htmlFor="proof-file">Upload image or video proof (optional)</label>
                <input
                  id="proof-file"
                  type="file"
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                  onChange={handleProofFileChange}
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
                  ) : 'Submit Proof'}
                </button>
              </div>
            </form>
            {/* Chicken Out button, only if dare is in progress */}
            {dare.status === 'in_progress' && (
              <button
                className="w-full mt-4 bg-danger text-danger-contrast rounded px-4 py-2 font-bold text-base hover:bg-danger-dark transition-colors focus:outline-none focus:ring-2 focus:ring-danger-contrast flex items-center gap-2 justify-center text-lg"
                onClick={handleChickenOut}
                disabled={chickenOutLoading}
                aria-busy={chickenOutLoading}
              >
                {chickenOutLoading ? 'Chickening Out...' : 'Chicken Out'}
              </button>
            )}
            {chickenOutError && <div className="text-danger text-sm font-medium mt-2" role="alert" aria-live="assertive">{chickenOutError}</div>}
          </>
        )}
      </main>
    </div>
  );
} 