// start slingin' some d3 here.

var gameOptions = {
  width: 700,
  height: 450,
  numEnemies: 30,
  padding: 20
};

var gameStats = {
  currentScore: 0,
  highScore: 0
};

var axes = {
  x: d3.scaleLinear().domain([0, 100]).range([0, gameOptions.width]),
  y: d3.scaleLinear().domain([0, 100]).range([0, gameOptions.height])
};

var gameBoard = d3.select('.board').append('svg').attr('height', gameOptions.height).attr('width', gameOptions.width).style('background-color', 'white');

var updateScore = function() {
  d3.select('.current span').text(gameStats.currentScore);
};

var updateBestScore = function() {
  gameStats.highScore = Math.max(gameStats.currentScore, gameStats.highScore);
  gameStats.currentScore = 0;
  return d3.select('.highscore span').text(gameStats.highScore);
};

class Player {
  constructor() {
    this.x = 20;
    this.y = 20;
    this.angle = 0;
    this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
    this.fill = '#ff6600'; // color
    this.r = 5;
    this.element = gameBoard.append('svg:path').attr('d', this.path).attr('fill', this.fill).attr('class', 'player');
    this.setupDragging();
  }

  setX(x) {
    var min = gameOptions.padding;
    var max = gameOptions.width - min;
    if (x <= min) {
      x = min;
    } else if (x >= max) {
      x = max;
    }
    this.x = x;
  }

  setY(y) {
    var min = gameOptions.padding;
    var max = gameOptions.height - min;
    if (y <= min) {
      y = min;
    } else if (y >= max) {
      y = max;
    }
    this.y = y;
  }

  transform(opts = this) {
    this.setX(opts.x);
    this.setY(opts.y);
    this.angle = opts.angle;
    return this.element.attr('transform', `rotate(${this.angle} ${this.x} ${this.y}) translate(${this.x} ${this.y})`);
  }

  moveRelative(dx, dy) {
    var opts = {
      x: this.x + dx,
      y: this.y + dy,
      angle: 360 * (Math.atan2(dy, dx) / (Math.PI * 2))
    };
    return this.transform(opts);
  }

  setupDragging() {
    var dragMove = () => {
      return this.moveRelative(d3.event.dx, d3.event.dy);
    };
    return d3.select('.player').call(d3.drag().on('drag', dragMove));
  }
}

var player = new Player();

var generateEnemies = function() {
  return _.range(0, gameOptions.numEnemies).map(function(val) {
    var obj = {};
    obj.x = Math.random() * 100;
    obj.y = Math.random() * 100;
    return obj;
  });
};

var enemyRender = function(enemyData) {
  var selection = gameBoard.selectAll('enemy').data(enemyData);
  selection.enter().append('svg:circle').attr('class', 'enemy')
                                        .attr('cx', d => axes.x(d.x))
                                        .attr('cy', d => axes.y(d.y))
                                        .attr('r', 5);
};


var enemies = generateEnemies(); // enemy array
enemyRender(enemies);

var enemyMovementX = function(obj) {
  obj.x = axes.x(Math.random() * 100);
  return obj.x;
};

var enemyMovementY = function(obj) {
  obj.y = axes.y(Math.random() * 100);
  return obj.y;
};

var moveEachEnemy = function() {
  return d3.selectAll('.enemy').each(function() {
    d3.select(this).transition().duration(2000).attr('cx', axes.x(Math.random() * 100))
                                               .attr('cy', axes.y(Math.random() * 100)).on('end', moveEachEnemy);
  });
};

moveEachEnemy();

var checkCollision = function(enemy) {
  var radiusSum = player.r + Number(d3.select('.enemy').attr('r'));
  d3.selectAll('.enemy').each(function() {
    var enemy = d3.select(this);
    var xDiff = player.x - enemy.attr('cx');
    var yDiff = player.y - enemy.attr('cy');
    var hypotenuse = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    if (hypotenuse <= radiusSum) {
      updateBestScore();
      console.log('collision: ', true);
    }
  });
};

d3.timer(checkCollision);

var scoreCounter = function() {
  gameStats.currentScore++;
  updateScore();
};

setInterval(scoreCounter, 50);
