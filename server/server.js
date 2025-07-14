require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
const mongoose = require('mongoose');
require('./db');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.localhost:3000';
const allowedOrigins = [FRONTEND_URL];
const io = socketio(server, { cors: { origin: allowedOrigins, credentials: true } });

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

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Placeholder routes
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/dares', require('./routes/dares'));
app.use('/comments', require('./routes/comments'));
app.use('/notifications', require('./routes/notifications'));
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

// Add before the error handler
app.all('*', (req, res) => {
  console.log('server.js catch-all:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not found in server.js' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  const errorId = uuidv4();
  console.error(`[${errorId}] Server error:`, err, {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params,
    stack: err.stack,
  });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.', errorId });
});

// Global process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  // Optionally exit process or perform cleanup
});

// Enhanced MongoDB connection event logging
mongoose.connection.on('connected', () => {
  console.log(`[${new Date().toISOString()}] [MongoDB] Connected`);
});
mongoose.connection.on('disconnected', () => {
  console.log(`[${new Date().toISOString()}] [MongoDB] Disconnected`);
});
mongoose.connection.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] [MongoDB] Connection error:`, err);
});
mongoose.connection.on('reconnected', () => {
  console.log(`[${new Date().toISOString()}] [MongoDB] Reconnected`);
});
mongoose.connection.on('reconnectFailed', () => {
  console.error(`[${new Date().toISOString()}] [MongoDB] Reconnection failed`);
});

// Server will use PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 