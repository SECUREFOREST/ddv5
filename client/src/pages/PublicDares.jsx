import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { Banner } from '../components/Modal';

export default function PublicDares() {
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/dares', { params: { public: true, status: 'waiting_for_participant' } }),
      api.get('/switches', { params: { public: true, status: 'waiting_for_participant' } })
    ])
      .then(([daresRes, switchesRes]) => {
        setDares(Array.isArray(daresRes.data) ? daresRes.data : []);
        setSwitchGames(Array.isArray(switchesRes.data) ? switchesRes.data : []);
      })
      .catch(() => setError('Failed to load public dares or switch games.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Participate in Public Dares & Switch Games</h1>
      {error && <Banner type="error" message={error} onClose={() => setError('')} />}
      {loading ? (
        <div className="text-center text-neutral-400 mb-4">Loading...</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-primary">Public Dares</h2>
            {dares.length === 0 ? (
              <div className="text-neutral-400">No public dares available.</div>
            ) : (
              <ul className="space-y-4">
                {dares.map(dare => (
                  <li key={dare._id} className="bg-neutral-900 border border-neutral-700 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      {dare.creator?.avatar ? (
                        <img src={dare.creator.avatar} alt={dare.creator.fullName || dare.creator.username} className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-lg">
                          {dare.creator?.fullName ? dare.creator.fullName.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-lg mb-1">{dare.creator?.fullName || dare.creator?.username || 'Unknown'}</div>
                        <div className="text-xs text-neutral-400 mb-1">Difficulty: {dare.difficulty}</div>
                        <div className="text-xs text-neutral-400">Tags: {dare.tags?.join(', ') || 'None'}</div>
                      </div>
                    </div>
                    <Link to={`/dare/${dare._id}/participate`} className="mt-3 md:mt-0 md:ml-4">
                      <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark">Participate</button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3 text-primary">Public Switch Games</h2>
            {switchGames.length === 0 ? (
              <div className="text-neutral-400">No public switch games available.</div>
            ) : (
              <ul className="space-y-4">
                {switchGames.map(game => (
                  <li key={game._id} className="bg-neutral-900 border border-neutral-700 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      {game.creator?.avatar ? (
                        <img src={game.creator.avatar} alt={game.creator.fullName || game.creator.username} className="w-10 h-10 rounded-full object-cover border border-neutral-700" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold text-lg">
                          {game.creator?.fullName ? game.creator.fullName.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-lg mb-1">{game.creator?.fullName || game.creator?.username || 'Unknown'}</div>
                        <div className="text-xs text-neutral-400 mb-1">Difficulty: {game.creatorDare?.difficulty}</div>
                      </div>
                    </div>
                    <Link to={`/switches/participate/${game._id}`} className="mt-3 md:mt-0 md:ml-4">
                      <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark">Participate</button>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
} 