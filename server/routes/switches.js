const express = require('express');
const router = express.Router();
const SwitchGame = require('../models/SwitchGame');
const Dare = require('../models/Dare');
const { sendNotification } = require('../utils/notification');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const allowedProofTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
const MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10MB
const { logActivity } = require('../utils/activity');
const { logAudit } = require('../utils/auditLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// GET /api/switches - list all switch games (auth required, filter out blocked users)
const User = require('../models/User');
const auth = require('../middleware/auth');

// Multer setup for proof file uploads
const proofStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create proofs directory if it doesn't exist
    const proofsDir = path.join(__dirname, '../uploads/proofs');
    if (!fs.existsSync(proofsDir)) {
      fs.mkdirSync(proofsDir, { recursive: true });
    }
    cb(null, proofsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const proofUpload = multer({ 
  storage: proofStorage, 
  limits: { fileSize: MAX_PROOF_SIZE },
  fileFilter: function (req, file, cb) {
    if (allowedProofTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
    }
  }
});

// Helper function to clean up expired proof submissions
async function cleanupExpiredProofs() {
  try {
    const now = new Date();
    const expiredGames = await SwitchGame.find({
      status: { $in: ['awaiting_proof', 'proof_submitted'] },
      proofExpiresAt: { $lt: now }
    });
    
    for (const game of expiredGames) {
      if (game.status === 'awaiting_proof') {
        // Game expired without proof submission
        game.status = 'expired';
        game.updatedAt = new Date();
        await game.save();
        
        // Notify both players
        if (game.creator) {
          await sendNotification(game.creator, 'switchgame_expired', 'Your switch game expired without proof submission.', null);
        }
        if (game.participant) {
          await sendNotification(game.participant, 'switchgame_expired', 'Your switch game expired without proof submission.', null);
        }
      } else if (game.status === 'proof_submitted' && game.proof) {
        // Proof expired
        game.proof = null;
        game.status = 'awaiting_proof';
        game.proofExpiresAt = null;
        game.updatedAt = new Date();
        await game.save();
        
        // Notify the loser that proof expired
        if (game.loser) {
          await sendNotification(game.loser, 'switchgame_proof_expired', 'Your proof for the switch game has expired. Please resubmit.', null);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up expired proofs:', error);
  }
}

router.get('/', auth, async (req, res) => {
  try {
    // Clean up expired proofs before fetching games
    await cleanupExpiredProofs();
    
    if (req.query.id) {
      const game = await SwitchGame.findById(req.query.id)
        .populate('creator', 'username fullName avatar participant winner proof.user');
      return res.json(game ? [game] : []);
    }
    const user = await User.findById(req.userId).select('blockedUsers roles');
    const isAdmin = user && user.roles && user.roles.includes('admin');
    const { difficulty, public: isPublic, status, search } = req.query;
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let games;
    let filter = {};
    let total;
    
    if (isAdmin) {
      // Admin: return all switch games
      if (isPublic !== undefined) filter.public = isPublic === 'true';
      if (status) filter.status = status;
      
      // Add search functionality for admin
      if (search) {
        filter.$or = [
          { 'creatorDare.description': { $regex: search, $options: 'i' } },
          { 'participantDare.description': { $regex: search, $options: 'i' } }
        ];
      }
      
      total = await SwitchGame.countDocuments(filter);
      games = await SwitchGame.find(filter)
        .populate('creator', 'username fullName avatar participant winner proof.user')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    } else {
      // Only return joinable games: status = 'waiting_for_participant', participant = null, and not created by current user
      filter = { status: 'waiting_for_participant', participant: null, creator: { $ne: req.userId } };
      if (difficulty) {
        // Support both direct difficulty and nested creatorDare.difficulty
        filter['creatorDare.difficulty'] = difficulty;
        // Also support direct difficulty for backward compatibility
        filter.difficulty = difficulty;
      }
      if (isPublic !== undefined) filter.public = isPublic === 'true';
      total = await SwitchGame.countDocuments(filter);
      games = await SwitchGame.find(filter)
        .populate('creator', 'username fullName avatar participant winner proof.user')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      // Apply blocked user filtering to paginated results
      if (user && user.blockedUsers && user.blockedUsers.length > 0) {
        games = games.filter(g => {
          // If creator or participant is blocked, filter out
          const creatorId = g.creator?._id?.toString() || g.creator?.toString();
          const participantId = g.participant?._id?.toString() || g.participant?.toString();
          return !user.blockedUsers.map(bu => bu.toString()).includes(creatorId) &&
                 (!participantId || !user.blockedUsers.map(bu => bu.toString()).includes(participantId));
        });
      }
    }
    
    // Include claimable information for public switch games
    const gamesWithClaimInfo = games.map(game => {
      const gameObj = game.toObject();
      // Mark as claimable if it's public, waiting for participants, and not created by current user
      if (game.public && game.status === 'waiting_for_participant' && !game.participant && game.creator.toString() !== req.userId) {
        gameObj.claimable = true;
        gameObj.claimRoute = `/switches/claim/${game._id}`;
      }
      return gameObj;
    });
    
    res.json({
      games: gamesWithClaimInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch switch games.' });
  }
});

// GET /api/switches/performer - get all switch games where current user is creator or participant
router.get('/performer', auth, async (req, res) => {
  try {
    const { status, difficulty } = req.query;
    const userId = req.userId;
    const filter = {
      $or: [
        { creator: userId },
        { participant: userId }
      ]
    };
    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    if (difficulty) {
      // Support both direct difficulty and nested creatorDare.difficulty
      filter['creatorDare.difficulty'] = difficulty;
      // Also support direct difficulty for backward compatibility
      filter.difficulty = difficulty;
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await SwitchGame.countDocuments(filter);
    
    // Get paginated games
    const games = await SwitchGame.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('participant', 'username fullName avatar')
      .populate('winner', 'username fullName avatar')
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });
    
    res.json({
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performer switch games.' });
  }
});

// GET /api/switches/history - get all completed/chickened out switch games for current user
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const filter = {
      $and: [
        {
          $or: [
            { creator: userId },
            { participant: userId }
          ]
        },
        {
          status: { $in: ['completed', 'chickened_out'] } // 'chickened_out' is the database status value for chickened out
        }
      ]
    };
    const games = await SwitchGame.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('participant', 'username fullName avatar')
      .populate('winner', 'username fullName avatar')
      .sort({ updatedAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch switch game history.' });
  }
});

// GET /api/switches/:id - get game details (auth required)
router.get('/:id',
  require('express-validator').param('id').isMongoId().withMessage('Game ID must be a valid MongoDB ObjectId.'),
  auth,
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    const game = await SwitchGame.findById(req.params.id)
      .populate('creator', 'username fullName avatar')
      .populate('participant', 'username fullName avatar')
      .populate('winner', 'username fullName avatar')
      .populate('proof.user');
    if (!game) return res.status(404).json({ error: 'Not found' });
    // --- AUTO-FIX: If both moves are present and winner is not set, determine winner and update game ---
    if (
      game.creatorDare && game.creatorDare.move &&
      game.participantDare && game.participantDare.move &&
      !game.winner
    ) {
      const m1 = game.creatorDare.move;
      const m2 = game.participantDare.move;
      function beats(a, b) {
        return (
          (a === 'rock' && b === 'scissors') ||
          (a === 'scissors' && b === 'paper') ||
          (a === 'paper' && b === 'rock')
        );
      }
      if (m1 !== m2) {
        if (beats(m1, m2)) {
          game.winner = game.creator;
        } else {
          game.winner = game.participant;
        }
        game.status = 'awaiting_proof';
        game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await game.save();
        await game.populate('creator participant winner proof.user');
      } else {
        // If draw, clear moves for replay
        game.creatorDare.move = undefined;
        game.participantDare.move = undefined;
        await game.save();
        await game.populate('creator participant winner proof.user');
      }
    }
    // Compute creator stats
    const creator = game.creator;
    let age = null;
    if (creator.dob) {
      const dob = new Date(creator.dob);
      const diffMs = Date.now() - dob.getTime();
      age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    }
    // Dares performed: completedDares.length
    const daresPerformed = Array.isArray(creator.completedDares) ? creator.completedDares.length : 0;
    // Dares created: count of dares with creator = user
    const daresCreated = await Dare.countDocuments({ creator: creator._id });
    // Average grade: average of all grades for dares created by user
    const dares = await Dare.find({ creator: creator._id });
    let grades = [];
    dares.forEach(d => {
      if (Array.isArray(d.grades)) grades = grades.concat(d.grades.map(g => g.grade));
    });
    const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;
    // Hard limits
    const limits = creator.limits || [];
    // Attach stats to creator
    const creatorInfo = {
      _id: creator._id,
      username: creator.username,
      fullName: creator.fullName,
      avatar: creator.avatar,
    };
    // Attach participant info
    const participant = game.participant;
    const participantInfo = participant ? {
      _id: participant._id,
      username: participant.username,
      fullName: participant.fullName,
      avatar: participant.avatar,
    } : null;
    // Attach winner info
    const winner = game.winner;
    const winnerInfo = winner ? {
      _id: winner._id,
      username: winner.username,
      fullName: winner.fullName,
      avatar: winner.avatar,
      // Add more fields if needed
    } : null;
    // Add difficulty description
    let difficultyDescription = '';
    switch (game.creatorDare.difficulty) {
      case 'titillating':
        difficultyDescription = 'Flirty, playful, and fun. Safe for most.';
        break;
      case 'arousing':
        difficultyDescription = 'Arousing and suggestive. For the bold.';
        break;
      case 'explicit':
        difficultyDescription = 'Explicit and revealing. For adults only.';
        break;
      case 'edgy':
        difficultyDescription = 'Pushes boundaries. Use with caution.';
        break;
      case 'hardcore':
        difficultyDescription = 'No holds barred. Use this with people you trust to safely approach your limits.';
        break;
      default:
        difficultyDescription = '';
    }
    res.json({
      _id: game._id,
      status: game.status,
      creator: creatorInfo,
      participant: participantInfo,
      winner: winnerInfo,
      loser: game.loser, // Only if needed by frontend
      creatorDare: {
        description: game.creatorDare.description,
        difficulty: game.creatorDare.difficulty,
      },
      participantDare: game.participantDare ? {
        description: game.participantDare.description,
        difficulty: game.participantDare.difficulty,
      } : null,
      proof: game.proof ? {
        user: game.proof.user,
        text: game.proof.text,
        review: game.proof.review,
        fileUrl: game.proof.fileUrl,
      } : null,
      proofExpiresAt: game.proofExpiresAt,
      expireProofAfterView: game.expireProofAfterView,
      proofViewedAt: game.proofViewedAt,
      grades: game.grades ? game.grades.map(g => ({ user: g.user, grade: g.grade, feedback: g.feedback, createdAt: g.createdAt })) : [],
      public: game.public,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    });
  }
);

// GET /api/switches/claim/:id - get game details for claiming (public access)
router.get('/claim/:id',
  require('express-validator').param('id').isMongoId().withMessage('Game ID must be a valid MongoDB ObjectId.'),
  async (req, res) => {
    try {
      const errors = require('express-validator').validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map(e => ({ field: e.param, message: e.msg }))
        });
      }
      
      const game = await SwitchGame.findById(req.params.id)
        .populate('creator', 'username fullName avatar')
        .populate('participant', 'username fullName avatar');
        
      if (!game) {
        return res.status(404).json({ error: 'Switch game not found' });
      }
      
      // Check if game is still available for joining
      if (game.status !== 'waiting_for_participant' || game.participant) {
        return res.status(400).json({ error: 'This switch game is no longer available to join' });
      }
      
      // Return limited game info for claiming
      res.json({
        _id: game._id,
        status: game.status,
        creator: {
          _id: game.creator._id,
          username: game.creator.username,
          fullName: game.creator.fullName,
          avatar: game.creator.avatar,
        },
        creatorDare: {
          description: game.creatorDare.description,
          difficulty: game.creatorDare.difficulty,
          move: game.creatorDare.move,
          tags: game.creatorDare.tags || [],
        },
        public: game.public,
        createdAt: game.createdAt,
      });
    } catch (err) {
      console.error('Error fetching switch game for claiming:', err);
      res.status(500).json({ error: 'Failed to fetch switch game' });
    }
  }
);

// POST /api/switches - create new game (auth required)
router.post('/',
  auth,
  [
    body('description')
      .isString().withMessage('Description must be a string.')
      .isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters.')
      .trim().escape(),
    body('difficulty')
      .isString().withMessage('Difficulty must be a string.')
      .isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']).withMessage('Difficulty must be one of: titillating, arousing, explicit, edgy, hardcore.'),
    body('move')
      .isString().withMessage('Move must be a string.')
      .isIn(['rock', 'paper', 'scissors']).withMessage('Move must be one of: rock, paper, scissors.'),
    body('tags').optional().isArray().withMessage('Tags must be an array.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const { description, difficulty, move, tags } = req.body;
      const creator = req.userId; // Use authenticated user's ID
      if (!description || !difficulty || !move) {
        return res.status(400).json({ error: 'Description, difficulty, and move are required.' });
      }
      const game = new SwitchGame({
        status: 'waiting_for_participant',
        creator,
        creatorDare: { description, difficulty, move, tags: Array.isArray(tags) ? tags : [] },
      });
      await game.save();
      await game.populate('creator');
      await logActivity({ type: 'switchgame_created', user: req.userId, switchGame: game._id });
      res.status(201).json(game);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to create switch game.' });
    }
  }
);

// POST /api/switches/:id/join - join a game (auth required)
router.post('/:id/join',
  require('express-validator').param('id').isMongoId().withMessage('Invalid game ID.'),
  auth,
  [
    require('express-validator').body('difficulty').isString().isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']),
    require('express-validator').body('move').isString().isIn(['rock', 'paper', 'scissors']),
    require('express-validator').body('consent').isBoolean(),
    require('express-validator').body('dare').isString().isLength({ min: 10, max: 1000 }).withMessage('Dare must be between 10 and 1000 characters.'),
    require('express-validator').body('contentDeletion').optional()
      .isString().withMessage('Content deletion must be a string.')
      .isIn(['delete_after_view', 'delete_after_30_days', 'never_delete']).withMessage('Content deletion must be one of: delete_after_view, delete_after_30_days, never_delete.'),
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      // Prevent joining if in cooldown or at open dare limit
      await require('./dares').checkSlotAndCooldownAtomic(req.userId);
      const userId = req.userId;
      const { difficulty, move, consent, dare, contentDeletion } = req.body;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) throw new Error('Not found');
      if (game.status !== 'waiting_for_participant' || game.participant) {
        throw new Error('This switch game is no longer available to join.');
      }
      if (game.participant) throw new Error('This switch game already has a participant.');
      if (game.creator.equals(userId)) throw new Error('You cannot join your own switch game as a participant.');
      if (!difficulty || !move || !consent || !dare) throw new Error('Difficulty, move, consent, and dare are required.');
      // Blocked user check
      const creator = await User.findById(game.creator).select('blockedUsers');
      const participantUser = await User.findById(userId).select('blockedUsers');
      
      console.log('Raw user objects:', {
        creator: creator,
        participantUser: participantUser,
        creatorId: game.creator,
        participantId: userId
      });
      
      // Ensure blockedUsers arrays exist and are arrays
      const creatorBlockedUsers = Array.isArray(creator?.blockedUsers) ? creator.blockedUsers : [];
      const participantBlockedUsers = Array.isArray(participantUser?.blockedUsers) ? participantUser.blockedUsers : [];
      
      // Debug logging for blocking
      console.log('Blocking check debug:', {
        gameId: req.params.id,
        creatorId: game.creator.toString(),
        participantId: userId,
        creatorBlockedUsers: creatorBlockedUsers,
        participantBlockedUsers: participantBlockedUsers,
        creatorBlockedParticipant: creatorBlockedUsers.some(id => id.toString() === userId.toString()),
        participantBlockedCreator: participantBlockedUsers.some(id => id.toString() === game.creator.toString())
      });
      
      // Additional debug info
      console.log('User objects debug:', {
        creator: {
          _id: creator?._id,
          blockedUsers: creator?.blockedUsers,
          blockedUsersType: typeof creator?.blockedUsers,
          isArray: Array.isArray(creator?.blockedUsers)
        },
        participantUser: {
          _id: participantUser?._id,
          blockedUsers: participantUser?.blockedUsers,
          blockedUsersType: typeof participantUser?.blockedUsers,
          isArray: Array.isArray(participantUser?.blockedUsers)
        }
      });
      
      // Check if creator has blocked the participant
      const creatorBlockedParticipant = creatorBlockedUsers.some(id => {
        try {
          const result = id && id.toString() === userId.toString();
          console.log('Creator blocked participant check:', { id: id?.toString(), userId: userId.toString(), result });
          return result;
        } catch (err) {
          console.error('Error checking creator blocked participant:', err, { id, userId });
          return false;
        }
      });
      
      // Check if participant has blocked the creator
      const participantBlockedCreator = participantBlockedUsers.some(id => {
        try {
          const result = id && id.toString() === game.creator.toString();
          console.log('Participant blocked creator check:', { id: id?.toString(), creatorId: game.creator.toString(), result });
          return result;
        } catch (err) {
          console.error('Error checking participant blocked creator:', err, { id, creatorId: game.creator });
          return false;
        }
      });
      
      if (creatorBlockedParticipant || participantBlockedCreator) {
              console.log('Blocking detected:', {
        creatorBlockedParticipant,
        participantBlockedCreator,
        creatorId: game.creator.toString(),
        participantId: userId,
        creatorBlockedUsers: creatorBlockedUsers.map(id => id.toString()),
        participantBlockedUsers: participantBlockedUsers.map(id => id.toString())
      });
      
      console.log('Detailed blocking info:', {
        creatorBlockedUsers: creatorBlockedUsers,
        participantBlockedUsers: participantBlockedUsers,
        creatorId: game.creator,
        participantId: userId,
        creatorIdType: typeof game.creator,
        participantIdType: typeof userId
      });
        throw new Error('You cannot join this switch game due to user blocking.');
      }
      
      // OSA-style content expiration setup based on participant's choice
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      game.participant = userId;
      game.participantDare = {
        description: dare, // Use the participant's own dare
        difficulty: difficulty, // Use the difficulty the participant chose
        move,
        consent
      };
      game.status = 'in_progress';
      game.contentDeletion = contentDeletion || 'delete_after_30_days'; // Participant's choice
      game.contentExpiresAt = thirtyDaysFromNow; // OSA automatic 30-day expiration
      await game.save();
      await game.populate('participant');
      await logActivity({ type: 'switchgame_joined', user: req.userId, switchGame: game._id });
      res.json(game);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Failed to join switch game.' });
    }
  }
);

// POST /api/switches/:id/move - submit RPS move (auth required)
// Implements OSA-style draw logic:
// - Rock vs Rock: Both lose, both must perform each other's demands
// - Paper vs Paper: Both win, no one does anything
// - Scissors vs Scissors: Coin flip determines random loser
router.post('/:id/move',
  require('express-validator').param('id').isMongoId(),
  auth,
  [
    require('express-validator').body('move').isString().isIn(['rock', 'paper', 'scissors'])
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const userId = req.userId;
      const { move } = req.body;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) throw new Error('Not found');
      if (!game.participant || !game.creator) throw new Error('Game is not ready.');
      if (![game.creator.toString(), game.participant?.toString()].includes(userId)) throw new Error('Not a participant');
      if (!['rock', 'paper', 'scissors'].includes(move)) throw new Error('Invalid move');
      // Only allow each user to submit their move once
      if (userId === game.creator.toString() && game.creatorDare.move) throw new Error('Creator has already submitted a move.');
      if (userId === game.participant?.toString() && game.participantDare.move) throw new Error('Participant has already submitted a move.');
      if (userId === game.creator.toString()) {
        game.creatorDare.move = move;
        console.log(`Creator move set: ${move} for game ${game._id}`);
      }
      if (userId === game.participant?.toString()) {
        game.participantDare.move = move;
        console.log(`Participant move set: ${move} for game ${game._id}`);
      }
      
      // Validate that moves were set correctly
      if (userId === game.creator.toString() && game.creatorDare.move !== move) {
        throw new Error('Failed to set creator move');
      }
      if (userId === game.participant?.toString() && game.participantDare.move !== move) {
        throw new Error('Failed to set participant move');
      }
      // If both moves present, determine winner
      let winner = null, loser = null;
      if (game.creatorDare.move && game.participantDare.move && !game.winner) {
        const m1 = game.creatorDare.move;
        const m2 = game.participantDare.move;
        
        if (m1 === m2) {
          // OSA Draw Logic: Special rules based on the gesture
          game.drawType = m1;
          
          if (m1 === 'rock') {
            // Both lose - both must perform each other's demands
            game.bothLose = true;
            game.status = 'awaiting_proof';
            // Set proof deadline based on participant's content deletion preference
            const proofDeadline = game.contentDeletion === 'delete_after_view' ? 24 : 
                                 game.contentDeletion === 'delete_after_30_days' ? 30 * 24 : 7 * 24; // hours
            game.proofExpiresAt = new Date(Date.now() + proofDeadline * 60 * 60 * 1000);
            // Both players need to submit proof
            await logActivity({ type: 'switchgame_draw_rock', user: game.creator, switchGame: game._id });
            await logActivity({ type: 'switchgame_draw_rock', user: game.participant, switchGame: game._id });
          } else if (m1 === 'paper') {
            // Both win - no one has to do anything
            game.bothWin = true;
            game.status = 'completed';
            await logActivity({ type: 'switchgame_draw_paper', user: game.creator, switchGame: game._id });
            await logActivity({ type: 'switchgame_draw_paper', user: game.participant, switchGame: game._id });
          } else if (m1 === 'scissors') {
            // Coin flip determines random loser
            const coinFlip = Math.random() < 0.5;
            if (coinFlip) {
              game.winner = game.creator;
              game.loser = game.participant;
              winner = game.creator;
              loser = game.participant;
            } else {
              game.winner = game.participant;
              game.loser = game.creator;
              winner = game.participant;
              loser = game.creator;
            }
            game.status = 'awaiting_proof';
            // Set proof deadline based on participant's content deletion preference
            const proofDeadline = game.contentDeletion === 'delete_after_view' ? 24 : 
                                 game.contentDeletion === 'delete_after_30_days' ? 30 * 24 : 7 * 24; // hours
            game.proofExpiresAt = new Date(Date.now() + proofDeadline * 60 * 60 * 1000);
            await logActivity({ type: 'switchgame_draw_scissors', user: winner, switchGame: game._id });
          }
        } else {
          // Normal win/lose scenario
          function beats(a, b) {
            return (
              (a === 'rock' && b === 'scissors') ||
              (a === 'scissors' && b === 'paper') ||
              (a === 'paper' && b === 'rock')
            );
          }
          if (beats(m1, m2)) {
            game.winner = game.creator;
            game.loser = game.participant;
            winner = game.creator;
            loser = game.participant;
          } else {
            game.winner = game.participant;
            game.loser = game.creator;
            winner = game.participant;
            loser = game.creator;
          }
          game.status = 'awaiting_proof';
          // Set proof deadline based on participant's content deletion preference
          const proofDeadline = game.contentDeletion === 'delete_after_view' ? 24 : 
                               game.contentDeletion === 'delete_after_30_days' ? 30 * 24 : 7 * 24; // hours
          game.proofExpiresAt = new Date(Date.now() + proofDeadline * 60 * 60 * 1000);
        }
      }
      // Validate that moves were saved
      if (game.creatorDare.move && game.participantDare.move) {
        console.log(`Both moves present - determining winner. Creator: ${game.creatorDare.move}, Participant: ${game.participantDare.move}`);
      } else {
        console.error(`Moves not properly saved. Creator move: ${game.creatorDare.move}, Participant move: ${game.participantDare.move}`);
      }
      
      // Save the game with proper error handling and atomic updates
      try {
        // First, ensure the moves are saved
        if (game.creatorDare.move || game.participantDare.move) {
          const moveUpdate = {
            $set: {}
          };
          
          if (game.creatorDare.move) {
            moveUpdate.$set['creatorDare.move'] = game.creatorDare.move;
          }
          if (game.participantDare.move) {
            moveUpdate.$set['participantDare.move'] = game.participantDare.move;
          }
          
          await SwitchGame.findByIdAndUpdate(game._id, moveUpdate);
          console.log(`Moves saved for game ${game._id}:`, moveUpdate.$set);
        }
        
        // Now save the entire game state
        await game.save();
        console.log(`Game ${game._id} saved successfully with moves and outcome`);
        
      } catch (saveError) {
        console.error(`Failed to save game ${game._id}:`, saveError);
        
        // If the main save fails, try to save the outcome separately
        try {
          const outcomeUpdate = {
            $set: {}
          };
          
          if (game.winner) outcomeUpdate.$set.winner = game.winner;
          if (game.loser) outcomeUpdate.$set.loser = game.loser;
          if (game.status) outcomeUpdate.$set.status = game.status;
          if (game.bothLose !== undefined) outcomeUpdate.$set.bothLose = game.bothLose;
          if (game.bothWin !== undefined) outcomeUpdate.$set.bothWin = game.bothWin;
          if (game.drawType) outcomeUpdate.$set.drawType = game.drawType;
          if (game.proofExpiresAt) outcomeUpdate.$set.proofExpiresAt = game.proofExpiresAt;
          
          if (Object.keys(outcomeUpdate.$set).length > 0) {
            await SwitchGame.findByIdAndUpdate(game._id, outcomeUpdate);
            console.log(`Outcome saved separately for game ${game._id}:`, outcomeUpdate.$set);
          }
          
          // Refresh the game object
          const updatedGame = await SwitchGame.findById(game._id);
          if (updatedGame) {
            Object.assign(game, updatedGame.toObject());
          }
        } catch (fallbackError) {
          console.error(`Fallback save also failed for game ${game._id}:`, fallbackError);
          throw new Error(`Failed to save game state: ${fallbackError.message}`);
        }
      }
      
      await game.populate('creator participant winner loser');
      
      // Final validation - verify the data was actually saved
      const finalGame = await SwitchGame.findById(game._id);
      if (finalGame) {
        console.log('Final game state verification:', {
          gameId: finalGame._id,
          creatorMove: finalGame.creatorDare?.move,
          participantMove: finalGame.participantDare?.move,
          winner: finalGame.winner,
          loser: finalGame.loser,
          status: finalGame.status
        });
        
        // Update the game object with the final state
        Object.assign(game, finalGame.toObject());
      }
      
      // Debug logging for game outcome
      console.log('Game outcome determined:', {
        gameId: game._id,
        creatorMove: game.creatorDare?.move,
        participantMove: game.participantDare?.move,
        winner: game.winner?._id || game.winner,
        loser: game.loser?._id || game.loser,
        bothLose: game.bothLose,
        bothWin: game.bothWin,
        drawType: game.drawType,
        status: game.status,
        proofExpiresAt: game.proofExpiresAt
      });
      
      if (winner) {
        await logActivity({ type: 'switchgame_won', user: winner, switchGame: game._id });
      }
      res.json(game);
    } catch (err) {
      console.error('Move submission error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit move.';
      if (err.message.includes('validation failed')) {
        errorMessage = 'Invalid move data. Please try again.';
      } else if (err.message.includes('save')) {
        errorMessage = 'Failed to save move. Please try again.';
      } else if (err.message.includes('not found')) {
        errorMessage = 'Game not found.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      res.status(400).json({ error: errorMessage });
    }
  }
);

// POST /api/switches/:id/proof - submit proof (auth required)
router.post('/:id/proof',
  require('express-validator').param('id').isMongoId(),
  proofUpload.array('files', 5), // Allow up to 5 files
  [
    require('express-validator').body('text').optional().isString().isLength({ max: 1000 }).trim().escape(),
    require('express-validator').body('expireAfterView').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const userId = req.userId;
      const { text, expireAfterView } = req.body;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) throw new Error('Not found');
      // Debug logging

      // Handle different proof submission scenarios
      if (game.bothLose) {
        // Both players must submit proof in rock vs rock draw
        if (![game.creator.toString(), game.participant?.toString()].includes(userId)) {
          throw new Error('Only participants can submit proof');
        }
      } else if (game.bothWin) {
        // No proof needed for paper vs paper draw
        throw new Error('No proof needed - both players won');
      } else {
        // Normal scenario - only loser submits proof
        if (!game.winner || ![game.creator.toString(), game.participant?.toString()].includes(userId) || userId !== game.loser?.toString()) {
          throw new Error('Only the loser can submit proof');
        }
      }
      if (game.status !== 'awaiting_proof') throw new Error('Proof cannot be submitted at this stage.');
      if (game.proofExpiresAt && Date.now() > game.proofExpiresAt.getTime()) {
        return res.status(400).json({ error: 'Proof submission window has expired.' });
      }
      // Blocked user check for proof submission
      const creatorUser = await User.findById(game.creator).select('blockedUsers');
      const participantUser = await User.findById(game.participant).select('blockedUsers');
      if (
        (creatorUser.blockedUsers && participantUser.blockedUsers && creatorUser.blockedUsers.some(id => id.toString() === game.participant.toString())) ||
        (creatorUser.blockedUsers && participantUser.blockedUsers && participantUser.blockedUsers.some(id => id.toString() === game.creator.toString()))
      ) {
        return res.status(400).json({ error: 'You cannot submit proof due to user blocking.' });
      }
      // Submit proof (no resubmissions allowed)
      if (game.proof && game.proof.user) {
        throw new Error('Proof has already been submitted. Resubmissions are not allowed.');
      }
      
      // Handle file uploads
      let proofFiles = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          proofFiles.push({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
          });
        }
      }
      
      game.proof = { 
        user: userId, 
        text,
        files: proofFiles,
        expireAfterView: expireAfterView || false
      };
      console.log(`New proof submitted for game ${game._id} by user ${userId} with ${proofFiles.length} files`);
      
      game.status = 'proof_submitted';
      // Set proof expiration based on participant's content deletion preference
      const proofExpiration = game.contentDeletion === 'delete_after_view' ? 24 : 
                              game.contentDeletion === 'delete_after_30_days' ? 30 * 24 : 7 * 24; // hours
      game.proofExpiresAt = new Date(Date.now() + proofExpiration * 60 * 60 * 1000);
      await game.save();
      res.json({ message: 'Proof submitted successfully.', game });
    } catch (err) {
      console.error('Proof submission error:', err);
      
      // If files were uploaded but DB update failed, delete the files
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error('Failed to delete uploaded file:', e);
          }
        }
      }
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit proof.';
      if (err.message.includes('not found')) {
        errorMessage = 'Game not found.';
      } else if (err.message.includes('cannot be submitted')) {
        errorMessage = 'Proof cannot be submitted at this stage.';
      } else if (err.message.includes('expired')) {
        errorMessage = 'Proof submission window has expired.';
      } else if (err.message.includes('blocking')) {
        errorMessage = 'Cannot submit proof due to user blocking.';
      } else if (err.message.includes('Invalid file type')) {
        errorMessage = 'Invalid file type. Only images and videos are allowed.';
      } else if (err.message.includes('File too large')) {
        errorMessage = 'File too large. Maximum size is 10MB.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      res.status(400).json({ error: errorMessage });
    }
  }
);

