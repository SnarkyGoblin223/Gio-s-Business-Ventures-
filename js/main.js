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

  /* Tarot card flip on click */
  document.querySelectorAll('.tcard').forEach(function (card) {
    if (card.classList.contains('locked')) return;
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
  });

  exploreBtn.addEventListener('click', explore);
  backBtn.addEventListener('click', goBack);
})();
