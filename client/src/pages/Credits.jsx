import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/credits')
      .then(res => setCredits(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCredits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Credits</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading credits...</div>
      ) : credits.length === 0 ? (
        <div className="text-center text-gray-400">No credit data available.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Credits</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((entry, i) => (
                <tr key={entry.user?._id || i} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-2 flex items-center gap-2">
                    {entry.user?.avatar ? (
                      <img src={entry.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-base font-bold">
                        {entry.user?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <span>{entry.user?.username || 'Unknown'}</span>
                  </td>
                  <td className="p-2">{entry.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 