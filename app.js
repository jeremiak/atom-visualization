var Raphael = require('raphael');

var atomData = require('./atomData.json');

function generateAtom(atomicNumber, cx, cy, options) {
  var options = options || {};
  var atom = {
    atomicNumber: atomicNumber,
    cx: cx,
    cy: cy,
    r: options.r || 100,
    shells: {}
  };

  var text = 'Atomic Number: ' + atom.atomicNumber;
  text += '\nName: ' + atomData[atom.atomicNumber];
  var atomLabel = paper.text(atom.cx, atom.cy, text),
      atomLabelAttrs = {'font-size': '15'};

  atomLabel.attr(atomLabelAttrs);
  drawElectronShells(atom);
  drawElectrons(atom);

  return atom;
}

function numberOfShells(numberOfElectrons) {
  if (numberOfElectrons <= 2) {
    return 1;
  }
  else if (numberOfElectrons > 2 && numberOfElectrons <= 8) {
    return 2;
  }
  else {
    return 3;
  }
}
var whichShell = numberOfShells;

function drawElectronShells(atom){
  var shellCount = numberOfShells(atom.atomicNumber);

  for (var i=1; i <= shellCount; i++) {
    var shellAttrs = {
      'cx': atom.cx,
      'cy': atom.cy,
      'stroke': 'black',
      'stroke-width': '3',
      'stroke-dasharray': '5, 5',
      'r': atom.r * i
    }, electronCount;

    if (i == 1 && atom.atomicNumber == 1) {
      electronCount = 1;
    }
    else if (i == 1 && atom.atomicNumber >= 2) {
      electronCount = 2;
    }
    else if (i == 2 && atom.atomicNumber < 8) {
      electronCount = atom.atomicNumber - 2;
    }
    else if (i == 2 && atom.atomicNumber >= 8) {
      electronCount = 6;
    }
    else if (i == 3 && atom.atomicNumber < 16) {
      electronCount = atom.atomicNumber - 8;
    }
    var shell = paper.circle().attr(shellAttrs);
    atom.shells[i] = {shell: shell, electrons: paper.set(), electronCount: electronCount};
  }
}

function generateElectron(atom, options) {
  var options = options || {};
  var electron = paper.circle();
  var electronAttrs = {
    'r': atom.r / 10,
    'fill': options.fill || 'black'
  };
  electron.attr(electronAttrs);

  return electron;
}

function drawElectrons(atom) {
  Object.keys(atom.shells).forEach(function(shellNumber){
    var shell = atom.shells[shellNumber];
    var shellRadius = atom.r * shellNumber,
        offset = 360/shell.electronCount;
    for (var i = 0; i < shell.electronCount; i++) {
      var electron = generateElectron(atom, {fill: 'yellow'});
      electron.attr('cx', atom.cx + shellRadius);
      electron.attr('cy', atom.cy);

      var animationString = 'r' + (offset * i) + "," + atom.cx + "," + atom.cy;
      electron.transform(animationString);

      shell.electrons.push(electron);
    }

    var animationString = "...R360" + "," + atom.cx + "," + atom.cy;
    electronSpinAnimation = Raphael.animation({transform: animationString}, 6000).repeat(Infinity);
    shell.electrons.animate(electronSpinAnimation)
  });
};

var paper = Raphael(50, 50, window.innerWidth-100, window.innerHeight-100);

var atom = generateAtom(9, paper.width/2, paper.height/2, {r: 90});
