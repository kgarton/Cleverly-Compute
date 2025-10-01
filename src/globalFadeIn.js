
(function () {
  const els = document.querySelectorAll('.reveal');

  // Optional per-element tuning:
  // data-reveal-delay="150"   (ms)
  // data-reveal-dur="600"     (ms)
  // data-reveal-repeat="true" (re-animate when leaving/entering)
  els.forEach(el => {
    const dly = el.getAttribute('data-reveal-delay');
    const dur = el.getAttribute('data-reveal-dur');
    if (dly) el.style.setProperty('--reveal-delay', dly + 'ms');
    if (dur) el.style.setProperty('--reveal-dur', dur + 'ms');
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      const repeat = el.getAttribute('data-reveal-repeat') === 'true';

      if (entry.isIntersecting) {
        // Reveal when it comes into view
        el.classList.add('is-visible');
        if (!repeat) io.unobserve(el);
      } else if (repeat) {
        // Hide again if repeating is enabled
        el.classList.remove('is-visible');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px', // start a touch before fully in view
    threshold: 0.15
  });

  // Delay observing by one frame to avoid any initial paint flash
  requestAnimationFrame(() => els.forEach(el => io.observe(el)));
})();