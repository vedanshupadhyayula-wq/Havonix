const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

const users = new Map();
const messages = [];

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join', (name) => {
    users.set(socket.id, { name, socketId: socket.id });
    
    // Send previous messages to new user
    socket.emit('load-messages', messages);
    
    // Notify all users
    io.emit('user-joined', {
      name,
      userCount: users.size,
      users: Array.from(users.values()).map(u => u.name)
    });
    
    console.log(`${name} joined. Total users: ${users.size}`);
  });

  socket.on('send-message', (data) => {
    const user = users.get(socket.id);
    if (user) {
      const message = {
        name: user.name,
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
      };
      messages.push(message);
      io.emit('receive-message', message);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.emit('user-left', {
        name: user.name,
        userCount: users.size,
        users: Array.from(users.values()).map(u => u.name)
      });
      console.log(`${user.name} left. Total users: ${users.size}`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
