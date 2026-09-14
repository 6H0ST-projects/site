/* GPAC visual white paper: crystal build animations (anime.js v3).
   Progressive enhancement: SVGs render final state without JS;
   animations rewind and replay on scroll.
   Respects prefers-reduced-motion. */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnime = typeof anime !== 'undefined';
  var animate = hasAnime && !reduced;

  function once(el, cb, threshold) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); cb(); }
      });
    }, { threshold: threshold || 0.25 });
    io.observe(el);
  }

  var configs = [
    {
      svgId: 'gpac-anim-nacl',
      prefix: 'nacl',
      lines: ['nacl-line-hall','nacl-line-gram','nacl-line-orb1','nacl-line-orb2','nacl-line-end'],
      atomClasses: ['.ga-na','.ga-cl'],
      paramSlide: false
    },
    {
      svgId: 'gpac-anim-tio2',
      prefix: 'tio2',
      lines: ['tio2-line-hall','tio2-line-gram','tio2-line-orb1','tio2-line-orb2','tio2-line-end'],
      atomClasses: ['.ga-ti','.ga-o'],
      paramSlide: true,
      paramId: 'tio2-param'
    },
    {
      svgId: 'gpac-anim-heusler',
      prefix: 'heus',
      lines: ['heus-line-hall','heus-line-gram','heus-line-orb1','heus-line-orb2','heus-line-orb3','heus-line-end'],
      atomClasses: ['.ga-al','.ga-mn','.ga-cu'],
      paramSlide: false
    }
  ];

  function showFinal(svg, cfg) {
    svg.querySelectorAll('.ga-line').forEach(function (g) { g.setAttribute('opacity', '1'); });
    cfg.atomClasses.forEach(function (cls) {
      svg.querySelectorAll(cls).forEach(function (c) {
        var d = +(c.getAttribute('data-depth') || 1);
        c.setAttribute('opacity', String(d));
        var dcx = c.getAttribute('data-cx');
        var dcy = c.getAttribute('data-cy');
        if (dcx) c.setAttribute('cx', dcx);
        if (dcy) c.setAttribute('cy', dcy);
      });
    });
    var cell = svg.querySelector('#' + cfg.prefix + '-cell');
    if (cell) cell.setAttribute('opacity', '1');
    var sha = svg.querySelector('#' + cfg.prefix + '-sha');
    if (sha) sha.setAttribute('opacity', '1');
    var legend = svg.querySelector('#' + cfg.prefix + '-legend');
    if (legend) legend.setAttribute('opacity', '1');
    if (cfg.paramId) {
      var p = svg.querySelector('#' + cfg.paramId);
      if (p) p.setAttribute('opacity', '1');
    }
    svg.querySelectorAll('.ga-line rect').forEach(function (r) {
      r.setAttribute('fill-opacity', '0.03');
    });
  }

  function setupAnimation(cfg) {
    var svg = document.getElementById(cfg.svgId);
    if (!svg) return;
    if (!animate) { showFinal(svg, cfg); return; }

    function runBuild() {
      svg.querySelectorAll('.ga-line').forEach(function (g) {
        g.setAttribute('opacity', '0.35');
        var r = g.querySelector('rect');
        if (r) { r.setAttribute('fill', '#000'); r.setAttribute('fill-opacity', '0'); }
      });
      cfg.atomClasses.forEach(function (cls) {
        svg.querySelectorAll(cls).forEach(function (c) { c.setAttribute('opacity', '0'); });
      });
      anime.set('#' + cfg.prefix + '-cell', { opacity: 0 });
      anime.set('#' + cfg.prefix + '-sha', { opacity: 0 });
      anime.set('#' + cfg.prefix + '-legend', { opacity: 0 });
      if (cfg.paramId) anime.set('#' + cfg.paramId, { opacity: 0 });

      var tl = anime.timeline({ easing: 'easeOutQuad' });
      var t = 400;

      function hl(lineId) {
        var line = svg.querySelector('#' + lineId);
        if (!line) return;
        tl.add({ targets: line, opacity: 1, duration: 200 }, t);
        var rect = line.querySelector('rect');
        if (rect) tl.add({ targets: rect, fillOpacity: [0.08, 0.03], duration: 600, easing: 'easeOutCubic' }, t);
        line.querySelectorAll('text').forEach(function (tx) {
          if (tx.getAttribute('fill') === '#555')
            tl.add({ targets: tx, fill: ['#FF0860', '#333'], duration: 500 }, t);
        });
      }

      var li = cfg.lines;
      /* HALL -> cell */
      hl(li[0]);
      tl.add({ targets: '#' + cfg.prefix + '-cell', opacity: [0, 1], duration: 600, easing: 'easeOutCubic' }, t + 300);
      t += 1100;

      /* GRAM -> pulse */
      hl(li[1]);
      tl.add({ targets: '#' + cfg.prefix + '-cell', scale: [0.93, 1.0], duration: 500, easing: 'easeOutElastic(1, .6)' }, t + 300);
      t += 1300;

      /* ORB lines -> atom groups */
      var orbStart = 2, orbEnd = li.length - 2;
      for (var oi = orbStart; oi <= orbEnd; oi++) {
        var gi = oi - orbStart;
        hl(li[oi]);
        var cls = cfg.atomClasses[gi];
        if (cls) {
          var atoms = svg.querySelectorAll(cls);
          var bt = t + 300;
          atoms.forEach(function (atom, ai) {
            var tr = +(atom.getAttribute('r') || 7);
            var depth = +(atom.getAttribute('data-depth') || 1);
            tl.add({
              targets: atom, opacity: [0, depth], r: [0, tr],
              duration: 280, easing: 'easeOutBack'
            }, bt + ai * 55);
          });
          if (cfg.paramSlide && gi === 1) {
            var slideT = bt + atoms.length * 55 + 200;
            atoms.forEach(function (oa) {
              var dcx = oa.getAttribute('data-cx');
              var dcy = oa.getAttribute('data-cy');
              if (dcx && dcy)
                tl.add({ targets: oa, cx: +dcx, cy: +dcy, duration: 600, easing: 'easeInOutQuad' }, slideT);
            });
            if (cfg.paramId)
              tl.add({ targets: '#' + cfg.paramId, opacity: [0, 1], duration: 300 }, slideT + 100);
            t = slideT + 800;
          } else {
            t += 300 + atoms.length * 55 + 400;
          }
        } else { t += 800; }
      }

      /* END -> SHA + legend */
      hl(li[li.length - 1]);
      tl.add({ targets: '#' + cfg.prefix + '-sha', opacity: [0, 1], duration: 500 }, t + 300);
      tl.add({ targets: '#' + cfg.prefix + '-legend', opacity: [0, 1], duration: 400 }, t + 400);

      tl.finished.then(function () { setTimeout(runBuild, 4000); });
    }

    once(svg, runBuild, 0.25);
  }

  configs.forEach(setupAnimation);
})();
