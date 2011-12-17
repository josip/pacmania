var io      = require('socket.io'),
    express = require('express'),
    colour  = require('onecolor'),
    app     = express.createServer();

app.configure(function () {
  app.use(express.static(__dirname + '/static'));
});

function hsv2hex(h, s, v) {
  return (new colour.HSV(h/360, s/100, v/100)).hex()
}

function randColour () {
  return hsv2hex(Math.ceil(Math.random()*1000)%360, 80, 92)
}

var commands = {
  join:   function (req) { return { id:     Math.random().toString(16).split('.')[1],
                                    colour: randColour()} },
  leave:  function (req) { return {id: req.param('id')} },
  move:   function (req) { return {id: req.param('id'), direction: req.param('d')} }
};

app.get('/player/:command', function (req, res) {
  var command = req.param('command'),
      resp = commands[command](req);
  
  sio.sockets.in('screen').emit(command, resp);
  res.json(resp);
});

app.listen(80);
var sio = io.listen(app);

sio.sockets.on('connection', function (socket) {
  socket.join('screen');
});
