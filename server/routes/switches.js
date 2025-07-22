const express = require('express');
const router = express.Router();
const SwitchGame = require('../models/SwitchGame');
const Dare = require('../models/Dare');
const { sendNotification } = require('../utils/notification');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const allowedProofTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
const MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10MB

// GET /api/switches - list all switch games (auth required, filter out blocked users)
const User = require('../models/User');
const auth = require('../middleware/auth');
router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('blockedUsers');
  // Only return joinable games: status = 'waiting_for_participant', participant = null, and not created by current user
  const filter = { status: 'waiting_for_participant', participant: null, creator: { $ne: req.userId } };
  if (req.query.difficulty) filter['creatorDare.difficulty'] = req.query.difficulty;
  let games = await SwitchGame.find(filter).populate('creator', 'username fullName avatar participant winner proof.user').sort({ createdAt: -1 });
  if (user && user.blockedUsers && user.blockedUsers.length > 0) {
    games = games.filter(g => {
      // If creator or participant is blocked, filter out
      const creatorId = g.creator?._id?.toString() || g.creator?.toString();
      const participantId = g.participant?._id?.toString() || g.participant?.toString();
      return !user.blockedUsers.map(bu => bu.toString()).includes(creatorId) &&
             (!participantId || !user.blockedUsers.map(bu => bu.toString()).includes(participantId));
    });
  }
  res.json(games);
});

// GET /api/switches/performer - get all switch games where current user is creator or participant
router.get('/performer', auth, async (req, res) => {
  try {
    const { status } = req.query;
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
    const games = await SwitchGame.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('participant', 'username fullName avatar')
      .populate('winner', 'username fullName avatar')
      .sort({ updatedAt: -1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performer switch games.' });
  }
});

// GET /api/switches/history - get all completed/forfeited/expired switch games for current user
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
          status: { $in: ['completed', 'forfeited', 'expired'] }
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
      .isIn(['rock', 'paper', 'scissors']).withMessage('Move must be one of: rock, paper, scissors.')
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
      const { description, difficulty, move } = req.body;
      const creator = req.userId; // Use authenticated user's ID
      if (!description || !difficulty || !move) {
        return res.status(400).json({ error: 'Description, difficulty, and move are required.' });
      }
      const game = new SwitchGame({
        status: 'waiting_for_participant',
        creator,
        creatorDare: { description, difficulty, move },
      });
      await game.save();
      await game.populate('creator');
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
    require('express-validator').body('consent').isBoolean()
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
      const { difficulty, move, consent } = req.body;
      const game = await SwitchGame.findById(req.params.id);
      if (!game) throw new Error('Not found');
      if (game.status !== 'waiting_for_participant' || game.participant) {
        throw new Error('This switch game is no longer available to join.');
      }
      if (game.participant) throw new Error('This switch game already has a participant.');
      if (game.creator.equals(userId)) throw new Error('You cannot join your own switch game as a participant.');
      if (!difficulty || !move || !consent) throw new Error('Difficulty, move, and consent are required.');
      // Blocked user check
      const creator = await User.findById(game.creator).select('blockedUsers');
      const participantUser = await User.findById(userId).select('blockedUsers');
      if (
        (creator.blockedUsers && creator.blockedUsers.includes(userId)) ||
        (participantUser.blockedUsers && participantUser.blockedUsers.includes(game.creator.toString()))
      ) {
        throw new Error('You cannot join this switch game due to user blocking.');
      }
      // Assign a random dare to the participant from the pool with the same difficulty, dareType 'switch', not created by the participant
      const darePool = await Dare.aggregate([
        { $match: {
            difficulty: difficulty,
            dareType: 'switch',
            creator: { $ne: mongoose.Types.ObjectId(userId) },
            public: true
          }
        },
        { $sample: { size: 1 } }
      ]);
      if (!darePool.length) {
        return res.status(400).json({ error: 'No available dares for this difficulty. Please try another difficulty or contact support.' });
      }
      const randomDare = darePool[0];
      game.participant = userId;
      game.participantDare = {
        description: randomDare.description,
        difficulty: randomDare.difficulty,
        move,
        consent
      };
      game.status = 'in_progress';
      await game.save();
      await game.populate('participant');
      res.json(game);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Failed to join switch game.' });
    }
  }
);

// POST /api/switches/:id/move - submit RPS move (auth required)
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
      if (userId === game.creator.toString()) game.creatorDare.move = move;
      if (userId === game.participant?.toString()) game.participantDare.move = move;
      // If both moves present, determine winner
      let winner = null, loser = null;
      if (game.creatorDare.move && game.participantDare.move && !game.winner) {
        const m1 = game.creatorDare.move;
        const m2 = game.participantDare.move;
        if (m1 === m2) {
          // Draw: clear moves for replay
          game.creatorDare.move = undefined;
          game.participantDare.move = undefined;
        } else {
          function beats(a, b) {
            return (
              (a === 'rock' && b === 'scissors') ||
              (a === 'scissors' && b === 'paper') ||
              (a === 'paper' && b === 'rock')
            );
          }
          if (beats(m1, m2)) {
            game.winner = game.creator;
            winner = game.creator; loser = game.participant;
          } else {
            game.winner = game.participant;
            winner = game.participant; loser = game.creator;
          }
          game.loser = loser; // <-- Ensure loser is set
          game.status = 'awaiting_proof';
          game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        }
      }
      await game.save();
      await game.populate('creator participant winner');
      res.json(game);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Failed to submit move.' });
    }
  }
);

