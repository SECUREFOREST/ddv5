import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ShareIcon,
  CogIcon,
  ArrowLeftIcon,
  UserPlusIcon,

  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernSwitchGameTaskManager = () => {
  const [game, setGame] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGame = {
          id: 'game_001',
          title: 'Weekend Role Switch Challenge',
          difficulty: 'explicit',
          status: 'in_progress',
          currentPhase: 'task_execution',
          currentParticipants: 4,
          maxParticipants: 6,
          allowRoleSwitching: true,
          creator: {
            id: 'user_123',
            username: 'GameMaster',
            avatar: '/api/avatars/user_123.jpg'
          },
          gameStats: {
            totalTasks: 12,
            completedTasks: 7,
            averageScore: 8.2,
            totalPoints: 246
          }
        };

        const mockTasks = [
          {
            id: 'task_001',
            title: 'Evening Submission Task',
            description: 'Complete evening routine with photographic evidence. Include at least 3 different activities.',
            difficulty: 'explicit',
            assignedTo: 'user_456',
            assignedRole: 'sub',
            dueAt: '2024-01-20T18:00:00Z',
            points: 15,
            status: 'assigned',
            evidence: [],
            feedback: null,
            grade: null,
            createdAt: '2024-01-20T06:00:00Z',
            timeRemaining: 7200000 // 2 hours
          },
          {
            id: 'task_002',
            title: 'Creative Dominance Display',
            description: 'Create a creative display of dominance. Be imaginative and artistic.',
            difficulty: 'edgy',
            assignedTo: 'user_789',
            assignedRole: 'dom',
            dueAt: '2024-01-20T18:00:00Z',
            points: 20,
            status: 'in_progress',
            evidence: [],
            feedback: null,
            grade: null,
            createdAt: '2024-01-20T06:00:00Z',
            timeRemaining: 7200000
          },
          {
            id: 'task_003',
            title: 'Role Adaptation Challenge',
            description: 'Demonstrate your ability to adapt between roles. Switch from submissive to dominant behavior.',
            difficulty: 'explicit',
            assignedTo: 'user_101',
            assignedRole: 'switch',
            dueAt: '2024-01-20T18:00:00Z',
            points: 25,
            status: 'completed',
            evidence: [
              {
                id: 'ev_001',
                type: 'photo',
                url: '/api/evidence/ev_001.jpg',
                submittedAt: '2024-01-20T16:30:00Z',
                description: 'Role switching demonstration'
              }
            ],
            feedback: 'Excellent role adaptation! Very creative approach.',
            grade: 9.5,
            createdAt: '2024-01-20T06:00:00Z',
            timeRemaining: 0
          }
        ];

        setGame(mockGame);
        setTasks(mockTasks);
        setIsCreator(mockGame.creator.id === 'user_123'); // Mock current user
        
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-red-400 to-red-600',
      explicit: 'from-orange-500 to-orange-700',
      edgy: 'from-purple-500 to-purple-700',
      hardcore: 'from-gray-700 to-gray-900'
    };
    return colors[difficulty] || 'from-gray-400 to-gray-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-4 h-4" />,
      arousing: <FireIcon className="w-4 h-4" />,
      explicit: <EyeDropperIcon className="w-4 h-4" />,
      edgy: <ExclamationTriangleIcon className="w-4 h-4" />,
      hardcore: <RocketLaunchIcon className="w-4 h-4" />
    };
    return icons[difficulty] || <SparklesIcon className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-500',
      'in_progress': 'bg-yellow-500',
      completed: 'bg-green-500',
      overdue: 'bg-red-500',
      cancelled: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      assigned: <ClockIcon className="w-4 h-4" />,
      'in_progress': <PlayIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      overdue: <ExclamationCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <ClockIcon className="w-4 h-4" />;
  };

  const formatTimeRemaining = (timeMs) => {
    if (!timeMs || timeMs <= 0) return 'Overdue';
    
    const hours = Math.floor(timeMs / 3600000);
    const minutes = Math.floor((timeMs % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateTask = () => {
    setShowTaskModal(true);
  };

  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setShowSubmissionModal(true);
  };

  const handleGradeTask = (task) => {
    // Implement grading logic
    console.log('Grading task:', task.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading task management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
              <p className="text-neutral-400">
                {game.title} - Manage tasks, submissions, and progress
              </p>
            </div>
            {isCreator && (
              <button
                onClick={handleCreateTask}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.gameStats.totalTasks}</div>
              <div className="text-sm text-neutral-400">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.gameStats.completedTasks}</div>
              <div className="text-sm text-neutral-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.gameStats.averageScore}</div>
              <div className="text-sm text-neutral-400">Avg Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.gameStats.totalPoints}</div>
              <div className="text-sm text-neutral-400">Total Points</div>
            </div>
          </div>
        </div>

        {/* Task Management Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-700/50">
            <nav className="flex space-x-8 px-6">
              {['overview', 'assigned', 'in-progress', 'completed', 'overdue'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitTask}
                      onGrade={handleGradeTask}
                      isCreator={isCreator}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyIcon={getDifficultyIcon}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Tab */}
            {activeTab === 'assigned' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Assigned Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(task => task.status === 'assigned').map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitTask}
                      onGrade={handleGradeTask}
                      isCreator={isCreator}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyIcon={getDifficultyIcon}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Tab */}
            {activeTab === 'in-progress' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tasks In Progress</h3>
                <div className="space-y-4">
                  {tasks.filter(task => task.status === 'in_progress').map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitTask}
                      onGrade={handleGradeTask}
                      isCreator={isCreator}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyIcon={getDifficultyIcon}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tab */}
            {activeTab === 'completed' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Completed Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(task => task.status === 'completed').map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitTask}
                      onGrade={handleGradeTask}
                      isCreator={isCreator}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyIcon={getDifficultyIcon}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Overdue Tab */}
            {activeTab === 'overdue' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">Overdue Tasks</h3>
                <div className="space-y-4">
                  {tasks.filter(task => task.status === 'overdue').map((task) => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onSubmit={handleSubmitTask}
                      onGrade={handleGradeTask}
                      isCreator={isCreator}
                      getDifficultyColor={getDifficultyColor}
                      getDifficultyIcon={getDifficultyIcon}
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      formatTimeRemaining={formatTimeRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Task Modal */}
        {showTaskModal && (
          <CreateTaskModal
            onClose={() => setShowTaskModal(false)}
            onCreateTask={(taskData) => {
              // Handle task creation
              console.log('Creating task:', taskData);
              setShowTaskModal(false);
            }}
          />
        )}

        {/* Task Submission Modal */}
        {showSubmissionModal && selectedTask && (
          <TaskSubmissionModal
            task={selectedTask}
            onClose={() => setShowSubmissionModal(false)}
            onSubmit={(submissionData) => {
              // Handle task submission
              console.log('Submitting task:', submissionData);
              setShowSubmissionModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onSubmit, onGrade, isCreator, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatTimeRemaining, formatDate }) => {
  return (
    <div className="bg-neutral-700/30 rounded-lg border border-neutral-600/50 overflow-hidden hover:border-neutral-500/50 transition-all duration-200">
      {/* Task Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center text-white`}>
              {getDifficultyIcon(task.difficulty)}
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">{task.points}</div>
            <div className="text-xs text-neutral-400">points</div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
        <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{task.description}</p>

        {/* Task Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Due:</span>
            <span className="text-white">{formatDate(task.dueAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Time Left:</span>
            <span className={`font-medium ${
              task.timeRemaining <= 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {formatTimeRemaining(task.timeRemaining)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Role:</span>
            <span className="text-white capitalize">{task.assignedRole}</span>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      <div className="px-4 py-3 bg-neutral-600/30 border-t border-neutral-600/50">
        <div className="flex items-center justify-between">
          {task.status === 'completed' ? (
            <div className="flex items-center space-x-2">
              <span className="text-green-400 font-medium">Grade: {task.grade}/10</span>
              {isCreator && (
                <button
                  onClick={() => onGrade(task)}
                  className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded transition-colors duration-200"
                >
                  Adjust Grade
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onSubmit(task)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
            >
              {task.status === 'assigned' ? 'Start Task' : 'Submit Task'}
            </button>
          )}
          
          <button className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Task List Item Component
const TaskListItem = ({ task, onSubmit, onGrade, isCreator, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatTimeRemaining, formatDate }) => {
  return (
    <div className="bg-neutral-700/30 rounded-lg border border-neutral-600/50 p-4">
      <div className="flex items-center space-x-4">
        {/* Task Icon & Status */}
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center text-white`}>
            {getDifficultyIcon(task.difficulty)}
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
            {getStatusIcon(task.status)}
            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-primary">{task.points} pts</span>
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{task.description}</p>
          
          {/* Task Info */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Due:</span>
              <span className="text-white">{formatDate(task.dueAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Time Left:</span>
              <span className={`font-medium ${
                task.timeRemaining <= 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {formatTimeRemaining(task.timeRemaining)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-neutral-400">Role:</span>
              <span className="text-white capitalize">{task.assignedRole}</span>
            </div>
          </div>
        </div>

        {/* Task Actions */}
        <div className="flex items-center space-x-2">
          {task.status === 'completed' ? (
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">{task.grade}/10</div>
              <div className="text-xs text-neutral-400">Grade</div>
            </div>
          ) : (
            <button
              onClick={() => onSubmit(task)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
            >
              {task.status === 'assigned' ? 'Start' : 'Submit'}
            </button>
          )}
          
          <button 
            onClick={() => onViewEvidence(task)}
            className="px-3 py-1 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded transition-colors duration-200"
          >
            Evidence
          </button>
          
          {task.status === 'in_progress' && task.allowExtensions && task.extensionsUsed < task.maxExtensions && (
            <button 
              onClick={() => onRequestExtension(task)}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-colors duration-200"
            >
              Extend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ onClose, onCreateTask }) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    difficulty: 'explicit',
    assignedTo: '',
    assignedRole: 'sub',
    dueAt: '',
    points: 10
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTask(taskData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-white mb-6">Create New Task</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Task Title *</label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Difficulty *</label>
              <select
                value={taskData.difficulty}
                onChange={(e) => setTaskData({ ...taskData, difficulty: e.target.value })}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {DIFFICULTY_OPTIONS.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Description *</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              rows={4}
              className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe the task requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Assigned Role *</label>
              <select
                value={taskData.assignedRole}
                onChange={(e) => setTaskData({ ...taskData, assignedRole: e.target.value })}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="dom">Dominant</option>
                <option value="sub">Submissive</option>
                <option value="switch">Switch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Due Date *</label>
              <input
                type="datetime-local"
                value={taskData.dueAt}
                onChange={(e) => setTaskData({ ...taskData, dueAt: e.target.value })}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Points *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={taskData.points}
                onChange={(e) => setTaskData({ ...taskData, points: parseInt(e.target.value) })}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Task Submission Modal Component
const TaskSubmissionModal = ({ task, onClose, onSubmit, evidenceForm, setEvidenceForm, uploadingEvidence }) => {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setEvidenceForm(prev => ({ ...prev, files: [...prev.files, ...files] }));
  };

  const removeFile = (index) => {
    setEvidenceForm(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-white mb-6">Submit Task: {task.title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Evidence Type</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                className="p-4 border-2 border-neutral-600 rounded-lg hover:border-primary transition-colors duration-200 text-center"
              >
                <PhotoIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="text-sm text-neutral-400">Photo</span>
              </button>
              <button
                type="button"
                className="p-4 border-2 border-neutral-600 rounded-lg hover:border-primary transition-colors duration-200 text-center"
              >
                <VideoCameraIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="text-sm text-neutral-400">Video</span>
              </button>
              <button
                type="button"
                className="p-4 border-2 border-neutral-600 rounded-lg hover:border-primary transition-colors duration-200 text-center"
              >
                <DocumentTextIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="text-sm text-neutral-400">Text</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Upload Evidence</label>
            <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
              <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-400 mb-2">Drag and drop files here, or click to browse</p>
              <button
                type="button"
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
              >
                Browse Files
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Completion Notes</label>
            <textarea
              value={submissionData.completionNotes}
              onChange={(e) => setSubmissionData({ ...submissionData, completionNotes: e.target.value })}
              rows={4}
              className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe how you completed the task..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
            >
              Submit Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernSwitchGameTaskManager; 