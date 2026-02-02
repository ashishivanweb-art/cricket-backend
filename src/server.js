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

// Attach socket.io
const io = new Server(server, {
  cors: { origin: '*' },
});

// Make io available globally
global.io = io;

// Socket connection log
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// 🔥 Live score updater (every 30 sec)
setInterval(async () => {
  try {
    const res = await axios.get(
      `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}`
    );

    // const liveMatches = res.data.data.filter(
    //   (m) => m.matchStarted && !m.matchEnded
    // );

    const liveMatches = res.data.data;

    io.emit('liveScores', liveMatches);

    console.log('Live scores pushed to clients');
  } catch (err) {
    console.log('Updater error:', err.message);
  }
}, 30000);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
