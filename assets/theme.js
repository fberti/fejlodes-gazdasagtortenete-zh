// Világos / sötét téma kapcsolója – a főoldal és a leckeoldalak közös szkriptje.
// A kezdő témát a <head>-ben futó szkript állítja be (villanásmentesen); ez a gomb feliratát és a váltást intézi.
(function () {
  "use strict";
  const THEME_KEY = "fegatt-theme";
  const themeBtn = document.getElementById("theme-toggle");
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    const dark = t === "dark";
    themeBtn.textContent = dark ? "☀️ Világos" : "🌙 Sötét";
    themeBtn.setAttribute("aria-label", dark ? "Váltás világos témára" : "Váltás sötét témára");
    themeBtn.title = themeBtn.getAttribute("aria-label");
  }
  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  themeBtn.onclick = () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* privát mód */ }
    applyTheme(t);
  };
  // Amíg nincs kézi választás, kövesse a rendszer beállítását.
  systemDark.addEventListener("change", e => {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (err) { /* privát mód */ }
    if (!saved) applyTheme(e.matches ? "dark" : "light");
  });
})();
