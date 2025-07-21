import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import TagsInput from '../components/TagsInput';
import { useNavigate } from 'react-router-dom';
import { DocumentPlusIcon } from '@heroicons/react/24/solid';

const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.' },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.' },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.' },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.' },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.' },
];
const PRIVACY_OPTIONS = [
  { value: 'when_viewed', label: 'Delete once viewed', desc: 'As soon as the other person has viewed the image, delete it completely.' },
  { value: '30_days', label: 'Delete in 30 days', desc: 'All pics are deleted thirty days after you upload them, whether they have been viewed or not.' },
  { value: 'never', label: 'Never delete', desc: 'Keep your images on the site permanently. Not recommended. Images will be deleted if you fail to log in for 2 months.' },
];

function mapPrivacyValue(val) {
  if (val === 'when_viewed') return 'delete_after_view';
  if (val === '30_days') return 'delete_after_30_days';
  if (val === 'never') return 'never_delete';
  return val;
}

export default function OfferSubmission() {
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [privacy, setPrivacy] = useState('when_viewed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(null);
  const [slotLimit, setSlotLimit] = useState(false);
  const [slotCount, setSlotCount] = useState(0);
  const [maxSlots, setMaxSlots] = useState(5);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState('');
  const navigate = useNavigate();

  // Fetch slot/cooldown state and privacy setting
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/user/slots'),
      api.get('/safety/content_deletion'),
    ]).then(([slotsRes, privacyRes]) => {
      setSlotCount(slotsRes.data?.openSlots ?? 0);
      setMaxSlots(slotsRes.data?.maxSlots ?? 5);
      setSlotLimit((slotsRes.data?.openSlots ?? 0) >= (slotsRes.data?.maxSlots ?? 5));
      setCooldown(slotsRes.data?.cooldownUntil ?? null);
      setPrivacy(privacyRes.data?.value || 'when_viewed');
    }).catch(() => {
      setError('Failed to load slot or privacy info.');
    }).finally(() => setLoading(false));
  }, []);

  // Handle privacy change
  const handlePrivacyChange = async (val) => {
    setPrivacyLoading(true);
    setPrivacyError('');
    try {
      await api.post('/safety/content_deletion', { value: mapPrivacyValue(val) });
      setPrivacy(val);
    } catch {
      setPrivacyError('Failed to update privacy setting.');
    } finally {
      setPrivacyLoading(false);
    }
  };

  // Deduplicate tags
  const handleTags = (newTags) => {
    setTags([...new Set(newTags.map(t => t.trim().toLowerCase()).filter(Boolean))]);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!difficulty) return setError('Please select a difficulty.');
    if (!description.trim()) return setError('Please enter a description or requirements.');
    if (slotLimit) return setError('You have reached the maximum number of open dares. Complete or reject a dare to free up a slot.');
    if (cooldown && new Date() < new Date(cooldown)) return setError('You are in cooldown and cannot offer a new submission until it ends.');
    setLoading(true);
    try {
      await api.post('/subs', {
        difficulty,
        description,
        tags,
        privacy: mapPrivacyValue(privacy),
      });
      setSuccess('Submission offer created!');
      setTimeout(() => navigate('/performer-dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create submission offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <DocumentPlusIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Offer Submission
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <DocumentPlusIcon className="w-6 h-6" /> Offer Submission
        </span>
      </div>
      <div className="border-t border-neutral-800 my-4" />
      {error && <div className="bg-danger text-danger-contrast px-4 py-2 rounded mb-3">{error}</div>}
      {success && <div className="bg-success text-success-contrast px-4 py-2 rounded mb-3">{success}</div>}
      {slotLimit && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-3">
          You can only have {maxSlots} open dares at a time. Complete or reject a dare to free up a slot.
        </div>
      )}
      {cooldown && new Date() < new Date(cooldown) && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-3">
          Cooldown active: You recently rejected a dare. You can offer a new submission after <b>{new Date(cooldown).toLocaleTimeString()}</b>.
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="offer-difficulty" className="block font-semibold mb-1">Difficulty</label>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" />
                <span>
                  <b>{opt.label}</b><br/>
                  <span className="text-xs text-neutral-400">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="offer-description" className="block font-semibold mb-1">Description / Requirements</label>
          <textarea
            id="offer-description"
            className="w-full rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}
            required
          />
        </div>
        <div>
          <label htmlFor="offer-tags" className="block font-semibold mb-1">Tags <span className="text-xs text-neutral-400">(optional, for filtering/discovery)</span></label>
          <TagsInput value={tags} onChange={handleTags} disabled={loading} />
        </div>
        <div>
          <label htmlFor="offer-privacy" className="block font-semibold mb-1">Content Deletion / Privacy</label>
          <div className="flex flex-col gap-2">
            {PRIVACY_OPTIONS.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${privacy === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                <input type="radio" name="privacy" value={opt.value} checked={privacy === opt.value} onChange={() => handlePrivacyChange(opt.value)} disabled={privacyLoading} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" />
                <span>
                  <b>{opt.label}</b><br/>
                  <span className="text-xs text-neutral-400">{opt.desc}</span>
                </span>
              </label>
            ))}
            {privacyError && <div className="text-danger mt-2">{privacyError}</div>}
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <button type="submit" className="bg-primary text-primary-contrast px-4 py-2 rounded font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg" disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="bg-neutral-700 text-neutral-100 px-4 py-2 rounded font-bold text-base shadow hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 flex items-center gap-2 justify-center text-lg" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 