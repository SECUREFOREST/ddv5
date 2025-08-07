const mongoose = require('mongoose');
const User = require('./models/User');

async function fixContentDeletionComprehensive() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddv5');
    console.log('Connected to MongoDB');

    // Find all users with any contentDeletion value
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} total users`);

    let fixedCount = 0;
    const validValues = ['delete_after_view', 'delete_after_30_days', 'never_delete', '', 'when_viewed', '30_days', 'never'];

    for (const user of allUsers) {
      const currentValue = user.contentDeletion;
      console.log(`User ${user.username}: contentDeletion = "${currentValue}" (type: ${typeof currentValue})`);
      
      // Check if the value is invalid
      if (currentValue && !validValues.includes(currentValue)) {
        console.log(`  -> INVALID VALUE: "${currentValue}" for user ${user.username}`);
        user.contentDeletion = '';
        await user.save();
        fixedCount++;
        console.log(`  -> FIXED: Set to empty string`);
      } else if (currentValue === null || currentValue === undefined) {
        console.log(`  -> NULL/UNDEFINED: Setting to empty string`);
        user.contentDeletion = '';
        await user.save();
        fixedCount++;
      }
    }

    console.log(`\nMigration completed successfully. Fixed ${fixedCount} users.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixContentDeletionComprehensive(); 