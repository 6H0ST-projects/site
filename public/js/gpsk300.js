/* GPSK-300 visual white paper: scroll animations (anime.js v3) + interactive figures.
   Progressive enhancement: SVGs render final state without JS; animations rewind and
   replay on scroll. The results explorer and conditioning sliders run with or without
   anime and respect nothing motion-wise beyond CSS. */
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
    }, { threshold: threshold || 0.35 });
    io.observe(el);
  }

  /* ==================== scroll-triggered animations ==================== */
  if (animate) {

    /* ---------- Figure 1: pipeline ---------- */
    var pl = document.getElementById('gpsk-anim-pipeline');
    if (pl) {
      var nodes = pl.querySelectorAll('.pl-node');
      var arrows = pl.querySelectorAll('.pl-arrow');
      var heads = pl.querySelectorAll('.pl-head');
      anime.set(nodes, { opacity: 0, translateY: 8 });
      anime.set(heads, { opacity: 0 });
      arrows.forEach(function (a) { a.setAttribute('stroke-dasharray', a.getTotalLength()); });
      anime.set(arrows, { strokeDashoffset: function (el) { return el.getTotalLength(); } });

      once(pl, function () {
        var tl = anime.timeline({ easing: 'easeOutQuad' });
        nodes.forEach(function (n, i) {
          tl.add({ targets: n, opacity: 1, translateY: 0, duration: 420 }, i * 260);
          if (arrows[i]) {
            tl.add({ targets: arrows[i], strokeDashoffset: 0, duration: 240 }, i * 260 + 300);
            tl.add({ targets: heads[i], opacity: 1, duration: 120 }, i * 260 + 480);
          }
        });
        tl.finished.then(function () {
          var dot = pl.querySelector('.pl-dot');
          if (!dot) return;
          var segs = [[104, 132], [242, 270], [372, 400], [494, 522]];
          var kf = [];
          segs.forEach(function (s) {
            kf.push({ cx: s[0], opacity: 0, duration: 1 });
            kf.push({ cx: s[0], opacity: 0.9, duration: 140 });
            kf.push({ cx: s[1], opacity: 0.9, duration: 380 });
            kf.push({ cx: s[1], opacity: 0, duration: 140 });
            kf.push({ cx: s[1], opacity: 0, duration: 240 });
          });
          anime({ targets: dot, keyframes: kf, easing: 'linear', loop: true });
        });
      });
    }

    /* ---------- Figure 2: three channels ---------- */
    var ch = document.getElementById('gpsk-anim-channels');
    if (ch) {
      var peaks = ch.querySelectorAll('.ch-peak');
      var rings = ch.querySelectorAll('.ch-ring');
      var finals = [];
      peaks.forEach(function (p) {
        finals.push({ el: p, r: +p.getAttribute('r'), o: +p.getAttribute('opacity') });
        p.setAttribute('r', 0);
      });
      var ringR = [];
      rings.forEach(function (r) { ringR.push(+r.getAttribute('r')); r.setAttribute('r', 0); });

      once(ch, function () {
        finals.forEach(function (f, i) {
          anime({
            targets: f.el, r: f.r, duration: 500,
            delay: 120 + (i % 13) * 55 + Math.random() * 260,
            easing: 'easeOutBack'
          });
        });
        rings.forEach(function (r, i) {
          anime({ targets: r, r: ringR[i], duration: 650, delay: 350 + i * 130, easing: 'easeOutCubic' });
        });
        setTimeout(function () {
          finals.filter(function (f) { return f.o > 0.5; }).forEach(function (f) {
            anime({
              targets: f.el, opacity: [f.o, Math.max(0.15, f.o - 0.35), f.o],
              duration: 2600 + Math.random() * 1800, delay: Math.random() * 2000,
              easing: 'easeInOutSine', loop: true
            });
          });
        }, 1400);
      });
    }

    /* ---------- Figure 3: per-channel denoise -> closed-form decode ---------- */
    var dc = document.getElementById('gpsk-anim-decode');
    if (dc) {
      var rnd = function (a, b) { return a + Math.random() * (b - a); };

      /* signal peaks: sharpen in place with decaying positional jitter */
      var sig = [];
      dc.querySelectorAll('.dn-sig').forEach(function (p) {
        sig.push({ el: p, cx: +p.getAttribute('cx'), cy: +p.getAttribute('cy'), r: +p.getAttribute('r'), o: +p.getAttribute('opacity') });
      });
      /* metric rings: radius wobble decaying to the exact quadratic */
      var rg = [];
      dc.querySelectorAll('.dn-ring').forEach(function (r) {
        rg.push({ el: r, r: +r.getAttribute('r'), o: +r.getAttribute('opacity') });
      });
      /* background speckle noise, opacity 0 in markup (final state is clean) */
      var nz = [];
      dc.querySelectorAll('.dn-noise').forEach(function (n) { nz.push(n); });

      var fpaths = dc.querySelectorAll('.dn-fpath');
      var fnode = dc.querySelectorAll('.dn-fnode');
      var ifft = dc.querySelector('.dn-ifft');
      var ifftHead = dc.querySelector('.dn-ifft-head');
      var labsF = dc.querySelectorAll('.dn-lab-f');
      var mpath = dc.querySelector('.dn-mpath');
      var mhead = dc.querySelector('.dn-mhead');
      var labsM = dc.querySelectorAll('.dn-lab-m');
      var dcCell = dc.querySelector('.dc-cell');
      var alabs = dc.querySelectorAll('.dc-alab');
      var dcAtoms = dc.querySelectorAll('.dc-atom');
      var atomR = [];
      dcAtoms.forEach(function (a) { atomR.push(+a.getAttribute('r')); });
      var dcProg = dc.querySelector('.dc-progress');
      var dpx1 = +dcProg.getAttribute('x1'), dpx2 = +dcProg.getAttribute('x2');

      var cellLen = dcCell.getTotalLength();
      dcCell.setAttribute('stroke-dasharray', cellLen);
      var drawables = [ifft, mpath];
      fpaths.forEach(function (p) { drawables.push(p); });
      drawables.forEach(function (p) { p.setAttribute('stroke-dasharray', p.getTotalLength()); });

      var dcReset = function () {
        sig.forEach(function (s) {
          s.el.setAttribute('cx', s.cx + rnd(-13, 13));
          s.el.setAttribute('cy', s.cy + rnd(-13, 13));
          s.el.setAttribute('r', s.r * 1.9);
          s.el.setAttribute('opacity', 0);
        });
        rg.forEach(function (g) {
          g.el.setAttribute('r', Math.max(3, g.r + rnd(-11, 11)));
          g.el.setAttribute('opacity', 0);
        });
        nz.forEach(function (n) { n.setAttribute('opacity', rnd(0.15, 0.7)); });
        anime.set(drawables, { strokeDashoffset: function (el) { return el.getTotalLength(); } });
        anime.set([ifftHead, mhead], { opacity: 0 });
        anime.set(fnode, { opacity: 0 });
        anime.set(labsF, { opacity: 0 });
        anime.set(labsM, { opacity: 0 });
        anime.set(dcCell, { strokeDashoffset: cellLen });
        anime.set(alabs, { opacity: 0 });
        dcAtoms.forEach(function (a) { a.setAttribute('r', 0); });
        anime.set(dcProg, { x2: dpx1 });
      };

      var STEP = 560;   /* denoise keyframe step */
      var jstep = function (base, jit, k) { return base + rnd(-jit, jit) * (1 - k / 4); };

      var dcCycle = function () {
        dcReset();
        var tl = anime.timeline();

        /* speckle noise flickers and dies */
        nz.forEach(function (n) {
          var s = +n.getAttribute('opacity');
          tl.add({
            targets: n,
            keyframes: [
              { opacity: s * rnd(0.5, 1.1), duration: STEP },
              { opacity: s * rnd(0.3, 0.7), duration: STEP },
              { opacity: s * rnd(0.1, 0.35), duration: STEP },
              { opacity: 0, duration: STEP }
            ],
            easing: 'easeInOutSine'
          }, rnd(0, 180));
        });

        /* peaks sharpen in place: jitter and blur decay, opacity climbs */
        sig.forEach(function (s) {
          tl.add({
            targets: s.el,
            keyframes: [
              { cx: jstep(s.cx, 9, 1), cy: jstep(s.cy, 9, 1), r: s.r * 1.55, opacity: s.o * 0.22, duration: STEP },
              { cx: jstep(s.cx, 9, 2), cy: jstep(s.cy, 9, 2), r: s.r * 1.25, opacity: s.o * rnd(0.35, 0.55), duration: STEP },
              { cx: jstep(s.cx, 9, 3), cy: jstep(s.cy, 9, 3), r: s.r * 1.08, opacity: s.o * 0.78, duration: STEP },
              { cx: s.cx, cy: s.cy, r: s.r, opacity: s.o, duration: STEP }
            ],
            easing: 'easeInOutSine'
          }, rnd(120, 320));
        });

        /* rings wobble onto the exact quadratic */
        rg.forEach(function (g) {
          tl.add({
            targets: g.el,
            keyframes: [
              { r: jstep(g.r, 8, 1), opacity: g.o * 0.2, duration: STEP },
              { r: jstep(g.r, 8, 2), opacity: g.o * 0.45, duration: STEP },
              { r: jstep(g.r, 8, 3), opacity: g.o * 0.75, duration: STEP },
              { r: g.r, opacity: g.o, duration: STEP }
            ],
            easing: 'easeInOutSine'
          }, rnd(160, 360));
        });

        tl.add({ targets: dcProg, x2: dpx2, duration: 4 * STEP + 300, easing: 'linear' }, 0);

        var t0 = 4 * STEP + 450;
        /* metric path first: lattice before atoms */
        tl.add({ targets: mpath, strokeDashoffset: 0, duration: 380, easing: 'easeInOutQuad' }, t0);
        tl.add({ targets: labsM, opacity: 1, duration: 250 }, t0 + 120);
        tl.add({ targets: mhead, opacity: 1, duration: 120 }, t0 + 340);
        tl.add({ targets: dcCell, strokeDashoffset: 0, duration: 600, easing: 'easeInOutQuad' }, t0 + 420);
        tl.add({ targets: alabs, opacity: 1, duration: 250 }, t0 + 900);

        /* structure-factor path: combine, iFFT, drop the basis in */
        var t1 = t0 + 1150;
        fpaths.forEach(function (p) {
          tl.add({ targets: p, strokeDashoffset: 0, duration: 320, easing: 'easeInOutQuad' }, t1);
        });
        tl.add({ targets: fnode, opacity: 1, duration: 220 }, t1 + 280);
        tl.add({ targets: ifft, strokeDashoffset: 0, duration: 280, easing: 'easeInOutQuad' }, t1 + 480);
        tl.add({ targets: labsF, opacity: 1, duration: 250 }, t1 + 560);
        tl.add({ targets: ifftHead, opacity: 1, duration: 120 }, t1 + 720);
        tl.add({
          targets: dcAtoms, r: function (el, i) { return atomR[i]; },
          duration: 460, delay: anime.stagger(40, { start: t1 + 820 }), easing: 'easeOutBack'
        }, 0);

        tl.finished.then(function () { setTimeout(dcFade, 2100); });
      };

      var dcFade = function () {
        var tl = anime.timeline({ easing: 'easeInQuad' });
        tl.add({ targets: dcAtoms, r: 0, duration: 380, delay: anime.stagger(8) }, 0);
        tl.add({ targets: dcCell, strokeDashoffset: cellLen, duration: 400 }, 0);
        tl.add({ targets: [ifftHead, mhead], opacity: 0, duration: 180 }, 0);
        tl.add({ targets: fnode, opacity: 0, duration: 180 }, 0);
        tl.add({ targets: labsF, opacity: 0, duration: 180 }, 0);
        tl.add({ targets: labsM, opacity: 0, duration: 180 }, 0);
        tl.add({ targets: alabs, opacity: 0, duration: 180 }, 0);
        tl.add({ targets: drawables, strokeDashoffset: function (el) { return el.getTotalLength(); }, duration: 300 }, 80);
        sig.forEach(function (s) {
          tl.add({ targets: s.el, opacity: 0, cx: s.cx + rnd(-13, 13), cy: s.cy + rnd(-13, 13), duration: 550 }, 60);
        });
        rg.forEach(function (g) {
          tl.add({ targets: g.el, opacity: 0, r: Math.max(3, g.r + rnd(-11, 11)), duration: 550 }, 60);
        });
        tl.add({ targets: dcProg, x2: dpx1, duration: 650, easing: 'linear' }, 60);
        tl.finished.then(function () { setTimeout(dcCycle, 350); });
      };

      dcReset();
      once(dc, dcCycle, 0.25);
    }

    /* ---------- Figures 4 & 5: bar charts (holdout, emergence) ---------- */
    var animBars = function (svgId, barSel, valSel, fmt) {
      var el = document.getElementById(svgId);
      if (!el) return;
      var barEls = el.querySelectorAll(barSel);
      var valEls = el.querySelectorAll(valSel);
      var widths = [];
      barEls.forEach(function (b) { widths.push(+b.getAttribute('width')); b.setAttribute('width', 0); });
      anime.set(valEls, { opacity: 0 });
      once(el, function () {
        barEls.forEach(function (b, i) {
          anime({ targets: b, width: widths[i], duration: 900, delay: i * 160, easing: 'easeOutCubic' });
          var v = valEls[i];
          var target = parseFloat(v.getAttribute('data-val'));
          var state = { n: 0 };
          anime({ targets: v, opacity: 1, duration: 300, delay: i * 160, easing: 'linear' });
          anime({
            targets: state, n: target, duration: 900, delay: i * 160, easing: 'easeOutCubic',
            update: function () { v.textContent = fmt(state.n); }
          });
        });
      });
    };
    animBars('gpsk-anim-holdout', '.hb-bar', '.hb-val', function (n) { return Math.round(n) + '%'; });
    animBars('aniso-anim-robust', '.hb-bar', '.hb-val', function (n) { return n < 1 ? '<0.01' : (n / 100).toFixed(2); });

    /* ---------- post-training recovery chart ---------- */
    var ft = document.getElementById('gpsk-anim-finetune');
    if (ft) {
      var ftLine = ft.querySelector('.ft-line');
      var ftPts = ft.querySelectorAll('.ft-pt');
      var ftNotes = ft.querySelectorAll('.ft-note');
      var ftLen = ftLine.getTotalLength();
      ftLine.setAttribute('stroke-dasharray', ftLen);
      anime.set(ftLine, { strokeDashoffset: ftLen });
      ftPts.forEach(function (p) { p.setAttribute('r', 0); });
      anime.set(ftNotes, { opacity: 0 });
      once(ft, function () {
        var tl = anime.timeline();
        ftPts.forEach(function (p, i) {
          tl.add({ targets: p, r: 4.5, duration: 380, easing: 'easeOutBack' }, i * 320);
        });
        tl.add({ targets: ftLine, strokeDashoffset: 0, duration: 1300, easing: 'easeInOutQuad' }, 200);
        tl.add({ targets: ftNotes[0], opacity: 1, duration: 300 }, 500);
        tl.add({ targets: ftNotes[1], opacity: 1, duration: 300 }, 1400);
      });
    }

    /* ---------- stat cards ---------- */
    var grid = document.querySelector('.gpsk-300 .stat-grid');
    if (grid) {
      var stats = grid.querySelectorAll('.stat');
      stats.forEach(function (s) { s.style.opacity = 0; s.style.transform = 'translateY(10px)'; });
      once(grid, function () {
        anime({
          targets: stats, opacity: 1, translateY: 0,
          duration: 520, delay: anime.stagger(90), easing: 'easeOutQuad'
        });
      }, 0.2);
    }
  }

  /* ==================== interactive: results explorer ==================== */
  var DATA = [
    { id: 'fept', name: 'FePt', cat: 'recovered', meta: 'L1\u2080 tetragonal \u00b7 trained', rate: 58, rateTxt: '58% per-sample exact match (N = 48, trained L1\u2080 set)', note: 'The classic L1\u2080 magnet, K\u2081 \u2248 7 MJ/m\u00b3. Recovered lattice lands at 0.995 of reference a and 1.003 of reference c.' },
    { id: 'copt', name: 'CoPt', cat: 'recovered', meta: 'L1\u2080 tetragonal \u00b7 trained', rate: 58, rateTxt: '58% per-sample exact match (N = 48, trained L1\u2080 set)', note: 'High-anisotropy sibling of FePt. Lattice ratios 0.986 (a) and 1.017 (c).' },
    { id: 'feni', name: 'FeNi', cat: 'recovered', meta: 'L1\u2080 tetragonal \u00b7 trained', rate: 58, rateTxt: '58% per-sample exact match (N = 48, trained L1\u2080 set)', note: 'Tetrataenite, the rare-earth-free candidate. Ratios 0.987 (a) and 0.985 (c).' },
    { id: 'mnal', name: 'MnAl', cat: 'recovered', meta: 'L1\u2080 tetragonal \u00b7 trained', rate: 58, rateTxt: '58% per-sample exact match (N = 48, trained L1\u2080 set)', note: '\u03c4-MnAl, cheap and rare-earth-free. Ratios 0.965 (a) and 0.998 (c).' },
    { id: 'fe', name: 'Fe', cat: 'recovered', meta: 'bcc metal', rate: 100, rateTxt: '8 of 8 exact matches (N = 8)', note: 'Cell scale ~1.0. The easiest case, and it behaves like it.' },
    { id: 'cu', name: 'Cu', cat: 'recovered', meta: 'fcc metal', rate: 93, rateTxt: '93% exact match (N = 8)', note: 'Cell scale ~1.0.' },
    { id: 'mgo', name: 'MgO', cat: 'recovered', meta: 'rock-salt oxide', rate: 100, rateTxt: '8 of 8 exact matches (N = 8)', note: 'Only ~430 rock-salt oxide samples exist in the 2M corpus, and 29 entries at this exact prompt. Decoded cells run 10 to 60% large on volume but stay within match tolerance.' },
    { id: 'lif', name: 'LiF', cat: 'recovered', meta: 'rock-salt halide', rate: 100, rateTxt: '8 of 8 exact matches (N = 8)', note: 'Same story as MgO: rare family, clean recovery.' },
    { id: 'nacl', name: 'NaCl', cat: 'recovered', meta: 'rock-salt halide', rate: 100, rateTxt: '8 of 8 exact matches (N = 8)', note: 'Recovers cleanly. Its cousin KCl, with 3 corpus entries at the prompt, does not; see off-target.' },
    { id: 'caf2', name: 'CaF\u2082', cat: 'recovered', meta: 'fluorite', rate: 100, rateTxt: '8 of 8 exact matches (N = 8)', note: 'Cell scale 1.16, large but within StructureMatcher tolerance.' },
    { id: 'gaas', name: 'GaAs', cat: 'recovered', meta: 'zinc-blende covalent', rate: 88, rateTxt: '7 of 8 exact matches (N = 8)', note: 'Almost no zinc-blende entries under this formula in the corpus. The motif comes from structural siblings, the same interpolation the L1\u2080 holdout shows.' },
    { id: 'zns', name: 'ZnS', cat: 'recovered', meta: 'zinc-blende covalent', rate: 88, rateTxt: '7 of 8 exact matches (N = 8)', note: 'Cell scale 1.07 to 1.10.' },
    { id: 'fepd', name: 'FePd', cat: 'holdout', meta: 'L1\u2080 \u00b7 composition cut from training', rate: 50, rateTxt: '50% per-sample exact match (N = 48)', note: 'Never seen in training; the rest of the L1\u2080 family was. Recovers at nearly the trained 58% rate, with correct c/a. This is interpolation within a learned motif, not lookup.' },
    { id: 'mnga', name: 'MnGa', cat: 'holdout', meta: 'L1\u2080 \u00b7 composition cut from training', rate: 46, rateTxt: '46% per-sample exact match (N = 48)', note: 'Second held-out composition, same result. At these rates best-of-N recovery is near-certain.' },
    { id: 'co2mnsi', name: 'Co\u2082MnSi', cat: 'unseen', meta: 'full Heusler \u00b7 formula absent from corpus', rate: 50, rateTxt: '4 of 8 exact matches (N = 8)', note: 'The corpus is 60% ternary, so the framework is well represented even though this formula never appears.' },
    { id: 'nimnsb', name: 'NiMnSb', cat: 'unseen', meta: 'half-Heusler \u00b7 formula absent from corpus', rate: 38, rateTxt: '3 of 8 exact; 8 of 8 species-blind', note: 'The framework always comes back. What slips is element assignment: Ni and Mn differ by \u0394Z = 3, too close for the brightness heuristic that maps heavier elements to brighter peaks.' },
    { id: 'cofemnsi', name: 'CoFeMnSi', cat: 'unseen', meta: 'quaternary Heusler \u00b7 formula absent from corpus', rate: 75, rateTxt: '6 of 8 exact matches (N = 8)', note: 'Four elements, never seen under this formula, still recovered. The unseen-composition result extends to quaternary cells.' },
    { id: 'smco5', name: 'SmCo\u2085', cat: 'offtarget', meta: 'CaCu\u2085 hexagonal \u00b7 entire family cut from training', rate: 0, rateTxt: '0 of 10 matches', note: 'The designed negative control. Generates tall cells (c/a \u2248 1.6) against the squat 0.79 target, every sample, every run. One to five curated fine-tuning examples move it to c/a \u2248 0.88.' },
    { id: 'kcl', name: 'KCl', cat: 'offtarget', meta: 'rock-salt \u00b7 3 corpus entries at prompt', rate: 0, rateTxt: '0 of 8 matches', note: 'Right atomic density, wrong arrangement, nearest neighbors ~12% short. NaCl with plenty of support recovers; KCl with 3 entries does not.' },
    { id: 'cscl', name: 'CsCl', cat: 'offtarget', meta: 'CsCl-type \u00b7 5 corpus entries at prompt', rate: 0, rateTxt: '0 of 8 matches', note: 'Same thin-support failure as KCl.' },
    { id: 'srtio3', name: 'SrTiO\u2083', cat: 'offtarget', meta: 'cubic perovskite', rate: 0, rateTxt: '0 of 8 matches (all geometrically valid)', note: 'Cells come out near twice the reference volume with the wrong motif, even species-blind. Multi-sublattice oxides are the substantive miss.' },
    { id: 'cufes2', name: 'CuFeS\u2082', cat: 'offtarget', meta: 'chalcopyrite', rate: 0, rateTxt: '0 of 8 matches', note: 'Coherent cells, wrong motif. Same for kesterite and spinel.' },
    { id: 'cu2znsns4', name: 'Cu\u2082ZnSnS\u2084', cat: 'offtarget', meta: 'kesterite', rate: 0, rateTxt: '0 of 8 matches', note: 'Structured sulfides sit outside the represented motif classes.' },
    { id: 'lifepo4', name: 'LiFePO\u2084', cat: 'offtarget', meta: 'olivine \u00b7 28-atom cell', rate: null, rateTxt: 'exact atom count; ~1% close-contact pairs', note: 'The large-cell precision regime begins here. The full 28-atom cell always comes back and individual samples are fully clean, but close contacts start creeping in.' },
    { id: 'nd2fe14b', name: 'Nd\u2082Fe\u2081\u2084B', cat: 'offtarget', meta: 'NdFeB \u00b7 68-atom cell', rate: null, rateTxt: 'exact atom count; ~half the atoms in close contacts', note: 'Every sample returns exactly 68 atoms, the commercial magnet cell. Lattice edges drift 5 to 20% and positional precision degrades, so no sample passes strict validity.' }
  ];

  var rx = document.getElementById('gpsk-explorer');
  if (rx) {
    var chipsBox = rx.querySelector('.rx-chips');
    var imgEl = rx.querySelector('.rx-img');
    var nameEl = rx.querySelector('.rx-name');
    var metaEl = rx.querySelector('.rx-meta');
    var barBox = rx.querySelector('.rx-bar');
    var fillEl = rx.querySelector('.rx-fill');
    var rateEl = rx.querySelector('.rx-rate');
    var noteEl = rx.querySelector('.rx-note');
    var activeCat = 'all';

    DATA.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rx-chip';
      b.dataset.id = d.id;
      b.dataset.cat = d.cat;
      b.textContent = d.name;
      b.addEventListener('click', function () { select(d.id); });
      chipsBox.appendChild(b);
    });

    var select = function (id) {
      var d = null;
      DATA.forEach(function (x) { if (x.id === id) d = x; });
      if (!d) return;
      chipsBox.querySelectorAll('.rx-chip').forEach(function (c) {
        c.classList.toggle('is-active', c.dataset.id === id);
      });
      imgEl.src = '/img/gpsk300_tiles/' + d.id + '.png';
      imgEl.alt = 'Generated versus expected ' + d.name + ' structure';
      nameEl.textContent = d.name;
      metaEl.textContent = d.meta;
      rateEl.textContent = d.rateTxt;
      noteEl.textContent = d.note;
      if (d.rate === null) {
        barBox.style.display = 'none';
      } else {
        barBox.style.display = '';
        if (animate) {
          anime({ targets: fillEl, width: d.rate + '%', duration: 550, easing: 'easeOutCubic' });
        } else {
          fillEl.style.width = d.rate + '%';
        }
      }
    };

    var applyFilter = function (cat) {
      activeCat = cat;
      rx.querySelectorAll('.rx-f').forEach(function (f) {
        f.classList.toggle('is-active', f.dataset.cat === cat);
      });
      var firstVisible = null, currentVisible = false;
      chipsBox.querySelectorAll('.rx-chip').forEach(function (c) {
        var show = cat === 'all' || c.dataset.cat === cat;
        c.style.display = show ? '' : 'none';
        if (show && !firstVisible) firstVisible = c.dataset.id;
        if (show && c.classList.contains('is-active')) currentVisible = true;
      });
      if (!currentVisible && firstVisible) select(firstVisible);
    };

    rx.querySelectorAll('.rx-f').forEach(function (f) {
      f.addEventListener('click', function () { applyFilter(f.dataset.cat); });
    });

    select('fept');
  }

  /* ==================== interactive: conditioning sliders ==================== */
  var condSvg = document.getElementById('gpsk-cond');
  if (condSvg) {
    var q = function (cls) { return condSvg.querySelector('.' + cls); };
    var PY0 = 44, PY1 = 176;
    var yOf = function (v, vmin, vmax) { return PY1 - (v - vmin) / (vmax - vmin) * (PY1 - PY0); };

    var feIn = document.getElementById('cond-fe');
    var feOut = document.getElementById('cond-fe-val');
    var feM = q('cd-fe-marker'), feCell = q('cd-fe-cell'), feRead = q('cd-fe-read');
    var updateFe = function () {
      var E = parseFloat(feIn.value);
      var c = 3.0 + (-E) / 3 * 1.4;
      feM.setAttribute('cx', 52 + (E + 3) / 3 * 126);
      feM.setAttribute('cy', yOf(c, 2.9, 4.5));
      var h = c / 4.4 * 90;
      feCell.setAttribute('height', h);
      feCell.setAttribute('y', 110 - h / 2);
      feRead.textContent = 'c = ' + c.toFixed(2) + ' \u00c5';
      feOut.textContent = E.toFixed(2) + ' eV/atom';
    };
    feIn.addEventListener('input', updateFe);

    var bgIn = document.getElementById('cond-bg');
    var bgOut = document.getElementById('cond-bg-val');
    var bgM = q('cd-bg-marker'), bgCell = q('cd-bg-cell'), bgRead = q('cd-bg-read');
    var updateBg = function () {
      var g = parseFloat(bgIn.value);
      var a = 3.3 - 0.275 * g;
      bgM.setAttribute('cx', 352 + g / 4 * 126);
      bgM.setAttribute('cy', yOf(a, 2.1, 3.4));
      var w = a / 3.3 * 90;
      bgCell.setAttribute('width', w);
      bgCell.setAttribute('x', 542 - w / 2);
      bgRead.textContent = 'a = ' + a.toFixed(2) + ' \u00c5';
      bgOut.textContent = g.toFixed(2) + ' eV';
    };
    bgIn.addEventListener('input', updateBg);
  }

  /* ==================== interactive: emergence training scrubber ==================== */
  var emSvg = document.getElementById('gpsk-emerge');
  if (emSvg) {
    var emIn = document.getElementById('emerge-step');
    var emOut = document.getElementById('emerge-val');
    var emDots = emSvg.querySelectorAll('.em2-dot');
    var emPlay = emSvg.querySelector('.em2-play');
    var emClip = emSvg.querySelector('.em2-cliprect');
    var EX0 = 60, EX1 = 570, EY0 = 46, EY1 = 232;
    var exk = function (t) { return EX0 + t / 500 * (EX1 - EX0); };
    var eyc = function (v) { return EY1 - v / 0.9 * (EY1 - EY0); };

    var setStep = function (t) {
      var x = exk(t);
      emPlay.setAttribute('x1', x);
      emPlay.setAttribute('x2', x);
      if (emClip) emClip.setAttribute('width', Math.max(0, x - EX0 + 2));
      emDots.forEach(function (d) {
        var v = +d.getAttribute('data-v'), e = +d.getAttribute('data-e');
        var c = v / (1 + Math.exp(-(t - e) / 25));
        d.setAttribute('cx', x);
        d.setAttribute('cy', eyc(c));
      });
      emOut.textContent = Math.round(t) + 'k / 500k';
    };

    var emTouched = false;
    emIn.addEventListener('input', function () {
      emTouched = true;
      setStep(parseFloat(emIn.value));
    });

    if (animate) {
      setStep(0);
      emIn.value = 0;
      once(emSvg, function () {
        var st = { t: 0 };
        anime({
          targets: st, t: 500, duration: 4200, easing: 'easeInOutQuad',
          update: function () {
            if (emTouched) return;
            setStep(st.t);
            emIn.value = st.t;
          }
        });
      }, 0.3);
    }
  }

  /* ==================== interactive: crystal-system selector ==================== */
  var sysSvg = document.getElementById('gpsk-sys');
  if (sysSvg) {
    var sysDots = sysSvg.querySelectorAll('.sys-dot');
    var sysPoly = sysSvg.querySelector('.sys-cellpoly');
    var sysRead = sysSvg.querySelector('.sys-read');
    var sysBtns = document.querySelectorAll('.sys-btn');
    var spx = function (g) { return 55 + (g - 80) / 50 * 280; };
    var spy = function (c) { return 205 - (c - 0.7) / 1.2 * 165; };
    var srn = function (s) { return (Math.random() + Math.random() + Math.random() - 1.5) * s; };
    var SYS = {
      cubic: { med: [90, 1.00], gen: function () { return [90 + srn(1.2), 1.0 + srn(0.035)]; } },
      tetragonal: { med: [90, 1.37], gen: function () { return [90 + srn(1.2), 1.10 + Math.random() * 0.45]; } },
      hexagonal: { med: [120, 1.40], gen: function () { return [120 + srn(1.8), 1.05 + Math.random() * 0.7]; } }
    };
    var sysGlyph = function (g, ca) {
      var A = 48, C = A * ca, rad = g * Math.PI / 180;
      var dx = C * Math.cos(rad), dy = C * Math.sin(rad);
      var x0 = 465 - (A + dx) / 2, y0 = 120 + dy / 2;
      return x0.toFixed(1) + ',' + y0.toFixed(1) + ' ' + (x0 + A).toFixed(1) + ',' + y0.toFixed(1) + ' ' +
             (x0 + A + dx).toFixed(1) + ',' + (y0 - dy).toFixed(1) + ' ' + (x0 + dx).toFixed(1) + ',' + (y0 - dy).toFixed(1);
    };
    var setSys = function (name) {
      sysBtns.forEach(function (b) { b.classList.toggle('is-active', b.dataset.sys === name); });
      var s = SYS[name];
      sysDots.forEach(function (d, i) {
        var p = s.gen();
        var tx = Math.min(Math.max(spx(p[0]), 58), 332);
        var ty = Math.min(Math.max(spy(p[1]), 42), 202);
        if (animate) {
          anime({ targets: d, cx: tx, cy: ty, duration: 620, delay: i * 14, easing: 'easeInOutQuad' });
        } else {
          d.setAttribute('cx', tx);
          d.setAttribute('cy', ty);
        }
      });
      var pts = sysGlyph(s.med[0], s.med[1]);
      if (animate) {
        anime({ targets: sysPoly, points: pts, duration: 620, easing: 'easeInOutQuad' });
      } else {
        sysPoly.setAttribute('points', pts);
      }
      sysRead.textContent = 'median \u03b3 = ' + s.med[0].toFixed(0) + '\u00b0 \u00b7 c/a = ' + s.med[1].toFixed(2);
    };
    sysBtns.forEach(function (b) {
      b.addEventListener('click', function () { setSys(b.dataset.sys); });
    });
  }

  /* ==================== anisotropy dataset: calibration animation ==================== */
  var cal = document.getElementById('aniso-anim-cal');
  if (cal && animate) {
    var iqrs = cal.querySelectorAll('.cal-iqr');
    var meds = cal.querySelectorAll('.cal-med');
    var flips = cal.querySelectorAll('.cal-flip');
    iqrs.forEach(function (r, i) {
      var lo = +r.getAttribute('data-lo'), hi = +r.getAttribute('data-hi');
      var mid = (+meds[i].getAttribute('y1'));
      r.setAttribute('y', mid);
      r.setAttribute('height', 0);
      r.dataset.top = lo; r.dataset.h = hi - lo;
    });
    anime.set(meds, { opacity: 0 });
    anime.set(flips, { opacity: 0 });
    once(cal, function () {
      meds.forEach(function (m, i) {
        anime({ targets: m, opacity: 1, duration: 250, delay: i * 140, easing: 'linear' });
        anime({
          targets: iqrs[i], y: +iqrs[i].dataset.top, height: +iqrs[i].dataset.h,
          duration: 650, delay: 200 + i * 140, easing: 'easeOutCubic'
        });
        anime({ targets: flips[i], opacity: 1, duration: 300, delay: 700 + i * 140, easing: 'linear' });
      });
    });
  }

  /* ==================== anisotropy dataset: landscape class filter ==================== */
  var lp = document.getElementById('aniso-landscape');
  if (lp) {
    var lpBtns = document.querySelectorAll('.lp-f');
    var lpRead = document.querySelector('.lp-read');
    var LPSTATS = {
      all: [2044, '1.22', 59], i: [337, '1.08', 54], b: [37, '0.86', 32],
      p: [204, '1.35', 62], c: [422, '1.59', 67], o: [740, '1.13', 56], h: [304, '1.43', 63]
    };
    var LPNAMES = {
      all: 'reliable labels', i: 'intermetallics', b: 'borides',
      p: 'pnictides', c: 'chalcogenides', o: 'oxides', h: 'halides'
    };
    lpBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var cl = b.dataset.cl;
        lpBtns.forEach(function (x) { x.classList.toggle('is-active', x === b); });
        if (cl === 'all') { lp.removeAttribute('data-sel'); } else { lp.setAttribute('data-sel', cl); }
        var s = LPSTATS[cl];
        lpRead.textContent = s[0].toLocaleString() + ' ' + LPNAMES[cl] + ' \u00b7 median \u03ba = ' + s[1] + ' \u00b7 ' + s[2] + '% at \u03ba > 1';
      });
    });
  }
})();
