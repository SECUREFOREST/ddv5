import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function SwitchGames() {
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/api/switches')
      .then(res => setSwitchGames(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSwitchGames([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await api.post('/api/switches', { name: newGameName });
      setSwitchGames(games => [...games, res.data]);
      setShowCreate(false);
      setNewGameName('');
    } catch (err) {
      setCreateError('Failed to create switch game.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Switch Games</h1>
        <button className="bg-primary text-white rounded px-4 py-2 text-sm font-semibold hover:bg-primary-dark" onClick={() => setShowCreate(true)}>
          Switch battle
        </button>
      </div>
      {loading ? (
        <div className="text-center text-gray-500">Loading switch games...</div>
      ) : switchGames.length === 0 ? (
        <div className="text-center text-gray-400">No switch games available.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Participants</th>
                <th className="p-2 text-left">Winner</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {switchGames.map(game => (
                <tr key={game.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-2">{game.id}</td>
                  <td className="p-2">{game.name || '-'}</td>
                  <td className="p-2">{game.status}</td>
                  <td className="p-2">{game.participants ? game.participants.join(', ') : '-'}</td>
                  <td className="p-2">{game.winner || '-'}</td>
                  <td className="p-2">
                    <button className="bg-gray-200 text-gray-700 rounded px-3 py-1 text-xs font-semibold hover:bg-gray-300" onClick={() => navigate(`/switches/${game.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Switch battle">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Game Name (optional)</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring focus:border-primary"
              value={newGameName}
              onChange={e => setNewGameName(e.target.value)}
              placeholder="Enter a name for your switch game..."
            />
          </div>
          {createError && <div className="text-red-500 text-sm font-medium">{createError}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold text-sm hover:bg-gray-300" onClick={() => setShowCreate(false)} disabled={creating}>
              Cancel
            </button>
            <button type="submit" className="bg-primary text-white rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark disabled:opacity-50" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 