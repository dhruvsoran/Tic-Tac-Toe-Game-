const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Game state
let players = {};
let turn = 'X';
let board = Array(9).fill(null);

// On client connection
io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // Assign 'X' or 'O' to the player
  if (Object.keys(players).length < 2) {
    const playerSymbol = Object.keys(players).length === 0 ? 'X' : 'O';
    players[socket.id] = playerSymbol;
    socket.emit('symbol', playerSymbol);
    socket.emit('status', 'Game started. You are ' + playerSymbol);
    socket.broadcast.emit('status', 'Another player joined. Game started.');
  } else {
    socket.emit('full', 'Game room is full. Please try again later.');
    socket.disconnect();
    return;
  }

  // Player makes a move
  socket.on('makeMove', index => {
    if (board[index] === null && players[socket.id] === turn) {
      board[index] = turn;
      io.emit('updateBoard', { index, symbol: turn });

      // Switch turns
      turn = turn === 'X' ? 'O' : 'X';

      // TODO: Add win/draw check here
    }
  });

  // Reset game
  socket.on('reset', () => {
    board = Array(9).fill(null);
    turn = 'X';
    io.emit('resetBoard');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    board = Array(9).fill(null);
    turn = 'X';
    io.emit('resetBoard');
    io.emit('status', 'Player left. Game reset.');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
