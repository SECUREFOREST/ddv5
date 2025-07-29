import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/solid';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl text-center">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-6">
                  <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
                <p className="text-xl text-white/80">Sorry, the page you are looking for does not exist or has been moved.</p>
              </div>

              {/* Action Button */}
              <Link to="/dashboard" className="inline-block w-full">
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-3" aria-label="Go to User Dashboard">
                  <HomeIcon className="w-6 h-6" />
                  Go to Dashboard
                </button>
              </Link>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-white/60 text-sm">
                  If you believe this is an error, please contact support or try navigating from the main menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 