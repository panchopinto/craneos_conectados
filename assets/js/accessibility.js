
// === Accesibilidad y seguridad disuasiva ===
(function(){
  // Inject control bar
  const bar = document.createElement('div');
  bar.id = 'access-controls';
  bar.innerHTML = `
    <button id="btn-narrator" title="Narrador: lee la selección o contenido principal">🗣️</button>
    <button id="btn-contrast" title="Alto contraste">🌓</button>
    <button id="btn-a-plus" title="Aumentar tamaño de texto">A+</button>
    <button id="btn-a-minus" title="Disminuir tamaño de texto">A−</button>
    <span class="sep" aria-hidden="true"></span>
    <button id="btn-lang" title="Cambiar idioma ES/EN">🌐 ES/EN</button>
    <button id="btn-guide" title="Guía paso a paso (← → y ESC)">🧠 Guía</button>
    <button id="btn-cursor" title="Cursor accesible">🔍</button>
  `;
  document.documentElement.appendChild(bar);

  // Language state
  const lang = localStorage.getItem('site_lang') || 'es';
  document.documentElement.classList.toggle('lang-es', lang==='es');
  document.documentElement.classList.toggle('lang-en', lang==='en');

  // Font scale
  let scale = parseFloat(localStorage.getItem('font_scale') || '1');
  document.documentElement.style.setProperty('--font-scale', scale);

  // High contrast
  if(localStorage.getItem('high_contrast')==='1'){ document.body.classList.add('high-contrast'); }

  // Cursor accessible
  const dot = document.createElement('div'); dot.className='cursor-dot';
  const ring = document.createElement('div'); ring.className='cursor-ring';
  document.body.append(dot, ring);
  window.addEventListener('mousemove', e=>{
    dot.style.left = (e.clientX-5)+'px';
    dot.style.top  = (e.clientY-5)+'px';
    ring.style.left = e.clientX+'px';
    ring.style.top  = e.clientY+'px';
  });
  if(localStorage.getItem('cursor_xl')==='1'){ document.body.classList.add('cursor-xl'); }

  // Handlers
  document.getElementById('btn-contrast').addEventListener('click', ()=>{
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('high_contrast', document.body.classList.contains('high-contrast') ? '1':'0');
  });
  document.getElementById('btn-a-plus').addEventListener('click', ()=>{
    scale = Math.min(1.8, scale + 0.1); document.documentElement.style.setProperty('--font-scale', scale);
    localStorage.setItem('font_scale', scale.toString());
  });
  document.getElementById('btn-a-minus').addEventListener('click', ()=>{
    scale = Math.max(0.8, scale - 0.1); document.documentElement.style.setProperty('--font-scale', scale);
    localStorage.setItem('font_scale', scale.toString());
  });
  document.getElementById('btn-lang').addEventListener('click', ()=>{
    const current = document.documentElement.classList.contains('lang-es') ? 'es' : 'en';
    const next = current==='es' ? 'en' : 'es';
    document.documentElement.classList.toggle('lang-es', next==='es');
    document.documentElement.classList.toggle('lang-en', next==='en');
    localStorage.setItem('site_lang', next);
  });
  document.getElementById('btn-cursor').addEventListener('click', ()=>{
    document.body.classList.toggle('cursor-xl');
    localStorage.setItem('cursor_xl', document.body.classList.contains('cursor-xl') ? '1':'0');
  });

  // Narrador (Web Speech API)
  function speak(text){
    if(!('speechSynthesis' in window)) return alert('Narrador no disponible en este navegador.');
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const lang = document.documentElement.classList.contains('lang-en') ? 'en-US' : 'es-ES';
    u.lang = lang;
    window.speechSynthesis.speak(u);
  }
  document.getElementById('btn-narrator').addEventListener('click', ()=>{
    let txt = window.getSelection()?.toString().trim();
    if(!txt){
      const main = document.querySelector('main, article, section, .content, .container, body');
      txt = main ? main.innerText.trim() : document.body.innerText.trim();
    }
    if(txt) speak(txt.slice(0, 6000)); // límite prudente
  });

  // Seguridad disuasiva (no es protección real)
  window.addEventListener('contextmenu', e=> e.preventDefault(), {capture:true});
  window.addEventListener('keydown', (e)=>{
    const hotkeys = [
      (e.key==='F12'),
      (e.ctrlKey && e.shiftKey && (e.key.toUpperCase()==='I' || e.key.toUpperCase()==='J' || e.key.toUpperCase()==='C')),
      (e.ctrlKey && (e.key.toUpperCase()==='S' || e.key.toUpperCase()==='U'))
    ];
    if(hotkeys.some(Boolean)){ e.preventDefault(); e.stopPropagation(); }
  }, {capture:true});

  // Guía paso a paso
  const overlay = document.createElement('div'); overlay.id='guide-overlay';
  const card = document.createElement('div'); card.id='guide-card';
  const actions = document.createElement('div'); actions.id='guide-actions';
  let guideSteps = []; let idx = 0;
  function positionCard(target){
    const rect = target.getBoundingClientRect();
    const top = Math.max(20, rect.bottom + 12);
    const left = Math.max(20, rect.left);
    card.style.top = top+'px'; card.style.left = left+'px';
  }
  function renderStep(){
    guideSteps.forEach(s=> s.el.classList.remove('guide-highlight'));
    const step = guideSteps[idx];
    if(!step){ closeGuide(); return; }
    step.el.scrollIntoView({behavior:'smooth', block:'center'});
    step.el.classList.add('guide-highlight'); positionCard(step.el);
    card.innerHTML = `<h3>${step.title || 'Paso '+(idx+1)}</h3><p>${step.desc || ''}</p>`;
    card.appendChild(actions);
  }
  function closeGuide(){
    overlay.style.display='none'; card.remove(); guideSteps.forEach(s=> s.el.classList.remove('guide-highlight'));
    document.removeEventListener('keydown', keyHandler);
  }
  function keyHandler(e){
    if(e.key==='ArrowRight'){ idx = Math.min(guideSteps.length-1, idx+1); renderStep(); }
    else if(e.key==='ArrowLeft'){ idx = Math.max(0, idx-1); renderStep(); }
    else if(e.key==='Escape'){ closeGuide(); }
  }
  actions.innerHTML = '';
  const btnPrev = document.createElement('button'); btnPrev.textContent='← Anterior';
  const btnNext = document.createElement('button'); btnNext.textContent='Siguiente →'; btnNext.className='primary';
  const btnExit = document.createElement('button'); btnExit.textContent='Salir (ESC)';
  actions.append(btnPrev, btnNext, btnExit);
  btnPrev.onclick = ()=>{ idx = Math.max(0, idx-1); renderStep(); };
  btnNext.onclick = ()=>{ idx = Math.min(guideSteps.length-1, idx+1); renderStep(); };
  btnExit.onclick = closeGuide;
  document.body.append(overlay, card); overlay.addEventListener('click', closeGuide);

  document.getElementById('btn-guide').addEventListener('click', ()=>{
    // recogemos posibles pasos marcados con data-guide="title|desc"
    guideSteps = Array.from(document.querySelectorAll('[data-guide]')).map((el,i)=>{
      const raw = el.getAttribute('data-guide')||'';
      const [title, desc] = raw.split('|');
      return { el, title: title||('Paso '+(i+1)), desc: desc||'' };
    });
    // fallback: usa tarjetas/sections si no hay data-guide
    if(guideSteps.length===0){
      guideSteps = Array.from(document.querySelectorAll('article.card, section, .card, .step')).slice(0,8)
        .map((el,i)=>({ el, title:'Paso '+(i+1), desc: el.querySelector('h1,h2,h3')?.innerText||'' }));
    }
    idx = 0; overlay.style.display='block'; document.addEventListener('keydown', keyHandler); renderStep();
  });

  // Service Worker (para funcionar offline en HTTPS)
  if('serviceWorker' in navigator){
    const swPath = (document.currentScript && document.currentScript.src && document.currentScript.src.includes('/assets/js/')) ? '../../sw.js' : 'sw.js';
    navigator.serviceWorker.register(swPath).catch(()=>{});
  }
})();
