
(function(){
  const LS = window.localStorage;
  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function ensureToolbar(){
    // Remove duplicate toolbars (legacy classes/ids)
    const legacySel = ['#controls-fixed','.control-toolbar','.controls-fixed-toolbar','[data-controls-fixed]'];
    const all = $all(legacySel.join(','));
    all.slice(1).forEach(el=>el.remove()); // keep the first if already exists

    let bar = $('#controls-fixed');
    if (!bar){
      bar = document.createElement('div');
      bar.id = 'controls-fixed';
      bar.setAttribute('aria-label','🛠️ Controles');
      bar.setAttribute('data-controls-fixed','');
      bar.innerHTML = [
        '<span class="ctl-badge">🛠️ Controles:</span>',
        '<button type="button" id="ctl-contrast" title="Alto contraste">🌓</button>',
        '<button type="button" id="ctl-font-plus" title="Aumentar tamaño de fuente">A+</button>',
        '<button type="button" id="ctl-font-minus" title="Disminuir tamaño de fuente">A−</button>',
        '<button type="button" id="ctl-lang" title="ES/EN">🌐 ES/EN</button>'
      ].join('');
      document.body.appendChild(bar);
    }
    return bar;
  }

  function applyFsScale(scale){
    scale = Math.max(0.8, Math.min(1.6, scale));
    document.documentElement.style.setProperty('--fs-scale', String(scale));
    LS.setItem('fs-scale', String(scale));
  }

  function applyContrast(on){
    const key = 'prefers-hc';
    if (on){ document.documentElement.classList.add('hc'); document.body.classList.add('hc'); }
    else { document.documentElement.classList.remove('hc'); document.body.classList.remove('hc'); }
    LS.setItem(key, on ? '1' : '0');
  }

  function applyLang(lang){
    const v = (lang === 'en') ? 'en' : 'es';
    document.documentElement.setAttribute('data-lang', v);
    LS.setItem('site-lang', v);
    // Dispatch an event in case pages want to hook translations
    document.dispatchEvent(new CustomEvent('app:langChange', { detail:{ lang: v } }));
  }

  function initState(){
    const fs = parseFloat(LS.getItem('fs-scale') || '1') || 1;
    applyFsScale(fs);
    const hc = LS.getItem('prefers-hc') === '1';
    applyContrast(hc);
    const lang = LS.getItem('site-lang') || 'es';
    applyLang(lang);
  }

  function wireHandlers(bar){
    $('#ctl-font-plus', bar)?.addEventListener('click', ()=>{
      const fs = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--fs-scale') || '1') || 1;
      applyFsScale(fs + 0.1);
    });
    $('#ctl-font-minus', bar)?.addEventListener('click', ()=>{
      const fs = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue('--fs-scale') || '1') || 1;
      applyFsScale(fs - 0.1);
    });
    $('#ctl-contrast', bar)?.addEventListener('click', ()=>{
      const on = !document.documentElement.classList.contains('hc');
      applyContrast(on);
    });
    $('#ctl-lang', bar)?.addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-lang') || 'es';
      applyLang(cur === 'es' ? 'en' : 'es');
    });
  }

  function hideLegacyScatteredControls(){
    // If pages already render their own scattered controls, hide them to avoid duplicates.
    const candidates = [
      '.controls', '.ui-controls', '.header-controls', '.floating-controls',
      '#controls', '#ui-controls', '#header-controls'
    ];
    $all(candidates.join(',')).forEach(el=>{
      // Do not hide our fixed bar
      if (el.id !== 'controls-fixed') el.style.display = 'none';
    });
  }

  function boot(){
    initState();
    const bar = ensureToolbar();
    wireHandlers(bar);
    hideLegacyScatteredControls();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
