import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDB from './config/db.js';
import axios from 'axios';

const PORT = process.env.PORT || 5000;

connectDB();

// Create HTTP server from express app
const server = http.createServer(app);

// Attach socket.io with long timeout
const io = new Server(server, {
  cors: { origin: '*' },

  // keep connection tolerant for long time
  pingInterval: 60000,      // 1 min
  pingTimeout: 3600000,     // 1 hour
});

// Make io available globally
global.io = io;

// Socket connection log
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});


// 🔥 Live score updater (every 1 hour)
setInterval(async () => {
  try {
    const res = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}`
    );

    const liveMatches = res.data.data;

    io.emit('liveScores', liveMatches);

    console.log('Live scores pushed to clients (1 hour interval)');
  } catch (err) {
    console.log('Updater error:', err.message);
  }
}, 3600000); // 1 hour in milliseconds


// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
