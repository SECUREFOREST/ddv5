const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query, param, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const SwitchGame = require('../models/SwitchGame');
const Dare = require('../models/Dare');
const User = require('../models/User');
const mongoose = require('mongoose'); // Added for system health check

// Health check endpoint for debugging
router.get('/health', async (req, res) => {
  try {
    // Test database connectivity
    const userCount = await User.countDocuments();
    const dareCount = await Dare.countDocuments();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      collections: {
        users: userCount,
        dares: dareCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/stats/dashboard - comprehensive dashboard data for performer
router.get('/dashboard', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('dareFilters').optional().isString().withMessage('Dare filters must be a JSON string'),
  query('switchGameFilters').optional().isString().withMessage('Switch game filters must be a JSON string'),
  query('publicFilters').optional().isString().withMessage('Public filters must be a JSON string'),
  query('publicSwitchFilters').optional().isString().withMessage('Public switch filters must be a JSON string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }

    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // Parse filter parameters - handle both JSON strings and individual parameters
    let dareFilters = {};
    let switchGameFilters = {};
    let publicFilters = {};
    let publicSwitchFilters = {};

    try {
      // Try to parse JSON filter objects first
      if (req.query.dareFilters) {
        dareFilters = JSON.parse(req.query.dareFilters);
      }
      if (req.query.switchGameFilters) {
        switchGameFilters = JSON.parse(req.query.switchGameFilters);
      }
      if (req.query.publicFilters) {
        publicFilters = JSON.parse(req.query.publicFilters);
      }
      if (req.query.publicSwitchFilters) {
        publicSwitchFilters = JSON.parse(req.query.publicSwitchFilters);
      }
    } catch (parseError) {
      console.warn('Failed to parse filter JSON, using empty filters:', parseError.message);
      // Continue with empty filters if JSON parsing fails
    }

    // Log the parsed filters for debugging
    console.log('Parsed filters:', {
      dareFilters,
      switchGameFilters,
      publicFilters,
      publicSwitchFilters
    });

    // Build filter queries
    const buildDareFilter = (baseFilter = {}) => {
      const filter = { ...baseFilter };
      if (dareFilters.difficulty) filter.difficulty = dareFilters.difficulty;
      if (dareFilters.status) filter.status = dareFilters.status;
      return filter;
    };

    const buildSwitchGameFilter = (baseFilter = {}) => {
      const filter = { ...baseFilter };
      if (switchGameFilters.difficulty) filter.difficulty = switchGameFilters.difficulty;
      if (switchGameFilters.status) filter.status = switchGameFilters.status;
      return filter;
    };

    const buildPublicDareFilter = () => {
      const filter = { public: true, status: 'waiting_for_participant' };
      if (publicFilters.difficulty) filter.difficulty = publicFilters.difficulty;
      if (publicFilters.dareType) filter.dareType = publicFilters.dareType;
      return filter;
    };

    const buildPublicSwitchFilter = () => {
      const filter = { public: true, status: 'waiting_for_participant' };
      if (publicSwitchFilters.difficulty) filter.difficulty = publicSwitchFilters.difficulty;
      return filter;
    };

    // Get user's blocked users for filtering
    const user = await User.findById(userId).select('blockedUsers').lean();
    const blockedUserIds = user?.blockedUsers || [];

    // Parallel data fetching with proper error handling
    const [
      activeDaresCreator,
      activeDaresParticipant,
      completedDaresCreator,
      completedDaresParticipant,
      switchGames,
      publicDares,
      publicSwitchGames
    ] = await Promise.allSettled([
      // Active dares as creator
      Dare.find({
        creator: userId,
        status: { $in: ['in_progress', 'approved', 'waiting_for_participant'] },
        ...buildDareFilter()
      })
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Active dares as participant
      Dare.find({
        performer: userId,
        status: { $in: ['in_progress', 'approved', 'waiting_for_participant'] },
        ...buildDareFilter()
      })
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Completed dares as creator
      Dare.find({
        creator: userId,
        status: { $in: ['completed', 'graded', 'chickened_out', 'rejected', 'cancelled'] }
      })
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Completed dares as participant
      Dare.find({
        performer: userId,
        status: { $in: ['completed', 'graded', 'chickened_out', 'rejected', 'cancelled'] }
      })
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Switch games
      SwitchGame.find({
        $or: [{ creator: userId }, { participant: userId }],
        ...buildSwitchGameFilter()
      })
        .populate('creator', 'username fullName avatar')
        .populate('participant', 'username fullName avatar')
        .populate('winner', 'username fullName avatar')
        .populate('loser', 'username fullName avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Public dares - always fetch first page for overview
      Dare.find(buildPublicDareFilter())
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(limit) // Always fetch first page for public content
        .lean(),

      // Public switch games - always fetch first page for overview
      SwitchGame.find(buildPublicSwitchFilter())
        .populate('creator', 'username fullName avatar')
        .populate('participant', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(limit) // Always fetch first page for public content
        .lean()
    ]);

    // Get total counts for pagination
    const [
      activeDaresCreatorCount,
      activeDaresParticipantCount,
      completedDaresCreatorCount,
      completedDaresParticipantCount,
      switchGamesCount,
      publicDaresCount,
      publicSwitchGamesCount
    ] = await Promise.allSettled([
      Dare.countDocuments({
        creator: userId,
        status: { $in: ['in_progress', 'approved', 'waiting_for_participant'] },
        ...buildDareFilter()
      }),
      Dare.countDocuments({
        performer: userId,
        status: { $in: ['in_progress', 'approved', 'waiting_for_participant'] },
        ...buildDareFilter()
      }),
      Dare.countDocuments({
        creator: userId,
        status: { $in: ['completed', 'graded', 'chickened_out', 'rejected', 'cancelled'] }
      }),
      Dare.countDocuments({
        performer: userId,
        status: { $in: ['completed', 'graded', 'chickened_out', 'rejected', 'cancelled'] }
      }),
      SwitchGame.countDocuments({
        $or: [{ creator: userId }, { participant: userId }],
        ...buildSwitchGameFilter()
      }),
      Dare.countDocuments(buildPublicDareFilter()),
      SwitchGame.countDocuments(buildPublicSwitchFilter())
    ]);

    // Process and merge results
    const processResults = (results, counts) => {
      const processed = results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value || [];
        }
        console.error('Failed to fetch data:', result.reason);
        return [];
      });

      const processedCounts = counts.map(count => {
        if (count.status === 'fulfilled') {
          return count.value || 0;
        }
        console.error('Failed to fetch count:', count.reason);
        return 0;
      });

      return { processed, processedCounts };
    };

    const { processed, processedCounts } = processResults(
      [activeDaresCreator, activeDaresParticipant, completedDaresCreator, completedDaresParticipant, switchGames, publicDares, publicSwitchGames],
      [activeDaresCreatorCount, activeDaresParticipantCount, completedDaresCreatorCount, completedDaresParticipantCount, switchGamesCount, publicDaresCount, publicSwitchGamesCount]
    );

    // Merge active dares (remove duplicates)
    const activeDares = [...processed[0], ...processed[1]];
    const activeDaresMap = new Map();
    activeDares.forEach(dare => {
      if (!activeDaresMap.has(dare._id.toString())) {
        activeDaresMap.set(dare._id.toString(), dare);
      }
    });
    const uniqueActiveDares = Array.from(activeDaresMap.values());

    // Merge completed dares (remove duplicates)
    const completedDares = [...processed[2], ...processed[3]];
    const completedDaresMap = new Map();
    completedDares.forEach(dare => {
      if (!completedDaresMap.has(dare._id.toString())) {
        completedDaresMap.set(dare._id.toString(), dare);
      }
    });
    const uniqueCompletedDares = Array.from(completedDaresMap.values());

    // Filter out blocked users from public content
    const filterBlockedUsers = (items) => {
      return items.filter(item => {
        if (item.creator && blockedUserIds.includes(item.creator._id.toString())) return false;
        if (item.performer && blockedUserIds.includes(item.performer._id.toString())) return false;
        if (item.participant && blockedUserIds.includes(item.participant._id.toString())) return false;
        return true;
      });
    };

    const filteredPublicDares = filterBlockedUsers(processed[5]);
    const filteredPublicSwitchGames = filterBlockedUsers(processed[6]);

    // Calculate total items for pagination
    const totalActiveItems = processedCounts[0] + processedCounts[1];
    const totalCompletedItems = processedCounts[2] + processedCounts[3];

    // Build response
    const response = {
      data: {
        activeDares: uniqueActiveDares || [],
        completedDares: uniqueCompletedDares || [],
        switchGames: processed[4] || [],
        publicDares: filteredPublicDares || [],
        publicSwitchGames: filteredPublicSwitchGames || []
      },
      pagination: {
        activeDares: {
          page,
          limit,
          total: totalActiveItems || 0,
          pages: Math.max(1, Math.ceil((totalActiveItems || 0) / limit))
        },
        completedDares: {
          page,
          limit,
          total: totalCompletedItems || 0,
          pages: Math.max(1, Math.ceil((totalCompletedItems || 0) / limit))
        },
        switchGames: {
          page,
          limit,
          total: processedCounts[4] || 0,
          pages: Math.max(1, Math.ceil((processedCounts[4] || 0) / limit))
        },
        publicDares: {
          page: 1, // Public content is always first page
          limit,
          total: processedCounts[5] || 0,
          pages: Math.max(1, Math.ceil((processedCounts[5] || 0) / limit))
        },
        publicSwitchGames: {
          page: 1, // Public content is always first page
          limit,
          total: processedCounts[6] || 0,
          pages: Math.max(1, Math.ceil((processedCounts[6] || 0) / limit))
        }
      },
      summary: {
        totalActiveDares: totalActiveItems || 0,
        totalCompletedDares: totalCompletedItems || 0,
        totalSwitchGames: processedCounts[4] || 0,
        totalPublicDares: processedCounts[5] || 0,
        totalPublicSwitchGames: processedCounts[6] || 0
      }
    };

    // Ensure all arrays are actually arrays
    Object.keys(response.data).forEach(key => {
      if (!Array.isArray(response.data[key])) {
        console.warn(`Data key ${key} is not an array, converting to empty array`);
        response.data[key] = [];
      }
    });

    // Ensure all pagination objects have required properties
    Object.keys(response.pagination).forEach(key => {
      const pagination = response.pagination[key];
      if (!pagination.page || !pagination.limit || pagination.total === undefined || !pagination.pages) {
        console.warn(`Pagination key ${key} is missing required properties, setting defaults`);
        response.pagination[key] = {
          page: key.includes('public') ? 1 : page,
          limit,
          total: 0,
          pages: 1
        };
      }
    });

    // Ensure all summary values are numbers
    Object.keys(response.summary).forEach(key => {
      if (typeof response.summary[key] !== 'number') {
        console.warn(`Summary key ${key} is not a number, converting to 0`);
        response.summary[key] = 0;
      }
    });

    // Log the response structure for debugging
    console.log('Dashboard API response structure:', {
      dataKeys: Object.keys(response.data),
      paginationKeys: Object.keys(response.pagination),
      summaryKeys: Object.keys(response.summary),
      dataCounts: {
        activeDares: response.data.activeDares.length,
        completedDares: response.data.completedDares.length,
        switchGames: response.data.switchGames.length,
        publicDares: response.data.publicDares.length,
        publicSwitchGames: response.data.publicSwitchGames.length
      }
    });

    res.json(response);

  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

// GET /api/stats/leaderboard - comprehensive leaderboard data
router.get('/leaderboard', auth, async (req, res) => {
  try {
    // Get all users with their dare statistics - add error handling
    let users;
    try {
      users = await User.find({}, 'username fullName avatar roles').lean();
    } catch (userError) {
      console.error('Error fetching users:', userError);
      return res.status(500).json({ error: 'Failed to fetch users for leaderboard.' });
    }
    
    if (!users || users.length === 0) {
      return res.json([]);
    }
    
    // Use aggregation for better performance with error handling
    let daresCreatedStats, daresCompletedStats;
    try {
      [daresCreatedStats, daresCompletedStats] = await Promise.all([
      Dare.aggregate([
          { 
            $match: { 
              creator: { 
                $exists: true, 
                $ne: null,
                $type: "objectId"  // Ensure it's a valid ObjectId
              } 
            } 
          },
          { $group: { _id: '$creator', count: { $sum: 1 } } },
          { $sort: { count: -1 } }  // Sort by count for better performance
      ]),
      Dare.aggregate([
          { 
            $match: { 
              status: 'completed', 
              performer: { 
                $exists: true, 
                $ne: null,
                $type: "objectId"  // Ensure it's a valid ObjectId
              } 
            } 
          },
          { $group: { _id: '$performer', count: { $sum: 1 } } },
          { $sort: { count: -1 } }  // Sort by count for better performance
      ])
    ]);
    
      // Additional validation of aggregation results
      if (!Array.isArray(daresCreatedStats)) {
        daresCreatedStats = [];
      }
      if (!Array.isArray(daresCompletedStats)) {
        daresCompletedStats = [];
      }
      
      // Filter out any invalid results
      daresCreatedStats = daresCreatedStats.filter(stat => 
        stat && stat._id && stat._id !== null && stat._id !== undefined
      );
      daresCompletedStats = daresCompletedStats.filter(stat => 
        stat && stat._id && stat._id !== null && stat._id !== undefined
      );
      
    } catch (aggregateError) {
      console.error('Error in aggregation:', aggregateError);
      return res.status(500).json({ error: 'Failed to aggregate dare statistics.' });
    }
    
    // Create lookup maps for O(1) access with null checks
    const daresCreatedMap = new Map();
    const daresCompletedMap = new Map();
    
    // Fallback: if aggregation fails or returns no results, try alternative approach
    if ((!daresCreatedStats || daresCreatedStats.length === 0) && 
        (!daresCompletedStats || daresCompletedStats.length === 0)) {
      
      try {
        // Fallback: use simple count queries
        const allDares = await Dare.find({}).select('creator performer status').lean();
        
        allDares.forEach(dare => {
          if (dare.creator && dare.creator.toString && dare.creator.toString() !== 'null') {
            const creatorId = dare.creator.toString();
            daresCreatedMap.set(creatorId, (daresCreatedMap.get(creatorId) || 0) + 1);
          }
          
          if (dare.performer && dare.performer.toString && dare.performer.toString() !== 'null' && 
              dare.status === 'completed') {
            const performerId = dare.performer.toString();
            daresCompletedMap.set(performerId, (daresCompletedMap.get(performerId) || 0) + 1);
          }
        });
        
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        // Continue with empty maps rather than failing completely
      }
    } else {
      // Process aggregation results with comprehensive null checking
      if (daresCreatedStats && Array.isArray(daresCreatedStats)) {
        daresCreatedStats.forEach(stat => {
          // Add comprehensive null checking for aggregation results
          if (stat && stat._id && stat._id !== null && stat._id !== undefined) {
            try {
              const idString = stat._id.toString();
              if (idString && idString !== 'null' && idString !== 'undefined') {
                daresCreatedMap.set(idString, parseInt(stat.count) || 0);
              }
            } catch (idError) {
              console.warn('Invalid _id in daresCreatedStats:', stat._id, 'Error:', idError.message);
            }
          }
        });
      }
      
      if (daresCompletedStats && Array.isArray(daresCompletedStats)) {
        daresCompletedStats.forEach(stat => {
          // Add comprehensive null checking for aggregation results
          if (stat && stat._id && stat._id !== null && stat._id !== undefined) {
            try {
              const idString = stat._id.toString();
              if (idString && idString !== 'null' && idString !== 'undefined') {
                daresCompletedMap.set(idString, parseInt(stat.count) || 0);
              }
            } catch (idError) {
              console.warn('Invalid _id in daresCompletedStats:', stat._id, 'Error:', idError.message);
            }
          }
        });
      }
    }
    
    // Get dare statistics for each user with safe property access
    const userStats = users.map(user => {
      if (!user || !user._id) {
        console.warn('Invalid user object found:', user);
        return null;
      }
      
      try {
        const userId = user._id.toString();
        if (!userId || userId === 'null' || userId === 'undefined') {
          console.warn('Invalid user ID:', user._id);
          return null;
        }
        
        const daresCreated = daresCreatedMap.get(userId) || 0;
        const daresCompletedAsPerformer = daresCompletedMap.get(userId) || 0;
      
      return {
        user: {
          id: user._id,
            username: user.username || 'Unknown',
            fullName: user.fullName || user.username || 'Unknown',
            avatar: user.avatar || null,
            roles: Array.isArray(user.roles) ? user.roles : []
        },
          daresCreated: parseInt(daresCreated) || 0,
          daresCompletedAsPerformer: parseInt(daresCompletedAsPerformer) || 0,
          daresCount: (parseInt(daresCreated) || 0) + (parseInt(daresCompletedAsPerformer) || 0)
        };
      } catch (userError) {
        console.error('Error processing user:', user, 'Error:', userError);
        return null;
      }
    }).filter(Boolean); // Remove any null entries
    
    // Sort by total dares count (overall performance)
    userStats.sort((a, b) => (b.daresCount || 0) - (a.daresCount || 0));
    
    // Filter out blocked users with error handling
    let leaderboard = userStats;
    try {
      const currentUser = await User.findById(req.userId).select('blockedUsers').lean();
    
      if (currentUser && currentUser.blockedUsers && Array.isArray(currentUser.blockedUsers) && currentUser.blockedUsers.length > 0) {
        const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());
      leaderboard = userStats.filter(entry => 
          entry && entry.user && entry.user.id && 
          !blockedUserIds.includes(entry.user.id.toString())
      );
      }
    } catch (blockError) {
      console.error('Error filtering blocked users:', blockError);
      // Continue without filtering blocked users rather than failing
      leaderboard = userStats;
    }
    
    // Limit to top 50 users for performance
    leaderboard = leaderboard.slice(0, 50);
    
    res.json(leaderboard);
    
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ 
      error: 'Failed to get leaderboard.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/stats/users/:id - user stats
router.get('/users/:id',
  param('id').isMongoId().withMessage('User ID must be a valid MongoDB ObjectId.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const userId = req.params.id;
      // Count only completed dares where user was performer and proof was submitted
      const daresCount = await Dare.countDocuments({ 
        performer: userId, 
        status: 'completed',
        'proof.fileUrl': { $exists: true, $ne: null }
      });
      // Grades: average grade given to user's dares
      const dares = await Dare.find({ creator: userId });
      let grades = [];
      dares.forEach(dare => {
        if (Array.isArray(dare.grades)) grades = grades.concat(dare.grades.map(g => g.grade));
      });
      const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;
      const natures = { dominant: { withEveryone: {}, withYou: {}, tasks: [] }, submissive: { withEveryone: {}, withYou: {}, tasks: [] } };
      dares.forEach(dare => {
        if (dare.dareType === 'domination') {
          natures.dominant.tasks.push(dare.description);
          if (dare.performer) {
            const key = dare.performer.toString();
            natures.dominant.withEveryone[key] = (natures.dominant.withEveryone[key] || 0) + 1;
          }
        } else if (dare.dareType === 'submission') {
          natures.submissive.tasks.push(dare.description);
          if (dare.creator) {
            const key = dare.creator.toString();
            natures.submissive.withEveryone[key] = (natures.submissive.withEveryone[key] || 0) + 1;
          }
        }
      });
      let dominantCount = 0, submissiveCount = 0;
      dares.forEach(dare => {
        if (dare.dareType === 'domination' && dare.creator && dare.creator.toString() === userId) {
          dominantCount++;
        }
        if (dare.dareType === 'submission' && dare.performer && dare.performer.toString() === userId) {
          submissiveCount++;
        }
        if (dare.dareType === 'switch') {
          if (dare.winner && dare.winner.toString() === userId) {
            dominantCount++;
          }
          if (dare.loser && dare.loser.toString() === userId) {
            submissiveCount++;
          }
        }
      });
      const totalCount = dominantCount + submissiveCount;
      const dominantPercent = totalCount ? Math.round((dominantCount / totalCount) * 100) : 0;
      const submissivePercent = totalCount ? Math.round((submissiveCount / totalCount) * 100) : 0;
      res.json({
        daresCount,
        avgGrade,
        dominantCount,
        submissiveCount,
        totalCount,
        dominantPercent,
        submissivePercent,
        natures,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user stats.' });
    }
  }
);

// GET /api/stats/activities - get activity feed
router.get('/activities', async (req, res) => {
  try {
    const { limit = 20, userId } = req.query;
    let filter = {};
    
    if (userId) {
      filter.user = userId;
    }
    
    const activities = await Activity.find(filter)
      .populate('user', 'username fullName avatar')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

// GET /api/stats/dashboard - general dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDares = await Dare.countDocuments();
    // If you have a Comment model, include it; otherwise, skip or add your own
    let totalComments = 0;
    try {
      totalComments = await require('../models/Comment').countDocuments();
    } catch {}
    res.json({
      totalUsers,
      totalDares,
      totalComments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard stats.' });
  }
});

// GET /api/stats/public-dares - get public dare counts
router.get('/public-dares', async (req, res) => {
  try {
    const [totalDares, submissionDares, dominationDares, switchGames] = await Promise.all([
      Dare.countDocuments({ public: true, status: 'waiting_for_participant' }),
      Dare.countDocuments({ public: true, status: 'waiting_for_participant', dareType: 'submission' }),
      Dare.countDocuments({ public: true, status: 'waiting_for_participant', dareType: 'domination' }),
      SwitchGame.countDocuments({ public: true, status: 'waiting_for_participant' })
    ]);
    
    res.json({
      total: totalDares + switchGames,
      submission: submissionDares,
      domination: dominationDares,
      switch: switchGames
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public dare counts.' });
  }
});

// GET /api/stats/site - get site-wide statistics for admin dashboard
router.get('/site', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const [
      totalUsers,
      totalDares,
      totalSwitchGames,
      activeDares,
      completedDares,
      totalComments
    ] = await Promise.all([
      User.countDocuments(),
      Dare.countDocuments(),
      SwitchGame.countDocuments(),
      Dare.countDocuments({ status: { $in: ['in_progress', 'waiting_for_participant'] } }),
      Dare.countDocuments({ status: 'completed' }),
      require('../models/Comment').countDocuments().catch(() => 0)
    ]);

    res.json({
      totalUsers,
      totalDares,
      totalSwitchGames,
      activeDares,
      completedDares,
      totalComments,
      completionRate: totalDares > 0 ? Math.round((completedDares / totalDares) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch site statistics.' });
  }
});

// GET /api/stats/admin/system-health - get system health status (admin only)
router.get('/admin/system-health', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    // Check database connectivity
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get basic system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      database: dbStatus,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get system health.' });
  }
});

// GET /api/stats/admin/api-status - get API endpoint status (admin only)
router.get('/admin/api-status', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    // Test basic API functionality
    const testResults = await Promise.allSettled([
      User.countDocuments(),
      Dare.countDocuments(),
      SwitchGame.countDocuments()
    ]);

    res.json({
      users: testResults[0].status === 'fulfilled' ? 'healthy' : 'error',
      dares: testResults[1].status === 'fulfilled' ? 'healthy' : 'error',
      switchGames: testResults[2].status === 'fulfilled' ? 'healthy' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get API status.' });
  }
});

// GET /api/stats/admin/performance - get performance metrics (admin only)
router.get('/admin/performance', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    res.json({
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      uptime: Math.floor(uptime),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get performance metrics.' });
  }
});

// GET /api/stats/admin/database-stats - get database statistics (admin only)
router.get('/admin/database-stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const [userCount, dareCount, switchGameCount, commentCount] = await Promise.all([
      User.countDocuments(),
      Dare.countDocuments(),
      SwitchGame.countDocuments(),
      require('../models/Comment').countDocuments().catch(() => 0)
    ]);

    res.json({
      totalCollections: 4,
      totalDocuments: userCount + dareCount + switchGameCount + commentCount,
      storageSize: 'N/A', // MongoDB Atlas doesn't provide this easily
      indexes: 'N/A', // Would need to query system.indexes collection
      collections: {
        users: userCount,
        dares: dareCount,
        switchGames: switchGameCount,
        comments: commentCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get database stats.' });
  }
});

// GET /api/stats/admin/server-metrics - get server metrics (admin only)
router.get('/admin/server-metrics', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const memoryUsage = process.memoryUsage();
    
    res.json({
      cpuUsage: 'N/A', // Node.js doesn't provide CPU usage directly
      memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      diskUsage: 'N/A', // Would need fs.statfs or similar
      networkIO: 'N/A', // Would need network interface monitoring
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get server metrics.' });
  }
});

module.exports = router; 