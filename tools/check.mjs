#!/usr/bin/env node
// A tananyag és a kérdésbank automatikus ellenőrzése.  Futtatás:  node tools/check.mjs
// Hiba esetén 1-es kóddal lép ki; a figyelmeztetések nem buktatják el.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LESSON_DIR = path.join(ROOT, "tananyag");
const LAST_DIA = 213;
const NO_DIA_OK = ["szint-essze"]; // diatartomány nélküli (kiegészítő) szakaszok
const MIN_Q = 2;                   // ennyi kérdés kell szakaszonként

const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

// ── Adatok betöltése böngésző nélkül ──
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ["data/questions.js", "data/sections.js"])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
const { TOPICS, QUESTIONS, SECTIONS, LESSONS_READY, Lessons } = ctx.window;
const range = s => { const [a, b] = String(s).split(/[–-]/).map(Number); return [a, b ?? a]; };
const diaLabel = d => (d ? (d[0] === d[1] ? `${d[0]}` : `${d[0]}–${d[1]}`) : "–");

// ── 1. Szakaszok ──
const topicIds = new Set(TOPICS.map(t => t.id));
const seen = new Set();
for (const s of SECTIONS) {
  if (seen.has(s.id)) err(`Szakasz: kétszer szereplő id: ${s.id}`);
  seen.add(s.id);
  if (!topicIds.has(s.t)) err(`Szakasz ${s.id}: ismeretlen témakör: ${s.t}`);
  if (!s.dia) { if (!NO_DIA_OK.includes(s.id)) err(`Szakasz ${s.id}: hiányzó diatartomány`); continue; }
  const [ta, tb] = range(TOPICS.find(t => t.id === s.t).dia);
  if (s.dia[0] > s.dia[1] || s.dia[0] < ta || s.dia[1] > tb)
    err(`Szakasz ${s.id}: a ${diaLabel(s.dia)} tartomány kilóg a témakörből (${ta}–${tb})`);
}
const ranged = SECTIONS.filter(s => s.dia).sort((a, b) => a.dia[0] - b.dia[0]);
let next = 1;
for (const s of ranged) {
  if (s.dia[0] > next) err(`Lefedettség: a ${next}–${s.dia[0] - 1}. dia egyik szakaszhoz sem tartozik`);
  if (s.dia[0] < next) err(`Lefedettség: ${s.id} átfed az előző szakasszal (${s.dia[0]}. dia)`);
  next = Math.max(next, s.dia[1] + 1);
}
if (next !== LAST_DIA + 1) err(`Lefedettség: a szakaszok a ${next - 1}. diánál véget érnek (kell: ${LAST_DIA})`);

// ── 2. Kérdések ──
const perSection = Object.fromEntries(SECTIONS.map(s => [s.id, 0]));
const texts = new Set();
for (const q of QUESTIONS) {
  const tag = `Kérdés [${q.t}] „${q.q.slice(0, 50)}…”`;
  if (!topicIds.has(q.t)) err(`${tag}: ismeretlen témakör`);
  if (texts.has(q.q)) err(`${tag}: ismétlődő kérdésszöveg`);
  texts.add(q.q);
  if (!q.a || !Array.isArray(q.w) || q.w.length !== 3 || q.w.some(w => !w)) err(`${tag}: 1 helyes + 3 rossz válasz kell`);
  if (q.w && q.w.includes(q.a)) err(`${tag}: a helyes válasz a rossz válaszok között is szerepel`);
  if (!q.hint) err(`${tag}: hiányzó tipp (hint)`);
  if (!q.ex) err(`${tag}: hiányzó magyarázat (ex)`);
  if (q.sec && !SECTIONS.some(s => s.id === q.sec)) err(`${tag}: ismeretlen sec: ${q.sec}`);
  const s = Lessons.sectionOf(q);
  if (!s) continue;
  if (s.id in perSection) perSection[s.id]++;
  if (typeof q.dia === "number" && !q.sec && !(s.dia && s.dia[0] <= q.dia && q.dia <= s.dia[1]))
    err(`${tag}: a ${q.dia}. dia egyik szakaszba sem sorolható`);
}

// ── 3. Leckeoldalak ──
const files = fs.readdirSync(LESSON_DIR).filter(f => /^\d\d-.+\.html$/.test(f));
for (const t of LESSONS_READY)
  if (!files.includes(Lessons.lessonFile(t))) err(`LESSONS_READY: a(z) ${t} fejezet fájlja (${Lessons.lessonFile(t)}) nem létezik`);

const idsOf = html => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const pages = Object.fromEntries(["index.html", ...files].map(f => [f, fs.readFileSync(path.join(LESSON_DIR, f), "utf8")]));
const dynamicIds = f => f === "index.html" ? new Set(TOPICS.map(t => t.id)) : new Set(); // a tartalomjegyzék JS-ből épül

