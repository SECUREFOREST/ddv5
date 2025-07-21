import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import dayjs from 'dayjs';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, XMarkIcon, PhotoIcon, PlayCircleIcon, TagIcon, ArrowPathIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
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

const STATUS_STEPS = [
  { key: 'in_progress', label: 'In Progress', icon: <ClockIcon className="w-5 h-5" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircleIcon className="w-5 h-5" /> },
  { key: 'forfeited', label: 'Forfeited', icon: <ExclamationTriangleIcon className="w-5 h-5" /> },
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
  const [toast, setToast] = React.useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = React.useState('proof');

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

  // Status tracker bar
  const statusStepIdx = dare ? STATUS_STEPS.findIndex(s => s.key === dare.status) : 0;

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Status Tracker Bar */}
      <div className="flex items-center justify-between w-full px-4 py-3">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step.key} className="flex-1 flex flex-col items-center">
            <div className={`rounded-full w-8 h-8 flex items-center justify-center mb-1 text-lg font-bold
              ${dare && dare.status === step.key ? 'bg-primary text-primary-contrast' : 'bg-neutral-700 text-neutral-300'}`}>{step.icon}</div>
            <span className={`text-xs font-semibold ${dare && dare.status === step.key ? 'text-primary' : 'text-neutral-400'}`}>{step.label}</span>
            {idx < STATUS_STEPS.length - 1 && (
              <div className="w-full h-1 bg-neutral-700 mt-1 mb-1" />
            )}
          </div>
        ))}
      </div>
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Dare Reveal</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
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
          {/* --- Tabs for Proof/Grades --- */}
          <div className="flex gap-2 mb-4 border-b border-neutral-700">
            <button className={`px-4 py-2 font-semibold rounded-t ${activeTab === 'proof' ? 'bg-primary text-primary-contrast' : 'bg-neutral-900 text-neutral-300'}`} onClick={() => setActiveTab('proof')}>Proof</button>
            <button className={`px-4 py-2 font-semibold rounded-t ${activeTab === 'grades' ? 'bg-primary text-primary-contrast' : 'bg-neutral-900 text-neutral-300'}`} onClick={() => setActiveTab('grades')}>Grades</button>
          </div>
          {/* --- Tab Content --- */}
          {activeTab === 'proof' && (
            <div className="mb-4">
              {/* Proof Preview Section */}
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
              {/* Proof Submission Form */}
              {dare.status === 'in_progress' && (
                <form role="form" aria-labelledby="dare-reveal-title" onSubmit={handleProofSubmit} className="space-y-4 mt-4" aria-label="Submit Proof Form">
                  <h1 id="dare-reveal-title" className="text-2xl font-bold mb-4">Reveal Dare</h1>
                  <div>
                    <label htmlFor="proof-file" className="block font-semibold mb-1">Upload image or video proof:</label>
                    <input
                      type="file"
                      id="proof-file"
                      className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                      onChange={handleProofFileChange}
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      aria-required="true"
                    />
                    <small className="text-gray-400">Accepted file types: images (jpg, png, gif, webp) or video (mp4). Max size: 10MB.</small>
                  </div>
                  <div>
                    <label htmlFor="proof-text" className="block font-semibold mb-1">Describe what you did (optional):</label>
                    <textarea
                      id="proof-text"
                      className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
                      value={proof}
                      onChange={e => setProof(e.target.value)}
                      rows={3}
                      placeholder="Describe your proof, add context, or leave blank if uploading a file."
                      aria-label="Proof description"
                    />
                  </div>
                  {proofError && <div className="text-danger text-sm font-medium" role="alert">{proofError}</div>}
                  <div className="sticky bottom-0  py-4 flex justify-center z-10 border-t border-neutral-800">
                    <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg" disabled={proofLoading} aria-label="Submit Proof">
                      {proofLoading ? (
                        <svg className="animate-spin h-5 w-5 text-primary-contrast" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      ) : (
                        <>
                          Submit Proof <ArrowRightIcon className="inline w-5 h-5 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              {proofSuccess && <div className="text-success text-center font-medium mt-2">{proofSuccess}</div>}
            </div>
          )}
          {activeTab === 'grades' && (
            <div className="mb-4">
              {/* Grades Section */}
              <div className="bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-800">
                <h2 className="text-lg font-semibold text-center mb-4 text-primary">Grades & Feedback</h2>
                {dare?.grades && dare.grades.length > 0 ? (
                  <ul className="space-y-2 mb-4">
                    {dare.grades.map((g, i) => (
                      <li key={i} className="flex items-center gap-3 bg-neutral-800 rounded p-2">
                        <span className="font-semibold">{g.user?.username || 'Unknown'}</span>
                        <span className="mx-2">→</span>
                        <span className="font-semibold">{g.target?.username || 'Unknown'}</span>
                        <span className="ml-4 bg-primary text-white rounded px-2 py-1 text-xs font-semibold">
                          {g.grade}
                        </span>
                        {g.feedback && <span className="text-gray-400 ml-2">({g.feedback})</span>}
                        {g.createdAt && (
                          <span className="ml-2 text-xs text-gray-500">{new Date(g.createdAt).toLocaleString()}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 mb-4 text-center">No grades yet.</div>
                )}
              </div>
            </div>
          )}
          {/* --- Action Buttons (Sticky Footer on Mobile) --- */}
          <div className="sticky bottom-0  py-4 flex flex-col sm:flex-row gap-3 justify-center items-center z-10 border-t border-neutral-800">
            {dare.status === 'in_progress' && (
              <button onClick={handleChickenOut} className="bg-danger text-white px-4 py-2 rounded font-bold text-base shadow hover:bg-danger-contrast transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-danger-contrast text-lg" disabled={chickenOutLoading}>
                {chickenOutLoading && <span className="loader border-2 border-t-2 border-t-white border-danger rounded-full w-4 h-4 animate-spin"></span>}
                {chickenOutLoading ? 'Forfeiting...' : 'Forfeit Dare'}
              </button>
            )}
            {(dare.status === 'completed' || dare.status === 'forfeited') && (
              <button
                className="w-full sm:w-auto bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg"
                onClick={() => navigate('/dare/select')}
              >
                Get Another Dare
              </button>
            )}
            <button
              className="w-full sm:w-auto bg-neutral-700 text-neutral-100 rounded px-4 py-2 font-bold text-base shadow hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 flex items-center gap-2 justify-center text-lg"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
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
        </>
      ) : null}
    </div>
  );
} 