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
  SparklesIcon as SparklesIconSolid,
  UserIcon,
  BellIcon
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
      icon: <FireIcon className="w-8 h-8 text-red-500" />,
      title: "Create & Accept",
      description: "Create and accept dares in a safe, supportive environment"
    },
    {
      icon: <TrophyIcon className="w-8 h-8 text-yellow-500" />,
      title: "Compete & Win",
      description: "Compete on the global leaderboard and track your progress"
    },
    {
      icon: <UserGroupIcon className="w-8 h-8 text-blue-500" />,
      title: "Connect",
      description: "Connect with a vibrant community of challenge-seekers"
    },
    {
      icon: <BellIcon className="w-8 h-8 text-green-500" />,
      title: "Stay Updated",
      description: "Get notified about new dares, achievements, and activity"
    },
    {
      icon: <ShareIcon className="w-8 h-8 text-purple-500" />,
      title: "Share Victories",
      description: "Share your victories and inspire others to join the fun"
    },
    {
      icon: <SparklesIcon className="w-8 h-8 text-primary" />,
      title: "Daily Adventure",
      description: "Make every day an adventure with exciting challenges"
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
              <span className="text-xl font-bold text-white">Deviant Dare</span>
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
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{" "}
              <span className="block bg-gradient-to-r from-primary via-red-500 to-pink-500 bg-clip-text text-transparent">
                Deviant Dare
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              A safe, private space to share your sexual fantasies with strangers or lovers. 
              Choose your role and start your adventure.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 flex items-center space-x-2"
            >
              <span>Get Started</span>
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
      </section>

      {/* OSA-Style Role-Based Entry Points */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your Role
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Offer your Submission */}
            <div className="bg-neutral-800/80 border border-pink-500/30 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 rounded-2xl shadow-2xl shadow-pink-500/25 mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Offer your Submission</h3>
                <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
                  Perform tasks for a dominant. Create private offers that only the chosen person can see. Your picture is seen only by them.
                </p>
                <Link to="/register" className="inline-block w-full">
                  <button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Sign Up to Start
                  </button>
                </Link>
              </div>
            </div>

            {/* Demand and Dominate */}
            <div className="bg-neutral-800/80 border border-red-500/30 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl shadow-2xl shadow-red-500/25 mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Demand and Dominate</h3>
                <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
                  Assign tasks for a submissive. Your demand is hidden until they first consent to perform a deviant dare of your choice.
                </p>
                <Link to="/register" className="inline-block w-full">
                  <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Sign Up to Start
                  </button>
                </Link>
              </div>
            </div>

            {/* Compete with a Switch */}
            <div className="bg-neutral-800/80 border border-purple-500/30 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/25 mb-6 mx-auto w-16 h-16 flex items-center justify-center">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Compete with a Switch</h3>
                <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
                  Rock-paper-scissors game where the loser performs the winner's demand.
                </p>
                <Link to="/register" className="inline-block w-full">
                  <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Sign Up to Start
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional CTA Buttons */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25">
                Get Started
              </button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-xl font-semibold text-lg transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50">
                Join Community
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Deviant Dare?
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Built with cutting-edge technology and designed for the most sophisticated gaming experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-neutral-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Started
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Set Your Limits</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Set your limits and difficulty level, then explore a private moment of submission with a friend or a stranger. The picture of your submissive dare is seen only by them.
              </p>
            </div>
            
            <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Describe Your Fantasy</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Describe your dominant fantasy, then share a link with friends or strangers and find out who is willing to perform your demand before they even know what it is.
              </p>
            </div>
            
            <div className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Switch Between Roles</h3>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Do you switch between dominance and submission? Start a switch game with one other friend or stranger and you both get to try and dominate each other.
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Control Your Own Experience</h3>
            <p className="text-neutral-300 leading-relaxed mb-6">
              We like to have kinky fun online, but we wanted to be able to choose who to do it with, and how extreme it should be. Our product team is mostly women, and we've experienced being hassled on adult social networking sites that allow anyone to contact you.
            </p>
            <p className="text-neutral-300 leading-relaxed">
              On Deviant Dare, you can choose to start a kinky interaction with a person of your choice. Whether you're looking to dominate others, submit to them, or play a risky game, you get to create an offer of one of these activities, and then either share the link allowing others to claim it with those you like, or open it up for strangers. If you don't want to initiate things, browse through our list of people offering their own acts, and choose the one who interests you.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Safety & Privacy First
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Share Online Content Safely</h3>
              </div>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Nothing you share online is truly private. However, rather than sharing your erotic photos with everyone on the net, on this site you share them with a private audience of one person. By default, your photos automatically expire in 30 days, so you can focus on having sexy new interactions without leaving nude photos around the web that you've forgotten about.
                </p>
                <p>
                  Want them deleted faster? You can set them to delete immediately after being viewed on our privacy settings page. If someone doesn't feel right to you, you can block them at the press of the button, making all your content invisible to them, even things you have already uploaded.
                </p>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Allow Things to Heat Up</h3>
              </div>
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Our submissive dares come in five levels of explicitness, and we recommend you start at the start. If you're enjoying interactions with some sexy stranger, why not crank things up and allow them a more extreme interaction?
                </p>
                <p>
                  If you're having a good time, you can continue to interact privately with specific users, providing you're both into it. When there's mutual consent, there's room for a lot of fun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border border-primary/30 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already creating, accepting, and sharing exciting dares. 
              Your next challenge awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25">
                  Create Account
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-xl font-semibold text-lg transition-all duration-200 border border-neutral-600/50 hover:border-neutral-500/50">
                  Sign In
                </button>
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
                <span className="text-xl font-bold text-white">Deviant Dare</span>
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
            <p>&copy; 2025 Deviant Dare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLanding; 