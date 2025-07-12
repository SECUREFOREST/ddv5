import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardWidget({ leaders = [], loading = false, title = 'Leaderboard' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div>
        {loading ? (
          <div className="text-neutral-400 py-4">Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="text-neutral-400 py-4">No leaderboard data available.</div>
        ) : (
          <table className="min-w-full text-sm text-left bg-transparent text-[#fff] border border-[#282828]">
            <thead>
              <tr className="bg-[#282828] text-primary">
                <th className="px-2 py-1 font-semibold border-b border-[#282828] text-center w-8">#</th>
                <th className="px-2 py-1 font-semibold border-b border-[#282828]">User</th>
                <th className="px-2 py-1 font-semibold border-b border-[#282828] text-center w-24">Dares Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => {
                const clickable = !!entry.user?.id;
                return (
                  <tr
                    key={entry.user?.id || i}
                    className={`border-b border-[#282828] last:border-b-0 transition-colors ${clickable ? 'hover:bg-neutral-800 cursor-pointer' : ''}`}
                    onClick={() => {
                      if (!clickable) return;
                      if (user && entry.user.id === user.id) {
                        navigate('/profile');
                      } else {
                        navigate(`/profile/${entry.user.id}`);
                      }
                    }}
                  >
                    <td className="px-2 py-1 font-bold text-primary text-center">{i + 1}</td>
                    <td className="px-2 py-1 flex items-center">
                      {entry.user?.avatar ? (
                        <img src={entry.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover mr-2" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center mr-2 font-bold text-base">
                          {entry.user?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                      <span>{entry.user?.username || 'Unknown'}</span>
                    </td>
                    <td className="px-2 py-1 text-neutral-100 text-center">{entry.daresCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 