(function () {
    const slider   = document.getElementById('marketing-slider');
    if (!slider) return;
  
    const slides   = Array.from(slider.querySelectorAll('.marketing-slide'));
    const copyBox  = document.getElementById('slider-copy');
    if (!copyBox) return;
  
    const introEl  = copyBox.querySelector('.intro-text');
    const titleEl  = copyBox.querySelector('h3');            // <-- was h2
    const descEl   = copyBox.querySelector('.desc-text');
    const prevBtn  = slider.querySelector('.nav-prev');
    const nextBtn  = slider.querySelector('.nav-next');
  
    let idx = 0;
  
    function updateCopy(slide){
      if (!slide || !introEl || !titleEl || !descEl) return;
      copyBox.classList.add('fade-out');
      setTimeout(()=>{
        introEl.textContent = slide.dataset.intro || '';
        titleEl.textContent = slide.dataset.title || '';
        descEl.textContent  = slide.dataset.desc  || '';
        copyBox.classList.remove('fade-out');
      }, 250);
    }
  
    function show(i){
      idx = (i + slides.length) % slides.length;
      const next = (idx + 1) % slides.length;
  
      slides.forEach(s => s.className = 'marketing-slide');
      slides[idx].classList.add('marketing-slide','active');
      slides[next].classList.add('marketing-slide','next');
  
      updateCopy(slides[idx]);
    }
  
    if (prevBtn) prevBtn.addEventListener('click', ()=>show(idx-1));
    if (nextBtn) nextBtn.addEventListener('click', ()=>show(idx+1));
  
    document.addEventListener('keydown', e=>{
      if(e.key==='ArrowLeft')  show(idx-1);
      if(e.key==='ArrowRight') show(idx+1);
    });
  
    // Ensure initial copy matches the first active slide
    updateCopy(slides[idx]);
  })();
  
  /* Mobile reorder, now just move the wrapper */
  (function(){
    const slider = document.getElementById('marketing-slider');
    const track  = slider ? slider.querySelector('.slider-track') : null;
    const row    = document.getElementById('controls-row');
    if(!slider || !track || !row) return;
  
    const rowMarker = document.createComment('controls-row-original-spot');
    row.after(rowMarker);
  
    function placeElems(){
      if (window.innerWidth <= 767){
        track.after(row);
      } else {
        rowMarker.after(row);
      }
    }
    placeElems();
    window.addEventListener('resize', placeElems);
  })();
  