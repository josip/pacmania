(function () {
  var PLAYER = {id: null, colour: null}, $PLAYER, CTX;

  $(function () {
    $.getJSON('/player/join', function (resp) {
      PLAYER = resp;
      $PLAYER = $('#player');
      $('.container').show();
      
      drawPlayer();

      $PLAYER.on('click', blink);
      $('input').on('click', function () {
        $.getJSON('/player/move?id=' + PLAYER.id + '&d=' + this.className, function () {  });
      });

      var i = setInterval(blink, 3600);

      window.onunload = function () {
        $.ajax({type: 'GET', url: '/player/leave?id=' + PLAYER.id, async: false});
      }
    });
  });

  function drawPlayer() {
    CTX = $PLAYER[0].getContext('2d'),
    drawBody(PLAYER.colour);
    drawEye('#000');
  }

  function drawBody(c) {
    var W = 144, H = 144;
    CTX.fillStyle = c;
    CTX.beginPath();
    CTX.arc(W/2, H/2, W/3, 1/4 * Math.PI, 5/4 * Math.PI, false);
    CTX.fill();

    CTX.beginPath();
    CTX.arc(W/2, H/2, W/3, 3/4 * Math.PI, 7/4 * Math.PI, false);
    CTX.fill();
  }

  function drawEye(c) {
    CTX.fillStyle = c;
    CTX.beginPath();
    CTX.arc(80, 45, 5, 0, Math.PI*2, false);
    CTX.fill();
  }

  function rotatePlayer(d) {
    var deg = '';
    if(d === 'left')  deg = '180';
    if(d == 'right')  deg = '0';
    if(d == 'up')     deg = '270';
    if(d === 'down')  deg = '90';
    $PLAYER[0].style.webkitTransform='rotate(' + deg + 'deg)';
  }

  var blinks = [];
  function blink() {
    if(blinks.length) return;

    drawEye(PLAYER.colour);
    blinks.push(setTimeout(function () { drawEye('#000');         blinks.pop(); }, 100));
    blinks.push(setTimeout(function () { drawEye(PLAYER.colour);  blinks.pop(); }, 250));
    blinks.push(setTimeout(function () { drawEye('#000');         blinks.pop(); }, 300));
  }
})();
