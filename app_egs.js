const { io } = require("socket.io-client");

const socket = io("http://127.0.0.1:3000", { autoConnect: true, reconnection: true, reconnectionDelay: 1000 });
//const socket = io();


// Listen for the 'balanceChange' event emitted from the server
socket.on("balanceChange", (data) => {
  console.log("Received balance change data:");
  console.log(JSON.stringify(data, null, 2)); 
});

// Handle disconnect events if necessary
//socket.on("disconnect", () => {
//  console.log("Socket.IO client disconnected");
//});

//server.listen(port, () => {
//    console.log("Server listening on port ", port);
//});

socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected", port);
  });