import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/Toast';
import { DIFFICULTY_OPTIONS } from '../constants';
import TagsInput from '../components/TagsInput';
import { ButtonLoading } from '../components/LoadingSpinner';

const MOVES = ['rock', 'paper', 'scissors'];
const MOVE_ICONS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

const DIFFICULTY_ICONS = {
  titillating: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  arousing: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  explicit: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  edgy: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  hardcore: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
};

export default function SwitchGameCreate() {
  const { showSuccess, showError } = useToast();
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [move, setMove] = useState('rock');
  const [creating, setCreating] = useState(false);
  const [publicGame, setPublicGame] = useState(true);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/switches', { description, difficulty, move, public: publicGame, tags });
      showSuccess('Switch Game created successfully!');
      setTimeout(() => navigate(`/switches/${res.data._id}`), 1200);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create switch game.';
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Create a Switch Game</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Challenge others with rock, paper, scissors
            </p>
          </div>

          {/* Create Switch Game Form */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-lg font-semibold text-white mb-3">
                  Game Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Describe your switch game..."
                  required
                />
                <div className="text-sm text-neutral-400 mt-2">
                  {description.length}/1000 characters
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        difficulty === option.value
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {DIFFICULTY_ICONS[option.value]}
                        <div className="text-left">
                          <div className="font-semibold">{option.label}</div>
                          <div className="text-sm opacity-75">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Move Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Your Move
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {MOVES.map((moveOption) => (
                    <button
                      key={moveOption}
                      type="button"
                      onClick={() => setMove(moveOption)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-center ${
                        move === moveOption
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{MOVE_ICONS[moveOption]}</div>
                      <div className="font-semibold capitalize">{moveOption}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-lg font-semibold text-white mb-3">
                  Tags
                </label>
                <TagsInput
                  tags={tags}
                  onChange={setTags}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="public"
                    checked={publicGame}
                    onChange={(e) => setPublicGame(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="public" className="text-white">
                    Make this game public
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={creating || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-6 h-6" />
                      Create Switch Game
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/switches')}
                  className="flex-1 bg-gradient-to-r from-neutral-600 to-neutral-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-neutral-700 hover:to-neutral-600 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                  Back to Switch Games
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}