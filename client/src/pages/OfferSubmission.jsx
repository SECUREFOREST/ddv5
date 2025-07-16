import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import TagsInput from '../components/TagsInput';
import { useNavigate } from 'react-router-dom';

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
    if (slotLimit) return setError('You have reached the maximum number of open acts. Complete or reject an act to free up a slot.');
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
    <div className="max-w-lg mx-auto mt-10 bg-neutral-900 border border-neutral-700 rounded p-6 shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-primary">Offer Submission</h1>
      {error && <div className="bg-danger text-danger-contrast px-4 py-2 rounded mb-3">{error}</div>}
      {success && <div className="bg-success text-success-contrast px-4 py-2 rounded mb-3">{success}</div>}
      {slotLimit && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-3">
          You can only have {maxSlots} open acts at a time. Complete or reject an act to free up a slot.
        </div>
      )}
      {cooldown && new Date() < new Date(cooldown) && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-3">
          Cooldown active: You recently rejected an act. You can offer a new submission after <b>{new Date(cooldown).toLocaleTimeString()}</b>.
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block font-semibold mb-1">Difficulty</label>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${difficulty === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))} />
                <span>
                  <b>{opt.label}</b><br/>
                  <span className="text-xs text-neutral-400">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Description / Requirements</label>
          <textarea
            className="w-full rounded bg-neutral-800 border border-neutral-700 text-neutral-100 p-2 min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tags <span className="text-xs text-neutral-400">(optional, for filtering/discovery)</span></label>
          <TagsInput value={tags} onChange={handleTags} disabled={loading} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Content Deletion / Privacy</label>
          <div className="flex flex-col gap-2">
            {PRIVACY_OPTIONS.map(opt => (
              <label key={opt.value} className={`flex items-start gap-2 p-2 rounded cursor-pointer border ${privacy === opt.value ? 'border-primary bg-primary bg-opacity-10' : 'border-neutral-700'}`}>
                <input type="radio" name="privacy" value={opt.value} checked={privacy === opt.value} onChange={() => handlePrivacyChange(opt.value)} disabled={privacyLoading} />
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
          <button type="submit" className="bg-primary text-primary-contrast px-4 py-2 rounded font-bold" disabled={loading || slotLimit || (cooldown && new Date() < new Date(cooldown))}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="bg-neutral-700 text-neutral-100 px-4 py-2 rounded font-bold" onClick={() => navigate(-1)} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 