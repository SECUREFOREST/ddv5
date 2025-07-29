import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DareCard from '../components/DareCard';
import TagsInput from '../components/TagsInput';
import StatusBadge from '../components/DareCard';
import { Squares2X2Icon, PlusIcon, FireIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { STATUS_OPTIONS, DARE_TYPE_OPTIONS, ROLE_OPTIONS, DIFFICULTY_OPTIONS } from '../constants';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

export default function Dares() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
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
        showSuccess('Dares loaded successfully!');
      })
      .catch((error) => { 
        setDares([]); 
        setLastUpdated(new Date()); 
        showError('Failed to load dares. Please try again.');
        console.error('Dares loading error:', error);
      })
      .finally(() => setLoading(false));
  }, [user]); // Remove toast functions from dependencies

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
      showSuccess('Dare created successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create dare. Please try again.';
      setCreateError(errorMessage);
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const handleShareClick = () => {
    if (createdDareId) {
      const shareUrl = `${window.location.origin}/dare/share/${createdDareId}`;
      navigator.clipboard.writeText(shareUrl);
      showSuccess('Share link copied to clipboard!');
    }
  };

  const openAcceptModal = (dare) => {
    setAcceptDareId(dare._id);
    setAcceptDifficulty('');
    setAcceptConsent(false);
    setAcceptError('');
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    if (!acceptConsent) {
      setAcceptError('You must consent to participate in this dare.');
      return;
    }
    setAcceptLoading(true);
    try {
      await api.post(`/dares/${acceptDareId}/accept`, {
        difficulty: acceptDifficulty,
        consent: acceptConsent,
      });
      showSuccess('Dare accepted successfully!');
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
      const errorMessage = err.response?.data?.error || 'Failed to accept dare. Please try again.';
      setAcceptError(errorMessage);
      showError(errorMessage);
    } finally {
      setAcceptLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-2xl shadow-2xl shadow-primary/25">
                <FireIcon className="w-8 h-8 text-white" />
            </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Your Dares</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Manage and track all your dare activities
            </p>
            </div>

          {/* Filters and Actions */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
              </select>
                
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
              </select>
                
                <input
                  type="text"
                  placeholder="Search dares..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
            </div>
              
              <button
                onClick={() => setShowCreate(true)}
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Dare
              </button>
            </div>
          </div>

          {/* Dares Grid */}
        {loading ? (
            <ListSkeleton count={6} />
          ) : dares.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-neutral-800/50 rounded-xl p-12 border border-neutral-700/30">
                <div className="text-neutral-400 text-xl mb-4">No dares found</div>
                <p className="text-neutral-500 text-sm mb-6">Start by creating your first dare or accepting one from the community.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Create Your First Dare
                </button>
              </div>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dares.map(dare => (
                <div key={dare._id} className="transform hover:scale-[1.02] transition-transform duration-200">
                  <DareCard
                    title={dare.title}
                    description={dare.description}
                    difficulty={dare.difficulty}
                    tags={dare.tags || []}
                    status={dare.status}
                    user={dare.creator}
                    actions={[]}
                  />
                </div>
              ))}
          </div>
        )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-center text-neutral-500 text-sm">
              Last updated: {formatRelativeTimeWithTooltip(lastUpdated).display}
            </div>
          )}
        </main>
      </div>

      {/* Create Dare Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Dare"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="create-description" className="block font-semibold mb-1 text-white">Dare Description</label>
            <textarea
              id="create-description"
              name="description"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Describe your dare..."
              required
            />
          </div>
          <div>
            <label htmlFor="create-difficulty" className="block font-semibold mb-1 text-white">Difficulty</label>
            <select
              id="create-difficulty"
              name="difficulty"
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              required
            >
              <option value="">Select difficulty...</option>
              {DIFFICULTY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Dare'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Accept Dare Modal */}
      <Modal
        open={showAccept}
        onClose={() => setShowAccept(false)}
        title="Accept Dare"
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleAcceptSubmit} className="space-y-4">
          <div>
            <label htmlFor="accept-confirmation" className="block font-semibold mb-1 text-white">Confirmation</label>
            <textarea
              id="accept-confirmation"
              name="confirmation"
              className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
              placeholder="Confirm that you accept this dare..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowAccept(false)}
              className="flex-1 bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={accepting}
              className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {accepting ? 'Accepting...' : 'Accept Dare'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 