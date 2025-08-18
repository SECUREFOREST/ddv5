import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  NewspaperIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FireIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  HeartIcon,
  PlayIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  MegaphoneIcon,
  WrenchScrewdriverIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { formatRelativeTimeWithTooltip } from '../../utils/dateUtils';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Welcome to Deviant Dare v2.0!",
    content: "We've launched a completely redesigned platform with enhanced privacy controls, role-based leaderboards, and improved switch game mechanics. The new OSA-style draw logic adds exciting new gameplay elements.",
    author: "Dev Team",
    date: "2024-01-15",
    type: "announcement",
    priority: "high",
    category: "platform"
  },
  {
    id: 2,
    title: "Enhanced Privacy Controls Now Available",
    content: "We've implemented comprehensive content expiration options: delete after viewing, delete after 30 days, or never delete (not recommended). Your privacy and safety remain our top priority.",
    author: "Safety Team",
    date: "2024-01-10",
    type: "feature",
    priority: "high",
    category: "safety"
  },
  {
    id: 3,
    title: "New Role-Based Leaderboards",
    content: "Separate leaderboards for Submissives and Dominants are now live! Track your performance in your preferred role and compete with like-minded users.",
    author: "Community Team",
    date: "2024-01-08",
    type: "feature",
    priority: "medium",
    category: "community"
  },
  {
    id: 4,
    title: "Switch Game Improvements",
    content: "The rock-paper-scissors game now features special draw rules: Rock vs Rock (both lose), Paper vs Paper (both win), Scissors vs Scissors (coin flip). Try it out!",
    author: "Game Team",
    date: "2024-01-05",
    type: "feature",
    priority: "medium",
    category: "gameplay"
  },
  {
    id: 5,
    title: "Community Guidelines Reminder",
    content: "Remember to respect consent, use appropriate difficulty levels, and report any concerning content. We're committed to maintaining a safe and supportive environment.",
    author: "Moderation Team",
    date: "2024-01-01",
    type: "guidelines",
    priority: "high",
    category: "community"
  },
  {
    id: 7,
    title: "Hard Limits Feature Enhanced",
    content: "The hard limits feature during registration has been enhanced to better protect user safety. Users can now specify any acts they absolutely won't do, ensuring better consent and safety.",
    author: "Safety Team",
    date: "2023-12-15",
    type: "feature",
    priority: "medium",
    category: "safety"
  },
  {
    id: 8,
    title: "Newsletter Subscription Available",
    content: "Stay updated with new features and community announcements by subscribing to our newsletter during registration. We'll keep you informed about exciting updates and safety features.",
    author: "Community Team",
    date: "2023-12-10",
    type: "feature",
    priority: "low",
    category: "community"
  }
];

const NEWS_TYPES = {
  announcement: {
    label: 'Announcement',
    icon: MegaphoneIcon,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  feature: {
    label: 'Feature',
    icon: SparklesIcon,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  guidelines: {
    label: 'Guidelines',
    icon: BookOpenIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  }
};

const PRIORITY_LEVELS = {
  high: {
    label: 'Important',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  medium: {
    label: 'Medium',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  low: {
    label: 'Low',
    color: 'from-neutral-500 to-neutral-600',
    bgColor: 'bg-neutral-500/20',
    borderColor: 'border-neutral-500/30'
  }
};

const ModernNews = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredNews = NEWS_ITEMS.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = !search || (
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase())
    );
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    
    return matchesFilter && matchesSearch && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const getNewsIcon = (type) => {
    const typeInfo = NEWS_TYPES[type];
    if (!typeInfo) return <NewspaperIcon className="w-6 h-6 text-neutral-400" />;
    
    const Icon = typeInfo.icon;
    return <Icon className={`w-6 h-6 bg-gradient-to-r ${typeInfo.color} bg-clip-text text-transparent`} />;
  };

  const getPriorityInfo = (priority) => {
    return PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.low;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Community News</h1>
                <p className="text-neutral-400 text-sm">Latest announcements and updates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <BellIcon className="w-4 h-4" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <NewspaperIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Community News</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Stay updated with the latest announcements and features
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Get the latest updates on platform features, safety improvements, and community guidelines
          </p>
        </div>

        {/* Filter, Search, and Sort */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-2">
                Search News
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by title, content, or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* News Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-neutral-300 mb-2">
                News Type
              </label>
              <select
                id="type-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              >
                <option value="all">All Types</option>
                {Object.entries(NEWS_TYPES).map(([type, info]) => (
                  <option key={type} value={type}>{info.label}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priority-filter" className="block text-sm font-medium text-neutral-300 mb-2">
                Priority
              </label>
              <select
                id="priority-filter"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              >
                <option value="all">All Priorities</option>
                {Object.entries(PRIORITY_LEVELS).map(([priority, info]) => (
                  <option key={priority} value={priority}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-neutral-300">Sort by:</label>
              <div className="flex space-x-2">
                {[
                  { value: 'recent', label: 'Most Recent', icon: CalendarIcon },
                  { value: 'oldest', label: 'Oldest First', icon: CalendarIcon },
                  { value: 'priority', label: 'Priority', icon: ExclamationTriangleIcon },
                  { value: 'title', label: 'Title', icon: BookOpenIcon }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === option.value
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-neutral-400">
              {filteredNews.length} news items found
            </div>
          </div>
        </div>

        {/* News Items */}
        <div className="space-y-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-12 border border-neutral-600/30">
                <div className="text-neutral-400 text-xl mb-4">No news found</div>
                <p className="text-neutral-500 text-sm">
                  {search || filter !== 'all' || selectedPriority !== 'all'
                    ? 'Try adjusting your search terms or filters.' 
                    : 'No news items available.'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredNews.map((item) => {
              const priorityInfo = getPriorityInfo(item.priority);
              const typeInfo = NEWS_TYPES[item.type];
              
              return (
                <article
                  key={item.id}
                  className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    {/* News Type Icon */}
                    <div className={`p-3 rounded-xl ${typeInfo?.bgColor || 'bg-neutral-500/20'} border ${typeInfo?.borderColor || 'border-neutral-500/30'}`}>
                      {getNewsIcon(item.type)}
                    </div>
                    
                    {/* News Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-xl font-bold text-white">{item.title}</h2>
                        {item.priority === 'high' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${priorityInfo.color} text-white`}>
                            {priorityInfo.label}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-neutral-300 leading-relaxed mb-4">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-neutral-600/50 rounded">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-neutral-600/50 rounded">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <span 
                            className="cursor-help hover:text-neutral-300 transition-colors"
                            title={formatRelativeTimeWithTooltip(item.date).tooltip}
                          >
                            {formatRelativeTimeWithTooltip(item.date).display}
                          </span>
                        </div>
                        {typeInfo && (
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeInfo.color} text-white`}>
                            {typeInfo.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-12 mt-12">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
            <p className="text-neutral-500 text-sm mb-6">
              Built by kinky folks, for kinky folks
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/modern/leaderboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-all duration-200 text-sm font-medium"
              >
                <TrophyIcon className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link 
                to="/modern/activity-feed" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg hover:bg-neutral-500/50 transition-all duration-200 text-sm font-medium"
              >
                <BoltIcon className="w-4 h-4" />
                Activity Feed
              </Link>
              <Link 
                to="/modern/dashboard" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg hover:bg-neutral-500/50 transition-all duration-200 text-sm font-medium"
              >
                <CogIcon className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernNews; 