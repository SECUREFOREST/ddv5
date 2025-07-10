import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/credits/offers')
      .then(res => setCredits(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCredits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold text-center">Credits</h1>
      </div>
      {loading ? (
        <div className="text-center text-[#888]">Loading credits...</div>
      ) : credits.length === 0 ? (
        <div className="text-center text-[#888]">No credit data available.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full bg-transparent text-sm text-[#fff] border border-[#282828]">
            <thead>
              <tr className="bg-[#282828] text-primary">
                <th className="p-2 text-left font-semibold border-b border-[#282828]">User</th>
                <th className="p-2 text-left font-semibold border-b border-[#282828]">Credits</th>
                <th className="p-2 text-left font-semibold border-b border-[#282828]">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c._id} className="border-t border-[#282828] hover:bg-[#333] transition">
                  <td className="p-2 font-medium text-primary">{c.user?.username || c.userId}</td>
                  <td className="p-2 text-success font-bold">{c.amount}</td>
                  <td className="p-2 text-[#888]">{new Date(c.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 