const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const User = require('../models/User');

async function auth(req, res, next) {
  console.log('auth middleware:', req.method, req.originalUrl, req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('auth middleware: No token provided');
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    // Fetch user and attach to req.user for permissions
    const user = await User.findById(decoded.id);
    req.user = user;
    console.log('auth middleware: Authenticated user', decoded.id);
    next();
  } catch (err) {
    console.log('auth middleware: Invalid token', err);
    res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = auth; 