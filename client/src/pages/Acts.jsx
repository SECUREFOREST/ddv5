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
      .then(res => setActs(res.data))
      .catch(() => setActs([]))
      .finally(() => setLoading(false));
  }, [status, difficulty, search, isPublic, actType, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/acts', {
        title: createTitle,
        description: createDescription,
        difficulty: createDifficulty,
        tags: createTags,
        actType: createActType,
        isPublic: createPublic,
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
      setActs(actsRes.data);
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
      await api.post(`/acts/${acceptActId}/accept`, { difficulty: acceptDifficulty });
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
    <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4">
      <div className="border-b pb-2 mb-4">
        <h1 className="text-2xl font-bold">Acts</h1>
      </div>
      <div>
        <form className="flex flex-wrap gap-4 items-end mb-6" onSubmit={e => e.preventDefault()}>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Status</label>
            <select className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Difficulty</label>
            <select className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Search</label>
            <input className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={search} onChange={e => setSearch(e.target.value)} placeholder="Title or description" />
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Type</label>
            <select className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={actType} onChange={e => setActType(e.target.value)}>
              {ACT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-semibold mb-1">Visibility</label>
            <select className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary" value={isPublic} onChange={e => setIsPublic(e.target.value)}>
              <option value="">All</option>
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>
          {user && (
            <button type="button" className="ml-auto bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" onClick={() => setShowCreate(true)}>
              + Create Act
            </button>
          )}
        </form>
        {/* Acts List Section */}
        {loading ? (
          <div>Loading acts...</div>
        ) : (
          <div>
            {acts.length === 0 ? (
              <div className="text-gray-400">No acts found.</div>
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
      {showCreate && (
        <div>
          <div className="modal-backdrop fade in" style={{ zIndex: 1040 }} />
          <div className="modal fade in" tabIndex="-1" role="dialog" style={{ display: 'block', zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" onClick={() => setShowCreate(false)}>&times;</button>
                  <h2 className="modal-title">Create New Act</h2>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Title</label>
                      <input className="form-control" value={createTitle} onChange={e => setCreateTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" value={createDescription} onChange={e => setCreateDescription(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select className="form-control" value={createDifficulty} onChange={e => setCreateDifficulty(e.target.value)}>
                        {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tags</label>
                      <TagsInput value={createTags} onChange={setCreateTags} placeholder="Add a tag..." />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-control" value={createActType} onChange={e => setCreateActType(e.target.value)}>
                        {ACT_TYPE_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Visibility</label>
                      <select className="form-control" value={createPublic ? 'true' : 'false'} onChange={e => setCreatePublic(e.target.value === 'true')}>
                        <option value="true">Public</option>
                        <option value="false">Private</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Allowed Roles (optional)</label>
                      <select className="form-control" multiple value={createAllowedRoles} onChange={e => setCreateAllowedRoles(Array.from(e.target.selectedOptions, o => o.value))}>
                        {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <small className="form-text text-muted">If set, only users with these roles can participate.</small>
                    </div>
                    <div className="form-group">
                      <div className="checkbox">
                        <label>
                          <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)} required />
                          I consent to perform or participate in this act as described.
                        </label>
                      </div>
                    </div>
                    {createError && <div className="text-danger help-block">{createError}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary btn-block" disabled={creating || !consentChecked}>
                      {creating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Post-create sharing modal */}
      {createdActId && (
        <div>
          <div className="modal-backdrop fade in" style={{ zIndex: 1040 }} />
          <div className="modal fade in" tabIndex="-1" role="dialog" style={{ display: 'block', zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" onClick={() => setCreatedActId(null)}>&times;</button>
                  <h2 className="modal-title">Share Your Act</h2>
                </div>
                <div className="modal-body">
                  <label>Sharable Link</label>
                  <input
                    id="sharable-link-input-modal"
                    className="sharable-link"
                    type="text"
                    value={actUrl}
                    readOnly
                    style={{ maxWidth: 320, display: 'inline-block', marginRight: 8 }}
                    onFocus={e => e.target.select()}
                  />
                  <button className="btn btn-default btn-xs" onClick={handleShareClick} style={{ verticalAlign: 'top' }}>
                    Copy
                  </button>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary btn-block" onClick={() => setCreatedActId(null)}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {acceptActId && (
        <div>
          <div className="modal-backdrop fade in" style={{ zIndex: 1040 }} />
          <div className="modal fade in" tabIndex="-1" role="dialog" style={{ display: 'block', zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" onClick={() => setAcceptActId(null)}>&times;</button>
                  <h2 className="modal-title">Start / Accept Act</h2>
                </div>
                <form onSubmit={handleAcceptSubmit}>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Difficulty</label>
                      <select className="form-control" value={acceptDifficulty} onChange={e => setAcceptDifficulty(e.target.value)} required>
                        {DIFFICULTY_OPTIONS.filter(opt => opt.value).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <div className="checkbox">
                        <label>
                          <input type="checkbox" checked={acceptConsent} onChange={e => setAcceptConsent(e.target.checked)} required />
                          I consent to perform or participate in this act as described.
                        </label>
                      </div>
                    </div>
                    {acceptError && <div className="text-danger help-block">{acceptError}</div>}
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary btn-block" disabled={acceptLoading || !acceptConsent}>
                      {acceptLoading ? 'Starting...' : 'Start / Accept'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 