import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { Banner } from '../components/Modal';

export default function DareCreator() {
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdDareId, setCreatedDareId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState('');
  const [generalSuccess, setGeneralSuccess] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setGeneralError('');
    setGeneralSuccess('');
    if (description.trim().length < 10) {
      setCreateError('Description must be at least 10 characters.');
      setGeneralError('Description must be at least 10 characters.');
      return;
    }
    setCreating(true);
    try {
      const res = await api.post('/dares', {
        description,
        difficulty,
      });
      setCreatedDareId(res.data._id || res.data.id);
      setShowModal(true);
      setToast('Dare created successfully!');
      setGeneralSuccess('Dare created successfully!');
      setTimeout(() => { setToast(''); setGeneralSuccess(''); }, 3000);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create dare');
      setGeneralError(err.response?.data?.error || 'Failed to create dare');
    } finally {
      setCreating(false);
    }
  };

  const dareUrl = createdDareId && typeof window !== 'undefined' ? `${window.location.origin}/dares/${createdDareId}` : '';

  const handleCreateAnother = () => {
    setShowModal(false);
    setCreatedDareId(null);
    setDescription('');
    setDifficulty('titillating');
    setCreateError('');
  };

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Create a Dare</h1>
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-success text-success-contrast px-4 py-2 rounded shadow z-50 text-center" aria-live="polite">
          {toast}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true">
          <div className="bg-neutral-900 rounded-lg shadow-lg w-full max-w-md mx-4 relative p-6">
            <h2 className="text-lg font-semibold text-primary mb-4 text-center">Dare Created!</h2>
            <label className="block font-semibold mb-1 text-primary">Sharable Link</label>
            <input
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary mb-2"
              type="text"
              value={dareUrl}
              readOnly
              onFocus={e => e.target.select()}
              aria-label="Sharable Link"
            />
            <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark mb-3" onClick={() => navigator.clipboard.writeText(dareUrl)}>
              Copy Link
            </button>
            <button className="w-full bg-success text-success-contrast rounded px-4 py-2 font-semibold hover:bg-success-dark mb-3" onClick={handleCreateAnother}>
              Create Another Dare
            </button>
            <Link to="/" className="w-full inline-block mb-2">
              <button className="w-full bg-gray-200 text-gray-800 rounded px-4 py-2 font-semibold hover:bg-gray-300">Back to Home</button>
            </Link>
            <Link to="/dares" className="w-full inline-block">
              <button className="w-full bg-info text-info-contrast rounded px-4 py-2 font-semibold hover:bg-info-dark">View All Dares</button>
            </Link>
          </div>
        </div>
      )}
      {!showModal && (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-primary">Dare Description</label>
            <textarea className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={description} onChange={e => setDescription(e.target.value)} rows={3} required minLength={10} />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-primary">Difficulty</label>
            <select className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="titillating">Titillating</option>
              <option value="daring">Daring</option>
              <option value="diabolical">Diabolical</option>
            </select>
          </div>
          {createError && <div className="text-danger text-sm font-medium" role="alert">{createError}</div>}
          <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold text-sm hover:bg-primary-dark" disabled={creating}>
            {creating ? 'Creating...' : 'Create Dare'}
          </button>
        </form>
      )}
    </div>
  );
} 