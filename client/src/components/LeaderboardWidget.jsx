import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

export default function LeaderboardWidget({ leaders = [], loading = false, title = 'Leaderboard' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Memoize current user id for highlight
  const currentUserId = useMemo(() => user?.id || user?._id, [user]);
  return (
    <div className="bg-neutral-900/90 border border-[#282828] rounded-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-neutral-400 py-4 text-center">Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="text-neutral-400 py-4 text-center">No leaderboard data available.</div>
        ) : (
          <table className="min-w-full text-sm text-left bg-transparent text-[#fff] border border-[#282828]">
            <caption className="sr-only">Leaderboard</caption>
            <thead>
              <tr className="bg-[#282828] text-primary">
                <th scope="col" className="px-2 py-1 font-semibold border-b border-[#282828] text-center w-8">#</th>
                <th scope="col" className="px-2 py-1 font-semibold border-b border-[#282828]">User</th>
                <th scope="col" className="px-2 py-1 font-semibold border-b border-[#282828] text-center w-24">Dares Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => {
                const clickable = !!entry.id;
                const isCurrent = currentUserId && (entry.id === currentUserId || entry._id === currentUserId);
                let rowClass = 'border-b border-[#282828] last:border-b-0 transition-colors';
                if (isCurrent) rowClass += ' bg-primary/10';
                else if (clickable) rowClass += ' hover:bg-neutral-800 cursor-pointer';
                return (
                  <tr
                    key={entry.id || i}
                    className={rowClass}
                    onClick={() => {
                      if (!clickable) return;
                      if (isCurrent) {
                        navigate('/profile');
                      } else {
                        navigate(`/profile/${entry.id}`);
                      }
                    }}
                    tabIndex={clickable ? 0 : -1}
                    aria-label={clickable ? `View ${(entry.fullName || entry.username || 'user')}'s profile` : undefined}
                  >
                    <td className="px-2 py-1 font-bold text-primary text-center">
                      {i < 3 ? (
                        <span className={`inline-flex items-center gap-1 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`}>
                          <TrophyIcon className="w-5 h-5" /> {i + 1}
                        </span>
                      ) : (
                        i + 1
                      )}
                    </td>
                    <td className="px-2 py-1 flex items-center">
                      <Avatar user={entry} size={32} alt={`Avatar for ${entry.fullName || entry.username || 'user'}`} />
                      <span className="ml-2 font-semibold text-primary-contrast hover:underline focus:outline-none focus:ring-2 focus:ring-primary-contrast transition-colors" tabIndex={-1}>{entry.fullName || entry.username || 'Unknown'}</span>
                    </td>
                    <td className="px-2 py-1 text-neutral-100 text-center font-bold">{entry.daresCount}</td>
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