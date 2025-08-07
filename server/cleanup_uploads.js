const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/ddv5';
mongoose.connect(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Dare = require('./models/Dare');

async function cleanupUploads() {
  try {
    console.log('Starting upload cleanup...');
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const avatarsDir = path.join(__dirname, 'uploads/avatars');
    const proofsDir = path.join(__dirname, 'uploads/proofs');
    
    // Check if directories exist
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory does not exist');
      return;
    }
    
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir).filter(file => 
      !['avatars', 'proofs'].includes(file) && fs.statSync(path.join(uploadsDir, file)).isFile()
    );
    
    console.log(`Found ${files.length} files in uploads directory:`, files);
    
    // Check for avatar files that might be missing
    const users = await User.find({ avatar: { $exists: true, $ne: null } });
    console.log(`\nChecking ${users.length} users with avatars:`);
    
    for (const user of users) {
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const filename = path.basename(user.avatar);
        const oldPath = path.join(__dirname, user.avatar.substring(1));
        const newPath = path.join(avatarsDir, filename);
        
        console.log(`User: ${user.username}`);
        console.log(`  Avatar URL: ${user.avatar}`);
        console.log(`  Expected file: ${oldPath}`);
        console.log(`  File exists (old): ${fs.existsSync(oldPath)}`);
        console.log(`  File exists (new): ${fs.existsSync(newPath)}`);
        
        // Check if file exists in any location
        const possiblePaths = [
          oldPath,
          newPath,
          path.join(uploadsDir, filename),
          path.join(uploadsDir, filename.replace(/^[0-9]+-[0-9]+-/, '')),
          path.join(uploadsDir, filename.replace(/^[0-9]+-[0-9]+-/, '').replace(/\.(jpeg|jpg|png|gif|webp)$/i, '.jpg')),
          path.join(uploadsDir, filename.replace(/^[0-9]+-[0-9]+-/, '').replace(/\.(jpeg|jpg|png|gif|webp)$/i, '.jpeg'))
        ];
        
        let foundFile = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundFile = possiblePath;
            break;
          }
        }
        
        if (foundFile) {
          console.log(`  Found file at: ${foundFile}`);
          // Move to avatars directory
          const targetPath = path.join(avatarsDir, filename);
          fs.renameSync(foundFile, targetPath);
          await User.findByIdAndUpdate(user._id, { 
            avatar: `/uploads/avatars/${filename}` 
          });
          console.log(`  ✅ Moved and updated avatar for ${user.username}`);
        } else {
          console.log(`  ❌ File not found for ${user.username}`);
        }
        console.log('');
      }
    }
    
    // Check for proof files that might be missing
    const dares = await Dare.find({ 'proof.fileUrl': { $exists: true, $ne: null } });
    console.log(`\nChecking ${dares.length} dares with proof files:`);
    
    for (const dare of dares) {
      if (dare.proof.fileUrl && dare.proof.fileUrl.startsWith('/uploads/')) {
        const filename = path.basename(dare.proof.fileUrl);
        const oldPath = path.join(__dirname, dare.proof.fileUrl.substring(1));
        const newPath = path.join(proofsDir, filename);
        
        console.log(`Dare: ${dare._id}`);
        console.log(`  Proof URL: ${dare.proof.fileUrl}`);
        console.log(`  Expected file: ${oldPath}`);
        console.log(`  File exists (old): ${fs.existsSync(oldPath)}`);
        console.log(`  File exists (new): ${fs.existsSync(newPath)}`);
        
        // Check if file exists in any location
        const possiblePaths = [
          oldPath,
          newPath,
          path.join(uploadsDir, filename),
          path.join(uploadsDir, filename.replace(/^[0-9]+-[0-9]+-/, '')),
          path.join(uploadsDir, filename.replace(/^[0-9]+-[0-9]+-/, '').replace(/\.(jpeg|jpg|png|gif|webp|mp4|webm|mov|avi)$/i, '.jpeg'))
        ];
        
        let foundFile = null;
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            foundFile = possiblePath;
            break;
          }
        }
        
        if (foundFile) {
          console.log(`  Found file at: ${foundFile}`);
          // Move to proofs directory
          const targetPath = path.join(proofsDir, filename);
          fs.renameSync(foundFile, targetPath);
          await Dare.findByIdAndUpdate(dare._id, { 
            'proof.fileUrl': `/uploads/proofs/${filename}` 
          });
          console.log(`  ✅ Moved and updated proof for dare ${dare._id}`);
        } else {
          console.log(`  ❌ File not found for dare ${dare._id}`);
        }
        console.log('');
      }
    }
    
    // Handle remaining files
    const remainingFiles = fs.readdirSync(uploadsDir).filter(file => 
      !['avatars', 'proofs'].includes(file) && fs.statSync(path.join(uploadsDir, file)).isFile()
    );
    
    if (remainingFiles.length > 0) {
      console.log(`\nFound ${remainingFiles.length} remaining files in uploads directory:`);
      for (const file of remainingFiles) {
        const filePath = path.join(uploadsDir, file);
        const fileStats = fs.statSync(filePath);
        const fileSize = (fileStats.size / 1024 / 1024).toFixed(2);
        
        console.log(`  ${file} (${fileSize} MB)`);
        
        // Try to determine if it's an avatar or proof file based on size and type
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
        const isVideo = /\.(mp4|webm|mov|avi)$/i.test(file);
        
        if (isImage && fileStats.size < 5 * 1024 * 1024) { // Less than 5MB, likely avatar
          const targetPath = path.join(avatarsDir, file);
          fs.renameSync(filePath, targetPath);
          console.log(`    → Moved to avatars directory`);
        } else if (isImage || isVideo) { // Likely proof file
          const targetPath = path.join(proofsDir, file);
          fs.renameSync(filePath, targetPath);
          console.log(`    → Moved to proofs directory`);
        } else {
          console.log(`    → Unknown file type, left in uploads directory`);
        }
      }
    }
    
    // Final check
    const finalRemainingFiles = fs.readdirSync(uploadsDir).filter(file => 
      !['avatars', 'proofs'].includes(file) && fs.statSync(path.join(uploadsDir, file)).isFile()
    );
    
    if (finalRemainingFiles.length === 0) {
      console.log('\n✅ Cleanup completed successfully! All files organized.');
    } else {
      console.log(`\n⚠️  ${finalRemainingFiles.length} files remain in uploads directory:`, finalRemainingFiles);
    }
    
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run cleanup
cleanupUploads(); 