/* ============================================================
   Gio — Ventures :: intro -> Tetris line-clear -> tarot grid
   Inspired by the look of "Tetris Effect": glassy, glowing,
   vibrant blocks on a cosmic backdrop.
   ============================================================ */
(function () {
  'use strict';

  var intro      = document.getElementById('intro');
  var ventures   = document.getElementById('ventures');
  var tetris     = document.getElementById('tetris');
  var board      = document.getElementById('tetrisBoard');
  var word       = document.getElementById('tetrisWord');
  var flash      = document.getElementById('tetrisFlash');
  var exploreBtn = document.getElementById('exploreBtn');
  var backBtn    = document.getElementById('backBtn');
  var reduce     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tetris Effect-ish palette (vibrant, slightly pastel, glowing) */
  var PALETTE = [
    { c: '#2ee6c5', g: 'rgba(46,230,197,0.65)' },
    { c: '#38d6ff', g: 'rgba(56,214,255,0.65)' },
    { c: '#6aa6ff', g: 'rgba(106,166,255,0.65)' },
    { c: '#b07bff', g: 'rgba(176,123,255,0.65)' },
    { c: '#ff8ad1', g: 'rgba(255,138,209,0.65)' },
    { c: '#ffb36b', g: 'rgba(255,179,107,0.65)' },
    { c: '#ffe27a', g: 'rgba(255,226,122,0.65)' },
    { c: '#7be06a', g: 'rgba(123,224,106,0.65)' }
  ];
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function makeBlock(col, row, cell, pal) {
    var b = document.createElement('div');
    b.className = 'tblock';
    b.style.width = cell + 'px';
    b.style.height = cell + 'px';
    b.style.left = (col * cell) + 'px';
    b.style.top = (row * cell) + 'px';
    b.style.setProperty('--c', pal.c);
    b.style.setProperty('--glow', pal.g);
    return b;
  }

  /* Build a near-complete board with a 4-tall well; the I-piece
     drops in to complete (and clear) the lines. */
  function buildBoard() {
    board.innerHTML = '';
    var vw = window.innerWidth, vh = window.innerHeight;
    var cols = 8, rows = 8, wellCol = 7, fillRows = [4, 5, 6, 7];
    var cell = Math.max(26, Math.min(56, Math.floor(Math.min(vw / 10, vh / 11))));

    board.style.width = (cols * cell) + 'px';
    board.style.height = (rows * cell) + 'px';

    /* the colorful stack — every cell of the bottom 4 rows except the well */
    var rowBlocks = [];
    fillRows.forEach(function (r) {
      for (var c = 0; c < cols; c++) {
        if (c === wellCol) continue;
        var b = makeBlock(c, r, cell, pick(PALETTE));
        board.appendChild(b);
        rowBlocks.push(b);
      }
    });

    /* the hero I-piece (cyan), vertical, 4 tall */
    var piece = document.createElement('div');
    piece.className = 'tpiece';
    piece.style.left = (wellCol * cell) + 'px';
    piece.style.top = (fillRows[0] * cell) + 'px';
    piece.style.width = cell + 'px';
    piece.style.height = (4 * cell) + 'px';
    var iPal = { c: '#46e8ff', g: 'rgba(70,232,255,0.9)' };
    var pieceBlocks = [];
    for (var i = 0; i < 4; i++) {
      var pb = makeBlock(0, i, cell, iPal);
      piece.appendChild(pb);
      pieceBlocks.push(pb);
    }
    piece.style.transform = 'translateY(-' + (8 * cell) + 'px)'; /* start above board */
    board.appendChild(piece);

    return { cell: cell, piece: piece, rowBlocks: rowBlocks, pieceBlocks: pieceBlocks };
  }

  /* The Explore sequence (~1.1s of action) */
  function explore() {
    exploreBtn.disabled = true;

    if (reduce) { intro.classList.add('gone'); revealVentures(); return; }

    var d = buildBoard();
    tetris.classList.add('active');
    intro.classList.add('gone');
    requestAnimationFrame(function () { tetris.classList.add('in'); });

    /* 1. drop the I-piece into the well */
    setTimeout(function () {
      d.piece.style.transition = 'transform 0.42s cubic-bezier(0.34,1.15,0.5,1)';
      d.piece.style.transform = 'translateY(0)';
    }, 160);

    /* 2. landing impact */
    setTimeout(function () { board.classList.add('shake'); }, 580);

    /* 3. line clear — flash, collapse, "TETRIS!" */
    setTimeout(function () {
      d.rowBlocks.forEach(function (b) { b.classList.add('clear'); });
      d.pieceBlocks.forEach(function (b) { b.classList.add('clear'); });
      word.classList.add('show');
      flash.style.transition = 'opacity 0.12s ease';
      flash.style.opacity = '0.85';
      setTimeout(function () {
        flash.style.transition = 'opacity 0.55s ease';
        flash.style.opacity = '0';
      }, 130);
    }, 640);

    /* 4. reveal the cards beneath the flash */
    setTimeout(revealVentures, 770);

    /* 5. fade out + clean up the overlay */
    setTimeout(function () { tetris.classList.remove('in'); }, 1050);
    setTimeout(function () {
      tetris.classList.remove('active');
      board.innerHTML = '';
      board.classList.remove('shake');
      word.classList.remove('show');
      flash.style.opacity = '0';
    }, 1480);
  }

  function revealVentures() {
    ventures.setAttribute('aria-hidden', 'false');
    ventures.classList.add('show');
  }

  function goBack() {
    ventures.classList.remove('show');
    ventures.setAttribute('aria-hidden', 'true');
    intro.classList.remove('gone');
    exploreBtn.disabled = false;
    document.querySelectorAll('.tcard.flipped').forEach(function (c) { c.classList.remove('flipped'); });
  }

  /* ============================================================
     The intro artwork — sun rays, engraved disc, flowing ribbons
     ============================================================ */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    if (attrs) { for (var k in attrs) { e.setAttribute(k, attrs[k]); } }
    return e;
  }

  /* one wavy flame, base at (0,0), tip at (0,-L) */
  function flamePath(w, L) {
    return 'M ' + (-w) + ' 0 ' +
      'C ' + (-w * 1.5) + ' ' + (-L * 0.42) + ', ' + (w * 0.95) + ' ' + (-L * 0.64) + ', 0 ' + (-L) + ' ' +
      'C ' + (-w * 0.95) + ' ' + (-L * 0.64) + ', ' + (w * 1.5) + ' ' + (-L * 0.42) + ', ' + w + ' 0 Z';
  }

  function initSun() {
    var raysG = document.getElementById('sunRays');
    var linesG = document.getElementById('sunLines');
    if (!raysG || !linesG) return;
    var cx = 210, cy = 210, R = 92;

    /* engraved radial lines on the disc */
    var n = 80;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      linesG.appendChild(svgEl('line', {
        x1: cx + Math.cos(a) * 20, y1: cy + Math.sin(a) * 20,
        x2: cx + Math.cos(a) * (R - 7), y2: cy + Math.sin(a) * (R - 7),
        'class': 'sun-line'
      }));
    }

    /* flame rays around the disc, alternating long/short */
    var count = 24;
    for (var j = 0; j < count; j++) {
      var ang = (j / count) * 360;
      var long = (j % 2 === 0);
      var L = long ? 96 : 60, w = long ? 9 : 7;
      var g = svgEl('g', {
        'class': 'ray',
        transform: 'rotate(' + ang + ' ' + cx + ' ' + cy + ') translate(' + cx + ' ' + (cy - R + 3) + ')'
      });
      var p = svgEl('path', { 'class': 'flame', d: flamePath(w, L) });
      p.style.animationDelay = (j * 0.16) + 's';
      g.appendChild(p);
      raysG.appendChild(g);
    }
  }

  /* a ribbon that emerges near the sun (centre-top), bows out to mx,
     then funnels back into centre-bottom (the Explore button) */
  function ribbonPath(sx, mx) {
    return 'M ' + sx + ' -14 ' +
      'C ' + sx + ' 92, ' + mx + ' 150, ' + mx + ' 216 ' +
      'C ' + mx + ' 300, 120 330, 120 414';
  }

  function initBeams() {
    var svg = document.getElementById('beams');
    if (!svg) return;

    var defs = svgEl('defs');
    var grads = [
      ['#ffd24a', '#ff7a1f', '#e8341f'],
      ['#ffb347', '#ff5a2c', '#c81d3a'],
      ['#ff8a2c', '#ff3d2e', '#b51d54']
    ];
    grads.forEach(function (stops, gi) {
      var g = svgEl('linearGradient', { id: 'beamGrad' + gi, x1: '0', y1: '0', x2: '0', y2: '1' });
      g.appendChild(svgEl('stop', { offset: '0%',   'stop-color': stops[0] }));
      g.appendChild(svgEl('stop', { offset: '50%',  'stop-color': stops[1] }));
      g.appendChild(svgEl('stop', { offset: '100%', 'stop-color': stops[2] }));
      defs.appendChild(g);
    });
    svg.appendChild(defs);

    /* clustered starts (out of the sun) -> fanned middles -> centre bottom */
    var data = [
      { sx: 114, mx: 30,  w: 26, g: 2 },
      { sx: 118, mx: 56,  w: 34, g: 0 },
      { sx: 122, mx: 90,  w: 40, g: 1 },
      { sx: 116, mx: 120, w: 30, g: 2 },
      { sx: 124, mx: 150, w: 40, g: 0 },
      { sx: 120, mx: 186, w: 34, g: 1 },
      { sx: 126, mx: 212, w: 26, g: 2 }
    ];
    data.forEach(function (d, i) {
      var dPath = ribbonPath(d.sx, d.mx);
      var group = svgEl('g', { 'class': 'ribbon' });
      group.style.animationDelay = (i * 0.5) + 's';
      group.appendChild(svgEl('path', {
        'class': 'ribbon-base', d: dPath,
        stroke: 'url(#beamGrad' + d.g + ')', 'stroke-width': d.w, opacity: '0.95'
      }));
      var glow = svgEl('path', {
        'class': 'ribbon-glow', d: dPath,
        'stroke-width': Math.max(3, d.w * 0.22)
      });
      glow.style.animationDelay = (i * 0.4) + 's';
      group.appendChild(glow);
      svg.appendChild(group);
    });
  }

  initSun();
  initBeams();

  /* ============================================================ */

  /* Tarot card flip on click */
  document.querySelectorAll('.tcard').forEach(function (card) {
    if (card.classList.contains('locked')) return;
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
  });

  exploreBtn.addEventListener('click', explore);
  backBtn.addEventListener('click', goBack);
})();
