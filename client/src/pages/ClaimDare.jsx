import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

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
  return <span className={`inline-block px-2 py-1 text-xs font-semibold ${badgeClass}`}>{label}</span>;
}

export default function ClaimDare() {
  const { claimToken } = useParams();
  const navigate = useNavigate();
  const [dare, setDare] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/dares/claim/${claimToken}`)
      .then(res => setDare(res.data))
      .catch(() => setError('Dare not found or already claimed.'));
  }, [claimToken]);

  const handleConsent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/dares/claim/${claimToken}`, { demand: 'I consent' });
      // Use dare ID from response for redirect
      const dareId = res.data?.dare?._id || (dare && dare._id);
      if (dareId) {
        navigate(`/dare/${dareId}/perform`);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to consent to dare.');
    }
  };

  if (error) return <div className="max-w-sm mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded text-danger">{error}</div>;
  if (!dare) return <div className="max-w-sm mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded text-neutral-200">Loading...</div>;
  if (submitted) return <div className="max-w-sm mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded text-success">Thank you! You have consented to perform this dare.</div>;

  const c = dare.creator;

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded shadow">
      <div className="aggressive-text text-center mb-4">
        <p className="text-lg">{c.username} wants you to perform</p>
        <h1 className="text-3xl font-bold">Deviant Dare</h1>
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
                  <span key={lim} className="tag bg-danger text-white px-2 py-1 rounded mr-1 mb-1 inline-block text-xs">{lim}</span>
                )) : 'None'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="aggressive-text text-center mb-4">
        <p>Will you agree to perform their dare?</p>
        <h2 className="text-xl font-bold">Of course, there's a catch.</h2>
        <div className="difficulty-details border border-danger p-3 mt-2">
          <div className="heading flex items-center mb-1">
            <span className="prefix font-bold mr-2">difficulty:</span>
            <DifficultyBadge level={dare.difficulty} />
          </div>
          <div className="description text-neutral-200 text-sm">{dare.difficultyDescription}</div>
        </div>
        <form onSubmit={handleConsent} className="call-to-action mt-4">
          <button className="btn btn-primary btn-lg w-full bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark" type="submit">I Consent</button>
        </form>
      </div>
    </div>
  );
} 