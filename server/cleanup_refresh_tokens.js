const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanupRefreshTokens() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddv5');
    console.log('Connected to MongoDB');

    // Find all users with more than 5 refresh tokens
    const usersWithExcessiveTokens = await User.find({
      $expr: { $gt: [{ $size: "$refreshTokens" }, 5] }
    });

    console.log(`Found ${usersWithExcessiveTokens.length} users with more than 5 refresh tokens`);

    let cleanedCount = 0;
    for (const user of usersWithExcessiveTokens) {
      const originalCount = user.refreshTokens.length;
      console.log(`User ${user.username}: ${originalCount} tokens`);
      
      // Keep only the last 5 tokens
      user.refreshTokens = user.refreshTokens.slice(-5);
      
      await user.save();
      cleanedCount++;
      
      console.log(`  -> Cleaned: ${originalCount} -> ${user.refreshTokens.length} tokens`);
    }

    console.log(`\nCleanup completed successfully. Cleaned ${cleanedCount} users.`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupRefreshTokens(); 