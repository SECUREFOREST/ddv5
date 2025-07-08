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
      .then(res => setSwitchGames(res.data))
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
    <div className="panel panel-default">
      <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="panel-title">Switch Games</h1>
        <button className="btn btn-primary btn-xs" onClick={() => setShowCreate(true)}>Switch battle</button>
      </div>
      <div className="panel-body">
        {loading ? (
          <div>Loading switch games...</div>
        ) : switchGames.length === 0 ? (
          <div className="text-muted">No switch games available.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Winner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {switchGames.map(game => (
                  <tr key={game.id}>
                    <td>{game.id}</td>
                    <td>{game.name || '-'}</td>
                    <td>{game.status}</td>
                    <td>{game.participants ? game.participants.join(', ') : '-'}</td>
                    <td>{game.winner || '-'}</td>
                    <td>
                      <button className="btn btn-default btn-xs" onClick={() => navigate(`/switches/${game.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Switch battle">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Game Name (optional)</label>
            <input
              className="form-control"
              value={newGameName}
              onChange={e => setNewGameName(e.target.value)}
              placeholder="Enter a name for your switch game..."
            />
          </div>
          {createError && <div className="text-danger help-block">{createError}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-default" onClick={() => setShowCreate(false)} disabled={creating}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 