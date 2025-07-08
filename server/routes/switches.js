const express = require('express');
const router = express.Router();
const SwitchGame = require('../models/SwitchGame');

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
  if (game.participants.length === 2 && game.moves.size === 2 && !game.winner) {
    const [p1, p2] = game.participants;
    const m1 = game.moves.get(p1);
    const m2 = game.moves.get(p2);
    if (m1 === m2) {
      // Draw: clear moves for replay
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
      } else {
        game.winner = p2;
      }
      game.status = 'completed';
    }
  }
  await game.save();
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
  await game.save();
  res.json(game);
});

module.exports = router; 