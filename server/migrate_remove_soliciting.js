const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Dare = require('./models/Dare');

async function migrateRemoveSoliciting() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddv5');
    console.log('Connected to MongoDB');

    // Update any dares with 'soliciting' status to 'waiting_for_participant'
    const result = await Dare.updateMany(
      { status: 'soliciting' },
      { $set: { status: 'waiting_for_participant' } }
    );
    console.log(`Updated ${result.modifiedCount} dares from 'soliciting' to 'waiting_for_participant'`);

    if (result.modifiedCount > 0) {
      console.log('Note: These dares are now available for participants to claim');
    } else {
      console.log('No dares with "soliciting" status found');
    }

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
  migrateRemoveSoliciting();
}

module.exports = migrateRemoveSoliciting; 