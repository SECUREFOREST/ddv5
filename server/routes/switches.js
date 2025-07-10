const express = require('express');
const router = express.Router();
const SwitchGame = require('../models/SwitchGame');
const Act = require('../models/Act');
const { sendNotification } = require('../utils/notification');
const mongoose = require('mongoose');

// TODO: Replace with real auth middleware
function getUsername(req) {
  // In production, use req.user.username from auth middleware
  return req.body.username || req.query.username || 'anonymous';
}

// GET /api/switches - list all switch games
router.get('/', async (req, res) => {
  const games = await SwitchGame.find().sort({ createdAt: -1 });
  res.json(games);
});

// GET /api/switches/:id - get game details
router.get('/:id', async (req, res) => {
  const game = await SwitchGame.findById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Not found' });
  res.json(game);
});

// POST /api/switches - create new game
router.post('/', async (req, res) => {
  const { name } = req.body;
  const game = new SwitchGame({ name, participants: [], moves: {} });
  await game.save();
  res.status(201).json(game);
});

// POST /api/switches/:id/join - join a game
router.post('/:id/join', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const username = getUsername(req);
    const game = await SwitchGame.findById(req.params.id).session(session);
    if (!game) throw new Error('Not found');
    if (game.participant) throw new Error('This switch game already has a participant.');
    if (game.creator === username) throw new Error('Creator cannot join as participant.');
    // Assign a random dare (act) to the participant (pseudo-code, replace with your logic)
    const dare = await Act.findOneAndUpdate(
      { status: 'pending', performer: { $exists: false }, actType: 'switch' },
      { status: 'in_progress', performer: game._id },
      { new: true, session }
    );
    if (!dare) throw new Error('No available dare to assign.');
    game.participant = username;
    game.assignedDareId = dare._id;
    game.status = 'in_progress';
    dare.status = 'in_progress';
    await game.save({ session });
    await dare.save({ session });
    await session.commitTransaction();
    res.json(game);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message || 'Failed to join and assign dare.' });
  } finally {
    session.endSession();
  }
});

// POST /api/switches/:id/move - submit RPS move
router.post('/:id/move', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const username = getUsername(req);
    const { move } = req.body;
    const game = await SwitchGame.findById(req.params.id).session(session);
    if (!game) throw new Error('Not found');
    if (!game.participant || !game.creator) throw new Error('Game is not ready.');
    if (![game.creator, game.participant].includes(username)) throw new Error('Not a participant');
    if (!['rock', 'paper', 'scissors'].includes(move)) throw new Error('Invalid move');
    game.moves.set(username, move);
    let winner = null, loser = null;
    if (game.moves.size === 2 && !game.winner) {
      const [p1, p2] = [game.creator, game.participant];
      const m1 = game.moves.get(p1);
      const m2 = game.moves.get(p2);
      if (m1 === m2) {
        game.moves = new Map();
      } else {
        function beats(a, b) {
          return (
            (a === 'rock' && b === 'scissors') ||
            (a === 'scissors' && b === 'paper') ||
            (a === 'paper' && b === 'rock')
          );
        }
        if (beats(m1, m2)) {
          game.winner = p1;
          winner = p1; loser = p2;
        } else {
          game.winner = p2;
          winner = p2; loser = p1;
        }
        game.status = 'completed';
        if (game.assignedDareId) {
          const dare = await Act.findById(game.assignedDareId).session(session);
          if (dare) {
            dare.status = 'completed';
            await dare.save({ session });
          }
        }
      }
    }
    await game.save({ session });
    await session.commitTransaction();
    res.json(game);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message || 'Failed to submit move.' });
  } finally {
    session.endSession();
  }
});

// POST /api/switches/:id/proof - submit proof (by loser)
router.post('/:id/proof', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const username = getUsername(req);
    const { text } = req.body;
    const game = await SwitchGame.findById(req.params.id).session(session);
    if (!game) throw new Error('Not found');
    if (!game.winner || ![game.creator, game.participant].includes(username) || username === game.winner) {
      throw new Error('Only the loser can submit proof');
    }
    game.proof = { user: username, text };
    game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await game.save({ session });
    if (game.assignedDareId) {
      const dare = await Act.findById(game.assignedDareId).session(session);
      if (dare) {
        dare.status = 'proof_submitted';
        await dare.save({ session });
      }
    }
    await session.commitTransaction();
    res.json(game);
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message || 'Failed to submit proof.' });
  } finally {
    session.endSession();
  }
});

// TODO: If grading/approval endpoints are added, block if proofExpiresAt < now

module.exports = router; 