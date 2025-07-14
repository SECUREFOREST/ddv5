import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function DarePerform() {
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
    <div className="max-w-sm w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Link to="/" className="inline-block mb-4">
        <button className="text-primary hover:text-primary-dark text-sm font-semibold">&larr; Back to Home</button>
      </Link>
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Perform a Dare</h1>
      {!consented ? (
        <form onSubmit={e => { e.preventDefault(); handleConsent(); }} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-primary">Select Difficulty</label>
            <select
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              required
            >
              <option value="titillating">Titillating</option>
              <option value="daring">Daring</option>
              <option value="shocking">Shocking</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              className="mr-2"
              required
            />
            <label htmlFor="consent" className="text-sm">I consent to perform a random dare.</label>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50" disabled={loading || !consentChecked}>
            {loading ? 'Loading...' : 'Get Dare'}
          </button>
          {noDare && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">No dare found for this difficulty. Try a different one.</div>}
        </form>
      ) : dare ? (
        <div>
          <div className="mb-4 p-4 bg-neutral-900 rounded text-neutral-100 border border-neutral-800">
            <div className="font-semibold text-primary mb-2">Your Dare:</div>
            <div className="text-lg font-bold mb-2">{dare.description}</div>
            <div className="text-sm text-neutral-400">Difficulty: {dare.difficulty}</div>
          </div>
          <form onSubmit={handleProofSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-primary">Proof of Completion</label>
              <textarea
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                value={proof}
                onChange={e => setProof(e.target.value)}
                rows={3}
                placeholder="Describe or link to your proof..."
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-primary">Upload File (optional)</label>
              <input
                type="file"
                className="w-full text-neutral-100"
                onChange={e => setProofFile(e.target.files[0])}
                accept="image/*,video/*,application/pdf"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="expireAfterView"
                checked={expireAfterView}
                onChange={e => setExpireAfterView(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="expireAfterView" className="text-sm">Expire proof after view</label>
            </div>
            {proofError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{proofError}</div>}
            {proofSuccess && <div className="text-success text-sm font-medium" role="alert" aria-live="polite">{proofSuccess}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={handleTryDifferent} disabled={proofLoading}>
                Try Different Dare
              </button>
              <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50" disabled={proofLoading}>
                {proofLoading ? 'Submitting...' : 'Submit Proof'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
} 