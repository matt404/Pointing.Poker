// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var members = {};
var rooms = {};
var Member = function(){
  var _member = {
    id: 0,
    name: "",
    observer: "",
    vote: "",
    clientKey: 0,
    roomKey: ""
  }
  return _member;
};

var Room = function(){
  var _room = {
    id: 0,
    name: ""
  };
  return _room;
};

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/client'));

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('vote', function (data) {
    // we tell the client to execute 'new message'
    console.log('vote',data);
    /*
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    */
  });

  socket.on('add', function (data) {
    // we tell the client to execute 'new message'
    console.log('add',data);
    /*
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    */
  });

  socket.on('showcards', function (data) {
    // we tell the client to execute 'new message'
    console.log('showcards',data);
    /*
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    */
  });

  socket.on('remove', function (data) {
    // we tell the client to execute 'new message'
    console.log('remove',data);
    /*
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    */
  });

  socket.on('newgame', function (data) {
    // we tell the client to execute 'new message'
    console.log('newgame',data);
    /*
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    */
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
