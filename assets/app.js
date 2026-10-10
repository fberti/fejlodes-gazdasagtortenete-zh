(function () {
  "use strict";

  const TOPICS = window.TOPICS;
  const LETTERS = ["a", "b", "c", "d"];
  const ZH_MINUTES = 30;
  const PASS_MIN = 5;
  const GRADES = [
    { min: 27, name: "jeles (5)" },
    { min: 23, name: "jó (4)" },
    { min: 19, name: "közepes (3)" },
    { min: 15, name: "elégséges (2)" }
  ];
  // A mintazh eredeti betűjelei (1–15): hányadik opció volt a helyes.
  const MINTA_KEY = "cadbbdacdabcdba";

  // ── Kérdések előkészítése ──
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  const QUESTIONS = window.QUESTIONS.map(q => Object.assign({ id: q.t + "-" + hash(q.q) }, q));
  const BY_ID = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
  const topicOf = id => TOPICS.find(t => t.id === id);

  // ── Tárolás ──
  const KEY = "fegatt-zh-gyakorlo:v1";
  function load() {
    try { return Object.assign({ stats: {}, wrong: [] }, JSON.parse(localStorage.getItem(KEY))); }
    catch (e) { return { stats: {}, wrong: [] }; }
  }
  let store = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* privát mód */ }
    updateBadge();
  }
  function record(q, ok) {
    const s = store.stats[q.id] || { seen: 0, correct: 0 };
    s.seen++; if (ok) s.correct++; s.last = ok;
    store.stats[q.id] = s;
    const i = store.wrong.indexOf(q.id);
    if (ok && i >= 0) store.wrong.splice(i, 1);
    if (!ok && i < 0) store.wrong.push(q.id);
  }
  function updateBadge() {
    const n = store.wrong.filter(id => BY_ID[id]).length;
    document.getElementById("wrong-count").textContent = n ? n : "";
  }

  // ── Segédek ──
  const app = document.getElementById("app");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Egy kérdés egy konkrét kirakása: opciók sorrendje + a helyes index.
  function deal(q, fixedOrder) {
    let opts;
    if (fixedOrder && q.minta) {
      const pos = LETTERS.indexOf(MINTA_KEY[q.minta - 1]);
      opts = q.w.slice();
      opts.splice(pos, 0, q.a);
    } else {
      opts = shuffle([q.a].concat(q.w));
    }
    return { q, opts, answer: opts.indexOf(q.a), chosen: null };
  }
  function metaHtml(q) {
    const t = topicOf(q.t);
    return `<div class="q-meta"><span>${esc(t.title)}</span>${q.minta ? `<span>mintazh ${q.minta}.</span>` : ""}</div>`;
  }
  function optionsHtml(item, num) {
    return `<ul class="options">${item.opts.map((o, i) => `
      <li><button type="button" class="option" data-q="${num}" data-i="${i}">
        <span class="letter">${LETTERS[i]}.</span><span>${esc(o)}</span></button></li>`).join("")}</ul>`;
  }
  function explainHtml(item) {
    const ok = item.chosen === item.answer;
    const verdict = item.chosen === null ? "Nem válaszoltál."
      : ok ? "Helyes!" : `Nem jó – a helyes válasz: ${LETTERS[item.answer]}.`;
    return `<div class="explain ${ok ? "ok" : "bad"}">
      <div class="verdict">${verdict}</div>
      <div>${esc(item.q.ex)}</div>
      <div class="src">Diasor: ${esc(item.q.dia)}. dia körül</div></div>`;
  }
  function markOptions(container, item) {
    container.querySelectorAll(".option").forEach((b, i) => {
      b.disabled = true;
      b.classList.remove("selected");
      if (i === item.answer) b.classList.add("correct");
      else if (i === item.chosen) b.classList.add("wrong");
    });
  }
  function setActiveNav(route) {
    document.querySelectorAll(".site-header nav a").forEach(a => {
      const r = a.getAttribute("href").slice(2);
      a.classList.toggle("active", route === r || (r === "temak" && route.startsWith("tema")));
    });
  }

  let cleanup = null; // aktuális nézet takarítója (időzítő, billentyűfigyelő)

  // ── Nézetek ──
  function viewHome() {
    const seen = QUESTIONS.filter(q => store.stats[q.id]).length;
    app.innerHTML = `
      <h1>Gyakorló feladatsor a zárthelyihez</h1>
      <p class="lead">${QUESTIONS.length} feleletválasztós kérdés a teljes diasor anyagából, a mintazárthelyi stílusában:
        „Miért…?”, „Hogyan…?” típusú, mechanizmusokra kérdező feladatok, négy válaszlehetőséggel.</p>
      <div class="cards">
        <div class="card"><h3>📝 Gyakorló ZH</h3>
          <p>15 kérdés, témakörönként egy – mint az igazi ZH-n. 30 perces időzítő, beadás után kiértékelés.</p>
          <a class="btn" href="#/zh">Indítás</a></div>
        <div class="card"><h3>📚 Témakörök szerint</h3>
          <p>Egyesével, azonnali visszajelzéssel, tippel és magyarázattal. ${TOPICS.length} témakör.</p>
          <a class="btn" href="#/temak">Témák</a></div>
        <div class="card"><h3>📄 Az eredeti mintazh</h3>
          <p>A kiadott mintazárthelyi 15 kérdése, eredeti sorrendben és betűjelekkel.</p>
          <a class="btn" href="#/minta">Megnyitás</a></div>
        <div class="card"><h3>🔁 Hibáim</h3>
          <p>Azok a kérdések, amiket legutóbb elrontottál. Ha jól válaszolsz, kikerülnek a listából.</p>
          <a class="btn" href="#/hibak">Gyakorlás</a></div>
      </div>
      <div class="box tip"><strong>Hogyan működik a ZH?</strong>
        15 kérdés, kérdésenként 4 válaszlehetőség, ebből egy helyes; minden helyes válasz 1 pont, 30 perc.
        Az aláíráshoz legalább ${PASS_MIN} pont kell. A félév végi jegy a ZH (max. 15) és az esszé (max. 15) összegéből adódik:
        15–18 elégséges, 19–22 közepes, 23–26 jó, 27–30 jeles.</div>
      <div class="box tip"><strong>Tanulási tipp a diasor alapján.</strong>
        A pontos számadatokat nem kell megtanulni – a kulcsfogalmakra ([D]), az ok-okozati mechanizmusokra ([M])
        és a történeti példák összefüggéseire ([E]) koncentrálj. A rossz válaszok gyakran túlzó, abszolút állítások
        („kizárólag”, „mindig”, „automatikusan”, „teljesen megszünteti”) – de ne erre a mintázatra hagyatkozz, hanem a mechanizmusra.</div>
      <p class="t-meta">Eddig ${seen} / ${QUESTIONS.length} kérdést láttál.
        ${seen ? `<button type="button" class="btn secondary" id="reset">Statisztika törlése</button>` : ""}</p>`;
    const reset = document.getElementById("reset");
    if (reset) reset.onclick = () => {
      if (confirm("Biztosan törlöd az összes eredményt és a hibalistát?")) { store = { stats: {}, wrong: [] }; save(); viewHome(); }
    };
  }

  function pickZh(includeMinta) {
    return TOPICS.map(t => {
      let pool = QUESTIONS.filter(q => q.t === t.id && (includeMinta || !q.minta));
      // Előnyben a még nem látott vagy elrontott kérdések.
      const fresh = pool.filter(q => !store.stats[q.id] || store.stats[q.id].last === false);
      if (fresh.length) pool = fresh;
      return pool[Math.floor(Math.random() * pool.length)];
    });
  }

  function viewExam(items, opts) {
    const minta = opts.minta;
    let submitted = false;
    let remaining = ZH_MINUTES * 60;

    app.innerHTML = `
      <div class="zh-head">
        <div>
          <h1>${minta ? "Az eredeti mintazárthelyi" : "Gyakorló ZH"}</h1>
          <p class="lead">Válaszd ki azt a lehetőséget, amit leginkább helyesnek érzel. Minden helyes találat egy pontot ér.</p>
        </div>
        <table aria-label="Ponthatárok (ZH + vizsga)"><tbody>
          <tr><td colspan="2"><b>Ponthatárok (ZH + vizsga)</b></td></tr>
          <tr><td>jeles</td><td>27–30</td></tr><tr><td>jó</td><td>23–26</td></tr>
          <tr><td>közepes</td><td>19–22</td></tr><tr><td>elégséges</td><td>15–18</td></tr>
          <tr><td>elégtelen</td><td>0–14</td></tr></tbody></table>
      </div>
      <div class="sticky-bar">
        <span>Megválaszolva: <b id="answered">0</b> / ${items.length}</span>
        <span class="timer" id="timer" title="Hátralévő idő">${ZH_MINUTES}:00</span>
        <button type="button" class="btn" id="submit">Beadás</button>
      </div>
      <div id="result"></div>
      <div id="questions">${items.map((it, n) => `
        <section class="question" id="q${n}">
          ${metaHtml(it.q)}
          <p class="q-text"><span class="num">${n + 1}.</span>${esc(it.q.q)}</p>
          ${optionsHtml(it, n)}
          <div class="after"></div>
        </section>`).join("")}</div>
      <h2>Helyes válaszok</h2>
      <div class="answer-sheet" id="sheet"></div>
      <div class="toolbar">
        <button type="button" class="btn" id="submit2">Beadás</button>
        ${minta ? "" : `<a class="btn secondary" href="#/zh">Új feladatsor</a>`}
        <button type="button" class="btn secondary" id="print">Nyomtatás</button>
        ${minta ? "" : `<label><input type="checkbox" id="incl" ${opts.includeMinta ? "checked" : ""}> mintazh-kérdések is szerepelhetnek</label>`}
      </div>`;

    const sheet = document.getElementById("sheet");
    function renderSheet() {
      sheet.innerHTML = items.map((it, n) => {
        const cls = !submitted ? "" : it.chosen === it.answer ? "ok" : "bad";
        const val = it.chosen === null ? "" : LETTERS[it.chosen];
        const fix = submitted && it.chosen !== it.answer ? ` → ${LETTERS[it.answer]}` : "";
        return `<div class="${cls}">${n + 1}.<b>${val}${fix}</b></div>`;
      }).join("");
      document.getElementById("answered").textContent = items.filter(it => it.chosen !== null).length;
    }
    renderSheet();

    document.getElementById("questions").addEventListener("click", e => {
      const b = e.target.closest(".option");
      if (!b || submitted) return;
      const it = items[+b.dataset.q];
      it.chosen = +b.dataset.i;
      b.closest(".options").querySelectorAll(".option").forEach((x, i) => x.classList.toggle("selected", i === it.chosen));
      renderSheet();
    });

    function submit(auto) {
      if (submitted) return;
      const open = items.filter(it => it.chosen === null).length;
      if (!auto && open && !confirm(`${open} kérdés megválaszolatlan. Biztosan beadod?`)) return;
      submitted = true;
      clearInterval(timer);
      let score = 0;
      items.forEach((it, n) => {
        const ok = it.chosen === it.answer;
        if (ok) score++;
        record(it.q, ok);
        const sec = document.getElementById("q" + n);
        markOptions(sec, it);
        sec.querySelector(".after").innerHTML = explainHtml(it);
      });
      save();
      renderSheet();
      ["submit", "submit2"].forEach(id => { document.getElementById(id).disabled = true; });
      showResult(score, auto);
    }

    function showResult(score, auto) {
      const pass = score >= PASS_MIN;
      const rows = GRADES.slice().reverse().map(g => {
        const need = Math.max(0, g.min - score);
        return `<tr><td>${g.name}</td><td>${need > 15 ? "nem érhető el" : need + " pont"}</td></tr>`;
      }).join("");
      const res = document.getElementById("result");
      res.innerHTML = `
        <div class="score ${pass ? "pass" : "fail"}">
          ${auto ? "<p><b>Lejárt az idő – a dolgozatot automatikusan beadtuk.</b></p>" : ""}
          <div class="big">${score} / ${items.length} pont</div>
          <p>${pass ? `✅ Megvan a minimum (${PASS_MIN} pont) – az aláírás teljesülne.`
                    : `❌ Az aláíráshoz legalább ${PASS_MIN} pont kell.`}</p>
          <p>Ennyi esszépont kellene a jegyekhez (az esszé max. 15 pont):</p>
          <table><tbody>${rows}</tbody></table>
          <div class="toolbar">
            ${minta ? "" : `<a class="btn" href="#/zh">Új gyakorló ZH</a>`}
            ${store.wrong.length ? `<a class="btn secondary" href="#/hibak">Hibás kérdések gyakorlása</a>` : ""}
          </div>
        </div>`;
      res.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    document.getElementById("submit").onclick = () => submit(false);
    document.getElementById("submit2").onclick = () => submit(false);
    document.getElementById("print").onclick = () => window.print();
    const incl = document.getElementById("incl");
    if (incl) incl.onchange = () => { localStorage.setItem(KEY + ":incl", incl.checked ? "1" : ""); route(true); };

    const timerEl = document.getElementById("timer");
    const timer = setInterval(() => {
      remaining--;
      const m = Math.floor(remaining / 60), s = remaining % 60;
      timerEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
      timerEl.classList.toggle("low", remaining <= 300);
      if (remaining <= 0) submit(true);
    }, 1000);
    cleanup = () => clearInterval(timer);
  }

  function viewTopics() {
    const rows = TOPICS.map((t, i) => {
      const qs = QUESTIONS.filter(q => q.t === t.id);
      const known = qs.filter(q => store.stats[q.id] && store.stats[q.id].last).length;
      return `<li>
        <div><div class="t-title">${i + 1}. ${esc(t.title)}</div>
          <div class="t-meta">${qs.length} kérdés · diák: ${esc(t.dia)} · legutóbb jó: ${known}</div>
          <div class="progress"><i style="width:${Math.round(100 * known / qs.length)}%"></i></div></div>
        <a class="btn" href="#/tema/${t.id}">Gyakorlás</a></li>`;
    }).join("");
    app.innerHTML = `
      <h1>Gyakorlás témakörönként</h1>
      <p class="lead">A témakörök a diasor fejezeteit követik; a gyakorló ZH mindegyikből egy kérdést húz.
        A zöld sáv azt mutatja, hány kérdésre válaszoltál legutóbb jól.</p>
      <div class="toolbar"><a class="btn" href="#/tema/mind">Az összes kérdés vegyesen (${QUESTIONS.length})</a></div>
      <ul class="topic-list">${rows}</ul>`;
  }

  function viewPractice(title, questions, backHref) {
    if (!questions.length) {
      app.innerHTML = `<h1>${esc(title)}</h1><p class="lead">Nincs itt gyakorolnivaló – minden kérdésre jól válaszoltál legutóbb. 🎉</p>
        <a class="btn" href="#/temak">Vissza a témakörökhöz</a>`;
      return;
    }
    const deck = shuffle(questions).map(q => deal(q));
    let pos = 0, good = 0, answered = false;

    function render() {
      if (pos >= deck.length) {
        app.innerHTML = `<h1>${esc(title)}</h1>
          <div class="score ${good / deck.length >= 0.6 ? "pass" : "fail"}">
            <div class="big">${good} / ${deck.length}</div><p>helyes válasz ebben a körben.</p>
            <div class="toolbar">
              <button type="button" class="btn" id="restart">Újra</button>
              ${store.wrong.length ? `<a class="btn secondary" href="#/hibak">Hibáim (${store.wrong.length})</a>` : ""}
              <a class="btn secondary" href="${backHref}">Vissza</a></div></div>`;
        document.getElementById("restart").onclick = () => route(true);
        return;
      }
      const it = deck[pos];
      answered = false;
      app.innerHTML = `
        <div class="practice-head"><h1>${esc(title)}</h1>
          <span class="counter">${pos + 1} / ${deck.length} · ✅ ${good}</span></div>
        <section class="question">
          ${metaHtml(it.q)}
          <p class="q-text">${esc(it.q.q)}</p>
          ${optionsHtml(it, 0)}
          <button type="button" class="hint-btn" id="hint-btn">💡 Tipp</button>
          <div id="hint"></div>
          <div class="after"></div>
        </section>
        <div class="toolbar">
          <button type="button" class="btn" id="next" disabled>Következő →</button>
          <a class="btn secondary" href="${backHref}">Kilépés</a>
          <span class="t-meta">Billentyűk: a–d / 1–4 a válaszhoz, Enter a továbblépéshez.</span>
        </div>`;
      const sec = app.querySelector(".question");
      sec.querySelector(".options").addEventListener("click", e => {
        const b = e.target.closest(".option");
        if (b) choose(+b.dataset.i);
      });
      document.getElementById("hint-btn").onclick = () => {
        document.getElementById("hint").innerHTML = `<div class="hint">${esc(it.q.hint)}</div>`;
        document.getElementById("hint-btn").remove();
      };
      document.getElementById("next").onclick = next;
    }

    function choose(i) {
      if (answered || pos >= deck.length) return;
      answered = true;
      const it = deck[pos];
      it.chosen = i;
      const ok = i === it.answer;
      if (ok) good++;
      record(it.q, ok);
      save();
      const sec = app.querySelector(".question");
      markOptions(sec, it);
      const hb = document.getElementById("hint-btn");
      if (hb) hb.remove();
      sec.querySelector(".after").innerHTML = explainHtml(it);
      const nx = document.getElementById("next");
      nx.disabled = false;
      nx.focus();
      app.querySelector(".counter").textContent = `${pos + 1} / ${deck.length} · ✅ ${good}`;
    }
    function next() { if (answered) { pos++; render(); window.scrollTo(0, 0); } }

    function onKey(e) {
      if (e.target.closest && e.target.closest("input, textarea")) return;
      const k = e.key.toLowerCase();
      const idx = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : "1234".indexOf(k);
      if (idx >= 0 && !answered) { e.preventDefault(); choose(idx); }
      else if (k === "enter" && answered) { e.preventDefault(); next(); }
    }
    document.addEventListener("keydown", onKey);
    cleanup = () => document.removeEventListener("keydown", onKey);
    render();
  }

  // ── Útválasztó ──
  let lastHash = null;
  function route(force) {
    const h = location.hash.replace(/^#\/?/, "");
    if (!force && h === lastHash) return;
    lastHash = h;
    if (cleanup) { cleanup(); cleanup = null; }
    setActiveNav(h);
    const [page, arg] = h.split("/");
    if (page === "zh") {
      const includeMinta = localStorage.getItem(KEY + ":incl") === "1";
      viewExam(pickZh(includeMinta).map(q => deal(q)), { includeMinta });
    } else if (page === "minta") {
      const items = QUESTIONS.filter(q => q.minta).sort((a, b) => a.minta - b.minta).map(q => deal(q, true));
      viewExam(items, { minta: true });
    } else if (page === "temak") {
      viewTopics();
    } else if (page === "tema") {
      if (arg === "mind") viewPractice("Az összes kérdés vegyesen", QUESTIONS, "#/temak");
      else {
        const t = topicOf(arg);
        if (!t) { location.hash = "#/temak"; return; }
        viewPractice(t.title, QUESTIONS.filter(q => q.t === t.id), "#/temak");
      }
    } else if (page === "hibak") {
      viewPractice("Hibáim", store.wrong.map(id => BY_ID[id]).filter(Boolean), "#/");
    } else {
      viewHome();
    }
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  window.addEventListener("hashchange", () => route(false));
  // Ugyanarra az oldalra mutató link (pl. „Új feladatsor”) újragenerálja a nézetet.
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); route(true); }
  });
  updateBadge();
  route(true);
})();
