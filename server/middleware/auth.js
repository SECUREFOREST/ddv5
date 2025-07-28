const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(req, res, next) {
  // console.log('auth middleware:', req.method, req.originalUrl, req.headers.authorization);
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    // console.log('auth middleware: No token provided');
    return res.status(401).json({ error: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    req.userId = decoded.id;
    // console.log('auth middleware: Authenticated user', decoded.id);
    next();
  } catch (err) {
    // console.log('auth middleware: Invalid token', err);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = auth; 