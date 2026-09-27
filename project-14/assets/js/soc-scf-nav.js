/* SOC-SCF article navigation: collapsible sections. Progressive enhancement: without JavaScript
   every section is simply open. Sections start open; links into a closed section open it. */
(function() {
  'use strict';
  const body = document.querySelector('.soc-scf-trajectories .project-description');
  if (!body) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const NS = 'http://www.w3.org/2000/svg';
  const sections = [];

  function chevron() {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16'); svg.setAttribute('aria-hidden', 'true'); svg.classList.add('soc-chevron');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M4 6l4 4 4-4'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.6');
    svg.appendChild(p);
    return svg;
  }

  /* Wrap everything between one ### heading and the next in a collapsible body. */
  [...body.children].filter(el => el.tagName === 'H3').forEach((head, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'soc-section-body';
    wrap.id = `${head.id || `section-${i}`}-body`;
    let node = head.nextSibling;
    while (node && !(node.nodeType === 1 && node.tagName === 'H3')) {
      const next = node.nextSibling;
      wrap.appendChild(node);
      node = next;
    }
    head.after(wrap);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'soc-section-toggle';
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-controls', wrap.id);
    const label = document.createElement('span');
    while (head.firstChild) label.appendChild(head.firstChild);
    btn.append(label, chevron());
    head.appendChild(btn);
    head.classList.add('soc-collapsible');
    const section = { head, body: wrap, btn, open: true };
    btn.addEventListener('click', () => setOpen(section, !section.open));
    sections.push(section);
  });

  function setOpen(s, open, immediate) {
    if (s.open === open) return;
    s.open = open;
    s.btn.setAttribute('aria-expanded', String(open));
    s.head.classList.toggle('is-collapsed', !open);
    const el = s.body;
    if (immediate || reduced.matches) {
      el.hidden = !open; el.style.height = ''; el.classList.remove('is-animating');
      if (open) opened();
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      el.classList.remove('is-animating'); el.style.height = '';
      if (s.open) opened(); else el.hidden = true;
    };
    el.classList.add('is-animating');
    if (open) {
      el.hidden = false;
      const h = el.scrollHeight;
      el.style.height = '0px'; void el.offsetHeight; el.style.height = `${h}px`;
    } else {
      el.style.height = `${el.scrollHeight}px`; void el.offsetHeight; el.style.height = '0px';
    }
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 600);
  }
  // Content that measures itself (equations fitted to width, widgets) listens for this.
  function opened() { document.dispatchEvent(new CustomEvent('soc:section-open')); }

  function owner(el) { return sections.find(s => s.body.contains(el)); }
  function reveal(id) {
    const target = id && document.getElementById(id);
    if (!target) return null;
    const s = owner(target);
    if (s && !s.open) setOpen(s, true, true);
    return target;
  }
  // Open a closed section before the browser follows an in-page link into it.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a) reveal(decodeURIComponent(a.getAttribute('href').slice(1)));
  });
  window.addEventListener('hashchange', () => {
    const t = reveal(decodeURIComponent(location.hash.slice(1)));
    if (t) t.scrollIntoView();
  });
  if (location.hash) {
    const t = reveal(decodeURIComponent(location.hash.slice(1)));
    if (t) requestAnimationFrame(() => t.scrollIntoView());
  }
})();
