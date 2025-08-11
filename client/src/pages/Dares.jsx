import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DareCard from '../components/DareCard';
import TagsInput from '../components/TagsInput';
import Search from '../components/Search';
import Modal from '../components/Modal';
import { Squares2X2Icon, PlusIcon, FireIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { STATUS_OPTIONS, DARE_TYPE_OPTIONS, ROLE_OPTIONS, DIFFICULTY_OPTIONS, PRIVACY_OPTIONS, ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { useContentDeletion } from '../hooks/useContentDeletion';
import { MainContent, ContentContainer } from '../components/Layout';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { retryApiCall } from '../utils/retry';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

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
  const [acceptDifficulty, setAcceptDifficulty] = useState('titillating');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [showAccept, setShowAccept] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const { contentDeletion, updateContentDeletion } = useContentDeletion();

  // Add meta state
  const [lastUpdated, setLastUpdated] = useState(null);

  // Add pagination
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, paginatedData, setTotalItems } = usePagination(1, 10);
  
  // Get paginated items
  const paginatedItems = paginatedData(dares || []);
  
  // Update total items when dares change
  React.useEffect(() => {
    setTotalItems(Array.isArray(dares) ? dares.length : 0);
  }, [dares, setTotalItems]);

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    if (!userId) return;
    
    setLoading(true);
    
    Promise.allSettled([
      retryApiCall(() => api.get('/dares', { params: { creator: userId } })),
      retryApiCall(() => api.get('/dares', { params: { participant: userId } })),
      retryApiCall(() => api.get('/dares', { params: { assignedSwitch: userId } }))
    ])
      .then(([createdRes, partRes, switchRes]) => {
        const all = [];
        
        // Handle created dares
        if (createdRes.status === 'fulfilled') {
          const responseData = createdRes.value.data;
          const dares = responseData.dares || responseData;
          const createdData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          all.push(...createdData);
        }
        
        // Handle participating dares
        if (partRes.status === 'fulfilled') {
          const responseData = partRes.value.data;
          const dares = responseData.dares || responseData;
          const partData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          all.push(...partData);
        }
        
        // Handle switch dares
        if (switchRes.status === 'fulfilled') {
          const responseData = switchRes.value.data;
          const dares = responseData.dares || responseData;
          const switchData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          all.push(...switchData);
        }
        
        // Deduplicate by _id
        const unique = Array.from(new Map(all.map(d => [d._id, d])).values());
        setDares(unique);
        setLastUpdated(new Date());

      })
      .catch((error) => { 
        setDares([]); 
        setLastUpdated(new Date()); 
        const errorMessage = handleApiError(error, 'dares');
        showError(errorMessage);
        console.error('Dares loading error:', error);
      })
      .finally(() => setLoading(false));
  }, [user, showSuccess, showError]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await retryApiCall(() => api.post('/dares', {
        description: createDescription,
        difficulty: createDifficulty,
        tags: createTags,
        dareType: createDareType,
        public: createPublic,
        allowedRoles: createAllowedRoles,
      }));
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
      const daresRes = await retryApiCall(() => api.get('/dares', {
        params: {
          status: status || undefined,
          difficulty: difficulty || undefined,
          search: search || undefined,
          public: isPublic || undefined,
          dareType: dareType || undefined,
          role: user?.roles?.[0] || undefined,
        },
      }));
      const daresData = validateApiResponse(daresRes, API_RESPONSE_TYPES.DARE_ARRAY);
      setDares(daresData);
      showSuccess('Dare created successfully!');
    } catch (err) {
      const errorMessage = handleApiError(err, 'dare creation');
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
    setAcceptDifficulty(dare.difficulty);
    setAcceptConsent(false);
    setAcceptError('');
    setShowAccept(true);
  };

  const closeAcceptModal = () => {
    setAcceptDareId(null);
    setAcceptDifficulty('titillating');
    setAcceptConsent(false);
    setAcceptError('');
    setAccepting(false);
    setShowAccept(false);
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    if (!acceptConsent) {
      setAcceptError('You must consent to participate in this dare.');
      return;
    }
    setAccepting(true);
    try {
      await retryApiCall(() => api.post(`/dares/${acceptDareId}/accept`, {
        difficulty: acceptDifficulty,
        consent: acceptConsent,
        contentDeletion, // OSA-style content expiration specified by participant
      }));
      showSuccess('Dare accepted successfully!');
      // Refresh dares
      setLoading(true);
      const daresRes = await retryApiCall(() => api.get('/dares', {
        params: {
          status: status || undefined,
          difficulty: difficulty || undefined,
          search: search || undefined,
          public: isPublic || undefined,
          dareType: dareType || undefined,
          role: user?.roles?.[0] || undefined,
        },
      }));
      const daresData = validateApiResponse(daresRes, API_RESPONSE_TYPES.DARE_ARRAY);
      setDares(daresData);
    } catch (err) {
      const errorMessage = handleApiError(err, 'dare acceptance');
      setAcceptError(errorMessage);
      showError(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-7xl mx-auto space-y-8">
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
          <div className="bg-neutral-800/80 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
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
                
                <Search
                  placeholder="Search dares..."
                  onSearch={setSearch}
                  className="px-4 py-2"
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
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map(dare => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-center text-neutral-500 text-sm">
              Last updated: {formatRelativeTimeWithTooltip(lastUpdated).display}
            </div>
          )}
        </MainContent>

        {/* Create Dare Modal */}
        <Modal
          open={showCreate}
          onClose={() => {
            setShowCreate(false);
            setCreateDescription('');
            setCreateDifficulty('titillating');
            setCreateTags([]);
            setCreateDareType('submission');
            setCreatePublic(false);
            setCreateAllowedRoles([]);
            setCreating(false);
          }}
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
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
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
                value={createDifficulty}
                onChange={(e) => setCreateDifficulty(e.target.value)}
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
                onClick={() => {
                  setShowCreate(false);
                  setCreateDescription('');
                  setCreateDifficulty('titillating');
                  setCreateTags([]);
                  setCreateDareType('submission');
                  setCreatePublic(false);
                  setCreateAllowedRoles([]);
                  setCreating(false);
                }}
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
          onClose={closeAcceptModal}
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
                value={acceptConsent ? 'I consent to participate in this dare.' : ''}
                onChange={(e) => setAcceptConsent(e.target.value.includes('consent'))}
                className="w-full h-24 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                placeholder="Confirm that you accept this dare..."
                required
              />
            </div>
            
            {/* OSA-Style Content Expiration Settings */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-4 mb-4">
                <ClockIcon className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Content Privacy</h3>
                  <p className="text-neutral-300 leading-relaxed">
                    Choose how long this dare content should be available. This helps protect your privacy and ensures content doesn't persist indefinitely.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                {PRIVACY_OPTIONS.map((option) => (
                  <label key={option.value} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                    contentDeletion === option.value 
                      ? 'border-yellow-500 bg-yellow-500/10' 
                      : 'border-neutral-700 bg-neutral-800/30 hover:bg-neutral-800/50'
                  }`}>
                    <input 
                      type="radio" 
                      name="contentDeletion" 
                      value={option.value} 
                      checked={contentDeletion === option.value} 
                      onChange={(e) => updateContentDeletion(e.target.value)} 
                      className="w-5 h-5 text-yellow-600 bg-neutral-700 border-neutral-600 rounded-full focus:ring-yellow-500 focus:ring-2" 
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-semibold text-white">{option.label}</span>
                      </div>
                      <p className="text-sm text-neutral-300">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={closeAcceptModal}
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
      </ContentContainer>
    </div>
  );
}
