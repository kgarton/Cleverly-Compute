const tl = anime.timeline({
    autoplay: false,
    loop: true,
    direction: "alternate",
    loopComplete: async (i) => {
      i.pause();
      setTimeout(() => {
        i.play();
      }, 500);
    }
  });
  
  tl.add({
    targets: ".group path",
    strokeDashoffset: [0, anime.setDashoffset],
    easing: "easeInOutSine",
    stroke: ["red", "green"],
    duration: 1500,
    delay: function (el, i) {
      return i * 50;
    }
  })
  
  tl.play();

  (function () {
    var svg = document.getElementById('grey-circuit');
    if (!svg) return;

    var paths = Array.prototype.slice.call(svg.querySelectorAll('.st0'));

    // Hide strokes until we measure & set dash values (prevents a flash)
    paths.forEach(function (p) { p.style.visibility = 'hidden'; });

    // If reduced motion is requested, just show without animation
    var prefersReduced = window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Measure each path and set dash to the full length so it starts invisible
    paths.forEach(function (p) {
      try {
        var len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.style.visibility = 'visible';
        if (!prefersReduced) {
          // Add transition only after we’ve set initial dash values
          // (avoids the “disappears” issue)
          p.style.transition = 'stroke-dashoffset 1.6s ease-in-out';
        }
      } catch (e) {
        p.style.visibility = 'visible';
      }
    });

    if (prefersReduced) {
      // Just reveal immediately
      paths.forEach(function (p) { p.style.strokeDashoffset = '0'; });
      return;
    }

    // Animate once when the SVG enters the viewport
    var runAnimation = function () {
      paths.forEach(function (p, idx) {
        // Optional: slight stagger for nicer feel
        p.style.transitionDelay = (idx * 0.15) + 's';
        p.style.strokeDashoffset = '0';
      });
    };

    // If it’s already in view at load, trigger immediately
    var alreadyInView = (function () {
      var rect = svg.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var vw = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= vh &&
        rect.left <= vw
      );
    })();

    if (alreadyInView) {
      runAnimation();
      return;
    }

    // Otherwise, observe until it appears; then run once
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runAnimation();
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.35
    });

    observer.observe(svg);
  })();