// PATCH /api/switches/:id/proof-viewed - mark proof as viewed (auth required)
router.patch('/:id/proof-viewed', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const game = await SwitchGame.findById(req.params.id);
    if (!game) throw new Error('Not found');
    if (!game.creator.equals(userId)) throw new Error('Only the creator can mark proof as viewed.');
    if (game.expireProofAfterView && !game.proofViewedAt) {
      game.proofViewedAt = new Date();
      // Set proof expiration based on participant's content deletion preference
      const proofExpiration = game.contentDeletion === 'delete_after_view' ? 24 : 
                              game.contentDeletion === 'delete_after_30_days' ? 30 * 24 : 7 * 24; // hours
      game.proofExpiresAt = new Date(Date.now() + proofExpiration * 60 * 60 * 1000);
      await game.save();
    }
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to mark proof as viewed.' });
  }
});

// POST /api/switches/:id/proof-review - winner reviews submitted proof (approve/reject)
router.post('/:id/proof-review', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { action, feedback } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action.' });
    }
    const game = await SwitchGame.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Switch game not found.' });
    if (!game.winner || game.winner.toString() !== userId) {
      return res.status(403).json({ error: 'Only the winner can review proof.' });
    }
    if (game.status !== 'proof_submitted') {
      return res.status(400).json({ error: 'Proof is not awaiting review.' });
    }
    // Ensure we have the loser ID
    let loserId;
    if (game.loser) {
      loserId = game.loser;
    } else {
      // Fallback: determine loser based on winner
      loserId = (game.creator.toString() === userId) ? game.participant : game.creator;
      game.loser = loserId; // Set the missing loser field
    }
    
    if (action === 'approve') {
      game.status = 'completed';
      game.updatedAt = new Date();
      if (!game.winner) game.winner = userId;
      if (!game.loser) game.loser = loserId;
      game.proof.review = { action: 'approved', feedback: feedback || '' };
      await game.save();
      // Decrement openDares for the loser
      const User = require('../models/User');
      await User.findByIdAndUpdate(loserId, { $inc: { openDares: -1 } });
      await sendNotification(loserId, 'switchgame_proof_approved', 'Your proof for the switch game was approved.', req.userId);
      return res.json({ message: 'Proof approved.', game });
    } else {
      game.status = 'awaiting_proof';
      game.proof.review = { action: 'rejected', feedback: feedback || '' };
      await game.save();
      await sendNotification(loserId, 'switchgame_proof_rejected', `Your proof for the switch game was rejected.${feedback ? ' Feedback: ' + feedback : ''}`, req.userId);
      return res.json({ message: 'Proof rejected.', game });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to review proof.' });
  }
});

