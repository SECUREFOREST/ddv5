const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Dare = require('./models/Dare');
const SwitchGame = require('./models/SwitchGame');

async function migrateForfeitedToChickenedOut() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddv5');
    console.log('Connected to MongoDB');

    // Update Dare collection
    const dareResult = await Dare.updateMany(
      { status: 'forfeited' },
      { $set: { status: 'chickened_out' } }
    );
    console.log(`Updated ${dareResult.modifiedCount} dares from 'forfeited' to 'chickened_out'`);

    // Update SwitchGame collection
    const switchGameResult = await SwitchGame.updateMany(
      { status: 'forfeited' },
      { $set: { status: 'chickened_out' } }
    );
    console.log(`Updated ${switchGameResult.modifiedCount} switch games from 'forfeited' to 'chickened_out'`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateForfeitedToChickenedOut();
}

module.exports = migrateForfeitedToChickenedOut; 