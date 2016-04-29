(function () {
  game = Object.create(Game.prototype);
  game.keys = ['A', 'S', 'D', 'F'];
  for (var i = 0; i < game.keys.length; i++){
    atom.input.bind(atom.key[game.keys[i]], game.keys[i]);
  }
  atom.input.bind(atom.key.ENTER, 'ENTER');
  atom.input.bind(atom.key.LEFT_ARROW, 'left');
  atom.input.bind(atom.key.RIGHT_ARROW, 'right');
  game.mode = 'idle';
  game.difficulty = 0;
  atom.currentMoleTime = 0;
  atom.tillNewMole = 2;
  game.bop = {
    bopped: true,
    total:0,
    draw: function(){
      atom.context.fillStyle = '#000';
      atom.context.font = '130px monospace';
      atom.context.fillText('Score: ' + this.total, 300, 200);
    },
    with_key: function(key){
      if (!!(game.activeMole + 1) === true && key === game.holes[game.activeMole].holeLabel) {
        this.total += 1;
        game.activeMole = -1; // no active mole
        this.bopped = true;
      }
      else{
        if (this.total > 0) this.total -= 1;
      }
    }
  };
  game.update = function(dt) {
    if (game.mode === 'idle') {
      if (atom.input.pressed('ENTER')) {
        game.mode = 'select';
      }
    }
    else if (game.mode === 'select') {
      if (atom.input.pressed('left')) {
        if (game.difficulty > 0) game.difficulty--;
      }
      else if (atom.input.pressed('right')) {
        if (game.difficulty < 2) game.difficulty++;
      }
      else if (atom.input.pressed('ENTER')) {
        game.mode = 'play';
      }
    }
    else if (game.mode === 'play') {
      atom.currentMoleTime += dt;
      if (atom.currentMoleTime > atom.tillNewMole) {
        var newActive = Math.floor(Math.random() * 4);
        while (newActive === game.activeMole) { // prevent mole sitting in same hole for 2 cycles
          newActive = Math.floor(Math.random() * 4);
        }
        game.activeMole = newActive;
        atom.currentMoleTime = 0;
        if (game.bop.bopped === false) {
          if (game.bob.total >= 0) game.bop.total -= 1;
        } else {
          game.bop.bopped = false;
        }
      }
      for (var i = 0; i < game.keys.length; i++) {
        if (atom.input.pressed(game.keys[i])) {
          game.bop.with_key(game.keys[i]);
        }
      }
    }
  };
  game.draw = function () {
    this.drawBackground();
    if (game.mode === 'idle') {
      this.drawStartScreen();
    }
    else if (game.mode == 'select') {
      this.drawSelectScreen();
    }
    else if (game.mode === 'play') {
      for (var i = 0; i < game.holes.length; i++) {
        if (i === game.activeMole) {
          game.holes[i].active = true;
        } else {
          game.holes[i].active = false;
        }
        game.holes[i].draw();
      }
      this.bop.draw();
    }
  };
  game.hole = {
    size: 40,
    spacing: 280,
    color: '#311',
    labelOffset: 140,
    labelColor: '#000',
    labelFont: '130px monospace',
    moleOffset: 20,
    draw: function () {
      this.drawHole();
      this.drawLabel();
      if (this.active === true) {
        this.drawMole(this.holeLocation[0], this.holeLocation[1] - this.moleOffset);
      }
    },
    drawHole: function () {
      atom.context.fillStyle = this.color;
      atom.context.beginPath();
      atom.context.arc(this.holeLocation[0], this.holeLocation[1], this.size, 0, Math.PI*2, false);
      atom.context.fill();
    },
    drawLabel: function () {
      atom.context.fillStyle = this.labelColor;
      atom.context.font = this.labelFont;
      atom.context.fillText(this.holeLabel, this.holeLocation[0] - this.size, this.holeLocation[1] + this.labelOffset);
    },
    drawMole: function (xPos, yPos) {
      game.mole.draw(xPos, yPos);
    }
  };
  game.mole = {
    size: 40,
    color: '#cc6600',
    noseSize: 8,
    noseColor: '#ff0000',
    eyeSize: 5,
    eyeColor: '#000',
    eyeOffset: 10,
    draw: function (xPos, yPos) {
      this.drawHead(xPos, yPos);
      this.drawNose(xPos, yPos);
      this.drawEyes(xPos, yPos);
      this.drawWhiskers(xPos, yPos);
    },
    drawHead: function (xPos, yPos) {
      atom.context.beginPath();
      atom.context.fillStyle = this.color;
      atom.context.arc(xPos, yPos, this.size, 0, Math.PI*2, false);
      atom.context.fill();
    },
    drawNose: function (xPos, yPos) {
      atom.context.beginPath();
      atom.context.fillStyle = this.noseColor;
      atom.context.arc(xPos, yPos, this.noseSize, 0, Math.PI*2, false);
      atom.context.fill();
    },
    drawEyes: function (xPos, yPos) {
      atom.context.beginPath();
      atom.context.fillStyle = this.eyeColor;
      atom.context.arc(xPos - this.eyeOffset, yPos - this.eyeOffset, this.eyeSize, 0, Math.PI*2, false);
      atom.context.arc(xPos + this.eyeOffset, yPos - this.eyeOffset, this.eyeSize, 0, Math.PI*2, false);
      atom.context.fill();
    },
    drawWhiskers: function (xPos, yPos) {
      atom.context.beginPath();
      atom.context.moveTo(xPos - 10, yPos);
      atom.context.lineTo(xPos - 30, yPos);
      atom.context.moveTo(xPos + 10, yPos);
      atom.context.lineTo(xPos + 30, yPos);
      atom.context.moveTo(xPos - 10, yPos + 5);
      atom.context.lineTo(xPos - 30, yPos + 10);
      atom.context.moveTo(xPos + 10, yPos + 5);
      atom.context.lineTo(xPos + 30, yPos + 10);
      atom.context.stroke();
    }
  };
  game.drawBackground = function () {
    atom.context.beginPath();
    atom.context.fillStyle = '#34e';
    atom.context.fillRect(0, 0, atom.width, atom.height/2);
    atom.context.fillStyle = '#ee3';
    atom.context.arc(140, atom.height/2 -30, 90, Math.PI*2, 0);
    atom.context.fill();
    atom.context.fillStyle = '#2e2';
    atom.context.fillRect(0, atom.height/2, atom.width, atom.height/2);
  };
  game.drawStartScreen = function () {
    atom.context.beginPath();
    atom.context.fillStyle = '#000';
    atom.context.font = '40px monospace';
    atom.context.fillText('Press enter to begin!', atom.width/2 - 240, atom.height/2 - 20);
  };
  game.drawSelectScreen = function () {
    var computeCenterCoords = function (box) {
      return [(atom.width - box.width)/2, (atom.height - box.height)/2];
    };
    var innerBox = {
      width: 600,
      height: 80,
      coords: [0,0],
      color: '#34e'
    };

    var selectBar = {
      width: 150,
      height: 10,
      color: '#f00'
    };

    innerBox.coords = computeCenterCoords(innerBox);
    var difficultyLabels = ['Easy', 'Hard', 'Insane'];
    var borderWidth = 8;

    atom.context.beginPath();
    // draw border
    atom.context.fillStyle = '#000';
    atom.context.fillRect(innerBox.coords[0] - borderWidth, innerBox.coords[1] - borderWidth, innerBox.width + borderWidth * 2, innerBox.height + borderWidth * 2);
    // draw box
    atom.context.fillStyle = innerBox.color;
    atom.context.fillRect(innerBox.coords[0], innerBox.coords[1], innerBox.width, innerBox.height);
    // draw labels
    atom.context.fillStyle = '#000';
    atom.context.font = '40px monospace';
    atom.context.fillText(difficultyLabels[0], innerBox.coords[0] + 8, innerBox.coords[1] + 40);
    atom.context.fillText(difficultyLabels[1], innerBox.coords[0] + innerBox.width/2 - 60, innerBox.coords[1] + 40);
    atom.context.fillText(difficultyLabels[2], innerBox.coords[0] + innerBox.width - 150, innerBox.coords[1] + 40);
    // draw select bar in correct position
    atom.context.fillStyle = selectBar.color;
    if (game.difficulty === 0) {
      atom.context.fillRect(innerBox.coords[0] + 8, innerBox.coords[1] + 40, selectBar.width, selectBar.height);
    } else if (game.difficulty === 1) {
      atom.context.fillRect(innerBox.coords[0] + innerBox.width/2 - 80, innerBox.coords[1] + 40, selectBar.width, selectBar.height);
    } else {
      atom.context.fillRect(innerBox.coords[0] + innerBox.width - 150, innerBox.coords[1] + 40, selectBar.width, selectBar.height);
    }
  };
  game.makeHoles = function (holeLabels, xOffset, yOffset) {
    game.holes = [];
    for (var i = 0; i < holeLabels.length; i++) {
      var newHole = Object.create(game.hole);
      newHole.holeLocation = [xOffset + game.hole.spacing*i, yOffset];
      newHole.holeLabel = holeLabels[i];
      newHole.active = false;
      game.holes.push(newHole);
    }
  };
  window.onblur = function () {
    return game.stop();
  };
  window.onfocus = function () {
    return game.run();
  };
  game.makeHoles(game.keys, 145, atom.height/2 + 85);
  game.run();
}).call(this);