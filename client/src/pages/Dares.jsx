import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DareCard from '../components/DareCard';
import TagsInput from '../components/TagsInput';
import StatusBadge from '../components/DareCard';

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

export default function Dares() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dares, setDares] = useState([]);
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
  const [createdDareId, setCreatedDareId] = useState(null);
  const [dareType, setDareType] = useState('');
  const [isPublic, setIsPublic] = useState('');
  const [createDareType, setCreateDareType] = useState('submission');
  const [createPublic, setCreatePublic] = useState(false);
  const [createAllowedRoles, setCreateAllowedRoles] = useState([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [acceptDareId, setAcceptDareId] = useState(null);
  const [acceptDifficulty, setAcceptDifficulty] = useState('');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch dares created by user
    const fetchCreated = api.get('/dares', { params: { creator: user.id } });
    // Fetch dares where user is a participant
    const fetchParticipating = api.get('/dares', { params: { participant: user.id } });
    // Fetch dares assigned via switch games
    const fetchSwitch = api.get('/dares', { params: { assignedSwitch: user.id } });
    Promise.all([fetchCreated, fetchParticipating, fetchSwitch])
      .then(([createdRes, partRes, switchRes]) => {
        // Merge and deduplicate by _id
        const all = [...(createdRes.data || []), ...(partRes.data || []), ...(switchRes.data || [])];
        const unique = Array.from(new Map(all.map(d => [d._id, d])).values());
        setDares(unique);
      })
      .catch(() => setDares([]))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/dares', {
        description: createDescription,
        difficulty: createDifficulty,
        tags: createTags,
        dareType: createDareType,
        public: createPublic,
        allowedRoles: createAllowedRoles,
      });
      setShowCreate(false);
      setCreateTitle('');
      setCreateDescription('');
      setCreateDifficulty('titillating');
      setCreateTags([]);
      setCreateDareType('submission');
      setCreatePublic(false);
      setCreateAllowedRoles([]);
      setCreatedDareId(res.data._id || res.data.id); // Save new dare ID for sharing
      // Refresh dares
      setLoading(true);
      const daresRes = await api.get('/dares', {
        params: {
          status: status || undefined,
          difficulty: difficulty || undefined,
          search: search || undefined,
          public: isPublic || undefined,
          dareType: dareType || undefined,
          role: user?.roles?.[0] || undefined,
        },
      });
      setDares(Array.isArray(daresRes.data) ? daresRes.data : []);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create dare');
    } finally {
      setCreating(false);
    }
  };

  // Sharable link logic for post-create modal
  const dareUrl = createdDareId && typeof window !== 'undefined' ? `${window.location.origin}/dares/${createdDareId}` : '';
  const handleShareClick = () => {
    const input = document.getElementById('sharable-link-input-modal');
    if (input) {
      input.select();
      document.execCommand('copy');
    }
  };

  const openAcceptModal = (dare) => {
    setAcceptDareId(dare._id);
    setAcceptDifficulty(dare.difficulty || '');
    setAcceptConsent(false);
    setAcceptError('');
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setAcceptLoading(true);
    setAcceptError('');
    try {
      await api.patch(`/dares/${acceptDareId}/start`, { difficulty: acceptDifficulty });
      setAcceptDareId(null);
      setAcceptDifficulty('');
      setAcceptConsent(false);
      navigate(`/dares/${acceptDareId}`);
    } catch (err) {
      setAcceptError(err.response?.data?.error || 'Failed to accept dare.');
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 w-full">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">My Dares</h1>
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
            <select className="rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={dareType} onChange={e => setDareType(e.target.value)}>
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
              + Create Dare
            </button>
          )}
        </form>
        {/* Dares List Section */}
        {loading ? (
          <div className="text-neutral-400">Loading dares...</div>
        ) : (
          <div>
            {dares.length === 0 ? (
              <div className="text-neutral-400">No dares found.</div>
            ) : (
              <ul className="space-y-4">
                {dares.map(dare => (
                  <li key={dare._id}>
                    <DareCard
                      title={dare.title}
                      description={dare.description}
                      difficulty={dare.difficulty}
                      tags={dare.tags || []}
                      status={dare.status}
                      user={dare.creator}
                      actions={[]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {/* Create Dare Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-lg mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Create New Dare</h2>
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
                  <label htmlFor="createDareType" className="block font-semibold mb-1 text-primary">Type</label>
                  <select id="createDareType" className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDareType} onChange={e => setCreateDareType(e.target.value)}>
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
                    I consent to perform or participate in this dare as described.
                  </label>
                </div>
                {createError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{createError}</div>}
              </div>
              <div className="border-t border-neutral-900 px-6 py-3 flex justify-end space-x-2">
                <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Dare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Post-create sharing modal */}
      {createdDareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Share Your Dare</h2>
              <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" onClick={() => setCreatedDareId(null)}>&times;</button>
            </div>
            <div className="px-6 py-4">
              <label htmlFor="sharable-link-input-modal" className="block font-semibold mb-1 text-primary">Sharable Link</label>
              <div className="flex items-center gap-2">
                <input
                  id="sharable-link-input-modal"
                  className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-800 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                  type="text"
                  value={dareUrl}
                  readOnly
                  onFocus={e => e.target.select()}
                />
                <button className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-600" onClick={handleShareClick}>
                  Copy
                </button>
              </div>
            </div>
            <div className="border-t border-neutral-900 px-6 py-3 flex justify-end">
              <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark" onClick={() => setCreatedDareId(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Accept Dare Modal */}
      {acceptDareId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary">Start / Accept Dare</h2>
              <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" onClick={() => setAcceptDareId(null)}>&times;</button>
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
                    I consent to perform or participate in this dare as described.
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