/* ============================================================
   Gio — Business Ventures :: interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Reveal on scroll (staggered) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // stagger siblings within the same panel
          var siblings = entry.target.parentElement.querySelectorAll('.reveal');
          var idx = Array.prototype.indexOf.call(siblings, entry.target);
          entry.target.style.setProperty('--d', (Math.max(idx, 0) * 0.08) + 's');
          entry.target.classList.add('in');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Scroll progress bar ---- */
  var progress = document.getElementById('scrollProgress');
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    if (progress) progress.style.width = (scrolled * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---- Build dot navigation from panels ---- */
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var dotNav = document.getElementById('dotNav');
  var dots = [];
  panels.forEach(function (panel) {
    var btn = document.createElement('button');
    btn.setAttribute('aria-label', panel.dataset.label || panel.id);
    var tip = document.createElement('span');
    tip.className = 'tip';
    tip.textContent = panel.dataset.label || panel.id;
    btn.appendChild(tip);
    btn.addEventListener('click', function () {
      panel.scrollIntoView({ behavior: 'smooth' });
    });
    dotNav.appendChild(btn);
    dots.push(btn);
  });

  /* ---- Active dot + theme tracking ---- */
  if ('IntersectionObserver' in window) {
    var activeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var i = panels.indexOf(entry.target);
          dots.forEach(function (d, di) { d.classList.toggle('active', di === i); });
        }
      });
    }, { threshold: 0.55 });
    panels.forEach(function (p) { activeObs.observe(p); });
  }

  /* ---- Smooth-scroll for [data-scrollto] / hash links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });

  /* ---- Hero word rotator ---- */
  var rotator = document.getElementById('rotator');
  if (rotator) {
    var words = ['businesses', 'brands', 'ventures', 'ideas', 'the future'];
    var ri = 0;
    setInterval(function () {
      ri = (ri + 1) % words.length;
      rotator.style.opacity = '0';
      setTimeout(function () {
        rotator.textContent = words[ri];
        rotator.style.opacity = '1';
      }, 300);
    }, 2400);
    rotator.style.transition = 'opacity 0.3s ease';
  }

  /* ---- Count-up stats ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var dur = 1400, start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  }
})();
