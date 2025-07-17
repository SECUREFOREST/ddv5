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
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <Squares2X2Icon className="w-7 h-7 text-primary" aria-hidden="true" /> Switch Games
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <Squares2X2Icon className="w-6 h-6" /> Switch Games
        </span>
      </div>
      <div className="border-t border-neutral-800 my-4" />
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-8">
        <Link to="/switches/create">
          <button className="w-full md:w-64 bg-primary text-primary-contrast rounded px-4 py-3 font-semibold text-lg hover:bg-primary-dark">Create a Switch Game</button>
        </Link>
        <Link to="/switches/participate">
          <button className="w-full md:w-64 bg-info text-info-contrast rounded px-4 py-3 font-semibold text-lg hover:bg-info-dark">Participate in a Switch Game</button>
        </Link>
      </div>
    </div>
  );
} 