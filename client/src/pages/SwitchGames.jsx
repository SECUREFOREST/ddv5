import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SwitchGames() {
  const { user } = useAuth ? useAuth() : { user: null };
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
    <div className="max-w-2xl mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none flex items-center justify-between">
        <h1 className="text-2xl font-bold">Switch Games</h1>
        {user && (
          <button
            className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark"
            onClick={() => setShowCreate(true)}
          >
            + Create Switch Game
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center text-neutral-400">Loading switch games...</div>
      ) : switchGames.length === 0 ? (
        <div className="text-center text-neutral-400">No switch games available.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th className="p-2 text-left font-semibold">Title</th>
                <th className="p-2 text-left font-semibold">Status</th>
                <th className="p-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {switchGames.map((g) => (
                <tr key={g._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                  <td className="p-2 font-medium text-primary">{g.title}</td>
                  <td className="p-2">
                    {g.status === 'open' && <span className="inline-block bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold">Open</span>}
                    {g.status === 'closed' && <span className="inline-block bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold">Closed</span>}
                  </td>
                  <td className="p-2">
                    <button className="bg-info text-info-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-info-dark mr-2" onClick={() => handleView(g._id)}>View</button>
                    <button className="bg-warning text-warning-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-warning-dark" onClick={() => handleDelete(g._id)}>Delete</button>
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