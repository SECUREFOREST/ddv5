import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const ModernUIDemo = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tabIdx, setTabIdx] = useState(0);
  const [tags, setTags] = useState(["react", "migration", "modern-ui"]);
  const [progress, setProgress] = useState(42);
  const [markdown, setMarkdown] = useState(`# Modern UI Demo

## Features
- **Bold** and _italic_ text
- [Links](https://example.com)
- \`inline code\`
- Lists and more!

> This is a blockquote example

\`\`\`javascript
// Code block example
function hello() {
  console.log("Hello, Modern UI!");
}
\`\`\``);
  const [countdownTarget, setCountdownTarget] = useState(null);
  const [countdownDone, setCountdownDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(0);

  const handleTagAdd = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const startCountdown = () => {
    setCountdownTarget(Date.now() + 2 * 60 * 1000);
    setCountdownDone(false);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">UI Demo</h1>
                <p className="text-neutral-400 text-sm">Interactive demonstration of modern UI components</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Demo Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Modern UI Demo</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Interactive demonstration of UI components
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-4xl mx-auto">
            Explore our comprehensive collection of modern, accessible, and beautiful UI components designed for the OSA platform.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-12">
          <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-8 py-4 font-bold text-lg shadow-lg">
            <SparklesIcon className="w-6 h-6" /> 
            Modern UI Component Library
          </span>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Button Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-primary" />
              Button Components
            </h3>
            <div className="space-y-4">
              <button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => setModalOpen(true)}
              >
                Open Modal
              </button>
              <button 
                className="w-full bg-neutral-700/50 text-white border border-neutral-600/50 rounded-xl px-6 py-3 font-bold transition-all duration-200 hover:bg-neutral-600/50"
                onClick={() => showSuccess('Secondary button clicked!')}
              >
                Secondary Button
              </button>
              <button 
                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={() => showError('Danger button clicked!')}
              >
                Danger Button
              </button>
            </div>
          </div>

          {/* Alert Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
              Alert Components
            </h3>
            <div className="space-y-4">
              <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 text-yellow-300 rounded-xl px-4 py-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                This is a warning alert.
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-300 rounded-xl px-4 py-3 flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                This is a success alert.
              </div>
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-300 rounded-xl px-4 py-3 flex items-center gap-2">
                <XMarkIcon className="w-5 h-5" />
                This is a danger alert.
              </div>
              <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 rounded-xl px-4 py-3 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                This is an info alert.
              </div>
            </div>
          </div>

          {/* Table Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6 text-blue-400" />
              Table Component
            </h3>
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full bg-neutral-700/30 text-sm text-white border border-neutral-600/30" role="table">
                <caption className="sr-only">Demo Table</caption>
                <thead>
                  <tr className="bg-neutral-700/50">
                    <th scope="col" className="p-3 text-left font-bold text-white">Name</th>
                    <th scope="col" className="p-3 text-left font-bold text-white">Role</th>
                    <th scope="col" className="p-3 text-left font-bold text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-neutral-600/30 hover:bg-neutral-700/20 transition-colors duration-200">
                    <td className="p-3 font-medium text-purple-300">Alice</td>
                    <td className="p-3 text-blue-300 font-bold">Admin</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-xs font-bold">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t border-neutral-600/30 hover:bg-neutral-700/20 transition-colors duration-200">
                    <td className="p-3 font-medium text-purple-300">Bob</td>
                    <td className="p-3 text-blue-300 font-bold">User</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-bold">
                        Banned
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Badge Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <StarIcon className="w-6 h-6 text-yellow-400" />
              Badge Components
            </h3>
            <div className="flex flex-wrap gap-3">
              <span className="inline-block bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-2 text-sm font-bold">Primary</span>
              <span className="inline-block bg-green-500/20 border border-green-500/30 text-green-300 rounded-full px-4 py-2 text-sm font-bold">Success</span>
              <span className="inline-block bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-4 py-2 text-sm font-bold">Info</span>
              <span className="inline-block bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-full px-4 py-2 text-sm font-bold">Warning</span>
              <span className="inline-block bg-red-500/20 border border-red-500/30 text-red-300 rounded-full px-4 py-2 text-sm font-bold">Danger</span>
            </div>
          </div>

          {/* Input Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <CogIcon className="w-6 h-6 text-purple-400" />
              Input Components
            </h3>
            <div className="space-y-4">
              <input
                className="w-full rounded-xl border border-neutral-600/50 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-neutral-700/50 placeholder-neutral-400 transition-all duration-200"
                placeholder="Type here..."
              />
              <button 
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => showSuccess('Form submitted successfully!')}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Card Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <BookOpenIcon className="w-6 h-6 text-green-400" />
              Card Component
            </h3>
            <div className="bg-neutral-700/30 rounded-xl border border-neutral-600/30 overflow-hidden">
              <div className="bg-neutral-700/50 px-4 py-3 border-b border-neutral-600/30">
                <h4 className="font-bold text-white">Card Header</h4>
              </div>
              <div className="p-4">
                <p className="text-neutral-300">This is the card body. You can put any content here.</p>
              </div>
              <div className="bg-neutral-700/50 px-4 py-3 border-t border-neutral-600/30">
                <span className="text-neutral-400 text-sm">Card Footer</span>
              </div>
            </div>
          </div>

          {/* Tabs Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              Tabs Component
            </h3>
            <div className="space-y-4">
              <div className="flex space-x-1 bg-neutral-700/30 rounded-lg p-1">
                {[
                  { label: 'Tab 1', disabled: false },
                  { label: 'Tab 2', disabled: false },
                  { label: 'Tab 3', disabled: true }
                ].map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => !tab.disabled && setTabIdx(index)}
                    disabled={tab.disabled}
                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      tabIdx === index
                        ? 'bg-primary text-white shadow-lg'
                        : tab.disabled
                        ? 'bg-neutral-600/30 text-neutral-500 cursor-not-allowed'
                        : 'bg-transparent text-neutral-300 hover:bg-neutral-600/30'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                <div className="text-neutral-300">
                  Content for Tab {tabIdx + 1}
                </div>
              </div>
            </div>
          </div>

          {/* Dropdown Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <ChevronDownIcon className="w-6 h-6 text-blue-400" />
              Dropdown Component
            </h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-between"
              >
                Open Dropdown
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-700/90 backdrop-blur-sm border border-neutral-600/30 rounded-xl shadow-xl z-10">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        showSuccess('Action 1 executed!');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-neutral-600/50 transition-colors duration-200"
                    >
                      Action 1
                    </button>
                    <button
                      onClick={() => {
                        showSuccess('Action 2 executed!');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-neutral-600/50 transition-colors duration-200"
                    >
                      Action 2
                    </button>
                    <button
                      disabled
                      className="w-full px-4 py-3 text-left text-neutral-500 cursor-not-allowed"
                    >
                      Disabled
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TagsInput Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <PlusIcon className="w-6 h-6 text-green-400" />
              Tags Input
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-3 py-1 text-sm font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="hover:bg-primary/30 rounded-full p-1 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 rounded-xl border border-neutral-600/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 bg-neutral-700/50 placeholder-neutral-400"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add a tag..."]');
                    if (input && input.value) {
                      handleTagAdd(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ProgressBar Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <PlayIcon className="w-6 h-6 text-blue-400" />
              Progress Bar
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral-300">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-neutral-700/50 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="w-full accent-primary bg-neutral-700/50"
              />
            </div>
          </div>

          {/* Countdown Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-red-400" />
              Countdown Timer
            </h3>
            <div className="space-y-4">
              <button
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={startCountdown}
              >
                Start 2-Minute Countdown
              </button>
              {countdownTarget && !countdownDone && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatTime(countdownTarget - Date.now())}
                  </div>
                  <div className="text-sm text-neutral-400">Time remaining</div>
                </div>
              )}
              {countdownDone && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">Countdown Complete!</div>
                  <div className="text-sm text-neutral-400">Time's up!</div>
                </div>
              )}
            </div>
          </div>

          {/* Accordion Component */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
              <ChevronDownIcon className="w-6 h-6 text-purple-400" />
              Accordion Component
            </h3>
            <div className="space-y-3">
              {[
                { title: "What is this app?", content: "This is a modern React app with a custom UI component library, admin panel, and full-featured backend for dares." },
                { title: "How does the countdown work?", content: "The countdown component uses setInterval to update the time remaining every second, and calls an onComplete callback when finished." },
                { title: "What are the key features?", content: "Modern UI components, responsive design, accessibility features, and comprehensive functionality for the OSA platform." }
              ].map((item, index) => (
                <div key={index} className="border border-neutral-600/30 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setAccordionOpen(accordionOpen === index ? -1 : index)}
                    className="w-full px-4 py-3 text-left bg-neutral-700/30 hover:bg-neutral-600/30 transition-colors duration-200 flex items-center justify-between"
                  >
                    <span className="font-medium text-white">{item.title}</span>
                    <ChevronDownIcon className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${accordionOpen === index ? 'rotate-180' : ''}`} />
                  </button>
                  {accordionOpen === index && (
                    <div className="px-4 py-3 bg-neutral-700/20 border-t border-neutral-600/30">
                      <p className="text-neutral-300 text-sm">{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-800/90 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-white">Modal Title</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6 text-neutral-400" />
                </button>
              </div>
              <p className="text-neutral-300 mb-8 text-lg">
                This is a modal dialog. Click outside or press Escape to close.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  className="px-6 py-3 bg-neutral-700/50 text-white rounded-xl font-bold hover:bg-neutral-600/50 transition-colors duration-200"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  onClick={() => setModalOpen(false)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernUIDemo;
