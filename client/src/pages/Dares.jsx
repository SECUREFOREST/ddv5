import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DareCard from '../components/DareCard';
import TagsInput from '../components/TagsInput';
import StatusBadge from '../components/DareCard';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

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
const DARE_TYPE_OPTIONS = [
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
  // Add meta state
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Fetch dares created by user
    const fetchCreated = api.get('/dares', { params: { creator: user.id } });
    const fetchParticipating = api.get('/dares', { params: { participant: user.id } });
    const fetchSwitch = api.get('/dares', { params: { assignedSwitch: user.id } });
    Promise.all([fetchCreated, fetchParticipating, fetchSwitch])
      .then(([createdRes, partRes, switchRes]) => {
        const all = [...(createdRes.data || []), ...(partRes.data || []), ...(switchRes.data || [])];
        const unique = Array.from(new Map(all.map(d => [d._id, d])).values());
        setDares(unique);
        setLastUpdated(new Date());
      })
      .catch(() => { setDares([]); setLastUpdated(new Date()); })
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
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden" role="main" aria-label="My Dares">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <Squares2X2Icon className="w-7 h-7 text-primary" aria-hidden="true" /> My Dares
          </h1>
        </div>
        {/* Visually distinct status badge below header */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold text-lg animate-fade-in">
            <Squares2X2Icon className="w-6 h-6" /> Your Dares
          </span>
        </div>
  
  
        {/* Filters/Form Section */}
        <form role="form" aria-labelledby="dares-filter-title" onSubmit={e => e.preventDefault()} className="space-y-6">
          <h1 id="dares-filter-title" className="text-2xl font-bold mb-4">Filter Dares</h1>
          <div className="flex flex-wrap gap-4 items-end mb-6" aria-label="Filter Dares">
            <div className="flex flex-col min-w-[120px] flex-1">
              <label htmlFor="dares-status" className="font-semibold mb-1 text-primary">Status</label>
              <select id="dares-status" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={status} onChange={e => setStatus(e.target.value)} aria-required="true">
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[120px] flex-1">
              <label htmlFor="dares-difficulty" className="font-semibold mb-1 text-primary">Difficulty</label>
              <select id="dares-difficulty" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={difficulty} onChange={e => setDifficulty(e.target.value)} aria-required="true">
                {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[120px] flex-1">
              <label htmlFor="dares-search" className="font-semibold mb-1 text-primary">Search</label>
              <input id="dares-search" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={search} onChange={e => setSearch(e.target.value)} placeholder="Description or tags" aria-label="Search Dares" aria-required="false" />
            </div>
            <div className="flex flex-col min-w-[120px] flex-1">
              <label htmlFor="dares-type" className="font-semibold mb-1 text-primary">Type</label>
              <select id="dares-type" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={dareType} onChange={e => setDareType(e.target.value)} aria-required="true">
                {DARE_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col min-w-[120px] flex-1">
              <label htmlFor="dares-visibility" className="font-semibold mb-1 text-primary">Visibility</label>
              <select id="dares-visibility" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={isPublic} onChange={e => setIsPublic(e.target.value)} aria-required="true">
                <option value="">All</option>
                <option value="true">Public</option>
                <option value="false">Private</option>
              </select>
            </div>
            {user && (
              <button type="button" className="ml-auto bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-contrast shadow-lg" onClick={() => setShowCreate(true)} aria-label="Create New Dare">
                + Create Dare
              </button>
            )}
          </div>
        </form>
        {/* Dares List Section */}
        {loading ? (
          <div className="text-neutral-400 text-center py-8" role="status" aria-live="polite">Loading dares...</div>
        ) : (
          <div className="overflow-x-auto">
            {dares.length === 0 && !loading && (
              <div className="text-neutral-400 text-center py-8">No dares found.</div>
            )}
            <div className="flex flex-col gap-4">
              {dares.map(dare => (
                <Link to={`/dares/${dare._id}`} key={dare._id} style={{ textDecoration: 'none' }} tabIndex={0} aria-label={`View dare: ${dare.description}`}>
                  <DareCard
                    description={dare.description}
                    difficulty={dare.difficulty}
                    tags={dare.tags}
                    status={dare.status}
                    creator={dare.creator}
                    performer={dare.performer}
                    assignedSwitch={dare.assignedSwitch}
                    actions={[]}
                    currentUserId={user?.id}
                    style={{ cursor: 'pointer' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Meta Section */}
        <div className="mt-6 text-xs text-neutral-500 flex flex-col items-center gap-1" aria-label="Dares meta info">
          <div className="flex items-center gap-1">
            <Squares2X2Icon className="w-4 h-4 text-primary" />
            Total Dares: <span className="font-bold text-primary ml-1">{dares.length}</span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1">
              <span className="text-neutral-400">Last Updated:</span>
              <span>{lastUpdated.toLocaleString()}</span>
            </div>
          )}
        </div>
        {/* Create Dare Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-neutral-900 rounded-lg w-full max-w-lg mx-4 relative">
              <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-primary">Create New Dare</h2>
                <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none shadow-lg" onClick={() => setShowCreate(false)}>&times;</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label htmlFor="dares-createDescription" className="block font-semibold mb-1 text-primary">Description</label>
                    <textarea id="dares-createDescription" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDescription} onChange={e => setCreateDescription(e.target.value)} required rows={3} maxLength={300} placeholder="Describe the dare..." aria-label="Dare Description" aria-required="true" />
                  </div>
                  <div>
                    <label htmlFor="dares-createDifficulty" className="block font-semibold mb-1 text-primary">Difficulty</label>
                    <select id="dares-createDifficulty" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDifficulty} onChange={e => setCreateDifficulty(e.target.value)} aria-required="true">
                      {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dares-createTags" className="block font-semibold mb-1 text-primary">Tags</label>
                    <TagsInput id="dares-createTags" value={createTags} onChange={setCreateTags} placeholder="Add a tag..." aria-label="Dare Tags" aria-required="false" />
                  </div>
                  <div>
                    <label htmlFor="dares-createDareType" className="block font-semibold mb-1 text-primary">Type</label>
                    <select id="dares-createDareType" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createDareType} onChange={e => setCreateDareType(e.target.value)} aria-required="true">
                      {DARE_TYPE_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dares-createPublic" className="block font-semibold mb-1 text-primary">Visibility</label>
                    <select id="dares-createPublic" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={createPublic ? 'true' : 'false'} onChange={e => setCreatePublic(e.target.value === 'true')} aria-required="true">
                      <option value="true">Public</option>
                      <option value="false">Private</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dares-createAllowedRoles" className="block font-semibold mb-1 text-primary">Allowed Roles (optional)</label>
                    <select id="dares-createAllowedRoles" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" multiple value={createAllowedRoles} onChange={e => setCreateAllowedRoles(Array.from(e.target.selectedOptions, o => o.value))} aria-required="false">
                      {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <small className="text-neutral-400">If set, only users with these roles can participate.</small>
                  </div>
                  <div>
                    <label htmlFor="dares-consentChecked" className="inline-flex items-center">Consent</label>
                    <input id="dares-consentChecked" type="checkbox" className="form-checkbox mr-2 bg-[#1a1a1a]" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} required aria-required="true" />
                    I consent to perform or participate in this dare as described.
                  </div>
                  {createError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{createError}</div>}
                </div>
                <div className="border-t border-neutral-900 px-6 py-3 flex justify-end space-x-2">
                  <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" disabled={creating}>
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
            <div className="bg-neutral-900 rounded-lg w-full max-w-md mx-4 relative">
              <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-primary">Share Your Dare</h2>
                <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none shadow-lg" onClick={() => setCreatedDareId(null)}>&times;</button>
              </div>
              <div className="px-6 py-4">
                <label htmlFor="dares-sharable-link-input-modal" className="block font-semibold mb-1 text-primary">Sharable Link</label>
                <div className="flex items-center gap-2">
                  <input
                    id="dares-sharable-link-input-modal"
                    className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                    type="text"
                    value={dareUrl}
                    readOnly
                    onFocus={e => e.target.select()}
                    aria-label="Sharable Dare Link"
                  />
                  <button className="bg-neutral-700 text-neutral-100 rounded px-3 py-1 font-semibold text-xs hover:bg-neutral-600 shadow-lg" onClick={handleShareClick} aria-label="Copy Sharable Link">
                    Copy
                  </button>
                </div>
              </div>
              <div className="border-t border-neutral-900 px-6 py-3 flex justify-end">
                <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark shadow-lg" onClick={() => setCreatedDareId(null)} aria-label="Done Sharing">
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Accept Dare Modal */}
        {acceptDareId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
            <div className="bg-neutral-900 rounded-lg w-full max-w-md mx-4 relative">
              <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
                <h2 className="text-lg font-semibold text-primary">Start / Accept Dare</h2>
                <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none shadow-lg" onClick={() => setAcceptDareId(null)}>&times;</button>
              </div>
              <form onSubmit={handleAcceptSubmit}>
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label htmlFor="dares-acceptDifficulty" className="block font-semibold mb-1 text-primary">Difficulty</label>
                    <select id="dares-acceptDifficulty" className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={acceptDifficulty} onChange={e => setAcceptDifficulty(e.target.value)} required aria-required="true">
                      {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dares-acceptConsent" className="inline-flex items-center">Accept Consent</label>
                    <input id="dares-acceptConsent" type="checkbox" className="form-checkbox mr-2 bg-[#1a1a1a]" checked={acceptConsent} onChange={e => setAcceptConsent(e.target.checked)} required aria-required="true" />
                    I consent to perform or participate in this dare as described.
                  </div>
                  {acceptError && <div className="text-danger text-sm font-medium" role="alert" aria-live="assertive">{acceptError}</div>}
                </div>
                <div className="border-t border-neutral-900 px-6 py-3 flex justify-end">
                  <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" disabled={acceptLoading || !acceptConsent}>
                    {acceptLoading ? 'Starting...' : 'Start / Accept'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 