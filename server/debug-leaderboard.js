// Debug script for leaderboard issues
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Dare = require('./models/Dare');

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/ddv5';

async function debugLeaderboard() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to database');

    // Test basic database operations
    console.log('\n=== Database Health Check ===');
    const userCount = await User.countDocuments();
    const dareCount = await Dare.countDocuments();
    console.log(`Users: ${userCount}`);
    console.log(`Dares: ${dareCount}`);

    // Test user fetching
    console.log('\n=== User Fetch Test ===');
    const users = await User.find({}, 'username fullName avatar roles').lean();
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample user:', users[0]);
    }

    // Test dare aggregation
    console.log('\n=== Dare Aggregation Test ===');
    try {
      const daresCreatedStats = await Dare.aggregate([
        { $match: { creator: { $exists: true, $ne: null } } },
        { $group: { _id: '$creator', count: { $sum: 1 } } }
      ]);
      console.log(`Dares created stats: ${daresCreatedStats.length} entries`);
      
      const daresCompletedStats = await Dare.aggregate([
        { $match: { 
          status: 'completed', 
          performer: { $exists: true, $ne: null } 
        }},
        { $group: { _id: '$performer', count: { $sum: 1 } } }
      ]);
      console.log(`Dares completed stats: ${daresCompletedStats.length} entries`);
      
    } catch (aggError) {
      console.error('Aggregation error:', aggError);
    }

    // Test specific user lookup
    console.log('\n=== Specific User Test ===');
    if (users.length > 0) {
      const testUserId = users[0]._id;
      const userDares = await Dare.find({ creator: testUserId });
      const userCompletedDares = await Dare.find({ performer: testUserId, status: 'completed' });
      console.log(`User ${users[0].username}:`);
      console.log(`  - Created dares: ${userDares.length}`);
      console.log(`  - Completed dares: ${userCompletedDares.length}`);
    }

  } catch (error) {
    console.error('Debug failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Run the debug function
debugLeaderboard().catch(console.error); 