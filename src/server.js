import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

connectDB();
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: '*' },
});

global.io = io;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});


// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
});
