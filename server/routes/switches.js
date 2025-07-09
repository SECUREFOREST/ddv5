const express = require('express');
const router = express.Router();
const SwitchGame = require('../models/SwitchGame');
const { sendNotification } = require('../utils/notification');

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
  const username = getUsername(req);
  const game = await SwitchGame.findById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Not found' });
  if (!game.participants.includes(username) && game.participants.length < 2) {
    game.participants.push(username);
    await game.save();
    // Notify both participants if game is now full
    if (game.participants.length === 2) {
      await sendNotification(game.participants[0], 'switch_joined', `Your switch game now has two participants.`);
      await sendNotification(game.participants[1], 'switch_joined', `Your switch game now has two participants.`);
    }
  }
  res.json(game);
});

// POST /api/switches/:id/move - submit RPS move
router.post('/:id/move', async (req, res) => {
  const username = getUsername(req);
  const { move } = req.body;
  const game = await SwitchGame.findById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Not found' });
  if (!game.participants.includes(username)) return res.status(403).json({ error: 'Not a participant' });
  if (!['rock', 'paper', 'scissors'].includes(move)) return res.status(400).json({ error: 'Invalid move' });
  game.moves.set(username, move);
  // If both moves present, determine winner
  let notifyMoves = false;
  let winner = null, loser = null;
  if (game.participants.length === 2 && game.moves.size === 2 && !game.winner) {
    const [p1, p2] = game.participants;
    const m1 = game.moves.get(p1);
    const m2 = game.moves.get(p2);
    if (m1 === m2) {
      // Draw: clear moves for replay
      game.moves = new Map();
      notifyMoves = true;
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
    }
  }
  await game.save();
  // Notify both participants if both moves are in
  if (game.participants.length === 2 && game.moves.size === 2) {
    const [p1, p2] = game.participants;
    await sendNotification(p1, 'switch_moves', 'Both players have made their moves.');
    await sendNotification(p2, 'switch_moves', 'Both players have made their moves.');
  }
  // Notify winner and loser if game is completed
  if (winner && loser) {
    await sendNotification(winner, 'switch_win', 'You won the switch game!');
    await sendNotification(loser, 'switch_lose', 'You lost the switch game. Please submit your proof.');
  }
  res.json(game);
});

// POST /api/switches/:id/proof - submit proof (by loser)
router.post('/:id/proof', async (req, res) => {
  const username = getUsername(req);
  const { text } = req.body;
  const game = await SwitchGame.findById(req.params.id);
  if (!game) return res.status(404).json({ error: 'Not found' });
  // Only loser can submit proof
  if (!game.winner || !game.participants.includes(username) || username === game.winner) {
    return res.status(403).json({ error: 'Only the loser can submit proof' });
  }
  game.proof = { user: username, text };
  // Set proofExpiresAt to 48h from now
  game.proofExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await game.save();
  // Notify winner that proof was submitted
  const winner = game.winner;
  if (winner) {
    await sendNotification(winner, 'switch_proof', 'The loser has submitted proof for your switch game.');
  }
  res.json(game);
});

// TODO: If grading/approval endpoints are added, block if proofExpiresAt < now

module.exports = router; 