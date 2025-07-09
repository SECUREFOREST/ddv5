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
    <div className="max-w-2xl mx-auto mt-12 bg-neutral-800 rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-primary">Credits</h1>
      {loading ? (
        <div className="text-center text-neutral-400">Loading credits...</div>
      ) : credits.length === 0 ? (
        <div className="text-center text-neutral-400">No credit data available.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-neutral-800 text-sm text-neutral-100 border border-neutral-900">
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th className="p-2 text-left font-semibold">User</th>
                <th className="p-2 text-left font-semibold">Credits</th>
                <th className="p-2 text-left font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c._id} className="border-t border-neutral-900 hover:bg-neutral-700 transition">
                  <td className="p-2 font-medium text-primary">{c.user?.username || c.userId}</td>
                  <td className="p-2 text-success font-bold">{c.amount}</td>
                  <td className="p-2 text-neutral-400">{new Date(c.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 