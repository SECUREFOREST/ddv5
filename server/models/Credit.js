const mongoose = require('mongoose');

const CreditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  offer: { type: String },
  purchasedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Credit', CreditSchema); 