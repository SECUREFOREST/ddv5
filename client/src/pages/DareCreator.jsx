import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import { DARE_DIFFICULTIES } from '../tailwindColors';
import TagsInput from '../components/TagsInput';

export default function DareCreator() {
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdDareId, setCreatedDareId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');
  const [claimable, setClaimable] = useState(false);
  const [claimLink, setClaimLink] = useState('');
  const [tags, setTags] = useState([]);
  const [publicDare, setPublicDare] = useState(true);

  const DIFFICULTIES = [
    { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.' },
    { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.' },
    { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.' },
    { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.' },
    { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.' },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setGeneralError('');
    setGeneralSuccess('');
    setClaimLink('');
    if (description.trim().length < 10) {
      setCreateError('Description must be at least 10 characters.');
      setGeneralError('Description must be at least 10 characters.');
      return;
    }
    setCreating(true);
    try {
      let res;
      if (claimable) {
        res = await api.post('/dares/claimable', {
          description,
          difficulty,
          tags,
          public: publicDare,
        });
        setClaimLink(res.data.claimLink);
        setShowModal(true);
      } else {
        res = await api.post('/dares', {
          description,
          difficulty,
          tags,
          public: publicDare,
        });
        navigate(`/dare/share/${res.data._id || res.data.id}`);
      }
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create dare');
      setGeneralError(err.response?.data?.error || 'Failed to create dare');
    } finally {
      setCreating(false);
    }
  };

  const dareUrl = createdDareId && typeof window !== 'undefined' ? `${window.location.origin}/dares/${createdDareId}` : '';

  const handleCreateAnother = () => {
    setShowModal(false);
    setCreatedDareId(null);
    setDescription('');
    setDifficulty('titillating');
    setCreateError('');
  };

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Create a Dare</h1>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">
          {toast}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 text-center">Dare Created!</h2>
            {claimLink && (
              <>
                <label className="block font-semibold mb-1 text-primary">Claimable Link</label>
                <input
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary mb-2"
                  type="text"
                  value={claimLink}
                  readOnly
                  onFocus={e => e.target.select()}
                  aria-label="Claimable Link"
                />
                <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark mb-3" onClick={() => navigator.clipboard.writeText(claimLink)}>
                  Copy Link
                </button>
              </>
            )}
            <label className="block font-semibold mb-1 text-primary">Sharable Link</label>
            <input
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary mb-2"
              type="text"
              value={dareUrl}
              readOnly
              onFocus={e => e.target.select()}
              aria-label="Sharable Link"
            />
            <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark mb-3" onClick={() => navigator.clipboard.writeText(dareUrl)}>
              Copy Link
            </button>
            <button className="w-full bg-success text-success-contrast rounded px-4 py-2 font-semibold hover:bg-success-dark mb-3" onClick={handleCreateAnother}>
              Create Another Dare
            </button>
            <Link to="/" className="w-full inline-block mb-2">
              <button className="w-full bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold hover:bg-gray-300">Back to Home</button>
            </Link>
            <Link to="/dares" className="w-full inline-block">
              <button className="w-full bg-info text-info-contrast rounded px-4 py-2 font-semibold hover:bg-info-dark">View All Dares</button>
            </Link>
          </div>
        </div>
      )}
      {!showModal && (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-primary">Difficulty</label>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map(opt => (
                <label key={opt.value} className={`flex flex-col items-start gap-1 p-2 rounded cursor-pointer border ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} />
                    <b>{opt.label}</b>
                  </span>
                  <span className="text-xs text-neutral-400 ml-6">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-primary">Description / Requirements</label>
            <textarea className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={description} onChange={e => setDescription(e.target.value)} rows={3} required minLength={10} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-primary">Tags <span className="text-xs text-neutral-400">(optional, for filtering/discovery)</span></label>
            <TagsInput value={tags} onChange={setTags} placeholder="Add tag..." />
          </div>
          <div className="flex items-center">
            <input id="claimable" type="checkbox" checked={claimable} onChange={e => setClaimable(e.target.checked)} className="mr-2" />
            <label htmlFor="claimable" className="text-neutral-200">Make this dare claimable by link</label>
          </div>
          <div className="flex items-center">
            <input id="publicDare" type="checkbox" checked={publicDare} onChange={e => setPublicDare(e.target.checked)} className="mr-2" />
            <label htmlFor="publicDare" className="text-neutral-200">Make this dare public (visible to others)</label>
          </div>
          {createError && <div className="text-danger text-sm font-medium" role="alert">{createError}</div>}
          <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={creating}>
            {creating ? 'Creating...' : 'Create Dare'}
          </button>
        </form>
      )}
    </div>
  );
} 