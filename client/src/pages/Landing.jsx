import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SparklesIcon } from '@heroicons/react/24/solid';
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

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-8 mb-12 overflow-hidden">
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
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-primary" /> Deviant Dare
        </h1>
      </div>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="flex flex-col items-center text-center px-6 pb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Dare. Compete. Connect.</h2>
          <p className="text-lg mb-8 text-center text-primary-contrast font-semibold leading-relaxed">Deviant Dare is the ultimate platform for social dares, challenges, and friendly competition. Create, accept, and share dares with friends or the community. Climb the leaderboard, earn rewards, and make every day an adventure!</p>
          <h3 className="text-lg font-semibold text-primary mb-4">Why Deviant Dare?</h3>
          <ul className="text-left mb-10 text-neutral-300 list-disc list-inside text-base max-w-xs mx-auto space-y-3">
            <li className="flex items-start gap-2"><span className="text-xl">🔥</span> <span><b>Create</b> and <b>accept</b> dares in a safe, supportive environment</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">🏆</span> <span><b>Compete</b> on the global leaderboard and track your progress</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">🤝</span> <span><b>Connect</b> with a vibrant community of challenge-seekers</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">🔔</span> <span><b>Get notified</b> about new dares, achievements, and activity</span></li>
            <li className="flex items-start gap-2"><span className="text-xl">🎉</span> <span><b>Share</b> your victories and inspire others to join the fun</span></li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full max-w-xs mx-auto">
            <Link to="/login" className="flex-1">
              <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg" aria-label="Log In">Log In</button>
            </Link>
            <Link to="/register" className="flex-1">
              <button className="w-full border-2 border-primary text-primary rounded px-4 py-2 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg" aria-label="Register">Register</button>
            </Link>
          </div>
          <div className="mt-10 text-neutral-400 text-xs max-w-md mx-auto">
            <p><b>SEO Keywords:</b> social dares, challenge app, leaderboard, online dares, friendly competition, community, Deviant Dare, create dares, accept dares, share dares, gamified challenges, rewards, achievements, fun, safe, adventure</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing; 