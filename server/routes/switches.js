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
  try {
    const { description, difficulty, move } = req.body;
    const creator = getUsername(req);
    if (!description || !difficulty || !move) {
      return res.status(400).json({ error: 'Description, difficulty, and move are required.' });
    }
    const game = new SwitchGame({
      status: 'open',
      creator,
      creatorDare: { description, difficulty, move },
    });
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create switch game.' });
  }
});

// POST /api/switches/:id/join - join a game
router.post('/:id/join', async (req, res) => {
  try {
    const username = getUsername(req);
    const { difficulty, move, consent } = req.body;
    const game = await SwitchGame.findById(req.params.id);
    if (!game) throw new Error('Not found');
    if (game.participant) throw new Error('This switch game already has a participant.');
    if (game.creator === username) throw new Error('Creator cannot join as participant.');
    if (!difficulty || !move || !consent) throw new Error('Difficulty, move, and consent are required.');
    game.participant = username;
    game.participantDare = { difficulty, move, consent };
    game.status = 'in_progress';
    await game.save();
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to join switch game.' });
  }
});

// POST /api/switches/:id/move - submit RPS move
router.post('/:id/move', async (req, res) => {
  try {
    const username = getUsername(req);
    const { move } = req.body;
    const game = await SwitchGame.findById(req.params.id);
    if (!game) throw new Error('Not found');
    if (!game.participant || !game.creator) throw new Error('Game is not ready.');
    if (![game.creator, game.participant].includes(username)) throw new Error('Not a participant');
    if (!['rock', 'paper', 'scissors'].includes(move)) throw new Error('Invalid move');
    // Only allow each user to submit their move once
    if (username === game.creator && game.creatorDare.move) throw new Error('Creator has already submitted a move.');
    if (username === game.participant && game.participantDare.move) throw new Error('Participant has already submitted a move.');
    if (username === game.creator) game.creatorDare.move = move;
    if (username === game.participant) game.participantDare.move = move;
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
        game.status = 'awaiting_proof';
        game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      }
    }
    await game.save();
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to submit move.' });
  }
});

// POST /api/switches/:id/proof - submit proof (by loser)
router.post('/:id/proof', async (req, res) => {
  try {
    const username = getUsername(req);
    const { text } = req.body;
    const game = await SwitchGame.findById(req.params.id);
    if (!game) throw new Error('Not found');
    if (!game.winner || ![game.creator, game.participant].includes(username) || username !== game.loser) {
      throw new Error('Only the loser can submit proof');
    }
    if (game.status !== 'awaiting_proof') throw new Error('Proof cannot be submitted at this stage.');
    if (game.proofExpiresAt && Date.now() > game.proofExpiresAt.getTime()) {
      game.status = 'expired';
      await game.save();
      return res.status(400).json({ error: 'Proof submission window has expired.' });
    }
    game.proof = { user: username, text };
    game.status = 'proof_submitted';
    await game.save();
    res.json(game);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to submit proof.' });
  }
});

// TODO: If grading/approval endpoints are added, block if proofExpiresAt < now

module.exports = router; 