const coverage = {};
for (const f of files) {
  const html = pages[f];
  const t = f.replace(/^\d\d-|\.html$/g, "");
  if (!topicIds.has(t)) { err(`${f}: a fájlnév nem témakör-azonosító`); continue; }
  if (Lessons.lessonFile(t) !== f) err(`${f}: a sorszám nem egyezik (kell: ${Lessons.lessonFile(t)})`);
  if (!LESSONS_READY.includes(t)) warn(`${f}: létezik, de nincs a LESSONS_READY listában (a linkek még a tartalomjegyzékre mutatnak)`);
  // Szakaszok megléte és sorrendje
  const secIds = SECTIONS.filter(s => s.t === t).map(s => s.id).concat(`${t}-osszegzes`);
  const order = [...html.matchAll(/<section\s+id="([^"]+)"/g)].map(m => m[1]);
  for (const id of secIds) if (!order.includes(id)) err(`${f}: hiányzó szakasz: <section id="${id}">`);
  const known = order.filter(id => secIds.includes(id));
  if (known.join() !== secIds.filter(id => order.includes(id)).join()) err(`${f}: a szakaszok sorrendje eltér a sections.js-től`);

  // Lenyílók: gyakorlás és kvíz sosem lehet nyitva
  for (const m of html.matchAll(/<details\b[^>]*>/g))
    if (/class="[^"]*\b(practice|quiz)\b/.test(m[0]) && /\sopen\b/.test(m[0])) err(`${f}: nyitott lenyíló: ${m[0]}`);
  for (const m of html.matchAll(/data-section="([^"]+)"/g))
    if (!SECTIONS.some(s => s.id === m[1])) err(`${f}: data-section ismeretlen szakaszra mutat: ${m[1]}`);
  if (/«|»/.test(html)) err(`${f}: kitöltetlen sablonhely («…»)`);

  // Képek
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src || !fs.existsSync(path.join(LESSON_DIR, src))) err(`${f}: hiányzó kép: ${src}`);
    if (!/\salt="[^"]+"/.test(tag)) err(`${f}: alt szöveg nélküli kép: ${src}`);
  }

  // Diák lefedése data-dia jelölésekkel (a <section> saját jelölése nem számít)
  const covered = new Set();
  for (const m of html.matchAll(/<(\w+)\b[^>]*\sdata-dia="([^"]+)"/g)) {
    if (m[1] === "section") continue;
    for (const part of m[2].split(",")) {
      const [a, b] = range(part.trim());
      if (Number.isNaN(a) || Number.isNaN(b)) { err(`${f}: hibás data-dia: "${m[2]}"`); continue; }
      for (let d = a; d <= b; d++) covered.add(d);
    }
  }
  const [ta, tb] = range(TOPICS.find(x => x.id === t).dia);
  const missing = [];
  for (let d = ta; d <= tb; d++) if (!covered.has(d)) missing.push(d);
  if (missing.length) err(`${f}: ezekhez a diákhoz nincs data-dia jelölés: ${missing.join(", ")}`);
  coverage[t] = tb - ta + 1 - missing.length;
}

// Horgonyok és belső linkek minden oldalon (a tartalomjegyzéken is)
for (const [f, html] of Object.entries(pages)) {
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|\.\.\/)/.test(href) || href === "./") continue;
    const [file, anchor] = href.split("#");
    const target = file || f;
    if (!pages[target]) { err(`${f}: nem létező oldalra mutató link: ${href}`); continue; }
    if (anchor && !idsOf(pages[target]).has(anchor) && !dynamicIds(target).has(anchor))
      err(`${f}: nem létező horgony: ${href}`);
  }
}

// ── Összesítés ──
const thin = SECTIONS.filter(s => perSection[s.id] < MIN_Q);
for (const s of thin)
  (LESSONS_READY.includes(s.t) ? warn : () => {})(`Kevés kérdés (${perSection[s.id]}): ${s.id} – ${s.title}`);

console.log("A fejlődés gazdaságtörténete – tananyag-ellenőrzés\n");
console.log(`Szakaszok: ${SECTIONS.length} (diatartománnyal: ${ranged.length}), lefedett diák: 1–${next - 1}`);
console.log(`Kérdések: ${QUESTIONS.length}; ${MIN_Q}-nél kevesebb kérdésű szakasz: ${thin.length}`);
console.log(`Megírt fejezetek: ${LESSONS_READY.length} / ${TOPICS.length}` +
  (files.length ? ` (fájl: ${files.join(", ")})` : ""));
console.log("\nTémakör      kérdés  szakaszonként" + " ".repeat(30) + "szöveggel lefedett diák");
for (const t of TOPICS) {
  const secs = SECTIONS.filter(s => s.t === t.id);
  const counts = secs.map(s => perSection[s.id]).join(" ");
  const [a, b] = range(t.dia);
  const cov = t.id in coverage ? `${coverage[t.id]} / ${b - a + 1}` : "—";
  const total = QUESTIONS.filter(q => q.t === t.id).length;
  console.log(`${t.id.padEnd(12)} ${String(total).padStart(6)}  ${counts.padEnd(43)} ${cov}`);
}
if (warnings.length) console.log(`\nFigyelmeztetések (${warnings.length}):\n  ` + warnings.join("\n  "));
if (errors.length) {
  console.log(`\nHIBÁK (${errors.length}):\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log("\n✅ Nincs hiba.");
