(function () {
  var socket = io.connect('http://' + window.location.host);
  socket.on('connect', function () {
    console.log('connected');
  });

  socket.on('message', function (msg) {
    console.log('got msg', msg);
  })
})()