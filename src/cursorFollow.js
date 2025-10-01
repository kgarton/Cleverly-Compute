
(function () {
  const TTL_MS = 1200;           // lifetime per segment
  const MAX_SEGMENTS = 36;        // DOM cap
  const MIN_DIST = 28;            // min pixels between segments
  const ALT_FIRST_HORIZONTAL = true; // toggle HV/VH alternation start

  // Create overlay SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('id', 'circuit-trail');
  svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
  svg.setAttribute('preserveAspectRatio', 'none');
  document.body.appendChild(svg);

  // Defs: glow filters
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="ct-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b2"/>
      <feMerge>
        <feMergeNode in="b2"/>
        <feMergeNode in="b1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="ct-pad-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="pb1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="pb2"/>
      <feMerge>
        <feMergeNode in="pb2"/>
        <feMergeNode in="pb1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // Resize handler: keep viewBox in sync
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      svg.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
    });
  });

  const segments = [];
  let last = null;
  let rafId = 0;
  let wantX = 0, wantY = 0;
  let altHV = ALT_FIRST_HORIZONTAL;

  function distance(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.hypot(dx, dy);
  }

  function spawnSegment(x, y) {
    if (!last) { last = { x, y }; return; }
    if (distance(x, y, last.x, last.y) < MIN_DIST) return;

    let cx, cy; // corner point
    let d;

    if (altHV) {
      // Horizontal then vertical: bend at (x, last.y)
      cx = x; cy = last.y;
      d = `M ${last.x} ${last.y} L ${cx} ${cy} L ${x} ${y}`;
    } else {
      // Vertical then horizontal: bend at (last.x, y)
      cx = last.x; cy = y;
      d = `M ${last.x} ${last.y} L ${cx} ${cy} L ${x} ${y}`;
    }
    altHV = !altHV;

    const g = document.createElementNS(svgNS, 'g');

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', 'ct-trace');
    path.setAttribute('d', d);
    g.appendChild(path);

    // Corner pad: small diamond
    const pad = document.createElementNS(svgNS, 'rect');
    pad.setAttribute('class', 'ct-pad');
    pad.setAttribute('x', String(cx - 3));
    pad.setAttribute('y', String(cy - 3));
    pad.setAttribute('width', '6');
    pad.setAttribute('height', '6');
    pad.setAttribute('transform', `rotate(45 ${cx} ${cy})`);
    g.appendChild(pad);

    // End pad: small circle at end point
    const end = document.createElementNS(svgNS, 'circle');
    end.setAttribute('class', 'ct-pad');
    end.setAttribute('cx', String(x));
    end.setAttribute('cy', String(y));
    end.setAttribute('r', '2.5');
    g.appendChild(end);

    svg.appendChild(g);
    segments.push(g);

    // Cap DOM
    while (segments.length > MAX_SEGMENTS) {
      const old = segments.shift();
      old.remove();
    }

    // Cleanup after TTL
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

  // Pointer events
  window.addEventListener('pointermove', (e) => queue(e.clientX, e.clientY), { passive: true });
  window.addEventListener('pointerdown', (e) => queue(e.clientX, e.clientY), { passive: true });

  // Optional: start at center so first bend draws from a known origin
  last = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
})();