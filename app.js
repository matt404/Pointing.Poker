// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var redisIO = require('socket.io-redis');
var redis = require('redis');
var port = process.env.PORT || 3000;

//var members = {};
//var rooms = {};
var Member = require('./app/models/Member');
var Room = require('./app/models/Room');

var redisHost = process.env.REDIS_ADDR || '127.0.0.1';
var redisPort = process.env.REDIS_PORT || 6379;

var redisClient = redis.createClient(redisPort, redisHost);

io.adapter(redisIO({ host: redisHost, port: redisPort }));

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {

  socket.on('add', function (data) {

    var member = new Member(data);
    var roomKey = member.roomKey.toLowerCase();
    var roomCacheKey = "ppoker_room_"+roomKey;
    //console.log('add',member);

    redisClient.get(roomCacheKey, function (err, val) {

        var members = [];

        //console.log(roomCacheKey, err, val);

        if(val !== null && typeof(val) === "string" && val !== ""){
          members = JSON.parse(val);
        }
        members[members.length] = member;

        redisClient.set(roomCacheKey, JSON.stringify(members));

        socket.join(roomKey);

        socket.emit('add', member);
        socket.broadcast.emit('add', member);

    });

  });

  socket.on('showcards', function (data) {

    console.log('showcards',data);

  });

  socket.on('remove', function (data) {
    console.log('remove',data);

  });

  socket.on('newgame', function (data) {
    console.log('newgame',data);

    socket.emit('newgame', data);
    socket.broadcast.emit('newgame', data);

  });

  socket.on('vote', function (data) {
    console.log('vote',data);

    var member = new Member(data);

    socket.emit('vote', member);
    socket.broadcast.emit('vote', member);

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });
});
