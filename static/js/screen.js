(function () {
var socket = io.connect('http://' + window.location.host);
socket.on('connect', function () {
  console.log('connected');
  Game.init();
});

socket.on('join', function (msg) {
  console.log('join', msg.id);
  Game.addPlayer(msg);
});

socket.on('leave', function (msg) {
  Game.removePlayer(msg.id);
});

socket.on('move', function (msg) {
  console.log('move', msg.id, msg.direction);
  Game.updateDirection(msg.id, msg.direction);
});

function isInRange(x, min, max) {
  return (x >= min) && (x <= max);
}

var PLAYER_R = 20,
    SCREEN_W = 640,
    SCREEN_H = 640,
    MOVE_INC = 2,
    TICK_INT = 30,
    TREAT_W  = 40,
    TREAT_H  = 40;
var Game = {
  init: function () {
    this.screen = $('#screen');
    this.screen.attr({width:  SCREEN_W = window.innerWidth,
                      height: SCREEN_H = window.innerHeight});
    this.canvas  = this.screen[0].getContext('2d');
    this.players = {};
    this.treats  = [[0,0,0], [0,0,0], [0,0,0]];
    this.__n__   = 0;

    this._treat  = new Image();
    this._treat.onload = function () {
      Game.__i__ = setInterval(function () { Game.tick() }, TICK_INT);
    };
    this._treat.src = '/img/treat.png';

    Game.scheduleTreat(0);
    Game.scheduleTreat(1);
    Game.scheduleTreat(2);

    this.scoreboard = $('#scoreboard');
  },

  tick: function () {
    this.canvas.fillStyle = '#fff';
    this.canvas.rect(0, 0, SCREEN_W, SCREEN_H);
    this.canvas.fill();

    this.detectCollision();
    this.drawTreats();
    this.drawPlayers();

    this.__n__++;
  },

  randX: function () {
    return Math.ceil(Math.random() * 1000)%SCREEN_W;
  },

  randY: function () {
    return Math.ceil(Math.random() * 1000)%SCREEN_H;
  },

  addPlayer: function (p) {
    p.x = this.randX();
    p.y = this.randY();
    p.direction = 'right';
    p.score = 0;
    this.players[p.id] = p;

    var r = PLAYER_R;
    this.scoreboard.append('<li><canvas id="player_' + p.id + '" width="' + (r*2) + '" height="' + (r*2) + '"></canvas><span id="score_' + p.id + '">0</span></li>');
    var icon = $('#player_' + p.id)[0].getContext('2d');
    this.drawBody(icon, r/2 + 12, r/2 + 10, p.colour, 'right', true);
    this.drawEye(icon, r/2 + 12, r/2 + 10, '#000', 'right');
  },

  updateDirection: function (id, d) {
    if(!(id in this.players)) return;
    this.players[id].direction = d;
  },

  drawPlayers: function () {
    var players = this.players, id, p;
    for(id in players) {
      p = players[id];
      if(p.direction == 'up')     p.y -= MOVE_INC;
      if(p.direction == 'down')   p.y += MOVE_INC;
      if(p.direction == 'left')   p.x -= MOVE_INC;
      if(p.direction == 'right')  p.x += MOVE_INC;

      if(p.x - PLAYER_R >= SCREEN_W)  p.x = 0;
      if(p.x < -PLAYER_R)             p.x = SCREEN_W;
      if(p.y - PLAYER_R >= SCREEN_H)  p.y = 0;
      if(p.y < -PLAYER_R)             p.y = SCREEN_H;
      
      this.drawBody(this.canvas, p.x, p.y, p.colour, p.direction);
      this.drawEye(this.canvas, p.x, p.y, '#000', p.direction);
    }
  },

  drawBody: function (ctx, x, y, c, dir, openMouth) {
    var m = this._body.body[dir],
        n = this.__n__ % 10;

    ctx.fillStyle = c;
    if((n > 4 && n < 8) && openMouth !== true) {
      ctx.beginPath();
      ctx.arc(x, y, PLAYER_R, 0, 2 * Math.PI, false);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, PLAYER_R, m[0][0] * Math.PI, m[0][1] * Math.PI, false);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, PLAYER_R, m[1][0] * Math.PI, m[1][1] * Math.PI, false);
      ctx.fill();
    }
  },

  drawEye: function drawEye(ctx, x, y, c, dir) {
    var ep = this._body.eye[dir];
    
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x + ep[0], y + ep[1], 2, 0, Math.PI*2, false);
    ctx.fill();
  },

  detectCollision: function () {
    var treats = this.treats,
        players = this.players,
        tt = treats.length,
        id, p, overlapX, overlapY, t, n;
    
    for(id in players) {
      p = players[id];
      n = tt;

      while(n--) {
        t = treats[n];
        if(!t[2]) continue;

        overlapX = isInRange(p.x, t[0], t[0] + TREAT_W) || isInRange(t[0], p.x - PLAYER_R, p.x + PLAYER_R);
        overlapY = isInRange(p.y, t[1], t[1] + TREAT_H) || isInRange(t[1], p.y - PLAYER_R, p.y + PLAYER_R);
        if(overlapX && overlapY) {
          console.log('oneup', p.id, ++p.score);
          $('#score_' + p.id).text(p.score * 100);
          treats[n] = [-444, -444, 0];
          this.scheduleTreat(n);
        }
      }
      
    }
  },

  drawTreats: function () {
    var txs   = this.treats,
        n     = txs.length,
        ctx   = this.canvas,
        treat = this._treat,
        t;

    while(n--) {
      t = txs[n];
      if(!t[2]) continue;
      ctx.drawImage(treat, t[0], t[1]);
    }
  },

  scheduleTreat: function (n) {
    setTimeout(function () { Game.treats[n] = [Game.randX(), Game.randY(), 1] }, 8000 + Math.random()*1000)
  },

  _body: {
    body: { right: [[1/4, 5/4], [3/4, 7/4]],
            left:  [[7/4, 3/4], [5/4, 1/4]],
            up:    [[7/4, 3/4], [1/4, 5/4]],
            down:  [[3/4, 7/4], [5/4, 1/4]] },
    eye: { right: [-1, -7],
           left:  [2, -7],
           up:    [-7, 2],
           down:  [7, -2] }
  }
};

window.Game = Game;

})()