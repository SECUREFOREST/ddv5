import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-auto bg-transparent" role="contentinfo">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-neutral-500">
              Built by kinky folks, for kinky folks
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/news" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              News
            </Link>
            <Link to="/leaderboard" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              Leaderboard
            </Link>
            <Link to="/activity-feed" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              Activity
            </Link>
            <Link to="/advertise" className="text-neutral-400 hover:text-neutral-200 transition-colors">
              Advertise
            </Link>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} Deviant Dare. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 