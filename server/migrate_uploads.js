const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Dare = require('./models/Dare');

async function migrateUploads() {
  try {
    console.log('Starting upload migration...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const avatarsDir = path.join(__dirname, 'uploads/avatars');
    const proofsDir = path.join(__dirname, 'uploads/proofs');
    
    // Create directories if they don't exist
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
      console.log('Created avatars directory');
    }
    
    if (!fs.existsSync(proofsDir)) {
      fs.mkdirSync(proofsDir, { recursive: true });
      console.log('Created proofs directory');
    }
    
    // Get all users with avatars
    const users = await User.find({ avatar: { $exists: true, $ne: null } });
    console.log(`Found ${users.length} users with avatars`);
    
    let avatarMoved = 0;
    let avatarErrors = 0;
    
    for (const user of users) {
      try {
        if (user.avatar && user.avatar.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, user.avatar.substring(1));
          const filename = path.basename(user.avatar);
          const newPath = path.join(avatarsDir, filename);
          
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            await User.findByIdAndUpdate(user._id, { 
              avatar: `/uploads/avatars/${filename}` 
            });
            avatarMoved++;
            console.log(`Moved avatar for user ${user.username}: ${filename}`);
          } else {
            console.log(`Avatar file not found for user ${user.username}: ${oldPath}`);
            avatarErrors++;
          }
        }
      } catch (err) {
        console.error(`Error moving avatar for user ${user.username}:`, err.message);
        avatarErrors++;
      }
    }
    
    // Get all dares with proof files
    const dares = await Dare.find({ 'proof.fileUrl': { $exists: true, $ne: null } });
    console.log(`Found ${dares.length} dares with proof files`);
    
    let proofMoved = 0;
    let proofErrors = 0;
    
    for (const dare of dares) {
      try {
        if (dare.proof.fileUrl && dare.proof.fileUrl.startsWith('/uploads/')) {
          const oldPath = path.join(__dirname, dare.proof.fileUrl.substring(1));
          const filename = path.basename(dare.proof.fileUrl);
          const newPath = path.join(proofsDir, filename);
          
          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            await Dare.findByIdAndUpdate(dare._id, { 
              'proof.fileUrl': `/uploads/proofs/${filename}` 
            });
            proofMoved++;
            console.log(`Moved proof file for dare ${dare._id}: ${filename}`);
          } else {
            console.log(`Proof file not found for dare ${dare._id}: ${oldPath}`);
            proofErrors++;
          }
        }
      } catch (err) {
        console.error(`Error moving proof file for dare ${dare._id}:`, err.message);
        proofErrors++;
      }
    }
    
    console.log('\nMigration completed!');
    console.log(`Avatars moved: ${avatarMoved}, Errors: ${avatarErrors}`);
    console.log(`Proof files moved: ${proofMoved}, Errors: ${proofErrors}`);
    
    // Clean up empty uploads directory
    const remainingFiles = fs.readdirSync(uploadsDir).filter(file => 
      !['avatars', 'proofs'].includes(file)
    );
    
    if (remainingFiles.length === 0) {
      console.log('Uploads directory is empty, migration successful!');
    } else {
      console.log(`Warning: ${remainingFiles.length} files remain in uploads directory:`, remainingFiles);
    }
    
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateUploads(); 