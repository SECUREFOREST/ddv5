import React, { useState, useEffect, useMemo } from 'react';
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
import { useToast } from '../context/ToastContext';
import { ChartBarIcon } from '@heroicons/react/24/solid';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function UserActivity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [tabIdx, setTabIdx] = useState(0);
  const [activeDares, setActiveDares] = useState([]);
  const [activeSwitchGames, setActiveSwitchGames] = useState([]);
  const [historyDares, setHistoryDares] = useState([]);
  const [historySwitchGames, setHistorySwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Activate caching for user activity data
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    if (!userId) return;
    
    // Check cache first
    const cacheKey = `user_activity_${userId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setActiveDares(cachedData.activeDares || []);
      setActiveSwitchGames(cachedData.activeSwitchGames || []);
      setHistoryDares(cachedData.historyDares || []);
      setHistorySwitchGames(cachedData.historySwitchGames || []);
      setLoading(false);
      setDataLoaded(true);
      return;
    }
    
    // Reset data when user changes
    if (!dataLoaded) {
      setLoading(true);
      setError('');
    }
    
    // Fetch active dares (not completed/forfeited/expired)
    const activeStatuses = ['in_progress', 'waiting_for_participant', 'pending'];
    const historyStatuses = ['completed', 'forfeited', 'expired'];
    
    Promise.allSettled([
      retryApiCall(() => api.get('/dares', { params: { creator: userId, status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { participant: userId, status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { creator: userId, status: historyStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { participant: userId, status: historyStatuses.join(',') } })),
      retryApiCall(() => api.get('/switches/performer', { params: { status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/switches/history'))
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
        
        const activeDaresData = [];
        const historyDaresData = [];
        
        // Handle active dares
        if (createdActiveRes.status === 'fulfilled') {
          const createdData = Array.isArray(createdActiveRes.value.data) ? createdActiveRes.value.data : [];
          activeDaresData.push(...createdData);
        }
        
        if (performedActiveRes.status === 'fulfilled') {
          const performedData = Array.isArray(performedActiveRes.value.data) ? performedActiveRes.value.data : [];
          activeDaresData.push(...performedData);
        }
        
        // Handle history dares
        if (createdHistoryRes.status === 'fulfilled') {
          const createdHistoryData = Array.isArray(createdHistoryRes.value.data) ? createdHistoryRes.value.data : [];
          historyDaresData.push(...createdHistoryData);
        }
        
        if (performedHistoryRes.status === 'fulfilled') {
          const performedHistoryData = Array.isArray(performedHistoryRes.value.data) ? performedHistoryRes.value.data : [];
          historyDaresData.push(...performedHistoryData);
        }
        
        const mergedActiveDares = mergeDares(activeDaresData);
        const mergedHistoryDares = mergeDares(historyDaresData);
        
        setActiveDares(mergedActiveDares);
        setHistoryDares(mergedHistoryDares);
        
        // Handle switch games
        let activeSwitchData = [];
        if (activeSwitchRes.status === 'fulfilled') {
          activeSwitchData = Array.isArray(activeSwitchRes.value.data) ? activeSwitchRes.value.data : [];
          setActiveSwitchGames(activeSwitchData);
        } else {
          setActiveSwitchGames([]);
        }
        
        let historySwitchData = [];
        if (historySwitchRes.status === 'fulfilled') {
          historySwitchData = Array.isArray(historySwitchRes.value.data) ? historySwitchRes.value.data : [];
          setHistorySwitchGames(historySwitchData);
        } else {
          setHistorySwitchGames([]);
        }
        
        // Cache the successful data
        setCachedData(cacheKey, {
          activeDares: mergedActiveDares,
          historyDares: mergedHistoryDares,
          activeSwitchGames: activeSwitchData,
          historySwitchGames: historySwitchData
        }, 10 * 60 * 1000); // 10 minutes cache
        
        setDataLoaded(true);

      })
      .catch(err => {
        console.error('Failed to load user activity:', err);
        setError('Failed to load activity.');
        showError('Failed to load activity.');
      })
      .finally(() => setLoading(false));
  }, [user, dataLoaded, showError, getCachedData, setCachedData]);

  // Reset dataLoaded when user changes
  useEffect(() => {
    setDataLoaded(false);
  }, [user]);

  // Compute stats from loaded data with memoization
  const stats = useMemo(() => {
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

    return {
      dareTotal,
      dareCompleted,
      dareForfeited,
      dareExpired,
      dareAvgGrade,
      dareCompletionRate,
      switchTotal,
      switchCompleted,
      switchForfeited,
      switchExpired,
      switchWins,
      switchLosses,
      switchAvgGrade,
      switchCompletionRate
    };
  }, [activeDares, historyDares, activeSwitchGames, historySwitchGames, user]);

  const {
    dareTotal,
    dareCompleted,
    dareForfeited,
    dareExpired,
    dareAvgGrade,
    dareCompletionRate,
    switchTotal,
    switchCompleted,
    switchForfeited,
    switchExpired,
    switchWins,
    switchLosses,
    switchAvgGrade,
    switchCompletionRate
  } = stats;

  // Compute bar chart data for dares and switch games completed per month (last 6 months)
  const chartData = useMemo(() => {
    const getMonthKey = (dateStr) => {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();

    const dareMonthlyData = last6Months.map(month => ({
      month,
      count: historyDares.filter(d => d.status === 'completed' && getMonthKey(d.completedAt) === month).length
    }));

    const switchMonthlyData = last6Months.map(month => ({
      month,
      count: historySwitchGames.filter(g => g.status === 'completed' && getMonthKey(g.completedAt) === month).length
    }));

    return {
      barData: {
        labels: last6Months.map(m => new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
        datasets: [
          {
            label: 'Dares Completed',
            data: dareMonthlyData.map(d => d.count),
            backgroundColor: 'rgba(147, 51, 234, 0.8)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 1,
          },
          {
            label: 'Switch Games Completed',
            data: switchMonthlyData.map(d => d.count),
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderColor: 'rgba(236, 72, 153, 1)',
            borderWidth: 1,
          },
        ],
      },
      pieData: {
        labels: ['Completed', 'Forfeited', 'Expired'],
        datasets: [
          {
            data: [dareCompleted + switchCompleted, dareForfeited + switchForfeited, dareExpired + switchExpired],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(156, 163, 175, 0.8)',
            ],
            borderColor: [
              'rgba(34, 197, 94, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(156, 163, 175, 1)',
            ],
            borderWidth: 1,
          },
        ],
      }
    };
  }, [historyDares, historySwitchGames, dareCompleted, switchCompleted, dareForfeited, switchForfeited, dareExpired, switchExpired]);

  const { barData, pieData } = chartData;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };



  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
    },
  };

  const tabs = [
    {
      label: 'Active',
      content: (
        <div className="p-4 text-white/80">
          {loading ? (
            <div className="text-center text-white/60">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2 text-white">Active Dares</h2>
              {activeDares.length === 0 ? <div className="mb-4 text-white/60">No active dares.</div> : activeDares.map(dare => (
                <DareCard
                  key={dare._id}
                  {...dare}
                  currentUserId={user._id || user.id}
                  onSubmitProof={() => navigate(`/dares/${dare._id}`)}
                  onForfeit={() => navigate(`/dares/${dare._id}`)}
                />
              ))}
        
              <h2 className="text-lg font-bold mb-2 text-white">Active Switch Games</h2>
              {activeSwitchGames.length === 0 ? <div className="text-white/60">No active switch games.</div> : activeSwitchGames.map(game => (
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
        <div className="p-4 text-white/80">
          {loading ? (
            <div className="text-center text-white/60">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-2 text-white">Dare History</h2>
              {historyDares.length === 0 ? <div className="mb-4 text-white/60">No historical dares.</div> : historyDares.map(dare => (
                <DareCard
                  key={dare._id}
                  {...dare}
                  currentUserId={user._id || user.id}
                  onSubmitProof={() => navigate(`/dares/${dare._id}`)}
                  onForfeit={() => navigate(`/dares/${dare._id}`)}
                />
              ))}
              <h2 className="text-lg font-bold mt-6 mb-2 text-white">Switch Game History</h2>
              {historySwitchGames.length === 0 ? <div className="text-white/60">No historical switch games.</div> : historySwitchGames.map(game => (
                <SwitchGameCard key={game._id} game={game} currentUserId={user._id || user.id} />
              ))}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <ChartBarIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Your Activity</h1>
            </div>
            <p className="text-xl text-white/80">Track your dares and switch games performance</p>
          </div>

          {/* Stats/Analytics Section */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Dares
              </h2>
              <div className="space-y-2 text-white/80 text-sm">
                <div>Total: <span className="font-semibold text-white">{dareTotal}</span></div>
                <div>Completed: <span className="font-semibold text-green-300">{dareCompleted}</span></div>
                <div>Forfeited: <span className="font-semibold text-red-300">{dareForfeited}</span></div>
                <div>Expired: <span className="font-semibold text-neutral-300">{dareExpired}</span></div>
                <div>Avg. Grade: <span className="font-semibold text-purple-300">{dareAvgGrade}</span></div>
                <div>Completion Rate: <span className="font-semibold text-blue-300">{dareCompletionRate}</span></div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Switch Games
              </h2>
              <div className="space-y-2 text-white/80 text-sm">
                <div>Total: <span className="font-semibold text-white">{switchTotal}</span></div>
                <div>Completed: <span className="font-semibold text-green-300">{switchCompleted}</span></div>
                <div>Forfeited: <span className="font-semibold text-red-300">{switchForfeited}</span></div>
                <div>Expired: <span className="font-semibold text-neutral-300">{switchExpired}</span></div>
                <div>Wins: <span className="font-semibold text-green-300">{switchWins}</span></div>
                <div>Losses: <span className="font-semibold text-red-300">{switchLosses}</span></div>
                <div>Avg. Grade: <span className="font-semibold text-purple-300">{switchAvgGrade}</span></div>
                <div>Completion Rate: <span className="font-semibold text-blue-300">{switchCompletionRate}</span></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
              <Bar data={barData} options={barOptions} height={220} />
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl flex items-center justify-center">
              <Pie data={pieData} options={pieOptions} height={220} />
            </div>
          </div>

          <Tabs tabs={tabs} selected={tabIdx} onChange={setTabIdx} />
        </div>
      </main>
    </div>
  );
} 