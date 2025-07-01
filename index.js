import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    
  },
});


let players = []; // Store players as { id, name, score }

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  socket.onAny((event, ...args) => {
  console.log(`📡 Event received: ${event}`, args);
});


  socket.on('login', ({ username, password }) => {
    // Here you would handle authentication logic
    
    if (username && password) {
       const player = { id: socket.id, name: username,avatar:password, score: 0 };
      players.push(player);
      console.log('Players:', players);
      process.stdout.write(''); 

      io.emit('player-list', players);
       // Notify everyone
       socket.emit('player-info', {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        score: player.score
        });
        
      socket.emit('login-success');

    } else {
      socket.emit('login-error', 'Invalid credentials');
    }
  });
// 📝 Request player lis  t

  socket.on('request-player-list', () => {
  socket.emit('player-list', players);
  io.emit('player-list', players);
});

  socket.on('request-player-info', () => {
    const player = players.find((p) => p.id === socket.id);
    if (player) {
  socket.emit('player-info', {
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    score: player.score
  });
} else {
  console.warn(`⚠️ Player not found for socket ${socket.id}`);
  socket.emit('player-info', { error: "Player not found" });
  }})
  

  // 💬 Chat handler
  
  socket.on('chat-message', (data) => {
  io.emit('chat-message', data); // Just forward the object
});

  // 🎨 Drawing handler
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data); // Don't send back to sender
  });

  // ❌ Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    players = players.filter((p) => p.id !== socket.id);
    io.emit('player-list', players);
  });

  socket.on('clear-canvas', () => {
    socket.broadcast.emit('clear-canvas'); // Notify others to clear their canvas
  });


  
});

server.listen(5000, () => {
  console.log('🚀 Server running at http://localhost:5000');
});

