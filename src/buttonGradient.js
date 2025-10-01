(function () {
  const BUTTON_SELECTOR = '.mouse-follow-btn';
  const INSTANT_CLASS   = 'mouse-follow-btn--instant';
  const DEFAULT_DELAY   = 8000;   // ms
  const DEFAULT_STAGGER = 500;    // ms, added per index if no explicit data-delay
  const DEFAULT_DISPLAY = 'flex';
  const FADE_MS         = 1000;

  const buttons = Array.from(document.querySelectorAll(BUTTON_SELECTOR));
  const rafMap  = new WeakMap(); // per-element rAF id

  // Track the last known pointer position so we can seed the glow
  let lastPointer = null;
  window.addEventListener('pointermove', (e) => {
    lastPointer = { clientX: e.clientX, clientY: e.clientY };
  }, { passive: true });

  // ---- Fade utilities ----
  function fadeIn(el, duration = 400, display = 'block') {
    el.style.opacity = 0;
    el.style.display = display;
    el.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => { el.style.opacity = 1; });
    function done(e) {
      if (e.propertyName === 'opacity') {
        el.style.transition = '';
        el.removeEventListener('transitionend', done);
      }
    }
    el.addEventListener('transitionend', done);
  }

  function fadeOut(el, duration = 400) {
    el.style.opacity = 1;
    el.style.transition = `opacity ${duration}ms ease`;
    requestAnimationFrame(() => { el.style.opacity = 0; });
    function hide(e) {
      if (e.propertyName === 'opacity') {
        el.style.display = 'none';
        el.style.transition = '';
        el.removeEventListener('transitionend', hide);
      }
    }
    el.addEventListener('transitionend', hide);
  }

  // ---- Mouse-follow glow ----
  function setPos(el, eLike) {
    const rect = el.getBoundingClientRect();
    const x = ((eLike.clientX - rect.left) / rect.width) * 100;
    const y = ((eLike.clientY - rect.top)  / rect.height) * 100;
    el.style.setProperty('--mx', x + '%');
    el.style.setProperty('--my', y + '%');
  }

  function onMove(el, e) {
    const prev = rafMap.get(el);
    if (prev) cancelAnimationFrame(prev);
    const id = requestAnimationFrame(() => setPos(el, e));
    rafMap.set(el, id);
  }

  function onLeave(el) {
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
    const prev = rafMap.get(el);
    if (prev) cancelAnimationFrame(prev);
  }

  function onDown(el, e) {
    onMove(el, e); // center under finger immediately on tap
  }

  // Seed the glow immediately after showing, if pointer is already over the element
  function primeMouseFollow(el) {
    if (!lastPointer) return;
    const r = el.getBoundingClientRect();
    const { clientX, clientY } = lastPointer;
    const inside = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    if (inside) setPos(el, lastPointer);
  }

  // ---- Init all buttons ----
  buttons.forEach((btn, i) => {
    // start hidden
    btn.style.display = 'none';
    btn.style.opacity = 0;
    // default glow center
    btn.style.setProperty('--mx', '50%');
    btn.style.setProperty('--my', '50%');

    // Determine instant vs delayed
    const hasInstantFlag =
      btn.classList.contains(INSTANT_CLASS) ||
      btn.hasAttribute('data-instant') ||
      (btn.dataset.delay && (
        btn.dataset.delay === '0' ||
        btn.dataset.delay.toLowerCase?.() === 'now' ||
        btn.dataset.delay.toLowerCase?.() === 'immediate'
      ));

    let delay;
    if (hasInstantFlag) {
      delay = 0;
    } else if (btn.dataset.delay !== undefined) {
      const parsed = parseInt(btn.dataset.delay, 10);
      delay = Number.isNaN(parsed) ? 0 : parsed;
    } else {
      delay = DEFAULT_DELAY + i * DEFAULT_STAGGER;
    }

    const display = btn.dataset.display || DEFAULT_DISPLAY;

    const show = () => {
      fadeIn(btn, FADE_MS, display);
      // seed position on next frame so layout is current
      requestAnimationFrame(() => primeMouseFollow(btn));
    };

    if (delay <= 0) {
      show();
    } else {
      setTimeout(show, delay);
    }

    // events
    const moveHandler  = (e) => onMove(btn, e);
    const leaveHandler = () => onLeave(btn);
    const enterHandler = (e) => onMove(btn, e);
    const downHandler  = (e) => onDown(btn, e);

    btn.addEventListener('pointerenter', enterHandler);
    btn.addEventListener('pointermove',  moveHandler);
    btn.addEventListener('pointerleave', leaveHandler);
    btn.addEventListener('pointerdown',  downHandler);
  });

  // Optional export
  window.mouseFollowBtn = { fadeIn, fadeOut };
})();