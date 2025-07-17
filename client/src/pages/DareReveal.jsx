import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';

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

const PRIVACY_OPTIONS = [
  { value: 'when_viewed', label: 'Delete once viewed', desc: 'As soon as the other person has viewed the image, delete it completely.' },
  { value: '30_days', label: 'Delete in 30 days', desc: 'All pics are deleted thirty days after you upload them, whether they have been viewed or not.' },
  { value: 'never', label: 'Never delete', desc: 'Keep your images on the site permanently. Not recommended. Images will be deleted if you fail to log in for 2 months.' },
];

export default function DareReveal() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const dareId = params.id || location.state?.dareId;
  const { user, loading: authLoading } = useAuth();
  const [dare, setDare] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [proof, setProof] = React.useState('');
  const [proofFile, setProofFile] = React.useState(null);
  const [proofLoading, setProofLoading] = React.useState(false);
  const [proofError, setProofError] = React.useState('');
  const [proofSuccess, setProofSuccess] = React.useState('');
  const [expireAfterView, setExpireAfterView] = React.useState(false);
  const [privacy, setPrivacy] = React.useState('when_viewed');
  const [chickenOutLoading, setChickenOutLoading] = React.useState(false);
  const [chickenOutError, setChickenOutError] = React.useState('');
  const [generalError, setGeneralError] = React.useState('');
  const [generalSuccess, setGeneralSuccess] = React.useState('');

  React.useEffect(() => {
    if (authLoading) return;
    if (!dareId) {
      navigate('/dare/select');
      return;
    }
    setLoading(true);
    setError('');
    api.get(`/dares/${dareId}`)
      .then(res => {
        if (res.data && res.data._id) {
          const performerId = res.data.performer?._id || res.data.performer;
          if (!user || !performerId || String(performerId) !== String(user._id)) {
            setDare(null);
            setError('You are not authorized to view this dare.');
          } else {
            setDare(res.data);
          }
        } else {
          setError('Dare not found.');
        }
      })
      .catch(() => {
        setError('Failed to fetch dare.');
      })
      .finally(() => setLoading(false));
  }, [dareId, navigate, user, authLoading]);

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setProofError('File too large. Max size is 10MB.');
      setProofFile(null);
      return;
    }
    setProofFile(file);
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    setProofError('');
    setProofSuccess('');
    setGeneralError('');
    setGeneralSuccess('');
    setProofLoading(true);
    try {
      if (!proof && !proofFile) {
        setProofError('Please provide proof text or upload a file.');
        setProofLoading(false);
        return;
      }
      let formData;
      if (proofFile) {
        formData = new FormData();
        if (proof) formData.append('text', proof);
        formData.append('file', proofFile);
        formData.append('expireAfterView', expireAfterView);
        await api.post(`/dares/${dare._id}/proof`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post(`/dares/${dare._id}/proof`, { text: proof, expireAfterView });
      }
      setProof('');
      setProofFile(null);
      setExpireAfterView(false);
      setProofSuccess('Proof submitted successfully!');
      setGeneralSuccess('Proof submitted successfully!');
      // Optionally reload dare
      api.get(`/dares/${dare._id}`).then(res => setDare(res.data));
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      setGeneralError(err.response?.data?.error || 'Failed to submit proof.');
    } finally {
      setProofLoading(false);
    }
  };

  const handleChickenOut = async () => {
    setChickenOutLoading(true);
    setChickenOutError('');
    setGeneralError('');
    setGeneralSuccess('');
    try {
      await api.post(`/dares/${dare._id}/forfeit`);
      setGeneralSuccess('You have successfully chickened out.');
      // Optionally reload dare
      api.get(`/dares/${dare._id}`).then(res => setDare(res.data));
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      setGeneralError(err.response?.data?.error || 'Failed to chicken out.');
    } finally {
      setChickenOutLoading(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!dareId) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Your Dare</h1>
      {loading ? (
        <div className="text-lg text-center">Loading dare...</div>
      ) : error ? (
        <div className="text-danger text-center mb-4">{error}</div>
      ) : dare ? (
        <div>
          {/* Final status message */}
          {dare.status === 'completed' && (
            <div className="mb-4 flex items-center justify-center gap-2 bg-green-900/80 border border-green-700 text-green-300 rounded px-4 py-2 font-semibold">
              <span className="text-2xl">✔️</span>
              <span>Dare completed! Proof submitted.</span>
            </div>
          )}
          {dare.status === 'forfeited' && (
            <div className="mb-4 flex items-center justify-center gap-2 bg-red-900/80 border border-red-700 text-red-300 rounded px-4 py-2 font-semibold">
              <span className="text-2xl">⚠️</span>
              <span>Dare forfeited (chickened out).</span>
            </div>
          )}
          {dare.status === 'in_progress' && (
            <div className="mb-4 flex items-center justify-center gap-2 bg-blue-900/80 border border-blue-700 text-blue-300 rounded px-4 py-2 font-semibold">
              <span className="text-2xl">⏳</span>
              <span>Dare is in progress.</span>
            </div>
          )}
          <div className="mb-4 p-4 bg-neutral-900 rounded text-neutral-100 border border-neutral-800 text-center">
            <div className="font-semibold text-primary mb-2">Dare:</div>
            <div className="text-lg font-bold mb-2">{dare.description}</div>
            <div className="text-sm text-neutral-400">Difficulty: <DifficultyBadge level={dare.difficulty} /></div>
            {dare.creator && (
              <div className="flex flex-col items-center mt-2">
                <span className="text-xs text-neutral-400">Creator: {dare.creator.username || 'Anonymous'}</span>
                {dare.creator.avatar && (
                  <img src={dare.creator.avatar} alt="creator avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#282828] mt-1" />
                )}
              </div>
            )}
            {dare.performer && (
              <div className="flex flex-col items-center mt-2">
                <span className="text-xs text-neutral-400">Participant: {dare.performer.username || 'Anonymous'}</span>
                {dare.performer.avatar && (
                  <img src={dare.performer.avatar} alt="participant avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#282828] mt-1" />
                )}
              </div>
            )}
          </div>
          {/* Proof submission and chicken out only if performer and in_progress */}
          {dare.performer && user && String((dare.performer._id || dare.performer)) === String(user._id) && dare.status === 'in_progress' && (
            <>
              <form onSubmit={handleProofSubmit} className="mb-4 space-y-4">
                <div>
                  <label className="block font-semibold mb-1 text-primary">Submit Proof</label>
                  <textarea
                    className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                    value={proof}
                    onChange={e => setProof(e.target.value)}
                    placeholder="Describe what you did..."
                    rows={3}
                  />
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf"
                    className="mt-2"
                    onChange={handleProofFileChange}
                  />
                  <div className="text-xs text-neutral-400 mt-1">Max file size: 10MB</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="expireAfterView"
                    checked={expireAfterView}
                    onChange={e => setExpireAfterView(e.target.checked)}
                  />
                  <label htmlFor="expireAfterView" className="text-sm">Delete proof after viewed</label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark disabled:opacity-50"
                  disabled={proofLoading}
                >
                  {proofLoading ? 'Submitting...' : 'Submit Proof'}
                </button>
                {proofError && <div className="text-danger text-center mt-2">{proofError}</div>}
                {proofSuccess && <div className="text-success text-center mt-2">{proofSuccess}</div>}
              </form>
              <button
                className="w-full bg-danger text-danger-contrast rounded px-4 py-2 font-semibold hover:bg-danger-dark disabled:opacity-50"
                onClick={handleChickenOut}
                disabled={chickenOutLoading}
              >
                {chickenOutLoading ? 'Chickening Out...' : 'Chicken Out (Forfeit)'}
              </button>
              {chickenOutError && <div className="text-danger text-center mt-2">{chickenOutError}</div>}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
} 