// POST /api/switches/:id/proof - submit proof (auth required)
router.post('/:id/proof',
  require('express-validator').param('id').isMongoId(),
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
      console.log('[DEBUG] userId:', userId, 'game.loser:', game.loser, 'game.creator:', game.creator, 'game.participant:', game.participant, 'game.winner:', game.winner);
      if (!game.winner || ![game.creator.toString(), game.participant?.toString()].includes(userId) || userId !== game.loser?.toString()) {
        throw new Error('Only the loser can submit proof');
      }
      if (game.status !== 'awaiting_proof') throw new Error('Proof cannot be submitted at this stage.');
      if (game.proofExpiresAt && Date.now() > game.proofExpiresAt.getTime()) {
        game.status = 'expired';
        await game.save();
        return res.status(400).json({ error: 'Proof submission window has expired.' });
      }
      // Blocked user check for proof submission
      const creatorUser = await User.findById(game.creator).select('blockedUsers');
      const participantUser = await User.findById(game.participant).select('blockedUsers');
      if (
        (creatorUser.blockedUsers && participantUser && participantUser._id && creatorUser.blockedUsers.includes(participantUser._id.toString())) ||
        (participantUser && participantUser.blockedUsers && creatorUser._id && participantUser.blockedUsers.includes(creatorUser._id.toString()))
      ) {
        return res.status(400).json({ error: 'You cannot submit proof for this switch game due to user blocking.' });
      }
      game.proof = { user: userId, text };
      game.status = 'proof_submitted';
      if (expireAfterView) {
        game.expireProofAfterView = true;
        game.proofExpiresAt = undefined;
      } else {
        game.expireProofAfterView = false;
        game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      }
      await game.save();
      await game.populate('proof.user');
      res.json(game);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Failed to submit proof.' });
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
      game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
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
    const loserId = (game.creator.toString() === userId) ? game.participant : game.creator;
    if (action === 'approve') {
      game.status = 'completed';
      game.updatedAt = new Date();
      if (!game.winner) game.winner = userId;
      const loserId = (game.creator.toString() === userId) ? game.participant : game.creator;
      if (!game.loser) game.loser = loserId;
      game.proof.review = { action: 'approved', feedback: feedback || '' };
      await game.save();
      // Decrement openDares for the loser
      const User = require('../models/User');
      await User.findByIdAndUpdate(loserId, { $inc: { openDares: -1 } });
      await sendNotification(loserId, 'switchgame_proof_approved', 'Your proof for the switch game was approved.');
      return res.json({ message: 'Proof approved.', game });
    } else {
      game.status = 'awaiting_proof';
      game.proof.review = { action: 'rejected', feedback: feedback || '' };
      await game.save();
      await sendNotification(loserId, 'switchgame_proof_rejected', `Your proof for the switch game was rejected.${feedback ? ' Feedback: ' + feedback : ''}`);
      return res.json({ message: 'Proof rejected.', game });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to review proof.' });
  }
});

// POST /api/switches/:id/forfeit - creator or participant forfeits (chickens out) of a switch game
router.post('/:id/forfeit',
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
        return res.status(400).json({ error: 'Only in-progress games can be forfeited.' });
      }
      if (![game.creator.toString(), game.participant?.toString()].includes(userId)) {
        return res.status(403).json({ error: 'Only the creator or participant can forfeit this game.' });
      }
      game.status = 'forfeited';
      game.updatedAt = new Date();
      await game.save();
      // Decrement openDares for the forfeiting user
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, { $inc: { openDares: -1 } });
      // Notify the other user
      const otherUser = userId === game.creator.toString() ? game.participant : game.creator;
      if (otherUser) {
        await sendNotification(
          otherUser,
          'switchgame_forfeited',
          `A user has chickened out (forfeited) the switch game. You may start a new game or wait for another participant.`
        );
      }
      // Optionally log the action (if you have a logActivity util for switch games)
      res.json({ message: 'Switch game forfeited (chickened out).', game });
    } catch (err) {
      res.status(500).json({ error: 'Failed to forfeit switch game.' });
    }
  }
);

// POST /api/switches/:id/grade - grade a switch game (auth required)
router.post('/:id/grade',
  [
    body('grade').isInt({ min: 1, max: 10 }),
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
        (graderUser.blockedUsers && targetUser && targetUser.blockedUsers && targetUser.blockedUsers.includes(req.userId)) ||
        (graderUser.blockedUsers && graderUser.blockedUsers.includes(targetUser?._id?.toString()))
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

// DELETE /api/switches/:id - only creator can delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const game = await SwitchGame.findById(req.params.id);
    if (!game) return res.status(404).json({ error: 'Switch game not found.' });

    // Fetch the user and check for admin role
    const user = await User.findById(req.userId);
    const isAdmin = user && user.roles && user.roles.includes('admin');

    if (!game.creator.equals(req.userId) && !isAdmin) {
      return res.status(403).json({ error: 'Only the creator or an admin can delete this switch game.' });
    }

    await game.deleteOne();
    res.json({ message: 'Switch game deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete switch game.' });
  }
});

// TODO: If grading/approval endpoints are added, block if proofExpiresAt < now

module.exports = router; 