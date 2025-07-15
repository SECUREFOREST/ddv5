import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dareStatusLabels = {
  completed: 'Completed',
  forfeited: 'Forfeited',
  graded: 'Graded',
};
const switchStatusLabels = {
  completed: 'Completed',
  forfeited: 'Forfeited',
  expired: 'Expired',
};
const dareStatusOptions = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'forfeited', label: 'Forfeited' },
  { value: 'graded', label: 'Graded' },
];
const dareRoleOptions = [
  { value: '', label: 'All' },
  { value: 'creator', label: 'As Creator' },
  { value: 'performer', label: 'As Performer' },
];
const switchStatusOptions = [
  { value: '', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'forfeited', label: 'Forfeited' },
  { value: 'expired', label: 'Expired' },
];
const winLossOptions = [
  { value: '', label: 'All' },
  { value: 'win', label: 'Won' },
  { value: 'loss', label: 'Lost' },
];

export default function GameHistory() {
  const [dares, setDares] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Filters
  const [dareStatus, setDareStatus] = useState('');
  const [dareRole, setDareRole] = useState('');
  const [dareDateFrom, setDareDateFrom] = useState('');
  const [dareDateTo, setDareDateTo] = useState('');
  const [switchStatus, setSwitchStatus] = useState('');
  const [winLoss, setWinLoss] = useState('');
  const [switchDateFrom, setSwitchDateFrom] = useState('');
  const [switchDateTo, setSwitchDateTo] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/dares/performer'),
      axios.get('/switches/history')
    ])
      .then(([daresRes, gamesRes]) => {
        setDares(daresRes.data.filter(d => ['completed', 'forfeited', 'graded'].includes(d.status)));
        setGames(gamesRes.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load game history.');
        setLoading(false);
      });
  }, []);

  // Filtered dares
  const filteredDares = dares.filter(dare => {
    if (dareStatus && dare.status !== dareStatus) return false;
    if (dareRole === 'creator' && (!user || (dare.creator?._id !== user.id && dare.creator !== user.id))) return false;
    if (dareRole === 'performer' && (!user || (dare.performer?._id !== user.id && dare.performer !== user.id))) return false;
    if (dareDateFrom && new Date(dare.updatedAt) < new Date(dareDateFrom)) return false;
    if (dareDateTo && new Date(dare.updatedAt) > new Date(dareDateTo)) return false;
    return true;
  });

  // Dare stats
  const dareStats = {
    total: dares.length,
    asCreator: dares.filter(d => user && (d.creator?._id === user.id || d.creator === user.id)).length,
    asPerformer: dares.filter(d => user && (d.performer?._id === user.id || d.performer === user.id)).length,
    completed: dares.filter(d => d.status === 'completed').length,
    forfeited: dares.filter(d => d.status === 'forfeited').length,
    graded: dares.filter(d => d.status === 'graded').length,
    avgGrade: (() => {
      const grades = dares.flatMap(d => d.grades || []).map(g => g.grade).filter(g => typeof g === 'number');
      return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
    })(),
  };

  // Filtered switch games
  const filteredGames = games.filter(game => {
    if (switchStatus && game.status !== switchStatus) return false;
    if (winLoss === 'win' && (!user || !game.winner || (game.winner._id !== user.id && game.winner !== user.id))) return false;
    if (winLoss === 'loss' && (!user || !game.winner || (game.winner._id === user.id || game.winner === user.id))) return false;
    if (switchDateFrom && new Date(game.updatedAt) < new Date(switchDateFrom)) return false;
    if (switchDateTo && new Date(game.updatedAt) > new Date(switchDateTo)) return false;
    return true;
  });

  // Switch game stats
  const switchStats = {
    total: games.length,
    won: games.filter(g => user && g.winner && (g.winner._id === user.id || g.winner === user.id)).length,
    lost: games.filter(g => user && g.winner && (g.winner._id !== user.id && g.winner !== user.id)).length,
    forfeited: games.filter(g => g.status === 'forfeited').length,
    avgGrade: (() => {
      const grades = games.flatMap(g => g.grades || []).map(g => g.grade).filter(g => typeof g === 'number');
      return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
    })(),
  };

  if (loading) return <div className="p-6 text-center">Loading your game history...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;
  if (!dares.length && !games.length) return <div className="p-6 text-center">No past dares or switch games found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Game History</h1>
      {/* Dare History Section */}
      <h2 className="text-xl font-semibold mb-2 mt-6">Dare History</h2>
      {/* Dare Stats */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
        <div>Total: <span className="font-bold">{dareStats.total}</span></div>
        <div>As Creator: <span className="font-bold">{dareStats.asCreator}</span></div>
        <div>As Performer: <span className="font-bold">{dareStats.asPerformer}</span></div>
        <div>Completed: <span className="font-bold">{dareStats.completed}</span></div>
        <div>Forfeited: <span className="font-bold">{dareStats.forfeited}</span></div>
        <div>Graded: <span className="font-bold">{dareStats.graded}</span></div>
        <div>Avg. Grade: <span className="font-bold">{dareStats.avgGrade}</span></div>
      </div>
      {/* Dare Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label>Status:
          <select className="ml-1 border rounded px-2 py-1" value={dareStatus} onChange={e => setDareStatus(e.target.value)}>
            {dareStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Role:
          <select className="ml-1 border rounded px-2 py-1" value={dareRole} onChange={e => setDareRole(e.target.value)}>
            {dareRoleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Date from:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={dareDateFrom} onChange={e => setDareDateFrom(e.target.value)} />
        </label>
        <label>Date to:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={dareDateTo} onChange={e => setDareDateTo(e.target.value)} />
        </label>
      </div>
      {!filteredDares.length ? (
        <div className="p-4 text-center text-gray-400">No past dares found.</div>
      ) : (
        <div className="space-y-4 mb-8">
          {filteredDares.map(dare => (
            <div key={dare._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{dare.description}</div>
                <div className="text-sm text-gray-500 mb-1">
                  Status: <span className="font-medium">{dareStatusLabels[dare.status] || dare.status}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Creator: {dare.creator?.username || 'Unknown'}
                  {dare.performer && (
                    <> | Performer: {dare.performer?.username || 'Unknown'}</>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  Last updated: {dare.updatedAt ? new Date(dare.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                <Link to={`/dare/${dare._id}/perform`} className="btn btn-primary btn-sm">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Switch Game History Section */}
      <h2 className="text-xl font-semibold mb-2 mt-6">Switch Game History</h2>
      {/* Switch Stats */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
        <div>Total: <span className="font-bold">{switchStats.total}</span></div>
        <div>Won: <span className="font-bold">{switchStats.won}</span></div>
        <div>Lost: <span className="font-bold">{switchStats.lost}</span></div>
        <div>Forfeited: <span className="font-bold">{switchStats.forfeited}</span></div>
        <div>Avg. Grade: <span className="font-bold">{switchStats.avgGrade}</span></div>
      </div>
      {/* Switch Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label>Status:
          <select className="ml-1 border rounded px-2 py-1" value={switchStatus} onChange={e => setSwitchStatus(e.target.value)}>
            {switchStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Win/Loss:
          <select className="ml-1 border rounded px-2 py-1" value={winLoss} onChange={e => setWinLoss(e.target.value)}>
            {winLossOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label>Date from:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={switchDateFrom} onChange={e => setSwitchDateFrom(e.target.value)} />
        </label>
        <label>Date to:
          <input type="date" className="ml-1 border rounded px-2 py-1" value={switchDateTo} onChange={e => setSwitchDateTo(e.target.value)} />
        </label>
      </div>
      {!filteredGames.length ? (
        <div className="p-4 text-center text-gray-400">No past switch games found.</div>
      ) : (
        <div className="space-y-4">
          {filteredGames.map(game => {
            const isWinner = user && game.winner && (game.winner._id === user._id || game.winner._id === user.id);
            return (
              <div key={game._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-lg">{game.creatorDare?.description || 'No description'}</div>
                  <div className="text-sm text-gray-500 mb-1">
                    Status: <span className="font-medium">{switchStatusLabels[game.status] || game.status}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    Creator: {game.creator?.username || 'Unknown'}
                    {game.participant && (
                      <> | Participant: {game.participant?.username || 'Unknown'}</>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    Winner: {game.winner ? (game.winner.username || 'Unknown') : 'N/A'}
                    {isWinner && <span className="ml-2 text-green-600 font-semibold">(You won)</span>}
                  </div>
                  <div className="text-xs text-gray-400">
                    Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                  <Link to={`/switches/${game._id}`} className="btn btn-primary btn-sm">View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 