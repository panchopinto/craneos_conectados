
function qs(selector, base=document){ return base.querySelector(selector); }
function qsa(selector, base=document){ return [...base.querySelectorAll(selector)]; }

// Query params
function getParam(name, search=location.search){
  const p = new URLSearchParams(search);
  return p.get(name) || "";
}

// i18n
const I18N = {
  es: {
    title: "CRÁNEOS 3D — Patrimonio Natural",
    intro: "Explora modelos 3D de cráneos de fauna chilena con accesibilidad y aprendizaje inclusivo.",
    rights: "El acceso al patrimonio cultural es un derecho fundamental que permite a las personas participar de la vida cultural, fortalecer su identidad y promover la inclusión.",
    controls: "Controles",
    btn3d: "👁️ Ver en 3D",
    btnar: "📱 Ver en AR",
    btnvr: "🥽 Ver en VR",
    contrast: "Alto contraste",
    fontPlus: "A+ Texto",
    fontMinus: "A− Texto",
    lang: "ES/EN",
    credits: "Sitio educativo para uso inclusivo en aula. Autoría: Francisco Pinto & Belén Acuña."
  },
  en: {
    title: "3D SKULLS — Natural Heritage",
    intro: "Explore 3D skull models of Chilean fauna with inclusive, accessible learning tools.",
    rights: "Access to cultural heritage is a fundamental right that enables people to participate in cultural life, strengthen identity, and promote inclusion.",
    controls: "Controls",
    btn3d: "👁️ View in 3D",
    btnar: "📱 View in AR",
    btnvr: "🥽 View in VR",
    contrast: "High contrast",
    fontPlus: "A+ Text",
    fontMinus: "A− Text",
    lang: "ES/EN",
    credits: "Educational site for inclusive classroom use. By Francisco Pinto & Belén Acuña."
  }
};

let currentLang = localStorage.getItem("lang") || "es";
function applyI18n(){
  qsa("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const t = I18N[currentLang]?.[key];
    if (t) el.textContent = t;
  });
  document.documentElement.lang = currentLang;
}
function toggleLang(){
  currentLang = currentLang === "es" ? "en" : "es";
  localStorage.setItem("lang", currentLang);
  applyI18n();
}

// contrast & font size
function toggleContrast(){
  document.documentElement.classList.toggle("high-contrast");
  const on = document.documentElement.classList.contains("high-contrast");
  localStorage.setItem("contrast", on ? "1" : "0");
}
function setFontSize(delta){
  const s = getComputedStyle(document.documentElement).fontSize;
  let px = parseFloat(s);
  px = Math.min(22, Math.max(12, px + delta));
  document.documentElement.style.fontSize = px + "px";
  localStorage.setItem("fontSize", px);
}
function restorePrefs(){
  if(localStorage.getItem("contrast")==="1"){
    document.documentElement.classList.add("high-contrast");
  }
  const fs = localStorage.getItem("fontSize");
  if(fs){ document.documentElement.style.fontSize = fs+"px"; }
  currentLang = localStorage.getItem("lang") || currentLang;
  applyI18n();
}

document.addEventListener("DOMContentLoaded", restorePrefs);
