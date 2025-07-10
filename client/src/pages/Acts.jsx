import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ActCard from '../components/ActCard';
import TagsInput from '../components/TagsInput';
import StatusBadge from '../components/ActCard';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'titillating', label: 'Titillating' },
  { value: 'arousing', label: 'Arousing' },
  { value: 'explicit', label: 'Explicit' },
  { value: 'edgy', label: 'Edgy' },
  { value: 'hardcore', label: 'Hardcore' },
];
const ACT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'submission', label: 'Submission' },
  { value: 'domination', label: 'Domination' },
  { value: 'switch', label: 'Switch' },
];
const ROLE_OPTIONS = [
  { value: 'dominant', label: 'Dominant' },
  { value: 'submissive', label: 'Submissive' },
  { value: 'switch', label: 'Switch' },
];

export default function Acts() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createDifficulty, setCreateDifficulty] = useState('titillating');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createTags, setCreateTags] = useState([]);
  const [createdActId, setCreatedActId] = useState(null);
  const [actType, setActType] = useState('');
  const [isPublic, setIsPublic] = useState('');
  const [createActType, setCreateActType] = useState('submission');
  const [createPublic, setCreatePublic] = useState(false);
  const [createAllowedRoles, setCreateAllowedRoles] = useState([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [acceptActId, setAcceptActId] = useState(null);
  const [acceptDifficulty, setAcceptDifficulty] = useState('');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/acts', {
      params: {
        status: status || undefined,
        difficulty: difficulty || undefined,
        search: search || undefined,
        public: isPublic || undefined,
        actType: actType || undefined,
        role: user?.roles?.[0] || undefined,
      },
    })
      .then(res => setActs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setActs([]))
      .finally(() => setLoading(false));
  }, [status, difficulty, search, isPublic, actType, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/acts', {
        description: createDescription,
        difficulty: createDifficulty,
        tags: createTags,
        actType: createActType,
        public: createPublic,
        allowedRoles: createAllowedRoles,
      });
      setShowCreate(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateDifficulty('titillating');
      setCreateTags([]);
      setCreateActType('submission');
      setCreatePublic(false);
      setCreateAllowedRoles([]);
      setCreatedActId(res.data._id || res.data.id); // Save new act ID for sharing
      // Refresh acts
      setLoading(true);
      const actsRes = await api.get('/acts', {
        params: {
          status: status || undefined,
          difficulty: difficulty || undefined,
          search: search || undefined,
          public: isPublic || undefined,
          actType: actType || undefined,
          role: user?.roles?.[0] || undefined,
        },
      });
      setActs(Array.isArray(actsRes.data) ? actsRes.data : []);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create act');
    } finally {
      setCreating(false);
    }
  };

  // Sharable link logic for post-create modal
  const actUrl = createdActId && typeof window !== 'undefined' ? `${window.location.origin}/acts/${createdActId}` : '';
  const handleShareClick = () => {
    const input = document.getElementById('sharable-link-input-modal');
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  };

  const openAcceptModal = (act) => {
    setAcceptActId(act._id);
    setAcceptDifficulty(act.difficulty || '');
    setAcceptConsent(false);
    setAcceptError('');
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setAcceptLoading(true);
    setAcceptError('');
    try {
      await api.patch(`/acts/${acceptActId}/start`, { difficulty: acceptDifficulty });
      setAcceptActId(null);
      setAcceptDifficulty('');
      setAcceptConsent(false);
      navigate(`/acts/${acceptActId}`);
    } catch (err) {
      setAcceptError(err.response?.data?.error || 'Failed to accept act.');
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 w-full">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Acts</h1>
      </div>
      <div>
        <form className="flex flex-wrap gap-4 items-end mb-6" onSubmit={e => e.preventDefault()}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-primary">Status</label>
            <select className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-primary">Difficulty</label>
            <select className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-primary">Search</label>
            <input className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={search} onChange={e => setSearch(e.target.value)} placeholder="Title or description" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-primary">Type</label>
            <select className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={actType} onChange={e => setActType(e.target.value)}>
              {ACT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1 text-primary">Visibility</label>
            <select className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={isPublic} onChange={e => setIsPublic(e.target.value)}>
              <option value="">All</option>
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
          {user && (
            <button type="button" className="ml-auto bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" onClick={() => setShowCreate(true)}>
              + Create Act
            </button>
          )}
        </form>
        {/* Acts List Section */}
        {loading ? (
          <div className="text-neutral-400">Loading acts...</div>
        ) : (
          <div>
            {acts.length === 0 ? (
              <div className="text-neutral-400">No acts found.</div>
            ) : (
              <ul className="space-y-4">
                {acts.map(act => (
                  <li key={act._id}>
                    <ActCard
                      title={act.title}
                      description={act.description}
                      difficulty={act.difficulty}
                      tags={act.tags || []}
                      status={act.status}
                      user={act.creator}
                      actions={[]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {/* Create Act Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Create New Act</h2>
              <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" onClick={() => setShowCreate(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="createTitle" className="block font-semibold mb-1 text-primary">Title</label>
                  <input id="createTitle" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createTitle} onChange={e => setCreateTitle(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="createDescription" className="block font-semibold mb-1 text-primary">Description</label>
                  <textarea id="createDescription" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDescription} onChange={e => setCreateDescription(e.target.value)} required />
                </div>
                <div>
                  <label htmlFor="createDifficulty" className="block font-semibold mb-1 text-primary">Difficulty</label>
                  <select id="createDifficulty" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDifficulty} onChange={e => setCreateDifficulty(e.target.value)}>
                    {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="createTags" className="block font-semibold mb-1 text-primary">Tags</label>
                  <TagsInput id="createTags" value={createTags} onChange={setCreateTags} placeholder="Add a tag..." />
                </div>
                <div>
                  <label htmlFor="createActType" className="block font-semibold mb-1 text-primary">Type</label>
                  <select id="createActType" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createActType} onChange={e => setCreateActType(e.target.value)}>
                    {ACT_TYPE_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="createPublic" className="block font-semibold mb-1 text-primary">Visibility</label>
                  <select id="createPublic" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createPublic ? 'true' : 'false'} onChange={e => setCreatePublic(e.target.value === 'true')}>
                    <option value="true">Public</option>
                    <option value="false">Private</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="createAllowedRoles" className="block font-semibold mb-1 text-primary">Allowed Roles (optional)</label>
                  <select id="createAllowedRoles" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" multiple value={createAllowedRoles} onChange={e => setCreateAllowedRoles(Array.from(e.target.selectedOptions, o => o.value))}>
                    {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <small className="text-neutral-400">If set, only users with these roles can participate.</small>
                </div>
                <div>
                  <label htmlFor="consentChecked" className="inline-flex items-center">
                    <input id="consentChecked" type="checkbox" className="form-checkbox mr-2" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} required />
                    I consent to perform or participate in this act as described.
                  </label>
                </div>
                {createError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{createError}</div>}
              </div>
              <div className="border-t border-neutral-900 px-6 py-3 flex justify-end space-x-2">
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Act'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Post-create sharing modal */}
      {createdActId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Share Your Act</h2>
              <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" onClick={() => setCreatedActId(null)}>&times;</button>
            </div>
            <div className="px-6 py-4">
              <label htmlFor="sharable-link-input-modal" className="block font-semibold mb-1 text-primary">Sharable Link</label>
              <div className="flex items-center gap-2">
                <input
                  id="sharable-link-input-modal"
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                  type="text"
                  value={actUrl}
                  readOnly
                  onFocus={e => e.target.select()}
                />
                <button className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-600" onClick={handleShareClick}>
                  Copy
                </button>
              </div>
            </div>
            <div className="border-t border-neutral-900 px-6 py-3 flex justify-end">
              <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={() => setCreatedActId(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Accept Act Modal */}
      {acceptActId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Start / Accept Act</h2>
              <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" onClick={() => setAcceptActId(null)}>&times;</button>
            </div>
            <form onSubmit={handleAcceptSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="acceptDifficulty" className="block font-semibold mb-1 text-primary">Difficulty</label>
                  <select id="acceptDifficulty" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={acceptDifficulty} onChange={e => setAcceptDifficulty(e.target.value)} required>
                    {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="acceptConsent" className="inline-flex items-center">
                    <input id="acceptConsent" type="checkbox" className="form-checkbox mr-2" checked={acceptConsent} onChange={e => setAcceptConsent(e.target.checked)} required />
                    I consent to perform or participate in this act as described.
                  </label>
                </div>
                {acceptError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{acceptError}</div>}
              </div>
              <div className="border-t border-neutral-900 px-6 py-3 flex justify-end">
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" disabled={acceptLoading || !acceptConsent}>
                  {acceptLoading ? 'Starting...' : 'Start / Accept'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 