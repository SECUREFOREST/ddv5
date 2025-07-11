import React, { useState } from 'react';
import api from '../api/axios';

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
        setDare(res.data);
        setConsented(true);
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
    setProofError('');
    setProofSuccess('');
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
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
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

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
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
            <div className="mb-2"><b>Difficulty:</b> {dare.difficulty}</div>
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
        </>
      )}
    </div>
  );
} 