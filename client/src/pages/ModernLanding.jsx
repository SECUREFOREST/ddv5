import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ShareIcon,
  CogIcon,
  ArrowRightIcon,
  UserPlusIcon,
  SparklesIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/outline';

const ModernLanding = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <UsersIcon className="w-12 h-12" />,
      title: "Multi-Participant Games",
      description: "Create and join sophisticated switch games with role switching, task management, and real-time collaboration."
    },
    {
      icon: <TrophyIcon className="w-12 h-12" />,
      title: "Advanced Task System",
      description: "Comprehensive task creation, assignment, submission, and grading with proof verification and accountability."
    },
    {
      icon: <ChartBarIcon className="w-12 h-12" />,
      title: "Performance Analytics",
      description: "Detailed performance tracking, role breakdown, difficulty progression, and achievement systems."
    },
    {
      icon: <GlobeAltIcon className="w-12 h-12" />,
      title: "Community Features",
      description: "Public acts, community challenges, social interactions, and discovery of new opportunities."
    },
    {
      icon: <ShieldCheckIcon className="w-12 h-12" />,
      title: "Safety & Moderation",
      description: "Comprehensive safety features, reporting systems, content moderation, and community guidelines."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50K+", label: "Completed Tasks" },
    { number: "1K+", label: "Switch Games" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-neutral-900/95 backdrop-blur-md border-b border-neutral-700/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">OSA</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#about" className="text-neutral-300 hover:text-white transition-colors duration-200">About</a>
              <a href="#safety" className="text-neutral-300 hover:text-white transition-colors duration-200">Safety</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
              <SparklesIconSolid className="w-4 h-4" />
              <span>Modern OSA Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover the Future of
              <span className="block bg-gradient-to-r from-primary via-primary-dark to-red-600 bg-clip-text text-transparent">
                Switch Games
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Experience the most advanced platform for multi-participant games, role switching, 
              and community-driven challenges with modern design and sophisticated functionality.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/modern"
              className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-xl font-semibold text-lg transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50"
            >
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-neutral-400 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for Modern Gaming
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Built with cutting-edge technology and designed for the most sophisticated gaming experiences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Showcase */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border-2 transition-all duration-500 ${
                    currentFeature === index
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : 'border-neutral-700/50 bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      currentFeature === index
                        ? 'bg-primary text-white'
                        : 'bg-neutral-700/50 text-neutral-400'
                    }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                        currentFeature === index ? 'text-primary' : 'text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className="text-neutral-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Demo */}
            <div className="relative">
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Live Demo</h3>
                  <p className="text-neutral-400">Experience the platform in action</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-white text-sm">Game Creation</span>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-white text-sm">Task Management</span>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      <span className="text-white text-sm">Role Switching</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link
                    to="/modern"
                    className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center space-x-2"
                  >
                    <span>Try Demo</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built on Legacy Excellence
              </h2>
              <p className="text-xl text-neutral-300 mb-8 leading-relaxed">
                OSA represents over a decade of development in sophisticated gaming platforms. 
                Our modern UI system preserves the advanced functionality while delivering 
                contemporary design and enhanced user experience.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-400" />
                  <span className="text-white">Advanced Chart.js Architecture</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-400" />
                  <span className="text-white">Professional Animation Systems</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-400" />
                  <span className="text-white">Enterprise-Grade Component Architecture</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-6 h-6 text-green-400" />
                  <span className="text-white">Real-Time Communication Systems</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CogIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Technical Excellence</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Chart.js Integration</span>
                      <span className="text-green-400">Advanced</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Animation System</span>
                      <span className="text-green-400">Professional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Component Architecture</span>
                      <span className="text-green-400">Enterprise</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Real-Time Features</span>
                      <span className="text-green-400">Advanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Safety & Moderation First
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-12">
            Your safety and well-being are our top priorities. We provide comprehensive 
            tools and systems to ensure a secure and respectful gaming environment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Content Moderation</h3>
              <p className="text-neutral-400">
                Advanced AI-powered content filtering and human moderation teams
              </p>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FlagIcon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Reporting System</h3>
              <p className="text-neutral-400">
                Comprehensive reporting tools with quick response times
              </p>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Guidelines</h3>
              <p className="text-neutral-400">
                Clear rules and guidelines for respectful participation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-2xl border border-primary/30 p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-neutral-300 mb-8">
              Join thousands of users already enjoying the most advanced switch gaming platform
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/register"
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 flex items-center space-x-2"
              >
                <span>Create Account</span>
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-xl font-semibold text-lg transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-8 lg:px-12 border-t border-neutral-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <FireIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">OSA</span>
              </div>
              <p className="text-neutral-400">
                The most advanced platform for switch gaming and community challenges.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#about" className="hover:text-white transition-colors duration-200">About</a></li>
                <li><Link to="/modern" className="hover:text-white transition-colors duration-200">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#safety" className="hover:text-white transition-colors duration-200">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link to="/guidelines" className="hover:text-white transition-colors duration-200">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-700/50 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 OSA Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLanding; 