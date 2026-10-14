// A tananyag-oldalak szkriptje: szakaszkvízek, útiterv, lapozó és a tartalomjegyzék.
// A kérdések a data/questions.js-ből jönnek, a szakaszok a data/sections.js-ből; az eredmények ugyanoda
// kerülnek, ahová a ZH-gyakorló (app.js) menti őket, így a „Hibáim” lista közös.
(function () {
  "use strict";

  const TOPICS = window.TOPICS;
  const SECTIONS = window.SECTIONS;
  const L = window.Lessons;
  const LETTERS = ["a", "b", "c", "d"];

  // ── Közös tárolás – a kulcs és az azonosító képzése egyezzen az app.js-ével! ──
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }
  const QUESTIONS = window.QUESTIONS.map(q => Object.assign({ id: q.t + "-" + hash(q.q) }, q));
  const KEY = "fegatt-zh-gyakorlo:v1";
  function load() {
    try { return Object.assign({ stats: {}, wrong: [] }, JSON.parse(localStorage.getItem(KEY))); }
    catch (e) { return { stats: {}, wrong: [] }; }
  }
  function record(q, ok) {
    const store = load(); // frissen olvasva, ha közben másik lapon is gyakoroltál
    const s = store.stats[q.id] || { seen: 0, correct: 0 };
    s.seen++; if (ok) s.correct++; s.last = ok;
    store.stats[q.id] = s;
    const i = store.wrong.indexOf(q.id);
    if (ok && i >= 0) store.wrong.splice(i, 1);
    if (!ok && i < 0) store.wrong.push(q.id);
    try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* privát mód */ }
    updateBadge();
  }
  function updateBadge() {
    const el = document.getElementById("wrong-count");
    if (!el) return;
    const ids = new Set(QUESTIONS.map(q => q.id));
    const n = load().wrong.filter(id => ids.has(id)).length;
    el.textContent = n ? n : "";
  }

  // ── Segédek ──
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const topicIndex = t => TOPICS.findIndex(x => x.id === t);
  const questionsOfSection = id => QUESTIONS.filter(q => L.sectionOf(q).id === id);
  const questionsOfTopic = t => QUESTIONS.filter(q => q.t === t);
  const diaText = d => !d ? "" : d[0] === d[1] ? `${d[0]}. dia` : `${d[0]}–${d[1]}. dia`;

  // ── Kvíz egy lenyílóban ──
  // <details class="box quiz" data-section="bev-fejlodes"></details>  – a szakasz kérdései
  // <details class="box quiz" data-topic="bev"></details>              – a teljes témakör kérdései
  function setupQuiz(det) {
    const sec = det.dataset.section, t = det.dataset.topic;
    const qs = sec ? questionsOfSection(sec) : questionsOfTopic(t);
    if (!det.querySelector("summary")) {
      const label = sec ? "Kvíz a szakaszhoz" : "Kvíz – a teljes fejezet";
      det.insertAdjacentHTML("afterbegin", `<summary>🎯 ${label} (${qs.length} kérdés)</summary>`);
    }
    const body = document.createElement("div");
    det.appendChild(body);
    let rendered = false;
    det.addEventListener("toggle", () => {
      if (!det.open || rendered) return;
      rendered = true;
      if (!qs.length) { body.innerHTML = `<p>Ehhez a szakaszhoz még nincs kérdés.</p>`; return; }
      body.innerHTML = `<p class="t-meta">Válaszd ki a helyes választ; a 💡 Tipp segít elindulni. Az eredmény a gyakorló oldal statisztikájába is bekerül.</p>`;
      shuffle(qs).forEach((q, n) => body.appendChild(questionEl(q, n)));
      if (t) body.insertAdjacentHTML("beforeend",
        `<div class="toolbar"><a class="btn" href="../index.html#/tema/${t}">Gyakorlás a ZH-gyakorlóban</a></div>`);
    });
  }

  function questionEl(q, n) {
    const opts = shuffle([q.a].concat(q.w));
    const answer = opts.indexOf(q.a);
    const el = document.createElement("section");
    el.className = "question";
    el.innerHTML = `
      <p class="q-text"><span class="num">${n + 1}.</span>${esc(q.q)}</p>
      <ul class="options">${opts.map((o, i) => `
        <li><button type="button" class="option" data-i="${i}">
          <span class="letter">${LETTERS[i]}.</span><span>${esc(o)}</span></button></li>`).join("")}</ul>
      <button type="button" class="hint-btn">💡 Tipp</button>
      <div class="hint-slot"></div>
      <div class="after"></div>`;
    const hintBtn = el.querySelector(".hint-btn");
    hintBtn.onclick = () => {
      el.querySelector(".hint-slot").innerHTML = `<div class="hint">${esc(q.hint)}</div>`;
      hintBtn.remove();
    };
    el.querySelector(".options").addEventListener("click", e => {
      const b = e.target.closest(".option");
      if (!b || b.disabled) return;
      const chosen = +b.dataset.i, ok = chosen === answer;
      record(q, ok);
      el.querySelectorAll(".option").forEach((x, i) => {
        x.disabled = true;
        if (i === answer) x.classList.add("correct");
        else if (i === chosen) x.classList.add("wrong");
      });
      hintBtn.remove();
      el.querySelector(".after").innerHTML = `<div class="explain ${ok ? "ok" : "bad"}">
        <div class="verdict">${ok ? "Helyes!" : `Nem jó – a helyes válasz: ${LETTERS[answer]}.`}</div>
        <div>${esc(q.ex)}</div></div>`;
    });
    return el;
  }

  // ── Útiterv: <ol class="roadmap" data-roadmap="bev"></ol> – üresen hagyva a SECTIONS-ből töltődik ──
  function fillRoadmap(ol) {
    if (ol.children.length) return;
    ol.innerHTML = SECTIONS.filter(s => s.t === ol.dataset.roadmap).map(s =>
      `<li><a href="#${s.id}">${esc(s.title)}</a> <span class="dia-ref">${diaText(s.dia)}</span></li>`).join("") +
      `<li><a href="#${ol.dataset.roadmap}-osszegzes">Összefoglalás</a></li>`;
  }

  // ── Lapozó: <nav class="lesson-nav" data-chapter="bev"></nav> ──
  function fillNav(nav) {
    const i = topicIndex(nav.dataset.chapter);
    const link = (t, label) => `<a class="btn secondary" href="${L.chapterHref(t.id, "../")}">${label}</a>`;
    nav.innerHTML = [
      i > 0 ? link(TOPICS[i - 1], `← ${i}. ${esc(TOPICS[i - 1].title)}`) : `<span></span>`,
      `<a class="btn secondary" href="./">Tartalomjegyzék</a>`,
      i < TOPICS.length - 1 ? link(TOPICS[i + 1], `${i + 2}. ${esc(TOPICS[i + 1].title)} →`) : `<span></span>`
    ].join("");
  }

  // ── Tartalomjegyzék: <div id="toc"></div> a tananyag/index.html-ben ──
  function fillToc(el) {
    el.innerHTML = TOPICS.map((t, i) => {
      const ready = window.LESSONS_READY.includes(t.id);
      const secs = SECTIONS.filter(s => s.t === t.id);
      const n = questionsOfTopic(t.id).length;
      const item = s => {
        const title = ready ? `<a href="${L.sectionHref(s, "../")}">${esc(s.title)}</a>` : esc(s.title);
        return `<li>${title} <span class="dia-ref">${diaText(s.dia)}</span></li>`;
      };
      return `<section class="toc-chapter" id="${t.id}">
        <span class="num" aria-hidden="true">${i + 1}</span>
        <h2>${ready ? `<a href="${L.lessonFile(t.id)}">${esc(t.title)}</a>` : esc(t.title)}</h2>
        <div class="t-meta">Diák: ${esc(t.dia)} · ${n} kvízkérdés${ready ? "" : ` · <span class="soon">a fejezet szövege hamarosan elkészül</span>`}</div>
        <ol>${secs.map(item).join("")}</ol>
        <div class="t-actions">
          ${ready ? `<a class="btn" href="${L.lessonFile(t.id)}">📖 Olvasás</a>` : ""}
          <a class="btn secondary" href="../index.html#/tema/${t.id}">🎯 Gyakorlás</a></div>
      </section>`;
    }).join("");
    // A dinamikusan létrejött horgonyra (pl. a kvíz „Olvasd el” linkjéből) görgessünk oda.
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  // Utoljára olvasott fejezet – a főoldal „Ott tartottál” linkjéhez.
  const chapterNav = document.querySelector("nav.lesson-nav[data-chapter]");
  if (chapterNav) {
    const t = chapterNav.dataset.chapter;
    try { localStorage.setItem("fegatt-last-lesson", JSON.stringify({ t, href: "tananyag/" + L.lessonFile(t), ts: Date.now() })); }
    catch (e) { /* privát mód */ }
  }

  document.querySelectorAll("ol.roadmap[data-roadmap]").forEach(fillRoadmap);
  document.querySelectorAll("details.quiz").forEach(setupQuiz);
  document.querySelectorAll("nav.lesson-nav[data-chapter]").forEach(fillNav);
  const toc = document.getElementById("toc");
  if (toc) fillToc(toc);
  updateBadge();

  // ── „Extra” gombok: a hozzájuk tartozó <dialog> modál megnyitása ──
  document.querySelectorAll("button.extra-btn[data-extra]").forEach(btn => {
    const dlg = document.getElementById(btn.dataset.extra);
    if (!dlg || typeof dlg.showModal !== "function") return;
    btn.setAttribute("aria-haspopup", "dialog");
    btn.addEventListener("click", () => dlg.showModal());
  });
  document.querySelectorAll("dialog.extra-modal").forEach(dlg => {
    dlg.querySelector(".extra-close")?.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); }); // kattintás a háttérre
  });
})();
