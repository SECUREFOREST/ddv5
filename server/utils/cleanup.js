// Utility functions for code cleanup and quality improvements

/**
 * Safe JSON parse with error handling
 * @param {string} str - String to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed value or default
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', str, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage operations
 */
const safeStorage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? safeJsonParse(item, defaultValue) : defaultValue;
    } catch (error) {
      console.warn('Failed to get from localStorage:', key, error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to set localStorage:', key, error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', key, error);
      return false;
    }
  }
};

// Clean up orphaned dares (dares where creator user has been deleted)
async function cleanupOrphanedDares() {
  try {
    console.log('Starting cleanup of orphaned dares...');
    
    const Dare = require('../models/Dare');
    const User = require('../models/User');
    
    // Find all dares
    const dares = await Dare.find({});
    let orphanedCount = 0;
    let fixedCount = 0;
    
    for (const dare of dares) {
      if (dare.creator) {
        // Check if creator user still exists
        const user = await User.findById(dare.creator);
        if (!user) {
          console.log(`Orphaned dare found: ${dare._id} - creator ${dare.creator} not found`);
          orphanedCount++;
          
          // Option 1: Delete the orphaned dare
          // await Dare.findByIdAndDelete(dare._id);
          
          // Option 2: Mark the dare as deleted
          // await Dare.findByIdAndUpdate(dare._id, { status: 'user_deleted' });
          
          // Option 3: Set creator to null (current approach)
          await Dare.findByIdAndUpdate(dare._id, { creator: null });
          fixedCount++;
        }
      }
    }
    
    console.log(`Cleanup complete. Found ${orphanedCount} orphaned dares, fixed ${fixedCount}`);
    return { orphanedCount, fixedCount };
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

module.exports = {
  safeStorage,
  cleanupOrphanedDares
}; 