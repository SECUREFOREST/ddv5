import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import TagsInput from '../components/TagsInput';
import { ArrowRightIcon, CheckCircleIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.', icon: <SparklesIcon className="w-6 h-6 text-pink-400" /> },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.', icon: <FireIcon className="w-6 h-6 text-purple-500" /> },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.', icon: <EyeDropperIcon className="w-6 h-6 text-red-500" /> },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.', icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" /> },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.', icon: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" /> },
];

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
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-neutral-700 rounded-full h-2 mt-4 mb-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
      </div>
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Create a Dare</h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">Step 2 of 2: Enter Dare Details</div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Card background for form/modal */}
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      {/* Toast notification for feedback */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded  text-base font-semibold transition-all duration-300
          ${toast.includes('success') ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}
          role="alert"
          aria-live="polite"
          onClick={() => setToast('')}
          tabIndex={0}
          onBlur={() => setToast('')}
        >
          {toast}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg  w-full max-w-md mx-4 relative p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 text-center flex items-center gap-2 justify-center"><CheckCircleIcon className="w-6 h-6 text-success" /> Dare Created!</h2>
            {claimLink && (
              <>
                <label htmlFor="dare-claimable-link" className="block font-semibold mb-1 text-primary">Claimable Link</label>
                <input
                  id="dare-claimable-link"
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
            <label htmlFor="dare-sharable-link" className="block font-semibold mb-1 text-primary">Sharable Link</label>
            <input
              id="dare-sharable-link"
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
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
        <form role="form" aria-labelledby="dare-create-title" onSubmit={handleCreate} className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          {/* Difficulty Group */}
          <div>
            <div className="font-bold text-xl text-primary mb-4 text-center">Choose a difficulty</div>
            <div className="flex flex-col gap-4">
              {DIFFICULTIES.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-primary-contrast w-full
                    ${difficulty === opt.value
                      ? 'border-primary bg-primary/10  scale-105'
                      : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
                  `}
                  tabIndex={0}
                  aria-label={`Select ${opt.label} difficulty`}
                  role="radio"
                  aria-checked={difficulty === opt.value}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setDifficulty(opt.value);
                  }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={opt.value}
                    checked={difficulty === opt.value}
                    onChange={() => setDifficulty(opt.value)}
                    className="accent-primary focus:ring-2 focus:ring-primary-contrast focus:outline-none bg-[#1a1a1a]"
                    aria-checked={difficulty === opt.value}
                    aria-label={opt.label}
                    tabIndex={-1}
                  />
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <b className="text-base text-primary-contrast">{opt.label}</b>
                  </span>
                  <span className="text-xs text-neutral-400 ml-6 text-left">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Description Group */}
          <div>
            <label htmlFor="dare-description" className="block font-bold text-primary mb-2">Description / Requirements</label>
            <textarea
              id="dare-description"
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
              minLength={10}
              placeholder="Describe the dare..."
              aria-label="Description or requirements"
            />
          </div>
          {/* Tags Group */}
          <div>
            <label className="block font-bold mb-1 text-primary text-lg">Tags <span className="text-xs text-neutral-400 font-normal">(optional, for filtering/discovery)</span></label>
            <TagsInput value={tags} onChange={setTags} placeholder="Add tag..." />
          </div>
          {/* Claimable and Public Checkboxes */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <input id="dare-claimable" type="checkbox" checked={claimable} onChange={e => setClaimable(e.target.checked)} className="mr-2 accent-primary bg-[#1a1a1a]" />
              <label htmlFor="dare-claimable" className="text-neutral-200">Make this dare claimable by link</label>
            </div>
            <div className="flex items-center">
              <input id="dare-public" type="checkbox" checked={publicDare} onChange={e => setPublicDare(e.target.checked)} className="mr-2 accent-primary bg-[#1a1a1a]" />
              <label htmlFor="dare-public" className="text-neutral-200">Make this dare public (visible to others)</label>
            </div>
          </div>
          {createError && <div className="text-danger text-sm font-medium" role="alert">{createError}</div>}
          {/* Sticky footer for action button on mobile */}
          <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
            <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg" disabled={creating}>
              {creating ? (
                <svg className="animate-spin h-5 w-5 text-primary-contrast" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              ) : (
                <>
                  Create Dare <ArrowRightIcon className="inline w-5 h-5 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 