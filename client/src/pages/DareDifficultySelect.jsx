import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRightIcon, FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { retryApiCall } from '../utils/retry';
import { ButtonLoading } from '../components/LoadingSpinner';
import { MainContent, ContentContainer } from '../components/Layout';



export default function DareDifficultySelect() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [difficulty, setDifficulty] = useState('titillating');
  const [loading, setLoading] = useState(false);

  const handleContinue = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use retry mechanism for random dare fetch
      const response = await retryApiCall(() => api.get(`/dares/random?difficulty=${difficulty}`));
      
      if (response.data && response.data._id) {
        showSuccess('Dare found! Redirecting...');

        navigate(`/dare/consent/${response.data._id}`, { state: { dare: response.data } });
      } else {
        showError('No dare found for this difficulty level.');
      }
    } catch (error) {
      console.error('Failed to fetch random dare:', error);
      const apiError = error.response?.data?.error || error.message;
      showError(apiError || 'Failed to fetch dare.');
    } finally {
      setLoading(false);
    }
  }, [difficulty, navigate, showSuccess, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <FireIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Choose Difficulty</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Select the difficulty level for your dare
            </p>
          </div>

          {/* Difficulty Selection Form */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <form onSubmit={handleContinue} className="space-y-8">
              <div>
                <label className="block text-lg font-semibold text-white mb-6">
                  Select Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        difficulty === option.value
                          ? 'border-primary bg-primary/20 text-primary shadow-lg scale-105'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {DIFFICULTY_ICONS[option.value]}
                        <div className="font-semibold text-lg">{option.label}</div>
                      </div>
                      <div className="text-sm opacity-75 leading-relaxed">
                        {option.desc}
                      </div>
                      {option.longDesc && (
                        <div className="text-xs opacity-60 mt-2 leading-relaxed">
                          {option.longDesc}
                        </div>
                      )}
                      {option.examples && (
                        <div className="text-xs opacity-50 mt-1 italic">
                          Examples: {option.examples}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
                >
                  {loading ? (
                    <>
                      <ButtonLoading />
                      Finding Dare...
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="w-6 h-6" />
                      Continue to Dare
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-2xl p-6 border border-blue-800/30">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">How it works</h3>
                <p className="text-blue-300 text-sm leading-relaxed">
                  After selecting a difficulty level, you'll be shown a random dare that matches your choice. 
                  You can then review the dare details and decide whether to accept or decline it. 
                  Remember, you can always decline any dare that makes you uncomfortable.
                </p>
              </div>
            </div>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 