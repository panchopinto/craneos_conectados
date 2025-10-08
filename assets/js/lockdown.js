
/*! Lockdown deterrence v1 */
(function(){
  const H = document.documentElement;
  H.classList.add('lockdown');

  // Watermark overlays
  const wm = document.createElement('div'); wm.className = 'watermark-overlay'; document.body.appendChild(wm);
  const wmt = document.createElement('div'); wmt.className = 'watermark-text';
  try {
    const u = (localStorage.getItem('ownerTag') || 'Cráneos Conectados');
    const t = u + ' • ' + new Date().toISOString().slice(0,10);
    wmt.textContent = t;
  } catch(e){ wmt.textContent = 'Cráneos Conectados'; }
  document.body.appendChild(wmt);

  // Block context menu & drag & selection
  ['contextmenu','dragstart','selectstart','copy','cut'].forEach(evt => {
    document.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }, {capture:true});
  });

  // Block key combos
  const blocked = new Set(['KeyI','KeyJ','KeyU','KeyS','KeyP','KeyC']);
  document.addEventListener('keydown', e => {
    if (e.key === 'F12') { e.preventDefault(); e.stopImmediatePropagation(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && blocked.has(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); return false; }
    if ((e.ctrlKey || e.metaKey) && blocked.has(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); return false; }
  }, {capture:true});

  // DevTools detection (viewport delta / timer trap)
  function devtoolsOpen(){
    const threshold = 160;
    const dw = Math.abs(window.outerWidth - window.innerWidth) > threshold;
    const dh = Math.abs(window.outerHeight - window.innerHeight) > threshold;
    return dw || dh;
  }
  let suspected = false;
  function reactToDevtools(open){
    if (open && !suspected){
      suspected = true;
      document.body.style.filter = 'blur(4px)';
      console.warn('DevTools detectado — contenido difuminado.');
      setTimeout(()=>{ document.body.style.filter=''; suspected=false; }, 2200);
    }
  }
  setInterval(()=>reactToDevtools(devtoolsOpen()), 800);

  // Anti-debugger (mild)
  (function anti(){ 
    const s = Date.now(); debugger; 
    if (Date.now() - s > 50) { reactToDevtools(true); }
    setTimeout(anti, 1500);
  })();

  // Protect media
  document.querySelectorAll('img,canvas,video,model-viewer').forEach(el => {
    el.setAttribute('draggable','false');
  });

  // Nota: protección absoluta no es posible en el cliente (web pública).
})();
