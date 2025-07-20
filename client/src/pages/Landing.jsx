import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SparklesIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-20 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-primary" /> Welcome to DDv5!
        </h1>
      </div>
      {/* Visually distinct status badge */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <SparklesIcon className="w-6 h-6" /> Welcome
        </span>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      <div className="flex flex-col items-center text-center px-6 pb-8">
        <img src="/logo.svg" alt="DDv5 Logo" className="w-2/3 max-w-[180px] mx-auto mb-4" aria-label="DDv5 Logo" />
        <p className="text-lg mb-6 text-center text-primary-contrast font-semibold italic">Your journey to productivity starts here.</p>
        <ul className="text-left mb-8 text-neutral-300 list-disc list-inside text-base max-w-xs mx-auto">
          <li className="mb-1">✔️ Log your daily dares and progress</li>
          <li className="mb-1">✔️ Compete on the leaderboard</li>
          <li className="mb-1">✔️ Get notified about new activities</li>
        </ul>
        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs mx-auto">
          <Link to="/login">
            <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast" aria-label="Log In">Log In</button>
          </Link>
          <Link to="/register">
            <button className="w-full border-2 border-primary text-primary rounded px-4 py-2 font-bold text-base shadow hover:bg-neutral-900 hover:border-primary-dark hover:text-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast" aria-label="Register">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 