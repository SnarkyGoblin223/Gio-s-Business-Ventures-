/* ============================================================
   Gio — Ventures :: intro -> Tetris crumble -> tarot grid
   ============================================================ */
(function () {
  'use strict';

  var intro      = document.getElementById('intro');
  var ventures   = document.getElementById('ventures');
  var crumble    = document.getElementById('crumble');
  var exploreBtn = document.getElementById('exploreBtn');
  var backBtn    = document.getElementById('backBtn');
  var reduce     = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Tetromino definitions (cells as [row, col]) ---- */
  var COLORS = {
    I: '#22d3ee', O: '#fde047', T: '#c084fc',
    S: '#4ade80', Z: '#fb7185', J: '#60a5fa', L: '#fb923c'
  };
  var SHAPES = {
    I: [[0,0],[0,1],[0,2],[0,3]],
    O: [[0,0],[0,1],[1,0],[1,1]],
    T: [[0,0],[0,1],[0,2],[1,1]],
    S: [[0,1],[0,2],[1,0],[1,1]],
    Z: [[0,0],[0,1],[1,1],[1,2]],
    J: [[0,0],[1,0],[1,1],[1,2]],
    L: [[0,2],[1,0],[1,1],[1,2]]
  };

  function normalize(cells) {
    var minR = Infinity, minC = Infinity;
    cells.forEach(function (c) { if (c[0] < minR) minR = c[0]; if (c[1] < minC) minC = c[1]; });
    return cells.map(function (c) { return [c[0] - minR, c[1] - minC]; });
  }
  function rotate(cells) { return normalize(cells.map(function (c) { return [c[1], -c[0]]; })); }
  function keyOf(cells) {
    return cells.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; })
      .map(function (c) { return c.join(','); }).join(';');
  }
  /* Pre-compute every shape in every unique rotation */
  var VARIANTS = [];
  Object.keys(SHAPES).forEach(function (k) {
    var cur = normalize(SHAPES[k]);
    var seen = {};
    for (var i = 0; i < 4; i++) {
      var key = keyOf(cur);
      if (!seen[key]) { seen[key] = true; VARIANTS.push({ color: COLORS[k], cells: cur }); }
      cur = rotate(cur);
    }
  });

  function topLeft(cells) {
    var best = cells[0];
    for (var i = 1; i < cells.length; i++) {
      var c = cells[i];
      if (c[0] < best[0] || (c[0] === best[0] && c[1] < best[1])) best = c;
    }
    return best;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---- Build a packed Tetris wall covering the viewport ---- */
  function buildWall() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var cols = Math.max(7, Math.min(22, Math.round(vw / 72)));
    var CELL = Math.ceil(vw / cols);
    var rows = Math.ceil(vh / CELL) + 1;

    var grid = [];
    for (var r = 0; r < rows; r++) { grid.push(new Array(cols).fill(false)); }

    var pieces = [];
    var frag = document.createDocumentFragment();

    function place(cells, color) {
      var minR = Infinity, minC = Infinity, maxR = -1, maxC = -1;
      cells.forEach(function (c) {
        grid[c[0]][c[1]] = true;
        if (c[0] < minR) minR = c[0]; if (c[1] < minC) minC = c[1];
        if (c[0] > maxR) maxR = c[0]; if (c[1] > maxC) maxC = c[1];
      });
      var piece = document.createElement('div');
      piece.className = 'piece';
      piece.style.left = (minC * CELL) + 'px';
      piece.style.top = (minR * CELL) + 'px';
      piece.style.width = ((maxC - minC + 1) * CELL) + 'px';
      piece.style.height = ((maxR - minR + 1) * CELL) + 'px';
      piece.style.opacity = '0';
      piece.style.transform = 'translateY(-26px) scale(0.5)';
      cells.forEach(function (c) {
        var b = document.createElement('div');
        b.className = 'block';
        b.style.left = ((c[1] - minC) * CELL) + 'px';
        b.style.top = ((c[0] - minR) * CELL) + 'px';
        b.style.width = CELL + 'px';
        b.style.height = CELL + 'px';
        b.style.background = color;
        piece.appendChild(b);
      });
      frag.appendChild(piece);
      pieces.push({ el: piece, minR: minR, maxR: maxR });
    }

    for (var rr = 0; rr < rows; rr++) {
      for (var cc = 0; cc < cols; cc++) {
        if (grid[rr][cc]) continue;
        var placed = false;
        var options = shuffle(VARIANTS);
        for (var v = 0; v < options.length; v++) {
          var variant = options[v];
          var tl = topLeft(variant.cells);
          var dR = rr - tl[0], dC = cc - tl[1];
          var abs = [], ok = true;
          for (var i = 0; i < variant.cells.length; i++) {
            var ar = variant.cells[i][0] + dR, ac = variant.cells[i][1] + dC;
            if (ar < 0 || ar >= rows || ac < 0 || ac >= cols || grid[ar][ac]) { ok = false; break; }
            abs.push([ar, ac]);
          }
          if (ok) { place(abs, variant.color); placed = true; break; }
        }
        if (!placed) {
          var pal = Object.keys(COLORS);
          place([[rr, cc]], COLORS[pal[Math.floor(Math.random() * pal.length)]]);
        }
      }
    }

    crumble.appendChild(frag);
    var maxRowGlobal = rows - 1;
    return { pieces: pieces, maxRow: maxRowGlobal };
  }

  /* ---- The full Explore sequence ---- */
  function explore() {
    exploreBtn.disabled = true;

    if (reduce) { intro.classList.add('gone'); revealVentures(); return; }

    var data = buildWall();
    crumble.classList.add('active');
    intro.classList.add('gone');

    /* Phase 1 — blocks snap into place (the screen "becomes" Tetris) */
    requestAnimationFrame(function () {
      data.pieces.forEach(function (p) {
        p.el.style.transition = 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1), opacity 0.4s ease';
        p.el.style.transitionDelay = (p.minR * 0.016 + Math.random() * 0.05) + 's';
        p.el.style.opacity = '1';
        p.el.style.transform = 'none';
      });
    });

    /* Phase 2 — crumble away + reveal ventures behind */
    setTimeout(function () {
      revealVentures();
      data.pieces.forEach(function (p) {
        var delay = (data.maxRow - p.maxR) * 0.04 + Math.random() * 0.18;
        var rot = (Math.random() * 440 - 220).toFixed(0);
        var dx = (Math.random() * 130 - 65).toFixed(0);
        p.el.style.transition = 'transform 0.95s cubic-bezier(0.5,0,0.85,0.25), opacity 0.95s ease-in';
        p.el.style.transitionDelay = delay + 's';
        p.el.style.transform = 'translate(' + dx + 'px, 115vh) rotate(' + rot + 'deg)';
        p.el.style.opacity = '0';
      });
    }, 620);

    /* Phase 3 — clean up the overlay */
    setTimeout(function () {
      crumble.classList.remove('active');
      crumble.innerHTML = '';
    }, 2200);
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

  /* ---- Tarot card flip ---- */
  document.querySelectorAll('.tcard').forEach(function (card) {
    if (card.classList.contains('locked')) return;
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
  });

  exploreBtn.addEventListener('click', explore);
  backBtn.addEventListener('click', goBack);
})();
