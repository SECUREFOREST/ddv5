import React, { useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold mr-2 ${badgeClass}`}>{label}</span>
  );
}

export default function DareParticipant() {
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
  // Add state for general error/success
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');

  const handleConsent = async () => {
    setLoading(true);
    setNoDare(false);
    setDare(null);
    setProof('');
    setProofFile(null);
    setProofError('');
    setProofSuccess('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      const res = await api.get(`/dares/random?difficulty=${difficulty}`);
      if (res.data && res.data._id) {
        setDare(res.data);
        setConsented(true);
      } else {
        setNoDare(true);
        setGeneralError('No dares available for this difficulty.');
      }
    } catch (err) {
      setNoDare(true);
      setGeneralError(err.response?.data?.error || 'Failed to fetch dare.');
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofError('');
    setProofSuccess('');
    setGeneralError('');
    setGeneralSuccess('');
    setProofLoading(true);
    try {
      if (!proof && !proofFile) {
        setProofError('Please provide proof text or upload a file.');
        setProofLoading(false);
        return;
      }
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
      setProofSuccess('Proof submitted successfully!');
      setGeneralSuccess('Proof submitted successfully!');
      // Automatically offer a new dare after a short delay
      setTimeout(() => {
        setConsented(false);
        setConsentChecked(false);
        setDare(null);
        setProofSuccess('');
        setGeneralSuccess('');
        handleConsent();
      }, 1500);
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      setGeneralError(err.response?.data?.error || 'Failed to submit proof.');
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      const res = await api.post(`/dares/${dare._id}/forfeit`);
      setConsented(false);
      setConsentChecked(false);
      setDare(null);
      setProof('');
      setProofFile(null);
      setProofError('');
      setProofSuccess('');
      setGeneralSuccess('You have successfully chickened out.');
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      setGeneralError(err.response?.data?.error || 'Failed to chicken out.');
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

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Perform a Dare</h1>
      {!consented && (
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-primary">Select Difficulty</label>
            <select
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              aria-label="Select Difficulty"
            >
              <option value="titillating">Titillating</option>
              <option value="arousing">Arousing</option>
              <option value="explicit">Explicit</option>
              <option value="edgy">Edgy</option>
              <option value="hardcore">Hardcore</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              className="form-checkbox mr-2"
              aria-required="true"
            />
            <label htmlFor="consent-checkbox" className="text-neutral-100">I consent to receive a random dare and complete it as described.</label>
          </div>
          <button
            className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark disabled:opacity-50"
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
          {noDare && (
            <div className="text-danger text-sm font-medium text-center">
              No available dare found for this difficulty.<br />
              <button className="mt-2 bg-info text-info-contrast rounded px-4 py-2 font-semibold hover:bg-info-dark" onClick={handleTryDifferent}>
                Try a Different Difficulty
              </button>
              <button className="mt-2 ml-2 bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={handleConsent} disabled={loading || !consentChecked}>
                Refresh Pool
              </button>
            </div>
          )}
        </div>
      )}
      {consented && dare && (
        <>
          <div className="mb-4">
            <div className="bg-neutral-900 rounded p-4 mb-2">
              <div className="mb-2"><b>Description:</b></div>
              <div>{dare.description}</div>
            </div>
            <div className="mb-2"><b>Difficulty:</b> <DifficultyBadge level={dare.difficulty} /></div>
          </div>
          <form onSubmit={handleProofSubmit} className="space-y-4" aria-label="Submit Proof Form">
            <div>
              <label className="block font-semibold mb-1 text-primary" htmlFor="proof-text">Proof (text, link, or upload)</label>
              <textarea
                id="proof-text"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                value={proof}
                onChange={e => setProof(e.target.value)}
                rows={3}
                placeholder="Describe your proof, add a link, or leave blank if uploading a file."
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                id="expireAfterView"
                type="checkbox"
                checked={expireAfterView}
                onChange={e => setExpireAfterView(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="expireAfterView" className="text-sm">Expire proof 48 hours after it is viewed by the dare creator.</label>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-primary" htmlFor="proof-file">Upload image or video proof (optional)</label>
              <input
                id="proof-file"
                type="file"
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                onChange={e => setProofFile(e.target.files[0])}
                accept="image/*,video/mp4,video/webm,video/quicktime"
              />
              <small className="text-gray-400">Accepted: images (jpg, png, gif) or video (mp4, mov, webm). Max size: 50MB.</small>
            </div>
            {proofError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{proofError}</div>}
            {proofSuccess && <div className="text-success text-sm font-medium" role="status" aria-live="polite">{proofSuccess}</div>}
            <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark disabled:opacity-50" disabled={proofLoading} aria-busy={proofLoading}>
              {proofLoading ? (
                <span>
                  <span className="inline-block w-4 h-4 border-2 border-t-transparent border-primary-contrast rounded-full animate-spin align-middle mr-2"></span>
                  Submitting...
                </span>
              ) : 'Submit Proof'}
            </button>
          </form>
          {/* Chicken Out button, only if dare is in progress */}
          {dare.status === 'in_progress' && (
            <button
              className="w-full mt-4 bg-danger text-danger-contrast rounded px-4 py-2 font-semibold hover:bg-danger-dark disabled:opacity-50"
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
    </div>
  );
} 