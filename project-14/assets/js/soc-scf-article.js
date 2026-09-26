/* Widgets for the SOC-SCF dataset article.
   Rotate: phenomenological uniaxial energy from MagnetSketch (magnetism-model.js), not a calculation.
   Explorer: measured FeAl2 slices and residuals rendered by docs/editorial/generate_soc_scf_figures.py. */
(function() {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const ink = '#252830', muted = '#5b6471', grid = '#e6e9ee', pink = '#ff0860', slate = '#4b515b';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function el(tag, attrs, parent, text) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text !== undefined) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  function path(points) { return points.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(''); }
  function sci(v) {
    if (!Number.isFinite(v)) return '—';
    const [m, e] = v.toExponential(2).split('e');
    return `${m} × 10${String(Number(e)).replace('-', '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d])}`;
  }
  // Render "m_z"-style labels with real subscripts, building DOM nodes rather than parsing HTML.
  function rich(node, text) {
    node.replaceChildren();
    for (const part of text.split(/([A-Za-z])_([A-Za-z0-9]+)/).reduce((acc, p, i) => (i % 3 === 0 ? acc.push([p]) : acc[acc.length - 1].push(p), acc), [])) {
      const [plain, base, sub] = part;
      if (plain) node.appendChild(document.createTextNode(plain));
      if (base) { node.appendChild(document.createTextNode(base)); const s = document.createElement('sub'); s.textContent = sub; node.appendChild(s); }
    }
  }
  function setPressed(buttons, match) { buttons.forEach(b => b.setAttribute('aria-pressed', String(match(b)))); }
  function pointerX(svg, event) {
    const box = svg.getBoundingClientRect();
    return (event.clientX - box.left) / box.width * svg.viewBox.baseVal.width;
  }

  /* ---------------- Rotate every spin together ---------------- */
  function initRotate(root) {
    const model = window.MagnetSketch;
    if (!model) return;
    const crystal = root.querySelector('#soc-rotate-crystal');
    const energy = root.querySelector('#soc-rotate-energy');
    const slider = root.querySelector('#soc-rotate-angle');
    const angleOut = root.querySelector('#soc-rotate-angle-value');
    const readout = root.querySelector('#soc-rotate-readout');
    const socButtons = [...root.querySelectorAll('[data-soc]')];
    const state = { soc: true, angle: Number(slider.value) };
    const K = () => model.anisotropy({ soc: state.soc, kind: 'axis', strength: 1 });

    function drawCrystal() {
      crystal.replaceChildren();
      el('title', {}, crystal, `Tetragonal cell with all moments at ${state.angle} degrees from the c axis`);
      const x0 = 80, y0 = 45, w = 140, h = 200;
      el('rect', { x: x0, y: y0, width: w, height: h, fill: '#f7f8fa', stroke: '#c9ced6' }, crystal);
      el('line', { x1: 34, y1: 250, x2: 34, y2: 196, stroke: muted, 'stroke-width': 1.2, 'marker-end': 'url(#socw-axis)' }, crystal);
      el('line', { x1: 34, y1: 250, x2: 88, y2: 250, stroke: muted, 'stroke-width': 1.2, 'marker-end': 'url(#socw-axis)' }, crystal);
      const defs = el('defs', {}, crystal);
      const axis = el('marker', { id: 'socw-axis', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
      el('path', { d: 'M0 0 10 5 0 10Z', fill: muted }, axis);
      const head = el('marker', { id: 'socw-head', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs);
      el('path', { d: 'M0 0 10 5 0 10Z', fill: pink }, head);
      el('text', { x: 26, y: 190, fill: ink, 'font-size': 13 }, crystal, 'c');
      el('text', { x: 94, y: 254, fill: ink, 'font-size': 13 }, crystal, 'a');
      const sites = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h], [x0 + w / 2, y0 + h / 2]];
      const t = state.angle * Math.PI / 180, L = 30;
      for (const [x, y] of sites) {
        el('circle', { cx: x, cy: y, r: 9, fill: '#bab3a7' }, crystal);
        el('line', { x1: x - L / 2 * Math.sin(t), y1: y + L / 2 * Math.cos(t), x2: x + L / 2 * Math.sin(t), y2: y - L / 2 * Math.cos(t),
          stroke: pink, 'stroke-width': 3, 'stroke-linecap': 'round', 'marker-end': 'url(#socw-head)' }, crystal);
      }
      const [cx, cy] = sites[4], R = 34;
      el('line', { x1: cx, y1: cy, x2: cx, y2: cy - R - 8, stroke: muted, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, crystal);
      if (state.angle > 0) {
        el('path', { d: `M${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx + R * Math.sin(t)} ${cy - R * Math.cos(t)}`, fill: 'none', stroke: muted, 'stroke-width': 1 }, crystal);
        const h = t / 2;
        el('text', { x: cx + (R + 11) * Math.sin(h), y: cy - (R + 11) * Math.cos(h) + 4, 'text-anchor': 'middle', fill: muted, 'font-size': 12 }, crystal, 'θ');
      }
      el('text', { x: 150, y: 285, 'text-anchor': 'middle', fill: muted, 'font-size': 12 }, crystal, `θ = ${state.angle}° from c`);
    }

    function drawEnergy() {
      energy.replaceChildren();
      const a = K(), W = 360, H = 300, left = 44, right = W - 16, top = 30, bottom = H - 50;
      const X = d => left + (right - left) * d / 180, Y = e => bottom - (bottom - top) * (e + 0.15) / 1.35;
      el('title', {}, energy, 'Energy relative to the c axis versus magnetization angle');
      for (const e of [0, 0.5, 1]) {
        el('line', { x1: left, x2: right, y1: Y(e), y2: Y(e), stroke: grid }, energy);
        el('text', { x: left - 8, y: Y(e) + 4, 'text-anchor': 'end', fill: muted, 'font-size': 11 }, energy, e === 0 ? '0' : `${e} K`);
      }
      for (const d of [0, 45, 90, 135, 180]) el('text', { x: X(d), y: bottom + 18, 'text-anchor': 'middle', fill: muted, 'font-size': 11 }, energy, `${d}°`);
      el('text', { x: X(0) - 4, y: bottom + 36, 'text-anchor': 'start', fill: ink, 'font-size': 11 }, energy, 'along c');
      el('text', { x: X(90), y: bottom + 36, 'text-anchor': 'middle', fill: ink, 'font-size': 11 }, energy, 'in the basal plane');
      el('text', { x: X(180) + 4, y: bottom + 36, 'text-anchor': 'end', fill: ink, 'font-size': 11 }, energy, 'along −c');
      el('text', { x: left, y: 16, fill: muted, 'font-size': 11 }, energy, 'E(θ) − E(0)');
      const pts = Array.from({ length: 181 }, (_, d) => [X(d), Y(model.energy(d, a))]);
      if (a > 0) el('path', { d: path(pts) + `L${X(180)} ${Y(0)}L${X(0)} ${Y(0)}Z`, fill: pink, 'fill-opacity': 0.08 }, energy);
      el('path', { d: path(pts), fill: 'none', stroke: a > 0 ? pink : '#9aa1ab', 'stroke-width': 2 }, energy);
      if (a > 0) {
        el('line', { x1: X(90), x2: X(90), y1: Y(0), y2: Y(a), stroke: slate, 'stroke-width': 1 }, energy);
        el('text', { x: X(90) + 6, y: Y(a / 2), fill: ink, 'font-size': 11 }, energy, 'anisotropy energy');
      }
      el('circle', { cx: X(state.angle), cy: Y(model.energy(state.angle, a)), r: 6, fill: pink, stroke: '#fff', 'stroke-width': 2 }, energy);
      energy.dataset.left = left; energy.dataset.right = right;
    }

    function render() {
      const a = K(), e = model.energy(state.angle, a);
      slider.value = state.angle;
      angleOut.textContent = `${state.angle}°`;
      setPressed(socButtons, b => (b.dataset.soc === 'on') === state.soc);
      drawCrystal(); drawEnergy();
      readout.textContent = state.soc
        ? `θ = ${state.angle}°: energy ${e.toFixed(2)} K above the c axis. Along ±c the energy is lowest; in the basal plane it is highest. That difference is the magnetocrystalline anisotropy energy.`
        : `θ = ${state.angle}°: energy 0. Without spin–orbit coupling the spin direction is not tied to the lattice, so every direction costs the same. For the same reason a collinear calculation's spin axis is arbitrary.`;
    }

    slider.addEventListener('input', () => { state.angle = Number(slider.value); render(); });
    socButtons.forEach(b => b.addEventListener('click', () => { state.soc = b.dataset.soc === 'on'; render(); }));
    let dragging = false;
    const fromPointer = event => {
      const left = Number(energy.dataset.left), right = Number(energy.dataset.right);
      state.angle = Math.round(Math.max(0, Math.min(180, (pointerX(energy, event) - left) / (right - left) * 180)));
      render();
    };
    energy.addEventListener('pointerdown', e => { dragging = true; energy.setPointerCapture(e.pointerId); fromPointer(e); });
    energy.addEventListener('pointermove', e => { if (dragging) fromPointer(e); });
    energy.addEventListener('pointerup', () => { dragging = false; });
    energy.addEventListener('keydown', e => {
      const step = e.shiftKey ? 15 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') state.angle = Math.min(180, state.angle + step);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') state.angle = Math.max(0, state.angle - step);
      else return;
      e.preventDefault(); render();
    });
    render();
  }

  /* ---------------- FeAl2 SCF explorer (measured) ---------------- */
  const CHANNEL_ORDER = [['input-mz', 'Input spin m_z'], ['input-n', 'Input charge n'], ['residual-m', 'Spin residual'],
                         ['residual-n', 'Charge residual'], ['v0', 'Potential V₀'], ['bz', 'Potential B_z']];

  function initExplorer(root, data) {
    const base = root.dataset.src;
    const channelBox = root.querySelector('.socw-channels');
    const stepBox = root.querySelector('.socw-steps');
    const history = root.querySelector('#soc-explorer-history');
    const readout = root.querySelector('#soc-explorer-readout');
    const steps = data.iterations;
    const state = { channel: 'input-mz', step: steps[0] };
    let timer = null;

    const channelButtons = CHANNEL_ORDER.map(([key, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.channel = key; rich(b, label);
      b.addEventListener('click', () => { state.channel = key; render(); preload(); });
      channelBox.appendChild(b); return b;
    });
    const play = document.createElement('button');
    play.type = 'button'; play.className = 'socw-play'; play.textContent = 'Play';
    stepBox.appendChild(play);
    const label = document.createElement('span');
    label.className = 'socw-small'; label.textContent = 'Evaluation';
    stepBox.appendChild(label);
    const stepButtons = steps.map(s => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.step = s; b.textContent = s === steps[steps.length - 1] ? `${s} · final` : String(s);
      b.addEventListener('click', () => { stop(); state.step = s; render(); });
      stepBox.appendChild(b); return b;
    });

    for (const layer of ['fe', 'al']) {
      const svg = root.querySelector(`[data-atoms="${layer}"]`);
      for (const [species, x, y] of data.atoms[layer]) {
        el('circle', { cx: x, cy: y, r: 0.024, fill: 'none', stroke: '#fff', 'stroke-width': 3.2, 'vector-effect': 'non-scaling-stroke' }, svg);
        el('circle', { cx: x, cy: y, r: 0.024, fill: 'none', stroke: ink, 'stroke-width': 1.2, 'vector-effect': 'non-scaling-stroke' }, svg);
      }
    }

    function src(channel, layer, step) { return `${base}${channel}-${layer}-${String(step).padStart(2, '0')}.webp?v=${data.version || ''}`; }
    function preload() {
      const load = () => steps.forEach(s => ['fe', 'al'].forEach(l => { const i = new Image(); i.src = src(state.channel, l, s); }));
      ('requestIdleCallback' in window) ? requestIdleCallback(load) : setTimeout(load, 300);
    }
    function colorbar() {
      const ch = data.channels[state.channel];
      root.querySelector('.socw-gradient').style.background = `linear-gradient(to right, ${ch.gradient.join(', ')})`;
      const ticks = root.querySelector('.socw-ticks');
      ticks.replaceChildren();
      for (const t of ch.ticks) {
        const s = document.createElement('span');
        s.style.left = `${(t.at * 100).toFixed(2)}%`; s.textContent = t.value;
        ticks.appendChild(s);
      }
      rich(root.querySelector('.socw-scale'), `${ch.label} · ${ch.unit} · ${ch.scale}`);
    }
    function drawHistory(hover) {
      history.replaceChildren();
      const W = 600, H = 230, left = 56, right = W - 20, top = 34, bottom = H - 38;
      const X = s => left + (right - left) * (s - 1) / 95;
      const Y = v => bottom - (bottom - top) * (Math.log10(Math.max(v, 1e-8)) + 7) / 7.5;
      el('title', {}, history, 'Charge and spin L1 residual per SCF evaluation, logarithmic scale');
      for (const e of [0, -2, -4, -6]) {
        el('line', { x1: left, x2: right, y1: Y(10 ** e), y2: Y(10 ** e), stroke: grid }, history);
        el('text', { x: left - 8, y: Y(10 ** e) + 4, 'text-anchor': 'end', fill: muted, 'font-size': 13 }, history, e === 0 ? '1' : `1e${e}`.replace('-', '−'));
      }
      for (const s of [1, 20, 40, 60, 80, 96]) el('text', { x: X(s), y: bottom + 17, 'text-anchor': 'middle', fill: muted, 'font-size': 13 }, history, s);
      el('text', { x: (left + right) / 2, y: H - 4, 'text-anchor': 'middle', fill: muted, 'font-size': 13 }, history, 'SCF evaluation (not time)');
      el('text', { x: left, y: 14, fill: muted, 'font-size': 13 }, history, 'Residual · e/atom');
      el('line', { x1: right - 170, x2: right - 152, y1: 12, y2: 12, stroke: slate, 'stroke-width': 2 }, history);
      el('text', { x: right - 146, y: 16, fill: ink, 'font-size': 13 }, history, 'charge');
      el('line', { x1: right - 84, x2: right - 66, y1: 12, y2: 12, stroke: pink, 'stroke-width': 2 }, history);
      el('text', { x: right - 60, y: 16, fill: ink, 'font-size': 13 }, history, 'spin');
      for (const s of steps) el('line', { x1: X(s), x2: X(s), y1: bottom + 1, y2: bottom + 5, stroke: ink }, history);
      el('path', { d: path(data.history.map(r => [X(r[0]), Y(r[1])])), fill: 'none', stroke: slate, 'stroke-width': 2, 'stroke-linejoin': 'round' }, history);
      el('path', { d: path(data.history.map(r => [X(r[0]), Y(r[2])])), fill: 'none', stroke: pink, 'stroke-width': 2, 'stroke-linejoin': 'round' }, history);
      const cur = data.history[state.step - 1];
      el('line', { x1: X(state.step), x2: X(state.step), y1: top, y2: bottom, stroke: ink, 'stroke-width': 1 }, history);
      el('circle', { cx: X(state.step), cy: Y(cur[1]), r: 5, fill: slate, stroke: '#fff', 'stroke-width': 2 }, history);
      el('circle', { cx: X(state.step), cy: Y(cur[2]), r: 5, fill: pink, stroke: '#fff', 'stroke-width': 2 }, history);
      if (hover) {
        const r = data.history[hover - 1], x = X(hover);
        el('line', { x1: x, x2: x, y1: top, y2: bottom, stroke: '#9aa1ab', 'stroke-width': 1 }, history);
        const bx = x > W - 190 ? x - 178 : x + 10;
        el('rect', { x: bx, y: top, width: 168, height: 62, fill: '#fff', stroke: grid }, history);
        el('text', { x: bx + 10, y: top + 17, fill: ink, 'font-size': 13 }, history, `Evaluation ${hover}`);
        el('line', { x1: bx + 10, x2: bx + 22, y1: top + 32, y2: top + 32, stroke: slate, 'stroke-width': 2 }, history);
        el('text', { x: bx + 28, y: top + 36, fill: ink, 'font-size': 13 }, history, sci(r[1]));
        el('line', { x1: bx + 10, x2: bx + 22, y1: top + 50, y2: top + 50, stroke: pink, 'stroke-width': 2 }, history);
        el('text', { x: bx + 28, y: top + 54, fill: ink, 'font-size': 13 }, history, sci(r[2]));
      }
      history.dataset.left = left; history.dataset.right = right;
    }
    function render() {
      setPressed(channelButtons, b => b.dataset.channel === state.channel);
      setPressed(stepButtons, b => Number(b.dataset.step) === state.step);
      const ch = data.channels[state.channel];
      for (const layer of ['fe', 'al']) {
        const img = root.querySelector(`img[data-layer="${layer}"]`);
        img.src = src(state.channel, layer, state.step);
        img.alt = `${ch.label.replace(/_/g, ' ')}, ${data.layers[layer]}, evaluation ${state.step}`;
        root.querySelector(`[data-caption="${layer}"]`).textContent = data.layers[layer];
      }
      colorbar();
      const r = data.history[state.step - 1];
      readout.textContent = `Evaluation ${state.step} of 96 · charge residual ${sci(r[1])} e/atom · spin residual ${sci(r[2])} e/atom · net spin moment ${r[3].toFixed(2)} μB per cell`;
      drawHistory();
    }
    function stop() { if (timer !== null) clearInterval(timer); timer = null; play.textContent = 'Play'; play.setAttribute('aria-pressed', 'false'); }
    play.addEventListener('click', () => {
      if (timer !== null) { stop(); return; }
      play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
      if (state.step === steps[steps.length - 1]) { state.step = steps[0]; render(); }
      timer = setInterval(() => {
        const i = steps.indexOf(state.step);
        if (i >= steps.length - 1) { stop(); return; }
        state.step = steps[i + 1]; render();
      }, reduced.matches ? 2000 : 1100);
    });
    const nearest = event => {
      const left = Number(history.dataset.left), right = Number(history.dataset.right);
      return Math.max(1, Math.min(96, Math.round(1 + (pointerX(history, event) - left) / (right - left) * 95)));
    };
    history.addEventListener('pointermove', e => drawHistory(nearest(e)));
    history.addEventListener('pointerleave', () => drawHistory());
    history.addEventListener('click', e => {
      const s = nearest(e);
      stop(); state.step = steps.reduce((best, v) => Math.abs(v - s) < Math.abs(best - s) ? v : best, steps[0]); render();
    });
    history.addEventListener('keydown', e => {
      const i = steps.indexOf(state.step);
      if (e.key === 'ArrowRight' && i < steps.length - 1) state.step = steps[i + 1];
      else if (e.key === 'ArrowLeft' && i > 0) state.step = steps[i - 1];
      else return;
      e.preventDefault(); stop(); render();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    render(); preload();
  }

  /* Shrink display equations that are wider than the column (phones), instead of scrolling them. */
  function fitEquations() {
    document.querySelectorAll('.project-description .katex-display').forEach(d => {
      d.style.fontSize = '';
      const have = d.clientWidth, need = d.scrollWidth;
      if (have > 0 && need > have + 1) d.style.fontSize = `${Math.max(0.6, (have / need) * 0.98).toFixed(3)}em`;
    });
  }
  let fitTimer = null;
  window.addEventListener('load', () => { fitEquations(); if (document.fonts) document.fonts.ready.then(fitEquations); });
  window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitEquations, 150); });

  const rotate = document.getElementById('soc-rotate');
  if (rotate) initRotate(rotate);
  const explorer = document.getElementById('soc-explorer');
  if (explorer) {
    fetch(`${explorer.dataset.src}manifest.json?v=${explorer.dataset.version || ''}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => initExplorer(explorer, data))
      .catch(() => { explorer.querySelector('.socw-readout').textContent = 'The measured fields could not be loaded.'; });
  }
})();
