(function(){
    const form = document.getElementById('contact-form');
    if (!form) return;
  
    // Compute a sensible default "To:" address from the current domain
    const host = (location.hostname || '').replace(/^www\./,'').trim();
    const defaultTo = `dev@cleverly-compute.com`;
    const to = (form.dataset.to && form.dataset.to.trim()) || defaultTo;
  
    // Set the visible direct-email link
    const emailLink = document.getElementById('email-link');
    if (emailLink){
      emailLink.textContent = to;
      emailLink.href = `mailto:${to}`;
    }
  
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
  
      const data = new FormData(form);
      const name     = (data.get('name')     || '').toString().trim();
      const email    = (data.get('email')    || '').toString().trim();
      const type     = (data.get('type')     || '').toString().trim();
      const timeline = (data.get('timeline') || '').toString().trim();
      const message  = (data.get('message')  || '').toString().trim();
  
      const subject = encodeURIComponent(`New ${type} project inquiry (${timeline}) — ${name}`);
      const body = encodeURIComponent(
  `Name: ${name}
  Email: ${email}
  Project: ${type}
  Timeline: ${timeline}
  
  Message:
  ${message}`
      );
  
      // Open default mail client with prefilled draft
      const link = document.createElement('a');
      link.href = `mailto:${to}?subject=${subject}&body=${body}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      requestAnimationFrame(()=> link.remove());
    });
  })();