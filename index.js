import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);

// ✅ CORS must match Vite dev server (localhost:5173)
const io = new Server(server, {
  cors: {
    origin: 'https://scrible-fronend-i1hl.vercel.app', 
    methods: ['GET', 'POST']
  }
});


let players = []; // Each player: { id, name, score }

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('player-join', (username) => {
    const player = { id: socket.id, name: username, score: 0 };
    players.push(player);
    console.log(players);

    io.emit('player-list', players);
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    io.emit('player-list', players);
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat-message', (msg) => {
    io.emit('chat-message', msg);
  });

  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });
    socket.on('draw-end', () => {
    socket.broadcast.emit('draw-end');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});
