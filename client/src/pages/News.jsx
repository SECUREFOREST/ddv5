import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Search from '../components/Search';
import { NewspaperIcon, CalendarIcon, UserIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';
import { MainContent, ContentContainer } from '../components/Layout';

const NEWS_ITEMS = [
  {
    id: 1,
    title: "Welcome to Deviant Dare v2.0!",
    content: "We've launched a completely redesigned platform with enhanced privacy controls, role-based leaderboards, and improved switch game mechanics. The new OSA-style draw logic adds exciting new gameplay elements.",
    author: "Dev Team",
    date: "2024-01-15",
    type: "announcement",
    priority: "high"
  },
  {
    id: 2,
    title: "Enhanced Privacy Controls Now Available",
    content: "We've implemented comprehensive content expiration options: delete after viewing, delete after 30 days, or never delete (not recommended). Your privacy and safety remain our top priority.",
    author: "Safety Team",
    date: "2024-01-10",
    type: "feature",
    priority: "high"
  },
  {
    id: 3,
    title: "New Role-Based Leaderboards",
    content: "Separate leaderboards for Submissives and Dominants are now live! Track your performance in your preferred role and compete with like-minded users.",
    author: "Community Team",
    date: "2024-01-08",
    type: "feature",
    priority: "medium"
  },
  {
    id: 4,
    title: "Switch Game Improvements",
    content: "The rock-paper-scissors game now features special draw rules: Rock vs Rock (both lose), Paper vs Paper (both win), Scissors vs Scissors (coin flip). Try it out!",
    author: "Game Team",
    date: "2024-01-05",
    type: "feature",
    priority: "medium"
  },
  {
    id: 5,
    title: "Community Guidelines Reminder",
    content: "Remember to respect consent, use appropriate difficulty levels, and report any concerning content. We're committed to maintaining a safe and supportive environment.",
    author: "Moderation Team",
    date: "2024-01-01",
    type: "guidelines",
    priority: "high"
  },
  {
    id: 7,
    title: "Hard Limits Feature Enhanced",
    content: "The hard limits feature during registration has been enhanced to better protect user safety. Users can now specify any acts they absolutely won't do, ensuring better consent and safety.",
    author: "Safety Team",
    date: "2023-12-15",
    type: "feature",
    priority: "medium"
  },
  {
    id: 8,
    title: "Newsletter Subscription Available",
    content: "Stay updated with new features and community announcements by subscribing to our newsletter during registration. We'll keep you informed about exciting updates and safety features.",
    author: "Community Team",
    date: "2023-12-10",
    type: "feature",
    priority: "low"
  }
];

const getNewsIcon = (type) => {
  switch (type) {
    case 'announcement':
      return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />;
    case 'feature':
      return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
    case 'guidelines':
      return <InformationCircleIcon className="w-6 h-6 text-blue-400" />;
    default:
      return <NewspaperIcon className="w-6 h-6 text-neutral-400" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'border-red-500/50 bg-red-500/10';
    case 'medium':
      return 'border-yellow-500/50 bg-yellow-500/10';
    default:
      return 'border-neutral-500/50 bg-neutral-500/10';
  }
};

export default function News() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredNews = NEWS_ITEMS.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.content.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <NewspaperIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Community News</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Stay updated with the latest announcements and features
            </p>
          </div>

          {/* Filter and Search */}
          <div className="bg-black/80 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  All News
                </button>
                <button
                  onClick={() => setFilter('announcement')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filter === 'announcement'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Announcements
                </button>
                <button
                  onClick={() => setFilter('feature')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filter === 'feature'
                      ? 'bg-green-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => setFilter('guidelines')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    filter === 'guidelines'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Guidelines
                </button>
              </div>

              {/* Search */}
              <div className="flex-1">
                <Search
                  placeholder="Search news..."
                  onSearch={setSearch}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* News Items */}
          <div className="space-y-6">
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">No news found</div>
                <p className="text-neutral-500 text-sm">
                  {search ? 'Try adjusting your search terms.' : 'No news items available.'}
                </p>
              </div>
            ) : (
              filteredNews.map((item) => (
                <article
                  key={item.id}
                  className={`bg-black/80 rounded-2xl p-6 border ${getPriorityColor(item.priority)} shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getNewsIcon(item.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-xl font-bold text-white">{item.title}</h2>
                        {item.priority === 'high' && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                      
                      <p className="text-neutral-300 leading-relaxed mb-4">
                        {item.content}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span title={formatRelativeTimeWithTooltip(item.date).tooltip}>
                            {formatRelativeTimeWithTooltip(item.date).display}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-8">
            <p className="text-neutral-500 text-sm">
              Built by kinky folks, for kinky folks
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/leaderboard" className="text-primary hover:text-primary-300 transition-colors">
                Leaderboard
              </Link>
              <Link to="/activity-feed" className="text-primary hover:text-primary-300 transition-colors">
                Activity Feed
              </Link>
              <Link to="/dashboard" className="text-primary hover:text-primary-300 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 