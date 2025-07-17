import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import dayjs from 'dayjs';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PhotoIcon, PlayCircleIcon, TagIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';

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
  const [proofModalOpen, setProofModalOpen] = React.useState(false);
  const [proofModalType, setProofModalType] = React.useState(''); // 'image' or 'video'
  const [toast, setToast] = React.useState({ message: '', type: '' });

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
      // Require a proof file (image or video)
      if (!proofFile || !proofFile.type.match(/^image\/(jpeg|png|gif|webp)$|^video\/mp4$/)) {
        setProofError('Please upload a proof file (image or video).');
        setProofLoading(false);
        return;
      }
      let formData = new FormData();
      if (proof) formData.append('text', proof);
      formData.append('file', proofFile);
      formData.append('expireAfterView', expireAfterView);
      await api.post(`/dares/${dare._id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProof('');
      setProofFile(null);
      setExpireAfterView(false);
      setProofSuccess('Proof submitted successfully!');
      setGeneralSuccess('Proof submitted successfully!');
      setToast({ message: 'Proof submitted successfully!', type: 'success' });
      // Optionally reload dare
      api.get(`/dares/${dare._id}`).then(res => setDare(res.data));
    } catch (err) {
      setProofError(err.response?.data?.error || 'Failed to submit proof.');
      setGeneralError(err.response?.data?.error || 'Failed to submit proof.');
      setToast({ message: err.response?.data?.error || 'Failed to submit proof.', type: 'error' });
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
      setToast({ message: 'You have successfully forfeited the dare.', type: 'success' });
      // Optionally reload dare
      api.get(`/dares/${dare._id}`).then(res => setDare(res.data));
    } catch (err) {
      setChickenOutError(err.response?.data?.error || 'Failed to chicken out.');
      setGeneralError(err.response?.data?.error || 'Failed to chicken out.');
      setToast({ message: err.response?.data?.error || 'Failed to forfeit dare.', type: 'error' });
    } finally {
      setChickenOutLoading(false);
    }
  };

  if (authLoading) return <div>Loading...</div>;
  if (!dareId) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      <Banner type={generalError ? 'error' : 'success'} message={generalError || generalSuccess} onClose={() => { setGeneralError(''); setGeneralSuccess(''); }} />
      {toast.message && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-base font-semibold transition-all duration-300
          ${toast.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}
          role="alert"
          aria-live="polite"
          onClick={() => setToast({ message: '', type: '' })}
          tabIndex={0}
          onBlur={() => setToast({ message: '', type: '' })}
        >
          {toast.message}
        </div>
      )}
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Dare Reveal</h1>
      </div>
      {/* Status badge at the very top, centered, visually distinct */}
      <div className="flex justify-center mb-4">
        {dare && (
          dare.status === 'completed' ? (
            <span className="inline-flex items-center gap-2 bg-green-900/90 border border-green-700 text-green-200 rounded-full px-4 py-1 font-semibold shadow-lg text-lg animate-fade-in">
              <CheckCircleIcon className="w-6 h-6" /> Completed
            </span>
          ) : dare.status === 'forfeited' ? (
            <span className="inline-flex items-center gap-2 bg-red-900/90 border border-red-700 text-red-200 rounded-full px-4 py-1 font-semibold shadow-lg text-lg animate-fade-in">
              <ExclamationTriangleIcon className="w-6 h-6" /> Forfeited
            </span>
          ) : dare.status === 'in_progress' ? (
            <span className="inline-flex items-center gap-2 bg-blue-900/90 border border-blue-700 text-blue-200 rounded-full px-4 py-1 font-semibold shadow-lg text-lg animate-fade-in">
              <ClockIcon className="w-6 h-6" /> In Progress
            </span>
          ) : null
        )}
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      {loading ? (
        <div className="text-lg text-center">Loading dare...</div>
      ) : error ? (
        <div className="text-danger text-center mb-4">{error}</div>
      ) : dare ? (
        <>
          {/* --- User Info Section --- */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 shadow-lg">
            {/* Creator */}
            <div className="flex flex-col items-center">
              {dare.creator?._id ? (
                <a href={`/profile/${dare.creator._id}`} className="group" tabIndex={0} aria-label={`View ${dare.creator.username}'s profile`}>
                  <img src={dare.creator.avatar || '/default-avatar.png'} alt="Creator avatar" className="w-14 h-14 rounded-full border-2 border-primary mb-1 shadow group-hover:scale-105 transition-transform" />
                </a>
              ) : (
                <img src={dare.creator?.avatar || '/default-avatar.png'} alt="Creator avatar" className="w-14 h-14 rounded-full border-2 border-primary mb-1 shadow" />
              )}
              <span className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">Creator</span>
              <span className="font-semibold text-neutral-100">{dare.creator?.username}</span>
            </div>
            {/* Arrow for desktop */}
            <span className="hidden sm:block text-neutral-500 text-3xl mx-4">→</span>
            {/* Performer */}
            <div className="flex flex-col items-center">
              {dare.performer?._id ? (
                <a href={`/profile/${dare.performer._id}`} className="group" tabIndex={0} aria-label={`View ${dare.performer.username}'s profile`}>
                  <img src={dare.performer.avatar || '/default-avatar.png'} alt="Performer avatar" className="w-14 h-14 rounded-full border-2 border-primary mb-1 shadow group-hover:scale-105 transition-transform" />
                </a>
              ) : (
                <img src={dare.performer?.avatar || '/default-avatar.png'} alt="Performer avatar" className="w-14 h-14 rounded-full border-2 border-primary mb-1 shadow" />
              )}
              <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full mt-1">Performer</span>
              <span className="font-semibold text-neutral-100">{dare.performer?.username}</span>
            </div>
          </div>
          {/* --- Dare Description Card --- */}
          <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
            <div className="font-bold text-xl text-primary mb-2">Dare Description</div>
            <div className="text-base font-normal mb-3 break-words text-primary-contrast">{dare.description}</div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <DifficultyBadge level={dare.difficulty} />
              {dare.tags && dare.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-blue-900 text-blue-200 rounded-full px-3 py-1 text-xs font-semibold border border-blue-700">
                  <TagIcon className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          </div>
          {/* --- Proof Preview Section --- */}
          {dare.proof && dare.proof.fileUrl ? (
            <div className="flex flex-col items-center mb-4">
              <div className="relative group cursor-pointer w-48 h-48 flex items-center justify-center bg-neutral-800 rounded-lg border border-neutral-700 shadow overflow-hidden" onClick={() => setProofModalOpen(true)}>
                {dare.proof.fileUrl.match(/\.(mp4)$/) ? (
                  <video src={dare.proof.fileUrl} className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} controls={false} />
                ) : (
                  <img src={dare.proof.fileUrl} alt="Proof" className="w-full h-full object-cover" style={{ aspectRatio: '1 / 1' }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircleIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <button className="mt-2 text-primary underline hover:text-primary-contrast transition-colors" onClick={() => setProofModalOpen(true)}>View Full Proof</button>
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <PhotoIcon className="w-16 h-16 text-neutral-700 mb-2" />
              <span className="text-neutral-400">No proof submitted yet. When you submit proof, it will appear here!</span>
            </div>
          )}
          {/* --- Action Buttons (Sticky Footer on Mobile) --- */}
          <div className="sticky bottom-0 bg-gradient-to-t from-[#232526] via-[#282828] to-transparent py-4 flex flex-col sm:flex-row gap-3 justify-center items-center z-10 border-t border-neutral-800">
            {dare.status === 'in_progress' && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <form onSubmit={handleProofSubmit} className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
                  <input type="file" accept="image/*,video/mp4" onChange={handleProofFileChange} className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-contrast hover:file:bg-primary-contrast hover:file:text-primary transition-colors" />
                  <button type="submit" className="bg-primary text-primary-contrast px-4 py-2 rounded font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-contrast" disabled={proofLoading}>
                    {proofLoading && <span className="loader border-2 border-t-2 border-t-primary-contrast border-primary rounded-full w-4 h-4 animate-spin"></span>}
                    {proofLoading ? 'Submitting...' : 'Submit Proof'}
                  </button>
                </form>
                <button onClick={handleChickenOut} className="bg-danger text-white px-4 py-2 rounded font-bold shadow hover:bg-danger-contrast transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-danger-contrast" disabled={chickenOutLoading}>
                  {chickenOutLoading && <span className="loader border-2 border-t-2 border-t-white border-danger rounded-full w-4 h-4 animate-spin"></span>}
                  {chickenOutLoading ? 'Forfeiting...' : 'Forfeit Dare'}
                </button>
              </div>
            )}
          </div>
          {/* --- Timestamps & Meta --- */}
          <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1" title={dayjs(dare.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
              <ClockIcon className="w-4 h-4 text-neutral-400" />
              Created: {dayjs(dare.createdAt).format('MMM D, YYYY h:mm A')}
            </div>
            {dare.completedAt && (
              <div className="flex items-center gap-1" title={dayjs(dare.completedAt).format('YYYY-MM-DD HH:mm:ss')}>
                <CheckCircleIcon className="w-4 h-4 text-green-400" />
                Completed: {dayjs(dare.completedAt).format('MMM D, YYYY h:mm A')}
              </div>
            )}
            {dare.updatedAt && (
              <div className="flex items-center gap-1" title={dayjs(dare.updatedAt).format('YYYY-MM-DD HH:mm:ss')}>
                <ArrowPathIcon className="w-4 h-4 text-blue-400" />
                Last Updated: {dayjs(dare.updatedAt).format('MMM D, YYYY h:mm A')}
              </div>
            )}
          </div>
          {/* Responsive layout: stack on mobile, row on desktop for action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <button
              className="w-full sm:w-auto bg-neutral-700 text-neutral-100 rounded px-4 py-2 font-semibold hover:bg-neutral-600 shadow"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            {(dare.status === 'completed' || dare.status === 'forfeited') && (
              <button
                className="w-full sm:w-auto bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark shadow"
                onClick={() => navigate('/dare/select')}
              >
                Get Another Dare
              </button>
            )}
          </div>
        </>
      ) : null}
      {/* --- Proof Modal --- */}
      {proofModalOpen && dare && dare.proof && (
        <Dialog open={proofModalOpen} onClose={() => setProofModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" />
            <div className="relative bg-neutral-900 rounded-lg p-6 shadow-2xl max-w-lg w-full animate-fade-in-scale">
              <Dialog.Title className="text-lg font-bold mb-4 text-primary">Proof Preview</Dialog.Title>
              {dare.proof.fileUrl && dare.proof.fileUrl.match(/\.(mp4)$/) ? (
                <video src={dare.proof.fileUrl} className="w-full aspect-square rounded-lg" controls autoPlay />
              ) : (
                <img src={dare.proof.fileUrl} alt="Proof" className="w-full aspect-square rounded-lg" />
              )}
              {/* Proof comment below media */}
              {dare.proof.text && (
                <div className="mt-4 p-3 bg-neutral-800 text-neutral-200 rounded shadow-inner text-sm border border-neutral-700">{dare.proof.text}</div>
              )}
              <button className="absolute top-2 right-2 text-neutral-400 hover:text-primary transition-colors" onClick={() => setProofModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
} 