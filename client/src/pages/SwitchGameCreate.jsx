import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { DIFFICULTY_OPTIONS, DIFFICULTY_ICONS } from '../constants.jsx';
import { FireIcon, SparklesIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon, PlayIcon } from '@heroicons/react/24/solid';
import TagsInput from '../components/TagsInput';
import { ButtonLoading } from '../components/LoadingSpinner';
import { retryApiCall } from '../utils/retry';
import { validateFormData, VALIDATION_SCHEMAS } from '../utils/validation';
import { MainContent, ContentContainer } from '../components/Layout';
import { FormInput, FormSelect, FormTextarea } from '../components/Form';
import { ErrorAlert } from '../components/Alert';

const MOVES = ['rock', 'paper', 'scissors'];
const MOVE_ICONS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export default function SwitchGameCreate() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('titillating');
  const [move, setMove] = useState('rock');
  const [tags, setTags] = useState([]);
  const [publicGame, setPublicGame] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showRules, setShowRules] = useState(false);



  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    // Enhanced validation with better user feedback
    if (!description.trim()) {
      showError('Description is required.');
      return;
    }
    if (description.trim().length < 10) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length > 1000) {
      showError('Description must be less than 1000 characters.');
      return;
    }
    if (!move) {
      showError('Please select a move.');
      return;
    }
    
    setCreating(true);
    try {
      const res = await retryApiCall(() => api.post('/switches', {
        description,
        difficulty,
        move,
        tags,
        public: publicGame
      }));
      
      if (res.data && res.data._id) {
        showSuccess('Switch game created successfully!');
        navigate(`/switches/${res.data._id}`);
      } else {
        throw new Error('Invalid response: missing game ID');
      }
    } catch (err) {
      console.error('Switch game creation error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create switch game.';
      setCreateError(errorMessage);
      showError(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-3xl mx-auto space-y-8">
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

          {/* Difficulty Selection - Vertical Layout like Dom Demand Create */}
          <div className="space-y-4">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-300 text-left ${difficulty === option.value
                    ? 'border-primary bg-primary/20 text-primary shadow-lg'
                    : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-700/50'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg flex-shrink-0 ${difficulty === option.value
                      ? 'bg-primary/20 text-primary'
                      : 'bg-neutral-700/50 text-neutral-400'
                    }`}>
                    {DIFFICULTY_ICONS[option.value]}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-2">{option.label}</div>
                    <div className="text-sm leading-relaxed text-neutral-300 mb-2">
                      {option.desc}
                    </div>
                    {option.longDesc && (
                      <div className="text-xs text-neutral-400 leading-relaxed mb-2">
                        {option.longDesc}
                      </div>
                    )}
                    {option.examples && (
                      <div className="text-xs text-neutral-500 italic">
                        Examples: {option.examples}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Create Switch Game Form */}
          <div className="bg-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 shadow-xl">
            {/* Error Display */}
            {createError && (
              <ErrorAlert className="mb-6">
                {createError}
              </ErrorAlert>
            )}
            
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Description */}
              <FormTextarea
                label="Game Description"
                placeholder="Describe your switch game..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="h-32 resize-none"
                maxLength={1000}
                showCharacterCount
              />

              {/* Move Selection */}
              <div className="pt-4">
                <label className="block text-lg font-semibold text-white mb-3">
                  Your Move
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {MOVES.map((moveOption) => (
                    <label 
                      key={moveOption} 
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col items-center hover:scale-105
                        ${move === moveOption 
                          ? 'bg-primary/20 text-primary border-primary shadow-lg' 
                          : 'bg-neutral-800/50 text-neutral-300 border-neutral-700 hover:border-primary/50'
                        }`}
                      tabIndex={0} 
                      aria-label={`Select move ${moveOption}`}
                    >
                      <input
                        className="sr-only"
                        required
                        aria-required="true"
                        type="radio"
                        value={moveOption}
                        name="move"
                        checked={move === moveOption}
                        onChange={(e) => setMove(e.target.value)}
                      />
                      <span className="text-4xl mb-2">{MOVE_ICONS[moveOption]}</span>
                      <span className="font-semibold text-lg">{moveOption.charAt(0).toUpperCase() + moveOption.slice(1)}</span>
                    </label>
                  ))}
                </div>
                <p className="text-neutral-400 text-sm">
                  The winner is determined by this game of rock-paper-scissors. 
                  <button 
                    type="button"
                    onClick={() => setShowRules(!showRules)} 
                    className="text-primary underline hover:text-primary-light ml-1"
                  >
                    See game rules
                  </button>
                </p>
                
                {showRules && (
                  <div className="mt-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700">
                    <h4 className="font-bold text-white mb-3">Game rules</h4>
                    <div className="text-sm text-neutral-300 space-y-2">
                      <p><strong>Rock:</strong> Strong and steady. Good against scissors, weak against paper.</p>
                      <p><strong>Paper:</strong> Flexible and adaptable. Good against rock, weak against scissors.</p>
                      <p><strong>Scissors:</strong> Sharp and decisive. Good against paper, weak against rock.</p>
                      <p className="mt-3 text-yellow-300"><strong>Draw scenarios:</strong></p>
                      <p><strong>Rock vs Rock:</strong> Both lose - both must perform each other's dares.</p>
                      <p><strong>Paper vs Paper:</strong> Both win - no dares required.</p>
                      <p><strong>Scissors vs Scissors:</strong> Coin flip determines winner.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="pt-4">
                <label className="block text-lg font-semibold text-white mb-3">
                  Tags
                </label>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="publicGame"
                    checked={publicGame}
                    onChange={(e) => setPublicGame(e.target.checked)}
                    className="w-5 h-5 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="publicGame" className="text-white">
                    Make this game public
                  </label>
                </div>
              </div>

              {/* Removed OSA-Style Privacy Settings */}

            </form>
          </div>

          {/* Submit Button - Centered like Dom Demand Create */}
          <div className="text-center pt-8">
            <button
              onClick={handleCreate}
              disabled={creating || !description.trim() || !move}
              className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-primary-dark hover:to-primary transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto"
            >
              {creating ? (
                <>
                  <ButtonLoading />
                  Creating Switch Game...
                </>
              ) : (
                <>
                  <PlayIcon className="w-6 h-6" />
                  Create Switch Game
                </>
              )}
            </button>
          </div>

          {/* Footer - Matching Dom Demand Create Style */}
          <div className="text-center pt-8">
            <p className="text-neutral-400 text-sm">
              Want to play something else? <a href="/dashboard" className="text-primary hover:text-primary-light underline">Try one of our other options</a>.
            </p>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
}