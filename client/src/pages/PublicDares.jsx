import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { Banner } from '../components/Modal';
import { ClockIcon } from '@heroicons/react/24/solid';

// Difficulty badge (reuse from DareCard)
function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold mr-2 ${badgeClass}`}>{label}</span>
  );
}

function Tag({ tag }) {
  return (
    <span className="bg-primary text-primary-contrast px-2 py-1 rounded-none text-xs font-semibold mr-2">{tag}</span>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'dares', label: 'Dares' },
  { key: 'switches', label: 'Switch Games' },
];

export default function PublicDares() {
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/dares', { params: { public: true, status: 'waiting_for_participant' } }),
      api.get('/switches', { params: { public: true, status: 'waiting_for_participant' } })
    ])
      .then(([daresRes, switchesRes]) => {
        setDares(Array.isArray(daresRes.data) ? daresRes.data : []);
        setSwitchGames(Array.isArray(switchesRes.data) ? switchesRes.data : []);
      })
      .catch(() => setError('Failed to load public dares or switch games.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter and search logic
  const filterAndSearch = (items, type) => {
    return items.filter(item => {
      if (search) {
        const creatorName = item.creator?.fullName || item.creator?.username || '';
        const tags = item.tags?.join(' ') || '';
        if (!creatorName.toLowerCase().includes(search.toLowerCase()) && !tags.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      }
      if (filter === 'all') return true;
      if (filter === 'dares') return type === 'dare';
      if (filter === 'switches') return type === 'switch';
      return true;
    });
  };

  const filteredDares = filterAndSearch(dares, 'dare');
  const filteredSwitchGames = filterAndSearch(switchGames, 'switch');
  const showDares = filter === 'all' || filter === 'dares';
  const showSwitches = filter === 'all' || filter === 'switches';

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Public Dares & Switch Games</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Toast notification for feedback (if needed) */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300 bg-green-700 text-white`} role="alert" aria-live="polite" onClick={() => setToast('')} tabIndex={0} onBlur={() => setToast('')}>{toast}</div>
      )}
      {/* Onboarding/Intro Banner */}
      <div className="mb-6 p-4 bg-neutral-900/90 rounded-xl border border-neutral-800 shadow-lg flex items-center gap-3">
        <span className="text-2xl">🌎</span>
        <div>
          <div className="font-bold text-lg text-primary">Participate in Public Dares & Switch Games</div>
          <div className="text-neutral-400 text-sm">Join fun challenges created by the community! Use the filters or search to find something that excites you. Click <b>Participate</b> to get started.</div>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-neutral-900/90 rounded-xl border border-neutral-800 shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`px-3 py-1 rounded font-semibold text-sm border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast ${filter === f.key ? 'bg-primary text-primary-contrast' : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'}`}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-sm text-neutral-100 focus:outline-none focus:border-primary w-full sm:w-64"
          placeholder="Search by creator or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search public dares and switch games"
        />
      </div>
      {error && <Banner type="error" message={error} onClose={() => setError('')} />}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-neutral-900/90 border border-neutral-800 rounded-xl mb-4" />
          ))}
        </div>
      ) : (
        <>
            {showDares && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3 text-primary">Public Dares</h2>
                {filteredDares.length === 0 ? (
                  <div className="text-neutral-400 text-center py-8">No public dares available.</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1">
                    {filteredDares.map(dare => (
                    <div key={dare._id} className="transition-transform hover:scale-[1.01] hover:shadow-2xl group focus-within:shadow-2xl bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar user={dare.creator} size="lg" />
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="font-bold text-lg truncate flex items-center gap-2">
                              {dare.creator?.fullName || dare.creator?.username || 'Unknown'}
                              <DifficultyBadge level={dare.difficulty} />
                            </div>
                            <Link to={`/dare/${dare._id}/participate`}>
                              <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast disabled:opacity-50">Participate</button>
                            </Link>
                          </div>
                        </div>
                      {/* Timestamps/meta */}
                      {dare.createdAt && (
                        <div className="mt-2 text-xs text-neutral-500 flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1" title={dare.createdAt}>
                            <ClockIcon className="w-4 h-4 text-neutral-400 inline-block mr-1" />
                            Created: {new Date(dare.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {showSwitches && (
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Public Switch Games</h2>
                {filteredSwitchGames.length === 0 ? (
                  <div className="text-neutral-400 text-center py-8">No public switch games available.</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-1">
                    {filteredSwitchGames.map(game => (
                    <div key={game._id} className="transition-transform hover:scale-[1.01] hover:shadow-2xl group focus-within:shadow-2xl bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar user={game.creator} size="lg" />
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="font-bold text-lg truncate flex items-center gap-2">
                              {game.creator?.fullName || game.creator?.username || 'Unknown'}
                              <DifficultyBadge level={game.creatorDare?.difficulty} />
                            </div>
                            <Link to={`/switches/participate/${game._id}`}>
                              <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast disabled:opacity-50">Participate</button>
                            </Link>
                          </div>
                        </div>
                      {/* Timestamps/meta */}
                      {game.createdAt && (
                        <div className="mt-2 text-xs text-neutral-500 flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1" title={game.createdAt}>
                            <ClockIcon className="w-4 h-4 text-neutral-400 inline-block mr-1" />
                            Created: {new Date(game.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    ))}
                  </div>
                )}
              </section>
            )}
            {/* Empty state if both are empty after filtering */}
            {filteredDares.length === 0 && filteredSwitchGames.length === 0 && (
              <div className="text-center text-neutral-400 mt-8 py-8">No public dares or switch games match your search or filters. Try adjusting your search or check back later!</div>
            )}
          </>
        )}
    </div>
  );
} 