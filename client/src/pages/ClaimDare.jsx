import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';

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
      badgeClass = 'bg-black text-white rounded-none';
      label = 'Hardcore';
      break;
    default:
      label = level;
  }
  return <span className={`inline-block px-3 py-2 text-sm font-semibold ${badgeClass}`}>{label}</span>;
}

export default function ClaimDare() {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const [dare, setDare] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    api.get(`/dares/claim/${claimToken}`)
      .then(res => setDare(res.data))
      .catch(() => showNotification('Dare not found or already claimed.', 'error'));
  }, [claimToken]);

  const handleConsent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/dares/claim/${claimToken}`, { demand: 'I consent' });
      // Use dare ID from response for redirect
      const dareId = res.data?.dare?._id || (dare && dare._id);
      if (dareId) {
        navigate(`/dare/${dareId}/perform`);
      } else {
        setSubmitted(true);
        showNotification('Thank you! You have consented to perform this dare.', 'success');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to consent to dare.', 'error');
    }
  };

  if (!dare) return <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden text-neutral-200">Loading...</div>;
  if (submitted) return <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden text-success">Thank you! You have consented to perform this dare.</div>;

  const c = dare.creator;

  return (
    <div className="w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <UserPlusIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Claim Dare
        </h1>
      </div>
      <div className="text-center mb-4">
        <p className="text-lg text-primary">{c.username} wants you to perform</p>
        <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">A Deviant Dare</h1>
      </div>
      <div className="user_info mb-4">
        <table className="table-auto w-full text-white">
          <tbody>
            <tr><td className="font-semibold">Name</td><td>{c.username}</td></tr>
            <tr><td className="font-semibold">Gender</td><td>{c.gender}</td></tr>
            <tr><td className="font-semibold">Age</td><td>{c.age}</td></tr>
            <tr>
              <td className="font-semibold">Dares performed</td>
              <td>
                <div>{c.daresPerformed} completed</div>
                <div>{c.avgGrade ? `Grade: ${c.avgGrade.toFixed(1)}` : 'No grades yet'}</div>
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Dares created</td>
              <td>{c.daresCreated}</td>
            </tr>
            <tr>
              <td className="font-semibold">Hard Limits</td>
              <td>
                {c.limits && c.limits.length > 0 ? c.limits.map(lim => (
                  <span key={lim} className="tag bg-danger text-white px-3 py-2 rounded mr-1 mb-1 inline-block text-sm">{lim}</span>
                )) : 'None'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="text-center mb-4">
        <p className="mb-2">Will you agree to perform their dare?</p>
        <h2 className="text-xl font-bold mb-2 text-primary">Of course, there's a catch.</h2>
        <div className="difficulty-details border border-danger p-3 mt-2 mb-2">
          <div className="heading flex items-center mb-1">
            <span className="prefix font-bold mr-2">difficulty:</span>
            <DifficultyBadge level={dare.difficulty} />
          </div>
          <div className="description text-neutral-200 text-sm">{dare.difficultyDescription}</div>
        </div>
        <form role="form" aria-labelledby="claim-dare-title" onSubmit={handleConsent} className="mt-4">
          <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" type="submit">I Consent</button>
        </form>
      </div>
    </div>
  );
} 