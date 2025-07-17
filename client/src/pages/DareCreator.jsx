import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';
import { DARE_DIFFICULTIES } from '../tailwindColors';
import TagsInput from '../components/TagsInput';
import { ArrowLeftIcon, FireIcon, SparklesIcon, ExclamationTriangleIcon, RocketLaunchIcon, BoltIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-md w-full mx-auto bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header with back button and subtle shadow */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center h-14 sm:h-16 mb-4 px-4">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="mr-2 p-2 rounded-full hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-contrast transition"
        >
          <ArrowLeftIcon className="h-5 w-5 text-primary" />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex-1 text-center">Create a Dare</h1>
      </div>
      {/* Section divider */}
      <div className="h-1 bg-gradient-to-r from-primary via-info to-success opacity-30 mb-4" />
      {/* Toast notification for feedback */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300
          ${toast.includes('success') ? 'bg-success text-success-contrast' : 'bg-danger text-danger-contrast'}`}
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
        <form onSubmit={handleCreate} className="space-y-6 p-0 sm:p-6">
          {/* Difficulty Card */}
          <div className="bg-neutral-900/80 rounded-xl shadow p-4 mb-2">
            <label className="block font-bold mb-2 text-primary text-lg">Difficulty</label>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map((opt, idx) => {
                const icons = [<SparklesIcon className="h-5 w-5 text-info" />, <FireIcon className="h-5 w-5 text-warning" />, <ExclamationTriangleIcon className="h-5 w-5 text-danger" />, <RocketLaunchIcon className="h-5 w-5 text-primary" />, <BoltIcon className="h-5 w-5 text-success" />];
                return (
                  <label
                    key={opt.value}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 p-3 rounded-lg cursor-pointer border transition-all duration-200
                      ${difficulty === opt.value ? 'border-primary bg-primary/10 scale-[1.03] shadow-lg' : 'border-neutral-700 hover:border-primary/60 hover:bg-primary/5'}`}
                    tabIndex={0}
                    aria-label={opt.label}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="difficulty"
                        value={opt.value}
                        checked={difficulty === opt.value}
                        onChange={() => setDifficulty(opt.value)}
                        className="accent-primary focus:ring-2 focus:ring-primary-contrast"
                        aria-label={opt.label}
                      />
                      {icons[idx]}
                      <b>{opt.label}</b>
                    </span>
                    <span className="text-xs text-neutral-400 ml-7 sm:ml-4">{opt.desc}</span>
                  </label>
                );
              })}
            </div>
          </div>
          {/* Section divider */}
          <div className="h-0.5 bg-gradient-to-r from-primary via-info to-success opacity-20 my-2" />
          {/* Description Card */}
          <div className="bg-neutral-900/80 rounded-xl shadow p-4 mb-2">
            <label className="block font-bold mb-2 text-primary text-lg">Description & Requirements</label>
            <textarea
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast text-base transition"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              required
              minLength={10}
              aria-label="Dare Description"
            />
          </div>
          {/* Section divider */}
          <div className="h-0.5 bg-gradient-to-r from-primary via-info to-success opacity-20 my-2" />
          {/* Tags Card */}
          <div className="bg-neutral-900/80 rounded-xl shadow p-4 mb-2">
            <label className="block font-bold mb-2 text-primary text-lg">Tags <span className="text-xs text-neutral-400 font-normal">(optional, for filtering/discovery)</span></label>
            <TagsInput value={tags} onChange={setTags} placeholder="Add tag..." />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-info text-info-contrast rounded-full px-3 py-1 text-xs font-semibold border border-info-dark shadow-sm">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    className="ml-1 rounded-full hover:bg-info-dark focus:outline-none focus:ring-2 focus:ring-info-contrast p-0.5 transition"
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          {/* Section divider */}
          <div className="h-0.5 bg-gradient-to-r from-primary via-info to-success opacity-20 my-2" />
          {/* Options Card */}
          <div className="bg-neutral-900/80 rounded-xl shadow p-4 mb-2 flex flex-col gap-2">
            <div className="flex items-center">
              <input id="claimable" type="checkbox" checked={claimable} onChange={e => setClaimable(e.target.checked)} className="mr-2 accent-primary focus:ring-2 focus:ring-primary-contrast" aria-label="Make this dare claimable by link" />
              <label htmlFor="claimable" className="text-neutral-200">Make this dare claimable by link</label>
            </div>
            <div className="flex items-center">
              <input id="publicDare" type="checkbox" checked={publicDare} onChange={e => setPublicDare(e.target.checked)} className="mr-2 accent-primary focus:ring-2 focus:ring-primary-contrast" aria-label="Make this dare public" />
              <label htmlFor="publicDare" className="text-neutral-200">Make this dare public (visible to others)</label>
            </div>
          </div>
          {createError && <div className="text-danger text-sm font-medium" role="alert">{createError}</div>}
          {/* Sticky footer for action button */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#232526] via-[#282828] to-transparent py-4 flex justify-center sm:justify-end z-10 border-t border-neutral-800 shadow-lg">
            <button
              type="submit"
              className="w-full sm:w-auto bg-primary text-primary-contrast rounded px-6 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors duration-150 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast"
              disabled={creating}
              aria-label="Create Dare"
            >
              {creating ? 'Creating...' : 'Create Dare'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 