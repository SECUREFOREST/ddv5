import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SparklesIcon, FireIcon, TrophyIcon, UserGroupIcon, BellIcon, ShareIcon } from '@heroicons/react/24/solid';
import { Helmet } from 'react-helmet';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <Helmet>
        <title>Deviant Dare | Social Dares, Challenges & Leaderboards</title>
        <meta name="description" content="Deviant Dare is the ultimate social dare and challenge platform. Create, accept, and share dares, climb the leaderboard, and join a vibrant community. Fun, safe, and always exciting!" />
        <meta property="og:title" content="Deviant Dare | Social Dares, Challenges & Leaderboards" />
        <meta property="og:description" content="Deviant Dare is the ultimate social dare and challenge platform. Create, accept, and share dares, climb the leaderboard, and join a vibrant community. Fun, safe, and always exciting!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://deviantdare.com/" />
        <meta property="og:image" content="/logo.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Deviant Dare | Social Dares, Challenges & Leaderboards" />
        <meta name="twitter:description" content="Deviant Dare is the ultimate social dare and challenge platform. Create, accept, and share dares, climb the leaderboard, and join a vibrant community. Fun, safe, and always exciting!" />
        <meta name="twitter:image" content="/logo.svg" />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <SparklesIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary via-red-500 to-pink-500 bg-clip-text text-transparent">
                Deviant Dare
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for social dares, challenges, and friendly competition. 
              Create, accept, and share dares with friends or the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-2xl shadow-primary/25 hover:shadow-3xl">
                  Get Started
                </button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-primary text-primary px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-primary hover:text-white transform hover:-translate-y-1 shadow-lg">
                  Join Community
                </button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Why Choose Deviant Dare?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
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

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 border border-primary/30 rounded-3xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already creating, accepting, and sharing exciting dares. 
              Your next challenge awaits!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-2xl shadow-primary/25">
                  Create Account
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-neutral-800 hover:bg-neutral-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* SEO Footer */}
          <div className="mt-16 text-center">
            <p className="text-neutral-500 text-sm max-w-4xl mx-auto">
              <strong>SEO Keywords:</strong> social dares, challenge app, leaderboard, online dares, friendly competition, community, Deviant Dare, create dares, accept dares, share dares, gamified challenges, rewards, achievements, fun, safe, adventure
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing; 