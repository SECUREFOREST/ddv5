import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DareCard from '../components/DareCard';
import { DARE_DIFFICULTIES } from '../tailwindColors';
import { useRef } from 'react';

// Constants for slot limits and cooldown (stub values)
const MAX_SLOTS = 5;
const COOLDOWN_SECONDS = 60 * 5; // 5 minutes

// Notification system
const [notification, setNotification] = useState(null);
const notificationTimeout = useRef(null);
const showNotification = (msg, type = 'info') => {
  setNotification({ msg, type });
  if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
  notificationTimeout.current = setTimeout(() => setNotification(null), 4000);
};

// Loading states
const [slotsLoading, setSlotsLoading] = useState(false);
const [completedLoading, setCompletedLoading] = useState(false);
const [demandLoading, setDemandLoading] = useState(false);

// Confirmation dialog for withdraw
const [confirmWithdrawIdx, setConfirmWithdrawIdx] = useState(null);

export default function DarePerformerDashboard() {
  const { user } = useAuth();
  // Slots management
  const [slots, setSlots] = useState([]); // [{dare, status, ...}]
  const [cooldownUntil, setCooldownUntil] = useState(null);
  // Ongoing/completed dares
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  // Public dares
  const [publicDares, setPublicDares] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  // Filtering
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // UI state
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  // Add demandSlots state
  const [demandSlots, setDemandSlots] = useState([]);

  // Fetch slots, ongoing, completed, and cooldown from API
  useEffect(() => {
    if (!user) return;
    setError('');
    setSlotsLoading(true);
    setCompletedLoading(true);
    setDemandLoading(true);
    // Fetch perform slots (ongoing dares)
    api.get('/dares/performer?status=in_progress')
      .then(res => setSlots(res.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
    // Fetch completed dares
    api.get('/dares/performer?status=completed')
      .then(res => setCompleted(res.data))
      .catch(() => setCompleted([]))
      .finally(() => setCompletedLoading(false));
    // Fetch ongoing dares (alias for slots)
    api.get('/dares/performer?status=in_progress')
      .then(res => setOngoing(res.data))
      .catch(() => setOngoing([]));
    // Fetch demand slots (dares created by user, in progress)
    api.get(`/dares?creator=${user._id}&status=in_progress`)
      .then(res => setDemandSlots(res.data))
      .catch(() => setDemandSlots([]))
      .finally(() => setDemandLoading(false));
    // TODO: Fetch cooldown from user profile if available
  }, [user]);

  // Fetch public dares with filters
  useEffect(() => {
    setPublicLoading(true);
    let url = '/dares?public=true&status=waiting_for_participant';
    if (difficultyFilter) url += `&difficulty=${difficultyFilter}`;
    if (typeFilter) url += `&dareType=${typeFilter}`;
    api.get(url)
      .then(res => setPublicDares(res.data))
      .catch(() => setPublicDares([]))
      .finally(() => setPublicLoading(false));
  }, [difficultyFilter, typeFilter]);

  // Claim a public dare (if slots available and not in cooldown)
  const handleClaimDare = async (dare) => {
    if (slots.length >= MAX_SLOTS) {
      showNotification('You have reached your maximum number of perform slots. Complete or reject a dare to free up a slot.', 'error');
      return;
    }
    if (cooldownUntil && new Date() < new Date(cooldownUntil)) {
      showNotification('You are in cooldown. Please wait before claiming a new dare.', 'error');
      return;
    }
    setClaiming(true);
    setError('');
    try {
      // Use /dares/random to claim a dare (optionally pass difficulty)
      const res = await api.get(`/dares/random${dare.difficulty ? `?difficulty=${dare.difficulty}` : ''}`);
      // Add to slots and refresh
      setSlots(prev => [...prev, res.data]);
      setOngoing(prev => [...prev, res.data]);
      showNotification('Dare claimed successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to claim dare.', 'error');
    } finally {
      setClaiming(false);
    }
  };

  // Complete or reject a dare (free up slot)
  const handleCompleteDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      await api.patch(`/dares/${dare._id}`, { status: 'completed' });
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      setCompleted(prev => [...prev, { ...dare, status: 'completed', completedAt: new Date() }]);
      showNotification('Dare marked as completed!', 'success');
    } catch (err) {
      showNotification('Failed to complete dare.', 'error');
    }
  };
  const handleRejectDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      await api.patch(`/dares/${dare._id}`, { status: 'rejected' });
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      // Start cooldown
      setCooldownUntil(new Date(Date.now() + COOLDOWN_SECONDS * 1000));
      showNotification('Dare rejected. You are now in cooldown.', 'info');
    } catch (err) {
      showNotification('Failed to reject dare.', 'error');
    }
  };

  // Withdraw handler for demand slots
  const handleWithdrawDemand = async (slotIdx) => {
    const dare = demandSlots[slotIdx];
    try {
      // PATCH dare status to 'cancelled' (or DELETE if supported)
      await api.patch(`/dares/${dare._id}`, { status: 'cancelled' });
      setDemandSlots(prev => prev.filter((_, i) => i !== slotIdx));
      showNotification('Demand dare withdrawn.', 'success');
    } catch (err) {
      showNotification('Failed to withdraw demand dare.', 'error');
    }
  };

  // Filtering UI
  const renderFilters = () => (
    <div className="flex gap-4 mb-4">
      <select
        className="rounded border border-neutral-800 bg-neutral-900 text-neutral-100 px-2 py-1"
        value={difficultyFilter}
        onChange={e => setDifficultyFilter(e.target.value)}
      >
        <option value="">All Difficulties</option>
        {DARE_DIFFICULTIES.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
      <select
        className="rounded border border-neutral-800 bg-neutral-900 text-neutral-100 px-2 py-1"
        value={typeFilter}
        onChange={e => setTypeFilter(e.target.value)}
      >
        <option value="">All Types</option>
        <option value="text">Text</option>
        <option value="photo">Photo</option>
        {/* TODO: Add more types if needed */}
      </select>
    </div>
  );

  // Advanced filter stubs (below existing filters)
  const renderAdvancedFilters = () => (
    <div className="advanced-filters flex gap-4 mb-4" /* Tailwind: flex gap-4 mb-4 */>
      <input type="text" className="rounded border px-2 py-1" placeholder="Search by keyword (stub)" disabled />
      <select className="rounded border px-2 py-1" disabled>
        <option>Filter by creator (stub)</option>
      </select>
      <select className="rounded border px-2 py-1" disabled>
        <option>Filter by status (stub)</option>
      </select>
      {/* TODO: Add more advanced filter options as needed */}
    </div>
  );

  // Slot status badge helper
  const renderStatusBadge = (status) => {
    let color = 'bg-gray-400';
    let label = status;
    if (status === 'in_progress') { color = 'bg-blue-500'; label = 'In Progress'; }
    if (status === 'awaiting_proof') { color = 'bg-yellow-500'; label = 'Awaiting Proof'; }
    if (status === 'completed') { color = 'bg-green-500'; label = 'Completed'; }
    if (status === 'rejected') { color = 'bg-red-500'; label = 'Rejected'; }
    if (status === 'cancelled') { color = 'bg-gray-500'; label = 'Cancelled'; }
    return <span className={`status-badge ${color} text-white text-xs px-2 py-1 rounded ml-2`} /* Tailwind: text-xs px-2 py-1 rounded ml-2 */>{label}</span>;
  };

  // Dashboard/overview UI
  return (
    <div id="dashboard" className="w-full max-w-5xl mx-auto p-4 bg-white rounded shadow-md">
      {/* Tabs */}
      <ul className="nav nav-tabs flex border-b mb-4" /* Tailwind: flex border-b mb-4 */>
        <li className={tab === 'perform' ? 'active mr-2' : 'mr-2'} /* Tailwind: mr-2 */>
          <a href="#" onClick={() => setTab('perform')} className="px-4 py-2 block" /* Tailwind: px-4 py-2 block */>Perform</a>
        </li>
        <li className={tab === 'demand' ? 'active' : ''}>
          <a href="#" onClick={() => setTab('demand')} className="px-4 py-2 block">Demand</a>
        </li>
      </ul>
      <div className="tab-content">
        {/* Perform Tab Content */}
        {tab === 'perform' && (
          <div className="tab-pane active" id="perform">
            {/* Filters */}
            <div className="act-filters flex items-center mb-4" /* Tailwind: flex items-center mb-4 */>
              <h3 className="filters-heading text-lg font-semibold mr-4" /* Tailwind: text-lg font-semibold mr-4 */>Show only</h3>
              <div className="difficulties flex gap-2">
                {difficulties.map((diff) => (
                  <a
                    key={diff}
                    href="#"
                    className={`difficulty px-3 py-1 rounded border ${selectedDifficulties.includes(diff) ? 'active bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    /* Tailwind: px-3 py-1 rounded border bg-blue-500 text-white (active), bg-gray-100 text-gray-700 (inactive) */
                    onClick={e => { e.preventDefault(); toggleDifficulty(diff); }}
                  >
                    {diff}
                  </a>
                ))}
              </div>
            </div>
            {/* Cooldown warning UI (show above slots/public dares if in cooldown) */}
            {cooldownUntil && new Date() < new Date(cooldownUntil) && (
              <div className="cooldown-warning bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4 text-center" /* Tailwind: bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4 text-center */>
                You are in cooldown until {new Date(cooldownUntil).toLocaleTimeString()}. You cannot claim new dares until cooldown ends.
              </div>
            )}
            {/* Slot List */}
            <div className="slot-list-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" /* Tailwind: grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 */>
              <div className="slot-list flex flex-wrap gap-4" /* Tailwind: flex flex-wrap gap-4 */>
                {slotsLoading ? <div className="text-center py-8 text-neutral-400">Loading slots...</div> : slots.map((slot, idx) =>
                  slot.empty ? (
                    <div key={idx} className="slot empty-slot w-32 h-32 bg-gray-100 rounded flex flex-col items-center justify-center" /* Tailwind: w-32 h-32 bg-gray-100 rounded flex flex-col items-center justify-center */>
                      <div className="dummy w-8 h-8 bg-gray-300 rounded-full mb-2" /* Tailwind: w-8 h-8 bg-gray-300 rounded-full mb-2 */></div>
                      <div className="contents"></div>
                    </div>
                  ) : (
                    <a key={idx} href={slot.url} className="slot act-slot w-32 h-32 bg-blue-100 rounded flex flex-col items-center justify-center relative overflow-hidden" /* Tailwind: w-32 h-32 bg-blue-100 rounded flex flex-col items-center justify-center relative overflow-hidden */>
                      <div className="dummy w-8 h-8 bg-blue-300 rounded-full mb-2"></div>
                      <div className="overlay absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2" /* Tailwind: absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2 */>
                        {/* Progress bar, etc. */}
                        <div className="difficulty text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded" /* Tailwind: text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded */>{slot.difficulty}</div>
                      </div>
                      <div className="contents flex-1 flex items-center justify-center">
                        <img src={slot.imageUrl} alt="Dare" className="w-12 h-12 object-cover rounded" /* Tailwind: w-12 h-12 object-cover rounded */ />
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>
            {/* Section Headings */}
            <h3 className="section-description text-xl font-bold mb-2" /* Tailwind: text-xl font-bold mb-2 */>Ongoing Dares</h3>
            <div className="ongoing-dares-list grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" /* Tailwind: grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 */>
              {completedLoading ? <div className="text-center py-8 text-neutral-400">Loading completed dares...</div> : ongoing.length === 0 ? (
                <div className="text-neutral-400">No ongoing dares.</div>
              ) : (
                ongoing.map((dare, idx) => (
                  <div key={dare._id || idx} className="dare-card bg-neutral-100 border border-neutral-300 rounded p-4 flex flex-col gap-2" /* Tailwind: bg-neutral-100 border border-neutral-300 rounded p-4 flex flex-col gap-2 */>
                    <DareCard dare={dare} />
                    <div className="actions flex gap-2 mt-2" /* Tailwind: flex gap-2 mt-2 */>
                      <button className="btn btn-primary px-3 py-1 bg-blue-600 text-white rounded" /* Tailwind: px-3 py-1 bg-blue-600 text-white rounded */ onClick={() => handleCompleteDare(idx)} disabled={cooldownUntil && new Date() < new Date(cooldownUntil)}>Complete</button>
                      <button className="btn btn-danger px-3 py-1 bg-red-600 text-white rounded" /* Tailwind: px-3 py-1 bg-red-600 text-white rounded */ onClick={() => handleRejectDare(idx)} disabled={cooldownUntil && new Date() < new Date(cooldownUntil)}>Reject</button>
                      {/* TODO: Link to submit proof or view dare */}
                      <a href={`/dares/${dare._id}/perform`} className="btn btn-secondary px-3 py-1 bg-gray-500 text-white rounded" /* Tailwind: px-3 py-1 bg-gray-500 text-white rounded */ title="Submit proof or view details">Submit/View</a>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 flex items-center">Status: {dare.status}{renderStatusBadge(dare.status)}</div>
                  </div>
                ))
              )}
            </div>
            <h3 className="section-description text-xl font-bold mb-2" /* Tailwind: text-xl font-bold mb-2 */>Completed Dares</h3>
            <div className="completed-dares-list grid grid-cols-1 md:grid-cols-2 gap-4 mb-8" /* Tailwind: grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 */>
              {completedLoading ? <div className="text-center py-8 text-neutral-400">Loading completed dares...</div> : completed.length === 0 ? (
                <div className="text-neutral-400">No completed dares yet.</div>
              ) : (
                completed.map((dare, idx) => (
                  <div key={dare._id || idx} className="dare-card bg-neutral-50 border border-neutral-200 rounded p-4 flex flex-col gap-2" /* Tailwind: bg-neutral-50 border border-neutral-200 rounded p-4 flex flex-col gap-2 */>
                    <DareCard dare={dare} />
                    <div className="text-xs text-neutral-400 mt-1">Completed at: {dare.completedAt ? new Date(dare.completedAt).toLocaleString() : '—'}</div>
                  </div>
                ))
              )}
            </div>
            <h3 className="section-description text-xl font-bold mb-2" /* Tailwind: text-xl font-bold mb-2 */>Browse Public Dares</h3>
            <div className="public-dares-browser mb-8" /* Tailwind: mb-8 */>
              {renderFilters()}
              {renderAdvancedFilters()}
              {publicLoading ? <div className="text-center py-8 text-neutral-400">Loading public dares...</div> : publicDares.length === 0 ? (
                <div className="text-neutral-400">No public dares found.</div>
              ) : (
                <div className="public-dares-list grid grid-cols-1 md:grid-cols-2 gap-4" /* Tailwind: grid grid-cols-1 md:grid-cols-2 gap-4 */>
                  {publicDares.map(dare => (
                    <div key={dare._id} className="dare-card bg-neutral-100 border border-neutral-300 rounded p-4 flex flex-col gap-2" /* Tailwind: bg-neutral-100 border border-neutral-300 rounded p-4 flex flex-col gap-2 */>
                      <DareCard dare={dare} />
                      <div className="actions flex gap-2 mt-2">
                        <button
                          className="btn btn-primary px-3 py-1 bg-blue-600 text-white rounded mt-2"
                          /* Tailwind: px-3 py-1 bg-blue-600 text-white rounded mt-2 */
                          disabled={claiming || slots.length >= MAX_SLOTS || (cooldownUntil && new Date() < new Date(cooldownUntil))}
                          onClick={() => handleClaimDare(dare)}
                        >
                          Claim Dare
                        </button>
                        {/* TODO: View details action */}
                        <a href={`/dares/${dare._id}`} className="btn btn-secondary px-3 py-1 bg-gray-500 text-white rounded" /* Tailwind: px-3 py-1 bg-gray-500 text-white rounded */ title="View dare details">View Details</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Call to Action */}
            <div className="call-to-action flex gap-2 mb-4" /* Tailwind: flex gap-2 mb-4 */>
              <a className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded" href="/subs/new" /* Tailwind: px-4 py-2 bg-blue-600 text-white rounded */>Offer submission</a>
              <a className="btn btn-primary px-4 py-2 bg-green-600 text-white rounded" href="/switches/new" /* Tailwind: px-4 py-2 bg-green-600 text-white rounded */>Switch battle</a>
            </div>
            {/* TODO: Public dares browser, advanced filtering, etc. */}
          </div>
        )}
        {/* Demand Tab Content */}
        {tab === 'demand' && (
          <div className="tab-pane active" id="demand">
            <h3 className="section-description text-xl font-bold mb-2" /* Tailwind: text-xl font-bold mb-2 */>Your Demand Slots</h3>
            <div className="slot-list-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" /* Tailwind: grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 */>
              <div className="slot-list flex flex-wrap gap-4" /* Tailwind: flex flex-wrap gap-4 */>
                {demandLoading ? <div className="text-center py-8 text-neutral-400">Loading demand slots...</div> : demandSlots.length === 0 ? (
                  <div className="text-neutral-400">No active demand slots.</div>
                ) : (
                  demandSlots.map((slot, idx) => (
                    <a key={slot._id || idx} href={slot.url} className="slot act-slot w-32 h-32 bg-green-100 rounded flex flex-col items-center justify-center relative overflow-hidden" /* Tailwind: w-32 h-32 bg-green-100 rounded flex flex-col items-center justify-center relative overflow-hidden */>
                      <div className="dummy w-8 h-8 bg-green-300 rounded-full mb-2"></div>
                      <div className="overlay absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2" /* Tailwind: absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2 */>
                        <div className="difficulty text-xs font-bold bg-green-600 text-white px-2 py-1 rounded" /* Tailwind: text-xs font-bold bg-green-600 text-white px-2 py-1 rounded */>{slot.difficulty}</div>
                        {renderStatusBadge(slot.status)}
                      </div>
                      <div className="contents flex-1 flex items-center justify-center">
                        <img src={slot.imageUrl} alt="Dare" className="w-12 h-12 object-cover rounded" /* Tailwind: w-12 h-12 object-cover rounded */ />
                      </div>
                      {/* Withdraw real handler */}
                      <button className="btn btn-danger mt-2 px-2 py-1 bg-red-600 text-white rounded w-full" onClick={() => handleWithdrawDemand(idx)} disabled /* Tailwind: mt-2 px-2 py-1 bg-red-600 text-white rounded w-full */ title="Withdraw this dare (not yet implemented)">
                        Withdraw (stub)
                      </button>
                    </a>
                  ))
                )}
              </div>
            </div>
            <h3 className="section-description more-tasks text-xl font-bold mt-6 mb-2" /* Tailwind: text-xl font-bold mt-6 mb-2 */>Find more</h3>
            <div className="call-to-action flex gap-2 mb-4" /* Tailwind: flex gap-2 mb-4 */>
              <a className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded" href="/doms/new" /* Tailwind: px-4 py-2 bg-blue-600 text-white rounded */>Offer domination</a>
              <a className="btn btn-primary px-4 py-2 bg-green-600 text-white rounded" href="/switches/new" /* Tailwind: px-4 py-2 bg-green-600 text-white rounded */>Switch battle</a>
            </div>
            {/* TODO: Public demand browser, advanced filtering, etc. */}
          </div>
        )}
      </div>
      {/* Notification/toast UI */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}
          role="alert">
          {notification.msg}
        </div>
      )}
      {/* Confirmation dialog for withdraw */}
      {confirmWithdrawIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full">
            <div className="text-lg font-bold mb-2">Withdraw Demand Dare</div>
            <div className="mb-4">Are you sure you want to withdraw this dare? This action cannot be undone.</div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => setConfirmWithdrawIdx(null)}>Cancel</button>
              <button className="btn btn-danger px-4 py-2 bg-red-600 text-white rounded" onClick={async () => { await handleWithdrawDemand(confirmWithdrawIdx); setConfirmWithdrawIdx(null); }}>Withdraw</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 