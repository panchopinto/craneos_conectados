/*! CraneosControls v1.0 — fixed top-right accessibility controls
 *  Features: High-contrast, font size A+/A−, language ES/EN toggle with custom event.
 *  Persists in localStorage across the whole site.
 */
(function(){
  const STORE_KEY = 'cc.settings';
  const html = document.documentElement;
  const body = document.body;

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function writeStore(obj) {
    localStorage.setItem(STORE_KEY, JSON.stringify(obj));
  }

  const S = Object.assign({ contrast:false, font:"md", lang:"ES" }, readStore());

  // Apply on load
  applyContrast(S.contrast);
  applyFont(S.font);
  applyLang(S.lang, {silent:true});

  function applyContrast(on){
    body.classList.toggle('cc-contrast', !!on);
    setAttr('btn-contrast','data-active', !!on);
  }
  function applyFont(sz){
    html.classList.remove('cc-font-sm','cc-font-md','cc-font-lg','cc-font-xl');
    const map = {sm:'cc-font-sm', md:'cc-font-md', lg:'cc-font-lg', xl:'cc-font-xl'};
    html.classList.add(map[sz] || 'cc-font-md');
    setText('btn-a-plus', 'A+');
    setText('btn-a-minus', 'A−');
  }
  function applyLang(lang, {silent}={}){
    setText('btn-lang', (lang || 'ES') + '/EN');
    if(!silent){
      // Dispatch custom event so pages can react (swap i18n, reload, etc.).
      const ev = new CustomEvent('cc:lang-changed', { detail: { lang } });
      window.dispatchEvent(ev);
    }
  }
  function clampFontStep(step){
    const order = ['sm','md','lg','xl'];
    let i = order.indexOf(S.font);
    i = Math.min(order.length-1, Math.max(0, i + step));
    return order[i];
  }
  function setAttr(id, key, val){
    const el = document.getElementById(id);
    if (el) el.setAttribute(key, String(val));
  }
  function setText(id, txt){
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function el(tag, attrs={}, children=[]) {
    const e = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k==='class') e.className = v;
      else if (k==='style') e.style.cssText = v;
      else e.setAttribute(k,v);
    }
    for (const c of children) {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else e.appendChild(c);
    }
    return e;
  }

  // Build controls UI
  const wrap = el('div', { class:'cc-fixed-wrap', role:'group', 'aria-label':'Controles de accesibilidad' }, [
    el('span', { class:'cc-label', id:'cc-label' }, ['🛠️ ', 'Controles:']),
    (function(){
      // "Inicio" button (🏠) — works from any subpage of the GitHub Pages repo
      const base = (function(){
        const parts = location.pathname.split('/').filter(Boolean);
        return parts.length ? ('/' + parts[0] + '/') : '/';
      })();
      const a = el('a', { id:'btn-home', class:'cc-btn', href: base, title:'Inicio' }, ['🏠 ', 'Inicio']);
      return a;
    })(),

    (function(){
      const b = el('button', { id:'btn-contrast', class:'cc-btn', 'aria-pressed': String(!!S.contrast), 'data-active': String(!!S.contrast), title:'Alto contraste' }, ['🌓 ', 'Alto contraste']);
      b.addEventListener('click', () => {
        S.contrast = !S.contrast;
        b.setAttribute('aria-pressed', String(!!S.contrast));
        b.setAttribute('data-active', String(!!S.contrast));
        applyContrast(S.contrast);
        writeStore(S);
      });
      return b;
    })(),
    (function(){
      const b = el('button', { id:'btn-a-plus', class:'cc-btn', title:'Aumentar tamaño de fuente' }, ['A+']);
      b.addEventListener('click', () => {
        S.font = clampFontStep(+1);
        applyFont(S.font);
        writeStore(S);
      });
      return b;
    })(),
    (function(){
      const b = el('button', { id:'btn-a-minus', class:'cc-btn', title:'Disminuir tamaño de fuente' }, ['A−']);
      b.addEventListener('click', () => {
        S.font = clampFontStep(-1);
        applyFont(S.font);
        writeStore(S);
      });
      return b;
    })(),
    (function(){
      const b = el('button', { id:'btn-lang', class:'cc-btn', title:'Cambiar ES/EN' }, [ (S.lang || 'ES') + '/EN' ]);
      b.addEventListener('click', () => {
        S.lang = (S.lang || 'ES').toUpperCase() === 'ES' ? 'EN' : 'ES';
        applyLang(S.lang);
        writeStore(S);
      });
      return b;
    })()
  ]);

  // Inject into DOM (top-right)
  window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(wrap);
  });

  // Expose a small API (optional)
  window.CraneosControls = {
    setContrast(v){ S.contrast = !!v; applyContrast(S.contrast); writeStore(S); },
    setFont(v){ S.font = v; applyFont(S.font); writeStore(S); },
    setLang(v){ S.lang = v; applyLang(S.lang); writeStore(S); },
    get settings(){ return {...S}; }
  };
})();