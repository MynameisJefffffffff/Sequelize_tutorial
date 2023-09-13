    const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', function(req, res){
   res.sendFile(__dirname +'/socket_io_client.html');});
users = [];
io.on('connection', function(socket){
   console.log('A user connected');
   socket.on('setUsername', function(data){
      console.log("data");
      console.log(data);
      if(users.indexOf(data) > -1){
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
      }
   });
   socket.on('msg', function(data,callback){
      //Send message to everyone
      
      io.sockets.emit('newmsg', data);
      callback('Message received!');
   })
});
http.listen(3000, function(){
   console.log('listening on localhost:3000');
});