// POST /api/switches/:id/chicken-out - creator or participant chickens out of a switch game
router.post('/:id/chicken-out',
  (req, res, next) => {
    if (Object.keys(req.body).length > 0) {
      return res.status(400).json({ error: 'No body expected.' });
    }
    next();
  },
  auth,
  async (req, res) => {
    try {
      const userId = req.userId;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) return res.status(404).json({ error: 'Switch game not found.' });
      if (game.status !== 'in_progress') {
        return res.status(400).json({ error: 'Only in-progress games can be chickened out of.' });
      }
      if (![game.creator.toString(), game.participant?.toString()].includes(userId)) {
        return res.status(403).json({ error: 'Only the creator or participant can chicken out of this game.' });
      }
      game.status = 'chickened_out';
      game.updatedAt = new Date();
      await game.save();
              // Decrement openDares for the user who chickened out
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, { $inc: { openDares: -1 } });
              await logActivity({ type: 'switchgame_chickened_out', user: req.userId, switchGame: game._id });
      // Notify the other user
      const otherUser = userId === game.creator.toString() ? game.participant : game.creator;
      if (otherUser) {
        await sendNotification(
          otherUser,
          'switchgame_chickened_out',
          `A user has chickened out of the switch game. You may start a new game or wait for another participant.`,
          req.userId
        );
      }
      // Optionally log the action (if you have a logActivity util for switch games)
              res.json({ message: 'Switch game chickened out successfully.', game });
    } catch (err) {
              res.status(500).json({ error: 'Failed to chicken out of switch game.' });
    }
  }
);

