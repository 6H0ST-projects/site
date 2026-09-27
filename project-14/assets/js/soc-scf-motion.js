/* SOC-SCF article motion (anime.js v3), in the style of the other Project 14 write-ups.
   Progressive enhancement: every figure is drawn in its final state; animations rewind it and
   play once when it scrolls into view. Nothing runs under prefers-reduced-motion or if anime.js
   is unavailable. */
(function() {
  'use strict';
  const root = document.querySelector('.soc-scf-trajectories');
  if (!root || typeof anime === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function once(el, cb, threshold) {
    if (!('IntersectionObserver' in window)) { cb(); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { io.disconnect(); cb(); } });
    }, { threshold: threshold || 0.3 });
    io.observe(el);
  }
  // Run a looping animation only while its figure is on screen.
  function whileVisible(el, start, stop) {
    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(entries => entries.forEach(e => (e.isIntersecting ? start() : stop())), { threshold: 0.05 }).observe(el);
  }
  const diagram = id => root.querySelector(`svg[aria-labelledby^="${id}"]`);
  const attrs = (el, names) => Object.fromEntries(names.map(n => [n, +el.getAttribute(n)]));

  // Draw a path in; its arrowhead is held back until the line arrives.
  function prepareDraw(path) {
    const len = path.getTotalLength();
    path.dataset.marker = path.getAttribute('marker-end') || '';
    path.removeAttribute('marker-end');
    path.setAttribute('stroke-dasharray', len);
    path.setAttribute('stroke-dashoffset', len);
    return path;
  }
  function draw(path, duration) {
    return {
      targets: path, strokeDashoffset: 0, duration: duration || 320, easing: 'easeInOutQuad',
      complete: () => {
        if (path.dataset.marker) path.setAttribute('marker-end', path.dataset.marker);
        path.removeAttribute('stroke-dasharray'); path.removeAttribute('stroke-dashoffset');
      }
    };
  }
  function countUp(el, delay) {
    const target = +el.dataset.val, state = { n: 0 };
    anime.set(el, { opacity: 0 });
    anime({ targets: el, opacity: 1, duration: 300, delay, easing: 'linear' });
    anime({
      targets: state, n: target, duration: 900, delay, easing: 'easeOutCubic',
      update: () => { el.textContent = Math.round(state.n); },
      complete: () => { el.textContent = el.dataset.val; }
    });
  }

  /* ---------- Stat strip: stagger in and count up ---------- */
  const stats = root.querySelector('.soc-stats');
  if (stats) {
    const items = [...stats.children];
    const values = [...stats.querySelectorAll('dd')].map(dd => ({ dd, text: dd.textContent }));
    anime.set(items, { opacity: 0, translateY: 10 });
    once(stats, () => {
      anime({ targets: items, opacity: 1, translateY: 0, duration: 520, delay: anime.stagger(90), easing: 'easeOutQuad' });
      values.forEach(({ dd, text }, i) => {
        const state = { t: 0 };
        anime({
          targets: state, t: 1, duration: 1100, delay: i * 90, easing: 'easeOutCubic',
          update: () => {
            dd.textContent = text.replace(/\d[\d,]*(?:\.\d+)?/g, m => {
              const decimals = (m.split('.')[1] || '').length;
              const v = parseFloat(m.replace(/,/g, '')) * state.t;
              return m.includes(',') ? Math.round(v).toLocaleString('en-US') : v.toFixed(decimals);
            });
          },
          complete: () => { dd.textContent = text; }
        });
      });
    }, 0.2);
  }

  /* ---------- Figures and the claim: fade up into place ---------- */
  // The SCF-loop diagram (Figure 2) stays static.
  [...root.querySelectorAll('.soc-figure, .soc-claim')].filter(el => !el.querySelector('svg[aria-labelledby^="ksl-title"]')).forEach(el => {
    anime.set(el, { opacity: 0, translateY: 14 });
    once(el, () => anime({ targets: el, opacity: 1, translateY: 0, duration: 700, easing: 'easeOutCubic' }), 0.12);
  });

  /* ---------- Collinear vs noncollinear: locked arrows grow; free arrows swing out ---------- */
  const spin = diagram('cnc-title');
  if (spin) {
    const locked = [...spin.querySelectorAll('.cnc-col line')];
    const free = [...spin.querySelectorAll('.cnc-free line')];
    const finals = new Map([...locked, ...free].map(l => [l, attrs(l, ['x1', 'y1', 'x2', 'y2'])]));
    locked.forEach(l => {
      const f = finals.get(l), mx = (f.x1 + f.x2) / 2, my = (f.y1 + f.y2) / 2;
      anime.set(l, { x1: mx, x2: mx, y1: my, y2: my });
    });
    free.forEach(l => {  // start pointing straight up, like a collinear arrow
      const f = finals.get(l), mx = (f.x1 + f.x2) / 2, my = (f.y1 + f.y2) / 2, h = Math.hypot(f.x2 - f.x1, f.y2 - f.y1) / 2;
      anime.set(l, { x1: mx, x2: mx, y1: my + h, y2: my - h, opacity: 0 });
    });
    once(spin, () => {
      locked.forEach((l, i) => anime({ targets: l, ...finals.get(l), duration: 520, delay: 100 + i * 45, easing: 'easeOutBack' }));
      free.forEach((l, i) => {
        anime({ targets: l, opacity: 1, duration: 200, delay: 800 + i * 40, easing: 'linear' });
        anime({ targets: l, ...finals.get(l), duration: 900, delay: 1000 + i * 55, easing: 'easeOutElastic(1, .7)' });
      });
    });
  }

  /* ---------- Spin–orbit frames: the electron orbits the nucleus, and vice versa ---------- */
  const frames = diagram('socf-title');
  if (frames) {
    const q = c => frames.querySelector(c);
    const e = q('.socf-e'), ev = q('.socf-ev'), evl = q('.socf-evl'), n = q('.socf-n'), nt = q('.socf-nt'), nv = q('.socf-nv');
    if (e && ev && n && nt && nv) {
      const rx = 110, ry = 38, arrow = 46;
      let t = Math.atan2(21 / ry, 92 / rx), last = null, raf = null;
      const place = () => {
        const x = rx * Math.cos(t), y = ry * Math.sin(t);
        const tx = -rx * Math.sin(t), ty = ry * Math.cos(t), s = Math.hypot(tx, ty), ux = tx / s, uy = ty / s;
        e.setAttribute('cx', x); e.setAttribute('cy', y);
        ev.setAttribute('x1', x); ev.setAttribute('y1', y); ev.setAttribute('x2', x + arrow * ux); ev.setAttribute('y2', y + arrow * uy);
        if (evl) { evl.setAttribute('x', x + (arrow + 12) * ux - 3); evl.setAttribute('y', y + (arrow + 12) * uy + 4); }
        n.setAttribute('cx', -x); n.setAttribute('cy', -y);
        nt.setAttribute('x', -x); nt.setAttribute('y', -y + 4);
        nv.setAttribute('x1', -x); nv.setAttribute('y1', -y); nv.setAttribute('x2', -x - arrow * ux); nv.setAttribute('y2', -y - arrow * uy);
      };
      const step = now => {
        if (last !== null) t += (now - last) / 1000 * (2 * Math.PI / 7);
        last = now; place(); raf = requestAnimationFrame(step);
      };
      once(frames, () => whileVisible(frames,
        () => { if (raf === null) { last = null; raf = requestAnimationFrame(step); } },
        () => { if (raf !== null) cancelAnimationFrame(raf); raf = null; }), 0.4);
    }
  }

  /* ---------- Response split: input → potential → output, one arrow at a time ---------- */
  const split = diagram('rsp-title');
  if (split) {
    const boxes = [...split.querySelectorAll(':scope > g.ksl-stored')];
    const edges = [...split.querySelectorAll('.rsp-edge')].map(prepareDraw);
    const labels = [...split.querySelectorAll('.rsp-label')];
    const subs = [...split.querySelectorAll('.rsp-sub')];
    const notes = split.querySelectorAll('.rsp-note');
    anime.set(boxes, { opacity: 0, translateY: 8 });
    anime.set([...labels, ...subs, ...notes], { opacity: 0 });
    once(split, () => {
      const tl = anime.timeline({ easing: 'easeOutQuad' });
      boxes.forEach((b, i) => {
        const t = 150 + i * 700;
        tl.add({ targets: b, opacity: 1, translateY: 0, duration: 380 }, t);
        if (edges[i]) {
          tl.add(draw(edges[i], 360), t + 330);
          tl.add({ targets: labels[i], opacity: 1, duration: 300 }, t + 480);
          tl.add({ targets: subs.filter(s => s.getAttribute('x') === labels[i].getAttribute('x')), opacity: 1, duration: 300, delay: anime.stagger(80) }, t + 560);
        }
      });
      tl.add({ targets: notes, opacity: 1, duration: 400, delay: anime.stagger(150) }, 150 + boxes.length * 700);
    });
  }

  /* ---------- Bar charts: grow the bars and count up the values ---------- */
  root.querySelectorAll('svg.soc-chart').forEach(chart => {
    const hbars = [...chart.querySelectorAll('.soc-hbar')];
    const vbars = [...chart.querySelectorAll('.soc-vbar')];
    const counts = [...chart.querySelectorAll('.soc-count')];
    hbars.forEach(b => b.setAttribute('width', 0));
    vbars.forEach(b => { b.setAttribute('y', +b.dataset.y + +b.dataset.h); b.setAttribute('height', 0); });
    counts.forEach(c => anime.set(c, { opacity: 0 }));
    once(chart, () => {
      hbars.forEach((b, i) => anime({ targets: b, width: +b.dataset.w, duration: 900, delay: 150 + i * 220, easing: 'easeOutCubic' }));
      vbars.forEach((b, i) => anime({ targets: b, y: +b.dataset.y, height: +b.dataset.h, duration: 800, delay: 150 + i * 130, easing: 'easeOutCubic' }));
      counts.forEach((c, i) => countUp(c, 150 + i * (hbars.length ? 220 : 130)));
    }, 0.4);
  });

  /* ---------- Rotate widget: one sweep to show what the slider does ---------- */
  const rotate = root.querySelector('#soc-rotate');
  const slider = rotate && rotate.querySelector('#soc-rotate-angle');
  if (slider) {
    let intro = null, touched = false;
    const stop = () => { touched = true; if (intro) intro.pause(); };
    rotate.addEventListener('pointerdown', stop, true);
    rotate.addEventListener('keydown', stop, true);
    once(rotate, () => {
      if (touched) return;
      const final = +slider.value, state = { a: final };
      const set = () => { slider.value = Math.round(state.a); slider.dispatchEvent(new Event('input')); };
      intro = anime.timeline({ update: set })
        .add({ targets: state, a: 0, duration: 500, easing: 'easeInOutSine' })
        .add({ targets: state, a: 90, duration: 1100, easing: 'easeInOutSine' })
        .add({ targets: state, a: final, duration: 800, easing: 'easeOutCubic' });
    }, 0.6);
  }
})();
