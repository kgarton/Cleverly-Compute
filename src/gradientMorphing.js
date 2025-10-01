
  (function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const root = document.documentElement;

    // clamp helper
    const clamp01 = (v) => v < 0 ? 0 : (v > 1 ? 1 : v);

    // write helper (use !important so no stylesheet can override)
    function setVar(name, value){
      root.style.setProperty(name, value, 'important');
    }

    // Initial (sticky) state
    let last = { mx: 0.5, my: 0.5 };
    apply(last.mx, last.my);

    function apply(mx, my){
      const swing = 6;
      const base = { c1x:12, c1y:28, c2x:88, c2y:70, c3x:72, c3y:6, c4x:10, c4y:88 };

      setVar('--c1x', (base.c1x - swing*mx) + '%');
      setVar('--c1y', (base.c1y - swing*my) + '%');

      setVar('--c2x', (base.c2x + swing*(1-mx)) + '%');
      setVar('--c2y', (base.c2y + swing*my) + '%');

      setVar('--c3x', (base.c3x + swing*(mx - 0.5)) + '%');
      setVar('--c3y', (base.c3y + swing*(my - 0.5)) + '%');

      setVar('--c4x', (base.c4x - swing*(mx - 0.5)) + '%');
      setVar('--c4y', (base.c4y + swing*(my - 0.5)) + '%');

      const hue = (mx - 0.5) * 24 + (my - 0.5) * -12;
      setVar('--hue', hue + 'deg');
    }

    function updateFromPointer(clientX, clientY){
      const rect = hero.getBoundingClientRect();
      const mx = clamp01((clientX - rect.left) / rect.width);
      const my = clamp01((clientY - rect.top) / rect.height);
      last.mx = mx; last.my = my;
      apply(mx, my);
    }

    // Track globally so DOM changes inside .hero never “drop” the pointer
    window.addEventListener('pointermove', (e) => {
      updateFromPointer(e.clientX, e.clientY);
    }, { passive: true });

    // Keep state across resizes/scroll and DOM mutations:
    function reapplyFromLast(){
      const rect = hero.getBoundingClientRect();
      const x = rect.left + rect.width  * last.mx;
      const y = rect.top  + rect.height * last.my;
      updateFromPointer(x, y);
    }

    window.addEventListener('resize', reapplyFromLast);
    window.addEventListener('scroll', reapplyFromLast, { passive: true });

    // If children get toggled (display/opacity/etc), re-apply next frame
    const mo = new MutationObserver(() => requestAnimationFrame(reapplyFromLast));
    mo.observe(hero, { childList: true, subtree: true, attributes: true });

  })();

