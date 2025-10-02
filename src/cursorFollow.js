(function () {
  const DESKTOP_QUERY = '(min-width: 1025px)';

  const TTL_MS = 1200;
  const MAX_SEGMENTS = 36;
  const MIN_DIST = 28;
  const ALT_FIRST_HORIZONTAL = true;

  const svgNS = 'http://www.w3.org/2000/svg';

  let initialized = false;

  // runtime state
  let svg = null;
  let segments = [];
  let last = null;
  let rafId = 0;
  let wantX = 0, wantY = 0;
  let altHV = ALT_FIRST_HORIZONTAL;
  let resizeRaf = 0;

  // bound handlers for add/remove
  let moveHandler = null;
  let downHandler = null;
  let resizeHandler = null;

  function distance(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.hypot(dx, dy);
  }

  function spawnSegment(x, y) {
    if (!last) { last = { x, y }; return; }
    if (distance(x, y, last.x, last.y) < MIN_DIST) return;

    let cx, cy, d;

    if (altHV) {
      cx = x; cy = last.y;
      d = 'M ' + last.x + ' ' + last.y + ' L ' + cx + ' ' + cy + ' L ' + x + ' ' + y;
    } else {
      cx = last.x; cy = y;
      d = 'M ' + last.x + ' ' + last.y + ' L ' + cx + ' ' + cy + ' L ' + x + ' ' + y;
    }
    altHV = !altHV;

    const g = document.createElementNS(svgNS, 'g');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'ct-trace');
    path.setAttribute('d', d);
    g.appendChild(path);

    const pad = document.createElementNS(svgNS, 'rect');
    pad.setAttribute('class', 'ct-pad');
    pad.setAttribute('x', String(cx - 3));
    pad.setAttribute('y', String(cy - 3));
    pad.setAttribute('width', '6');
    pad.setAttribute('height', '6');
    pad.setAttribute('transform', 'rotate(45 ' + cx + ' ' + cy + ')');
    g.appendChild(pad);

    const end = document.createElementNS(svgNS, 'circle');
    end.setAttribute('class', 'ct-pad');
    end.setAttribute('cx', String(x));
    end.setAttribute('cy', String(y));
    end.setAttribute('r', '2.5');
    g.appendChild(end);

    svg.appendChild(g);
    segments.push(g);

    while (segments.length > MAX_SEGMENTS) {
      const old = segments.shift();
      old.remove();
    }

    setTimeout(() => g.remove(), TTL_MS);

    last = { x, y };
  }

  function tick() {
    rafId = 0;
    spawnSegment(wantX, wantY);
  }

  function queue(x, y) {
    wantX = x;
    wantY = y;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function init() {
    if (initialized) return;
    initialized = true;

    svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'circuit-trail');
    svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
    svg.setAttribute('preserveAspectRatio', 'none');

    const defs = document.createElementNS(svgNS, 'defs');
    defs.innerHTML = ''
      + '<filter id="ct-glow" x="-50%" y="-50%" width="200%" height="200%">'
      + '  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b1"/>'
      + '  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b2"/>'
      + '  <feMerge>'
      + '    <feMergeNode in="b2"/>'
      + '    <feMergeNode in="b1"/>'
      + '    <feMergeNode in="SourceGraphic"/>'
      + '  </feMerge>'
      + '</filter>'
      + '<filter id="ct-pad-glow" x="-50%" y="-50%" width="200%" height="200%">'
      + '  <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="pb1"/>'
      + '  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="pb2"/>'
      + '  <feMerge>'
      + '    <feMergeNode in="pb2"/>'
      + '    <feMergeNode in="pb1"/>'
      + '    <feMergeNode in="SourceGraphic"/>'
      + '  </feMerge>'
      + '</filter>';
    svg.appendChild(defs);

    document.body.appendChild(svg);

    resizeHandler = function () {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(function () {
        resizeRaf = 0;
        if (svg) svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
      });
    };
    window.addEventListener('resize', resizeHandler);

    moveHandler = function (e) { queue(e.clientX, e.clientY); };
    downHandler = function (e) { queue(e.clientX, e.clientY); };

    window.addEventListener('pointermove', moveHandler, { passive: true });
    window.addEventListener('pointerdown', downHandler, { passive: true });

    segments = [];
    altHV = ALT_FIRST_HORIZONTAL;
    last = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
  }

  function destroy() {
    if (!initialized) return;
    initialized = false;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }

    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('pointermove', moveHandler);
    window.removeEventListener('pointerdown', downHandler);

    resizeHandler = null;
    moveHandler = null;
    downHandler = null;

    if (svg) {
      svg.remove();
      svg = null;
    }

    segments = [];
    last = null;
    wantX = 0;
    wantY = 0;
    resizeRaf = 0;
  }

  function applyMode(mql) {
    if (mql.matches) {
      init();
    } else {
      destroy();
    }
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  const mql = window.matchMedia(DESKTOP_QUERY);

  onReady(function () {
    applyMode(mql);
  });

  const mqHandler = function (e) { applyMode(e); };
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', mqHandler);
  } else if (typeof mql.addListener === 'function') {
    // Older Safari fallback
    mql.addListener(mqHandler);
  }
})();
