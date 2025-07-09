require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

// UserID to socket mapping
const userSockets = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  if (socket.userId) {
    userSockets.set(socket.userId, socket);
    console.log(`User ${socket.userId} connected via websocket.`);
  }
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected from websocket.`);
    }
  });
});

// Export io and userSockets for use in notification utility
module.exports.io = io;
module.exports.userSockets = userSockets;

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.localhost:3000';
app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Placeholder routes
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/acts', require('./routes/acts'));
app.use('/comments', require('./routes/comments'));
app.use('/notifications', require('./routes/notifications'));
app.use('/credits', require('./routes/credits'));
app.use('/stats', require('./routes/stats'));
app.use('/switches', require('./routes/switches'));
app.use('/reports', require('./routes/reports'));
app.use('/appeals', require('./routes/appeals'));
app.use('/audit-log', require('./routes/auditLog'));
app.use('/activity-feed', require('./routes/activityFeed'));

app.get('/', (req, res) => {
  res.send('DDV5 API is running');
});

// Health check endpoint for server and MongoDB status
app.get('/status', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    mongo: mongoStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Log MongoDB connection status
function logMongoStatus() {
  const status = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  console.log(`[MongoDB] Status: ${status}`);
}
mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Connected');
});
mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected');
});
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err);
});
// Log initial status after connecting
mongoose.connection.once('open', logMongoStatus);

// Server will use PORT from environment or default to 4000
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 