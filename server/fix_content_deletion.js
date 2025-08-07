const mongoose = require('mongoose');
const User = require('./models/User');

async function fixContentDeletion() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ddv5');
    console.log('Connected to MongoDB');

    // Find all users with invalid contentDeletion values
    const usersWithInvalidContentDeletion = await User.find({
      contentDeletion: { $nin: ['delete_after_view', 'delete_after_30_days', 'never_delete', '', 'when_viewed', '30_days', 'never'] }
    });

    console.log(`Found ${usersWithInvalidContentDeletion.length} users with invalid contentDeletion values`);

    // Fix each user
    for (const user of usersWithInvalidContentDeletion) {
      console.log(`Fixing user ${user.username} (${user._id}) - current contentDeletion: "${user.contentDeletion}"`);
      
      // Set to default empty string
      user.contentDeletion = '';
      await user.save();
      
      console.log(`Fixed user ${user.username}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
fixContentDeletion(); 