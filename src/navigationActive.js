(function () {
    // Real sections only (e.g., #home, #services, #marketing)
    const sections = Array.from(document.querySelectorAll('.stack > .slide[id]'));
    const navLinks = Array.from(document.querySelectorAll('.side-bar-nav a[href^="#"]'));
  
    // Map sectionId -> its SVG icon in the sidebar
    const iconById = new Map();
    navLinks.forEach((a, i) => {
      const id = a.getAttribute('href').slice(1);
      const svg = a.querySelector('svg.menu-icons');
      if (svg) {
        // ensure odd/even classes exist for your glow rules
        if (!svg.classList.contains('icon-odd') && !svg.classList.contains('icon-even')) {
          svg.classList.add(i % 2 === 0 ? 'icon-even' : 'icon-odd');
        }
        iconById.set(id, svg);
      }
  
      // Click: always scroll to target (up or down) and elevate the target slide
      a.addEventListener('click', (e) => {
        const targetId = a.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return; // ignore Work/Contact until they exist
        e.preventDefault();

        // Elevate target slide so it renders above any sticky later slide
        setActiveSlide(targetId);

        // Scroll to target using scrollIntoView which works better with scroll-snap
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Sync URL & icon immediately for feedback
        history.pushState(null, '', '#' + targetId);
        setActiveIcon(targetId);
      });
    });
  
    let currentSlideId = null;
  
    function setActiveIcon(id) {
      document.querySelectorAll('.menu-icons.active').forEach(el => el.classList.remove('active'));
      const svg = iconById.get(id);
      if (svg) svg.classList.add('active');
  
      navLinks.forEach(a => a.removeAttribute('aria-current'));
      const activeLink = document.querySelector('.side-bar-nav a[href="#' + id + '"]');
      if (activeLink) activeLink.setAttribute('aria-current', 'true');
    }
  
    function setActiveSlide(id) {
      if (currentSlideId === id) return;
      sections.forEach(s => s.classList.remove('is-active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('is-active');
      currentSlideId = id;
    }
  
    // IntersectionObserver: activate whichever slide crosses the viewport center
    const io = new IntersectionObserver((entries) => {
      // pick the entry with the greatest intersectionRatio
      let best = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
      if (best && best.target.id) {
        setActiveSlide(best.target.id);   // lift the slide that's in view
        setActiveIcon(best.target.id);    // light up its icon
        history.replaceState(null, '', '#' + best.target.id);
      }
    }, {
      root: null,
      rootMargin: '-50% 0px -50% 0px', // centerline
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
  
    sections.forEach(sec => io.observe(sec));
  
    // On load: sync to hash or first section
    window.addEventListener('load', () => {
      const initial = (location.hash || '').slice(1) || (sections[0] && sections[0].id);
      if (initial) {
        setActiveSlide(initial);
        setActiveIcon(initial);
      }
    });
  })();