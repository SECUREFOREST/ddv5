import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import { Squares2X2Icon } from '@heroicons/react/24/solid';

export default function SwitchGames() {
  const { user } = useAuth ? useAuth() : { user: null };
  // Placeholder for future error/info state
  const [generalError, setGeneralError] = React.useState('');
  const [generalInfo, setGeneralInfo] = React.useState('');
  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <Squares2X2Icon className="w-7 h-7 text-primary" aria-hidden="true" /> Switch Games
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-8">
        <Link to="/switches/create">
          <button className="w-full md:w-64 bg-primary text-primary-contrast rounded px-4 py-3 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg">Create a Switch Game</button>
        </Link>
        <Link to="/switches/participate">
          <button className="w-full md:w-64 bg-info text-info-contrast rounded px-4 py-3 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-info-contrast flex items-center gap-2 justify-center text-lg shadow-lg">Participate in a Switch Game</button>
        </Link>
      </div>
    </div>
  );
} 