// POST /api/switches/:id/grade - grade a switch game (auth required)
router.post('/:id/grade',
  [
    body('grade').isInt({ min: 1, max: 5 }),
    body('feedback').optional().isString().isLength({ max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { grade, feedback } = req.body;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) return res.status(404).json({ error: 'Switch game not found.' });
      game.grades = game.grades || [];
      if (game.grades.some(g => g.user.toString() === req.userId)) {
        return res.status(400).json({ error: 'You have already graded this switch game.' });
      }
      // Blocked user check for grading
      const graderUser = await User.findById(req.userId).select('blockedUsers');
      const targetUser = game.creator.equals(req.userId) ? await User.findById(game.participant).select('blockedUsers') : await User.findById(game.creator).select('blockedUsers');
      if (
        (graderUser.blockedUsers && targetUser && targetUser.blockedUsers && targetUser.blockedUsers.some(id => id.toString() === req.userId.toString())) ||
        (graderUser.blockedUsers && graderUser.blockedUsers.some(id => id.toString() === targetUser?._id?.toString()))
      ) {
        return res.status(400).json({ error: 'You cannot grade this user due to user blocking.' });
      }
      game.grades.push({ user: req.userId, grade, feedback });
      await game.save();
      res.json({ message: 'Grade submitted.', game });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit grade.' });
    }
  }
);

