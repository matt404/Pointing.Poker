// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//var redis = require('socket.io-redis');
//io.adapter(redis({ host: '127.0.0.1', port: 6379 }));
var port = process.env.PORT || 3000;

var members = {};
var rooms = {};
var Member = require('./app/models/Member');
var Room = require('./app/models/Room');

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

  socket.on('add', function (data) {
    console.log('add',member);

    var member = new Member(data);
    var roomKey = member.roomKey.toLowerCase();

    socket.join(roomKey);

    socket.emit('add', member);
    socket.broadcast.emit('add', member);

  });

  socket.on('showcards', function (data) {

    console.log('showcards',data);

  });

  socket.on('remove', function (data) {
    console.log('remove',data);

  });

  socket.on('newgame', function (data) {
    console.log('newgame',data);

  });

  socket.on('vote', function (data) {
    console.log('vote',data);

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });
});
