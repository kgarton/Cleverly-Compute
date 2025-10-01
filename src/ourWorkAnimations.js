(function(){
    // --- Scroll in/out: toggle .play and auto play/pause any preview video ---
    const scopes = document.querySelectorAll('[data-anim-scope]');
  
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const preview = entry.target.querySelector('.case-preview');
        if (!preview) return;
  
        // find any video inside this preview
        const vids = preview.querySelectorAll('video');
  
        if (entry.isIntersecting){
          preview.classList.add('play');
  
          // start videos safely (muted + playsinline helps autoplay policies)
          vids.forEach(v=>{
            if (!v.muted) v.muted = true;              // property works even if attribute missing
            v.setAttribute('playsinline','');
            v.setAttribute('webkit-playsinline','');
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(()=>{ /* ignore autoplay block */});
          });
        } else {
          preview.classList.remove('play');
          vids.forEach(v=>{
            try { v.pause(); } catch(_) {}
          });
        }
      });
    }, { root:null, rootMargin:'0px 0px -10% 0px', threshold: 0.2 });
  
    scopes.forEach(sc => io.observe(sc));
  
    // Also pause videos when the tab is hidden (saves CPU)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') {
        document.querySelectorAll('.case-preview video').forEach(v=>{
          try { v.pause(); } catch(_) {}
        });
      }
    });
  
    // --- Lightweight 3D tilt (unchanged) ---
    const TILT_MAX = 10; // degrees
    document.querySelectorAll('[data-tilt]').forEach(card=>{
      let rAF = 0;
      function onMove(e){
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;   // 0..1
        const y = (e.clientY - rect.top)  / rect.height;  // 0..1
        const rotY = (x - 0.5) * TILT_MAX * 2;            // -..+
        const rotX = (0.5 - y) * TILT_MAX * 2;
        if (rAF) cancelAnimationFrame(rAF);
        card.classList.add('tilting');
        rAF = requestAnimationFrame(()=> {
          card.style.transform = `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
        });
      }
      function onLeave(){
        if (rAF) cancelAnimationFrame(rAF);
        card.classList.remove('tilting');
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
      }
      card.addEventListener('pointermove', onMove, { passive: true });
      card.addEventListener('pointerleave', onLeave);
    });
  })();