// GET /api/switches/debug/blocking - debug endpoint for blocking issues
router.get('/debug/blocking', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('blockedUsers');
    
    res.json({
      userId: userId.toString(),
      userBlockedUsers: user?.blockedUsers || [],
      userBlockedUsersType: typeof user?.blockedUsers,
      isArray: Array.isArray(user?.blockedUsers),
      blockedUsersLength: user?.blockedUsers?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/switches/:id - allow deletion regardless of status
router.delete('/:id', auth, async (req, res) => {
  try {
    const game = await SwitchGame.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Switch game not found.' });

    // Fetch the user and check for admin role
    const user = await User.findById(req.userId);
    const isAdmin = user && user.roles && user.roles.includes('admin');

    // If creator is missing or invalid, only allow admin to delete
    if ((!game.creator || typeof game.creator.equals !== 'function' || !game.creator.equals(req.userId)) && !isAdmin) {
      return res.status(403).json({ error: 'Only the creator or an admin can delete this switch game.' });
    }

    await game.deleteOne();
    res.json({ message: 'Switch game deleted.' });
  } catch (err) {
    // console.error('Failed to delete switch game:', err);
    res.status(500).json({ error: 'Failed to delete switch game.' });
  }
});



// POST /api/switches/:id/fix-game-state - fix inconsistent game state (admin only)
router.post('/:id/fix-game-state', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const game = await SwitchGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Switch game not found.' });
    }
    
    if (game.status === 'awaiting_proof' && game.winner && !game.loser) {
      // Fix missing loser field
      if (game.winner.equals(game.creator)) {
        game.loser = game.participant;
      } else {
        game.loser = game.creator;
      }
      
      // Set moves if they're missing (this is a fallback)
      if (!game.creatorDare.move) {
        game.creatorDare.move = 'rock'; // Default fallback
      }
      if (!game.participantDare.move) {
        game.participantDare.move = 'scissors'; // Default fallback
      }
      
      await game.save();
      await game.populate('creator participant winner loser');
      
      res.json({ 
        message: 'Game state fixed successfully.', 
        game,
        fixed: {
          loser: game.loser,
          creatorMove: game.creatorDare.move,
          participantMove: game.participantDare.move
        }
      });
    } else {
      res.json({ message: 'Game state is already consistent or cannot be fixed.', game });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/switches/:id/self-fix - fix inconsistent game state (participants only)
router.post('/:id/self-fix', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const game = await SwitchGame.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Switch game not found.' });
    }
    
    // Only allow participants to fix their own game
    if (![game.creator.toString(), game.participant?.toString()].includes(userId)) {
      return res.status(403).json({ error: 'Only game participants can fix this game.' });
    }
    
    // Only fix games that are in awaiting_proof status with missing data
    if (game.status === 'awaiting_proof' && game.winner && !game.loser) {
      console.log(`Fixing game state for game ${game._id} by user ${userId}`);
      
      // Fix missing loser field based on winner
      if (game.winner.equals(game.creator)) {
        game.loser = game.participant;
      } else {
        game.loser = game.creator;
      }
      
      // If moves are missing, we need to determine them logically
      // Since the game reached awaiting_proof, both moves must have been submitted
      // But they weren't saved properly, so we'll infer them
      if (!game.creatorDare.move || !game.participantDare.move) {
        // Infer moves based on the winner/loser pattern
        // This is a reasonable assumption since the game progressed to awaiting_proof
        if (game.winner.equals(game.participant)) {
          // Participant won, so participant's move beats creator's move
          if (!game.participantDare.move) game.participantDare.move = 'rock';
          if (!game.creatorDare.move) game.creatorDare.move = 'scissors';
        } else {
          // Creator won, so creator's move beats participant's move
          if (!game.creatorDare.move) game.creatorDare.move = 'rock';
          if (!game.participantDare.move) game.participantDare.move = 'scissors';
        }
      }
      
      await game.save();
      await game.populate('creator participant winner loser');
      
      console.log(`Game ${game._id} fixed successfully. Loser: ${game.loser}, Creator move: ${game.creatorDare.move}, Participant move: ${game.participantDare.move}`);
      
      res.json({ 
        message: 'Game state fixed successfully!', 
        game,
        fixed: {
          loser: game.loser,
          creatorMove: game.creatorDare.move,
          participantMove: game.participantDare.move
        }
      });
    } else {
      res.json({ 
        message: 'Game state is already consistent or cannot be fixed.', 
        game,
        status: game.status,
        hasWinner: !!game.winner,
        hasLoser: !!game.loser
      });
    }
  } catch (err) {
    console.error('Error fixing game state:', err);
    res.status(500).json({ error: err.message });
  }
});

// Schedule cleanup of expired proofs every hour
setInterval(cleanupExpiredProofs, 60 * 60 * 1000);

// POST /api/switches/:id/like - like a switch game
router.post('/:id/like', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const game = await SwitchGame.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Switch game not found.' });
    }
    
    // Check if user already liked this game
    if (game.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have already liked this game.' });
    }
    
    // Add user to likes array
    game.likes.push(userId);
    await game.save();
    
    // Log activity
    await logActivity({
      user: userId,
      type: 'switchgame_liked',
      description: `Liked switch game`,
      switchGame: game._id
    });
    
    // Populate creator and participant for response
    await game.populate('creator participant');
    
    res.json({ 
      message: 'Game liked successfully!',
      isLiked: true,
      likesCount: game.likes.length,
      game
    });
  } catch (err) {
    console.error('Error liking switch game:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/switches/:id/like - unlike a switch game
router.delete('/:id/like', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const game = await SwitchGame.findById(req.params.id);
    
    if (!game) {
      return res.status(404).json({ error: 'Switch game not found.' });
    }
    
    // Check if user has liked this game
    if (!game.likes.includes(userId)) {
      return res.status(400).json({ error: 'You have not liked this game.' });
    }
    
    // Remove user from likes array
    game.likes = game.likes.filter(id => !id.equals(userId));
    await game.save();
    
    // Log activity
    await logActivity({
      user: userId,
      type: 'switchgame_unliked',
      description: `Unliked switch game`,
      switchGame: game._id
    });
    
    // Populate creator and participant for response
    await game.populate('creator participant');
    
          res.json({ 
        message: 'Game unliked successfully!',
        isLiked: false,
        likesCount: game.likes.length,
        game
      });
  } catch (err) {
    console.error('Error unliking switch game:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 