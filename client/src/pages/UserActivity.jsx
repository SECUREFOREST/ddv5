import React, { useState, useEffect } from 'react';
import Tabs from '../components/Tabs';
import { useAuth } from '../context/AuthContext';
import DareCard from '../components/DareCard';
import SwitchGameCard from '../components/SwitchGameCard';
import api from '../api/axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function UserActivity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabIdx, setTabIdx] = useState(0);
  const [activeDares, setActiveDares] = useState([]);
  const [activeSwitchGames, setActiveSwitchGames] = useState([]);
  const [historyDares, setHistoryDares] = useState([]);
  const [historySwitchGames, setHistorySwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    // Fetch active dares (not completed/forfeited/expired)
    const activeStatuses = ['in_progress', 'waiting_for_participant', 'pending'];
    const historyStatuses = ['completed', 'forfeited', 'expired'];
    // Fetch dares where user is creator or performer (active)
    const dareCreatedActiveReq = api.get('/dares', { params: { creator: user._id || user.id, status: activeStatuses.join(',') } });
    const darePerformedActiveReq = api.get('/dares', { params: { participant: user._id || user.id, status: activeStatuses.join(',') } });
    // Fetch dares where user is creator or performer (history)
    const dareCreatedHistoryReq = api.get('/dares', { params: { creator: user._id || user.id, status: historyStatuses.join(',') } });
    const darePerformedHistoryReq = api.get('/dares', { params: { participant: user._id || user.id, status: historyStatuses.join(',') } });
    // Fetch active switch games
    const switchActiveReq = api.get('/switches/performer', { params: { status: activeStatuses.join(',') } });
    // Fetch historical switch games
    const switchHistoryReq = api.get('/switches/history');
    Promise.all([
      dareCreatedActiveReq, darePerformedActiveReq,
      dareCreatedHistoryReq, darePerformedHistoryReq,
      switchActiveReq, switchHistoryReq
    ])
      .then(([
        createdActiveRes, performedActiveRes,
        createdHistoryRes, performedHistoryRes,
        activeSwitchRes, historySwitchRes
      ]) => {
        // Merge and deduplicate dares by _id
        const mergeDares = (...lists) => {
          const map = new Map();
          lists.flat().forEach(d => { if (d && d._id) map.set(d._id, d); });
          return Array.from(map.values());
        };
        setActiveDares(mergeDares(createdActiveRes.data, performedActiveRes.data));
        setHistoryDares(mergeDares(createdHistoryRes.data, performedHistoryRes.data));
        setActiveSwitchGames(Array.isArray(activeSwitchRes.data) ? activeSwitchRes.data : []);
        setHistorySwitchGames(Array.isArray(historySwitchRes.data) ? historySwitchRes.data : []);
      })
      .catch(err => {
        setError('Failed to load activity.');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Compute stats from loaded data
  const dareTotal = activeDares.length + historyDares.length;
  const dareCompleted = historyDares.filter(d => d.status === 'completed').length;
  const dareForfeited = historyDares.filter(d => d.status === 'forfeited').length;
  const dareExpired = historyDares.filter(d => d.status === 'expired').length;
  const dareAvgGrade = (() => {
    const grades = historyDares.flatMap(d => (d.grades || []).map(g => g.grade)).filter(g => typeof g === 'number');
    return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
  })();
  const dareCompletionRate = dareTotal ? ((dareCompleted / dareTotal) * 100).toFixed(1) + '%' : 'N/A';

  const switchTotal = activeSwitchGames.length + historySwitchGames.length;
  const switchCompleted = historySwitchGames.filter(g => g.status === 'completed').length;
  const switchForfeited = historySwitchGames.filter(g => g.status === 'forfeited').length;
  const switchExpired = historySwitchGames.filter(g => g.status === 'expired').length;
  const switchWins = historySwitchGames.filter(g => g.winner && (g.winner._id === (user?._id || user?.id))).length;
  const switchLosses = historySwitchGames.filter(g => g.loser && (g.loser._id === (user?._id || user?.id))).length;
  const switchAvgGrade = (() => {
    const grades = historySwitchGames.flatMap(g => (g.grades || []).map(gr => gr.grade)).filter(g => typeof g === 'number');
    return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
  })();
  const switchCompletionRate = switchTotal ? ((switchCompleted / switchTotal) * 100).toFixed(1) + '%' : 'N/A';

  // Compute bar chart data for dares and switch games completed per month (last 6 months)
  function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
  }
  const dareMonthCounts = Object.fromEntries(months.map(m => [m, 0]));
  const switchMonthCounts = Object.fromEntries(months.map(m => [m, 0]));
  historyDares.forEach(d => {
    if (d.status === 'completed' && d.completedAt) {
      const key = getMonthKey(d.completedAt);
      if (dareMonthCounts[key] !== undefined) dareMonthCounts[key]++;
    }
  });
  historySwitchGames.forEach(g => {
    if (g.status === 'completed' && g.updatedAt) {
      const key = getMonthKey(g.updatedAt);
      if (switchMonthCounts[key] !== undefined) switchMonthCounts[key]++;
    }
  });
  const barData = {
    labels: months,
    datasets: [
      {
        label: 'Dares Completed',
        data: months.map(m => dareMonthCounts[m]),
        backgroundColor: '#D60B20',
      },
      {
        label: 'Switch Games Completed',
        data: months.map(m => switchMonthCounts[m]),
        backgroundColor: '#0B8ED6',
      },
    ],
  };
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Completions Per Month (Last 6 Months)' },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  // Compute pie chart data for switch game win/loss ratio
  const winCount = historySwitchGames.filter(g => g.winner && (g.winner._id === (user?._id || user?.id))).length;
  const lossCount = historySwitchGames.filter(g => g.loser && (g.loser._id === (user?._id || user?.id))).length;
  const pieData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [winCount, lossCount],
        backgroundColor: ['#22c55e', '#ef4444'],
      },
    ],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Switch Game Win/Loss Ratio' },
    },
  };

  const tabs = [
    {
      label: 'Active',
      content: (
        <div className="p-4 text-neutral-300">
          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <DareCard key={i} loading />
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2 text-primary">Active Dares</h2>
              {activeDares.length === 0 ? <div className="mb-4">No active dares.</div> : activeDares.map(dare => (
                <DareCard
                  key={dare._id}
                  {...dare}
                  currentUserId={user._id || user.id}
                  onSubmitProof={() => navigate(`/dares/${dare._id}`)}
                  onForfeit={() => navigate(`/dares/${dare._id}`)}
                />
              ))}
        
              <h2 className="text-lg font-bold mb-2 text-primary">Active Switch Games</h2>
              {activeSwitchGames.length === 0 ? <div>No active switch games.</div> : activeSwitchGames.map(game => (
                <SwitchGameCard
                  key={game._id}
                  game={game}
                  currentUserId={user._id || user.id}
                  onSubmitProof={() => navigate(`/switches/${game._id}`)}
                  onForfeit={() => navigate(`/switches/${game._id}`)}
                />
              ))}
            </>
          )}
        </div>
      ),
    },
    {
      label: 'History',
      content: (
        <div className="p-4 text-neutral-300">
          {loading ? (
            <div className="text-center text-neutral-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2 text-primary">Dare History</h2>
              {historyDares.length === 0 ? <div className="mb-4">No historical dares.</div> : historyDares.map(dare => (
                <DareCard
                  key={dare._id}
                  {...dare}
                  currentUserId={user._id || user.id}
                  onSubmitProof={() => navigate(`/dares/${dare._id}`)}
                  onForfeit={() => navigate(`/dares/${dare._id}`)}
                />
              ))}
              <h2 className="text-lg font-bold mt-6 mb-2 text-primary">Switch Game History</h2>
              {historySwitchGames.length === 0 ? <div>No historical switch games.</div> : historySwitchGames.map(game => (
                <SwitchGameCard key={game._id} game={game} currentUserId={user._id || user.id} />
              ))}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-md sm:max-w-2xl lg:max-w-3xl w-full mx-auto mt-12 bg-[#222] border border-[#282828] rounded p-0 sm:p-8 text-neutral-100">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-primary text-center">Your Activity</h1>
      {/* Stats/Analytics Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#181818] border border-[#282828] rounded p-4">
          <h2 className="text-lg font-bold text-primary mb-2">Dares</h2>
          <div className="text-neutral-300 text-sm">Total: <span className="font-semibold">{dareTotal}</span></div>
          <div className="text-neutral-300 text-sm">Completed: <span className="font-semibold">{dareCompleted}</span></div>
          <div className="text-neutral-300 text-sm">Forfeited: <span className="font-semibold">{dareForfeited}</span></div>
          <div className="text-neutral-300 text-sm">Expired: <span className="font-semibold">{dareExpired}</span></div>
          <div className="text-neutral-300 text-sm">Avg. Grade: <span className="font-semibold">{dareAvgGrade}</span></div>
          <div className="text-neutral-300 text-sm">Completion Rate: <span className="font-semibold">{dareCompletionRate}</span></div>
        </div>
        <div className="bg-[#181818] border border-[#282828] rounded p-4">
          <h2 className="text-lg font-bold text-primary mb-2">Switch Games</h2>
          <div className="text-neutral-300 text-sm">Total: <span className="font-semibold">{switchTotal}</span></div>
          <div className="text-neutral-300 text-sm">Completed: <span className="font-semibold">{switchCompleted}</span></div>
          <div className="text-neutral-300 text-sm">Forfeited: <span className="font-semibold">{switchForfeited}</span></div>
          <div className="text-neutral-300 text-sm">Expired: <span className="font-semibold">{switchExpired}</span></div>
          <div className="text-neutral-300 text-sm">Wins: <span className="font-semibold">{switchWins}</span></div>
          <div className="text-neutral-300 text-sm">Losses: <span className="font-semibold">{switchLosses}</span></div>
          <div className="text-neutral-300 text-sm">Avg. Grade: <span className="font-semibold">{switchAvgGrade}</span></div>
          <div className="text-neutral-300 text-sm">Completion Rate: <span className="font-semibold">{switchCompletionRate}</span></div>
        </div>
      </div>
      {/* Charts Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#181818] border border-[#282828] rounded p-4">
          <Bar data={barData} options={barOptions} height={220} />
        </div>
        <div className="bg-[#181818] border border-[#282828] rounded p-4 flex items-center justify-center">
          <Pie data={pieData} options={pieOptions} height={220} />
        </div>
      </div>
      <Tabs tabs={tabs} selected={tabIdx} onChange={setTabIdx} />
    </div>
  );
} 