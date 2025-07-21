import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function NotFound() {
  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-32 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-8 mb-8 overflow-hidden text-center">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-danger h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Page Not Found</h1>
      </div>
      {/* Visually distinct status badge */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-danger/90 border border-danger text-danger-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <ExclamationTriangleIcon className="w-7 h-7" /> 404
        </span>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      <div className="flex flex-col items-center text-center px-6 pb-8">
        <p className="text-lg text-neutral-300 mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
        <Link to="/dashboard" tabIndex={0} aria-label="Go to Dashboard">
          <button className="w-full bg-primary text-primary-contrast rounded px-6 py-3 font-bold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg">Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
} 