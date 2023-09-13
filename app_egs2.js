const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Socket.IO client connected');

  // Listen for the 'balanceChange' event
  socket.on('balanceChange', (data) => {
    console.log('Received balanceChange event:');
    console.log(JSON.stringify(data, null, 2)); 

    // You can process the data here as needed
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected');
  });
});

// Start the server
const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Socket.IO server is running on port ${port}`);
});