const express = require('express');
const router = express.Router();
const Credit = require('../models/Credit');
const auth = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');

// Static offers (could be from DB in production)
const OFFERS = [
  { id: 'basic', name: 'Basic Pack', amount: 10, price: 5 },
  { id: 'standard', name: 'Standard Pack', amount: 25, price: 10 },
  { id: 'premium', name: 'Premium Pack', amount: 60, price: 20 },
];

// GET /api/credits/offers - list available credit offers
router.get('/offers', (req, res) => {
  res.json(OFFERS);
});

// POST /api/credits/purchase - purchase credits (JWT required)
router.post('/purchase', auth, async (req, res) => {
  try {
    const { offerId } = req.body;
    const offer = OFFERS.find(o => o.id === offerId);
    if (!offer) return res.status(400).json({ error: 'Invalid offer.' });
    const credit = new Credit({
      user: req.userId,
      amount: offer.amount,
      offer: offer.id,
    });
    await credit.save();
    // Notify user
    await sendNotification(req.userId, 'credits_purchased', `You purchased ${offer.amount} credits.`);
    res.status(201).json({ message: 'Credits purchased.', credit });
  } catch (err) {
    res.status(500).json({ error: 'Failed to purchase credits.' });
  }
});

// GET /api/credits - list user's credit history and total credits (JWT required)
router.get('/', auth, async (req, res) => {
  try {
    const credits = await Credit.find({ user: req.userId }).sort({ purchasedAt: -1 });
    const total = credits.reduce((sum, c) => sum + c.amount, 0);
    res.json({ total, credits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get credits.' });
  }
});

module.exports = router; 