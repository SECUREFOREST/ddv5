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
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');



  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    
    if (description.trim().length < 10) {
      showError('Description must be at least 10 characters.');
      return;
    }
    if (description.trim().length > 1000) {
      showError('Description must be less than 1000 characters.');
      return;
    }
    
    setCreating(true);
    try {
      const res = await retryApiCall(() => api.post('/switches', {
        creatorDare: {
          description,
          difficulty,
          move
        },
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-4xl mx-auto space-y-8">
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
            {/* Error Display */}
            {createError && (
              <ErrorAlert className="mb-6">
                {createError}
              </ErrorAlert>
            )}
            
            <form onSubmit={handleCreate} className="space-y-8">
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
                          <div className="text-sm opacity-75">{option.desc}</div>
                          {option.longDesc && (
                            <div className="text-xs opacity-60 mt-1">
                              {option.longDesc}
                            </div>
                          )}
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
                  tags={[]} // Removed tags state
                  onChange={() => {}} // Removed tags state
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* Removed public game option */}
              </div>

              {/* Removed OSA-Style Privacy Settings */}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  disabled={creating || !description.trim()}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <ButtonLoading />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-6 h-6" />
                      Create Switch Game
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={() => navigate('/switches')}
                  variant="default"
                  size="lg"
                  className="flex-1"
                >
                  Back to Switch Games
                </Button>
              </div>
            </form>
          </div>
        </MainContent>
      </ContentContainer>
    </div>
  );
}