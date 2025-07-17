import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import TagsInput from '../components/TagsInput';
import { ArrowRightIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, LinkIcon, ClipboardIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-neutral-700 rounded-full h-2 mt-4 mb-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '50%' }} />
      </div>
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Create a Dare</h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">Step 1 of 2: Describe Your Dare</div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Card background for form/modal */}
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      {/* Toast notification for feedback */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300
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
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative p-6 border border-primary">
            <h2 className="text-lg font-semibold text-primary mb-4 text-center flex items-center justify-center gap-2"><LinkIcon className="w-6 h-6 text-primary" /> Dare Created!</h2>
            {claimLink && (
              <>
                <label className="block font-semibold mb-1 text-primary">Claimable Link</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                    type="text"
                    value={claimLink}
                    readOnly
                    onFocus={e => e.target.select()}
                    aria-label="Claimable Link"
                  />
                  <button className="bg-primary text-primary-contrast rounded px-3 py-2 font-semibold hover:bg-primary-dark flex items-center gap-1" onClick={() => navigator.clipboard.writeText(claimLink)}><ClipboardIcon className="w-5 h-5" /> Copy</button>
                </div>
              </>
            )}
            <label className="block font-semibold mb-1 text-primary">Sharable Link</label>
            <div className="flex gap-2 mb-2">
              <input
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                type="text"
                value={dareUrl}
                readOnly
                onFocus={e => e.target.select()}
                aria-label="Sharable Link"
              />
              <button className="bg-primary text-primary-contrast rounded px-3 py-2 font-semibold hover:bg-primary-dark flex items-center gap-1" onClick={() => navigator.clipboard.writeText(dareUrl)}><ClipboardIcon className="w-5 h-5" /> Copy</button>
            </div>
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
        <form onSubmit={handleCreate} className="space-y-8 p-4 sm:p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          {/* Difficulty Selection */}
          <div>
            <label className="block font-bold mb-2 text-primary text-lg">Difficulty</label>
            <div className="flex flex-col gap-4">
              {DIFFICULTIES.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-primary-contrast
                    ${difficulty === opt.value ? 'border-primary bg-primary/10 shadow-lg scale-105' : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
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
                    className="accent-primary focus:ring-2 focus:ring-primary-contrast focus:outline-none"
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
          {/* Description Field */}
          <div>
            <label className="block font-bold mb-1 text-primary text-lg">Description / Requirements</label>
            <textarea className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary text-base" value={description} onChange={e => setDescription(e.target.value)} rows={3} required minLength={10} />
          </div>
          {/* Tags Field */}
          <div>
            <label className="block font-bold mb-1 text-primary text-lg">Tags <span className="text-xs text-neutral-400 font-normal">(optional, for filtering/discovery)</span></label>
            <TagsInput value={tags} onChange={setTags} placeholder="Add tag..." />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-blue-900 text-blue-200 rounded-full px-3 py-1 text-xs font-semibold border border-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {/* Claimable and Public Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input id="claimable" type="checkbox" checked={claimable} onChange={e => setClaimable(e.target.checked)} className="accent-primary" />
              <span className="text-neutral-200">Make this dare claimable by link</span>
            </label>
            <label className="flex items-center gap-2">
              <input id="publicDare" type="checkbox" checked={publicDare} onChange={e => setPublicDare(e.target.checked)} className="accent-primary" />
              <span className="text-neutral-200">Make this dare public (visible to others)</span>
            </label>
          </div>
          {createError && <div className="bg-danger/10 text-danger text-center mt-2 mb-2 font-semibold rounded p-2 flex items-center gap-2 justify-center" role="alert"><ExclamationTriangleIcon className="w-5 h-5 inline text-danger" /> {createError}</div>}
          {/* Sticky footer for action button on mobile */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#232526] via-[#282828] to-transparent py-4 flex justify-center z-10 border-t border-neutral-800">
            <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center" disabled={creating}>
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