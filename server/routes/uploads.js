const express = require('express');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Dare = require('../models/Dare');

const router = express.Router();

// Secure file access endpoint - returns file with authentication
router.get('/secure/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'proofs', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }
    
    // Find the dare that contains this proof file
    const dare = await Dare.findOne({
      'proof.fileUrl': `/uploads/proofs/${filename}`
    });
    
    if (!dare) {
      return res.status(404).json({ error: 'Proof file not found.' });
    }
    
    // Check if user has permission to access this file
    const user = await User.findById(req.userId);
    const isAdmin = user && user.roles && user.roles.includes('admin');
    const isCreator = dare.creator.toString() === req.userId;
    const isPerformer = dare.claimedBy && dare.claimedBy.toString() === req.userId;
    
    if (!isAdmin && !isCreator && !isPerformer) {
      return res.status(403).json({ error: 'Access denied. Only the creator, performer, or admins can view proof files.' });
    }
    
    // Return file as base64 with metadata
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const contentType = getContentType(filename);
    
    res.json({
      filename: filename,
      contentType: contentType,
      data: base64,
      size: fileBuffer.length
    });
  } catch (err) {
    console.error('File access error:', err);
    res.status(500).json({ error: 'Failed to access file.' });
  }
});

// Protected file access - only creator, performer, and admins can access proof files
router.get('/:filename', auth, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', 'uploads', 'proofs', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }
    
    // Find the dare that contains this proof file
    const dare = await Dare.findOne({
      'proof.fileUrl': `/uploads/proofs/${filename}`
    });
    
    if (!dare) {
      return res.status(404).json({ error: 'Proof file not found.' });
    }
    
    // Check if user has permission to access this file
    const user = await User.findById(req.userId);
    const isAdmin = user && user.roles && user.roles.includes('admin');
    const isCreator = dare.creator.toString() === req.userId;
    const isPerformer = dare.claimedBy && dare.claimedBy.toString() === req.userId;
    
    if (!isAdmin && !isCreator && !isPerformer) {
      return res.status(403).json({ error: 'Access denied. Only the creator, performer, or admins can view proof files.' });
    }
    
    // Set appropriate headers for file download
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': getContentType(filename),
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': getContentType(filename),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error('File access error:', err);
    res.status(500).json({ error: 'Failed to access file.' });
  }
});

// Helper function to determine content type
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

module.exports = router; 