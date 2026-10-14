// A tananyag szakaszai – a TERV.md 3. fejezetének táblázatai alapján.
// Mezők: id = horgony a leckeoldalon, t = témakör (TOPICS), title = cím, dia = [első, utolsó] dia (null: nincs diája).
// A diatartományok együtt hézag és átfedés nélkül lefedik az 1–213. diát (tools/check.mjs ellenőrzi).

window.SECTIONS = [
  { id: "bev-bevezetes", t: "bev", title: "Bevezetés: jólétünket érintő döntések; hogyan használd az anyagot (D/M/E/V)", dia: [1, 6] },
  { id: "bev-fejlodes", t: "bev", title: "Növekedés, fejlődés, fejlettség; a három kihívás; Amartya Sen", dia: [7, 10] },
  { id: "bev-tortenelem", t: "bev", title: "„A történelem rímel” – miért hasznos a gazdaságtörténet; Gallia 2000 éve és ma", dia: [11, 14] },
  { id: "bev-utak", t: "bev", title: "A fejlődés receptje: egy út vagy sok? Unilineáris fejlődés, világrend; Veblen: cél-e a növekedés?", dia: [15, 19] },
  { id: "bev-kornyezet", t: "bev", title: "Növekedés és környezet: energia, CO₂, Jevons-paradoxon", dia: [20, 26] },
  { id: "bev-nyugat", t: "bev", title: "A nyugati kapitalizmus mint cél; hosszú távú fejlődés; ipari forradalmak", dia: [27, 32] },
  { id: "bev-eroforras", t: "bev", title: "Erőforrások és a növekedés alapmodellje; a nyugati recept három állítása", dia: [33, 35] },

  { id: "ker-kontener", t: "ker", title: "Nyitó eset: a konténer", dia: [36, 37] },
  { id: "ker-piac", t: "ker", title: "Belső és külső kereskedelem; a centrum; szállítási költségek", dia: [38, 41] },
  { id: "ker-szakosodas", t: "ker", title: "Szakosodás, munkamegosztás, növekvő hatékonyság", dia: [42, 43] },
  { id: "ker-globalizacio", t: "ker", title: "Globalizációk: római pénzérme, selyemút", dia: [44, 46] },
  { id: "ker-hatarok", t: "ker", title: "Miért nem teljes a szakosodás? Népesség, urbanizáció, „régi” kereskedelem; összegzés", dia: [47, 51] },

  { id: "nep-pirula", t: "nep", title: "Nyitó eset: a fogamzásgátló tabletta", dia: [52, 53] },
  { id: "nep-malthus", t: "nep", title: "Malthus elmélete és hibái", dia: [54, 56] },
  { id: "nep-atmenet", t: "nep", title: "Gyerekvállalási stratégiák; demográfiai átmenet", dia: [57, 59] },
  { id: "nep-pepys", t: "nep", title: "Pepys-hipotézis; az ipari forradalom előtti növekedés modellje", dia: [60, 62] },
  { id: "nep-tfp", t: "nep", title: "Teljes tényezőtermelékenység (TFP) az agrártársadalmakban", dia: [63, 65] },
  { id: "nep-eletszinvonal", t: "nep", title: "Fogel és az élelmezés; várható élettartam; munkaidő, nem fizetett munka", dia: [66, 69] },
  { id: "nep-jovo", t: "nep", title: "Ha a népesség nem nő tovább: „fordított Pepys”; összegzés", dia: [70, 72] },

  { id: "int-lajos", t: "int", title: "Nyitó eset: „Az állam én vagyok”", dia: [73, 74] },
  { id: "int-fogalom", t: "int", title: "Mi az intézmény, és miért fontos? (tranzakciós költség, ösztönzők)", dia: [75, 76] },
  { id: "int-rendek", t: "int", title: "Korlátozott és nyílt hozzáférésű rend (NWW); kizsákmányoló és befogadó intézmények (AR)", dia: [77, 78] },
  { id: "int-ajr", t: "int", title: "Az AJR-modell és tanulságai", dia: [79, 80] },
  { id: "int-felvilagosodas", t: "int", title: "A felvilágosodás eszméi és gyakorlati következményei (Dicsőséges forradalom)", dia: [81, 82] },
  { id: "int-hatekony", t: "int", title: "Hatékony és kevésbé hatékony intézményi rendszerek; összegzés", dia: [83, 84] },

  { id: "tud-gpu", t: "tud", title: "Nyitó eset: a videókártyától az MI-ig", dia: [85, 86] },
  { id: "tud-megismeres", t: "tud", title: "Gyakorlati és tudományos megismerés; Fourier-sortól a Netflixig", dia: [87, 88] },
  { id: "tud-felvilagosodas", t: "tud", title: "Tudományos felvilágosodás, empiricizmus", dia: [89, 91] },
  { id: "tud-fokozatvaltas", t: "tud", title: "Fokozatváltás: 1. és 2. ipari forradalom; Nordhaus fényára", dia: [92, 95] },
  { id: "tud-innovacio", t: "tud", title: "Az innovációra épülő fejlődés modellje", dia: [96, 96] },
  { id: "tud-transzfer", t: "tud", title: "Tudástranszfer, felzárkózás 1870–1975", dia: [97, 100] },
  { id: "tud-humantoke", t: "tud", title: "Emberitőke-elmélet; oktatásban töltött évek; tanulságok", dia: [101, 104] },

  { id: "penz-mpesa", t: "penz", title: "Nyitó eset: M-Pesa, Kenya", dia: [105, 106] },
  { id: "penz-szuletes", t: "penz", title: "A pénz születése: barter, árupénz, pénzevolúció", dia: [107, 109] },
  { id: "penz-bankok", t: "penz", title: "A bankok közvetítő szerepe és hatása a növekedésre", dia: [110, 111] },
  { id: "penz-tozsde", t: "penz", title: "Tőzsdék; a pénzügyi rendszer csökkenti a kockázatot", dia: [112, 113] },
  { id: "penz-harari", t: "penz", title: "Harari: a hitel mint a jövőbe vetett bizalom; összegzés", dia: [114, 115] },

  { id: "ciklus-palmstruch", t: "ciklus", title: "Nyitó eset: az első bankjegy; a pénzügyi rendszer jó és rossz oldala", dia: [116, 118] },
  { id: "ciklus-buborekok", t: "ciklus", title: "Buborékok a történelemben: tulipánmánia, South Sea, dot-com, kripto", dia: [119, 123] },
  { id: "ciklus-minsky", t: "ciklus", title: "Hogyan keletkeznek a buborékok? Minsky–Kindleberger", dia: [124, 126] },
  { id: "ciklus-ponzi", t: "ciklus", title: "Buborék csalással: Ponzi, Albánia 1996–97", dia: [127, 129] },
  { id: "ciklus-valsag", t: "ciklus", title: "Keresleti sokk; a pénzügyi válság reálgazdasági válsággá válik; nagy világválság", dia: [130, 133] },

  { id: "eur-gutenberg", t: "eur", title: "Nyitó eset: a nyomtatás", dia: [134, 135] },
  { id: "eur-megosztottsag", t: "eur", title: "Európa megosztottsága; verseny vagy háború; az egység átka", dia: [136, 140] },
  { id: "eur-felfedezok", t: "eur", title: "Felfedezők és az „új” kereskedelem", dia: [141, 143] },
  { id: "eur-gyarmatok", t: "eur", title: "Gyarmatok: a spanyol és az angol út", dia: [144, 148] },
  { id: "eur-rabszolgasag", t: "eur", title: "Rabszolgaság; Európa felemelkedése mint többtényezős folyamat", dia: [149, 151] },

  { id: "fogy-aruhaz", t: "fogy", title: "Nyitó eset: az áruház", dia: [152, 153] },
  { id: "fogy-textil", t: "fogy", title: "A textilipar felemelkedése; mit kezdenek a rengeteg szövettel?", dia: [154, 156] },
  { id: "fogy-berek", t: "fogy", title: "Keleti és nyugati bérek; reálbérek Európában", dia: [157, 159] },
  { id: "fogy-arnyoldal", t: "fogy", title: "Árnyoldalak és jogkiterjesztés", dia: [160, 161] },
  { id: "fogy-20szazad", t: "fogy", title: "Totalitárius felzárkózás; USA a háború után; farmer; összegzés", dia: [162, 165] },

  { id: "ert-bosegkep", t: "ert", title: "Nyitó eset: a bőség képzete; összefügg-e értékrend és fejlődés?", dia: [166, 168] },
  { id: "ert-weber", t: "ert", title: "Weber: protestáns etika; vallás és üzlet", dia: [169, 170] },
  { id: "ert-tarsadalmitoke", t: "ert", title: "Társadalmi tőke (Putnam); mi függ mitől?", dia: [171, 172] },
  { id: "ert-meritokracia", t: "ert", title: "Meritokrácia; kölcsönös egymásra hatás", dia: [173, 175] },

  { id: "kerpol-hajo", t: "kerpol", title: "Nyitó eset: egy 3500 éves hajóroncs", dia: [176, 177] },
  { id: "kerpol-vedelem", t: "kerpol", title: "Nemzetközi intézmények; kereskedelempolitika; növendékipar-védelem", dia: [178, 180] },
  { id: "kerpol-ketoldalu", t: "kerpol", title: "Vámok leépítése 1.: kétoldalú megállapodások", dia: [181, 182] },
  { id: "kerpol-valsag", t: "kerpol", title: "Vámok visszaépítése a nagy világválságban", dia: [183, 183] },
  { id: "kerpol-tobboldalu", t: "kerpol", title: "Vámok leépítése 2.: GATT/WTO; kereskedelempolitikai rendszerek", dia: [184, 185] },

  { id: "monet-vilagpenz", t: "monet", title: "A világpénz előnyei", dia: [186, 187] },
  { id: "monet-arany", t: "monet", title: "Az aranystandard; bukás – feltámadás – bukás", dia: [188, 189] },
  { id: "monet-trilemma", t: "monet", title: "A trilemma", dia: [190, 191] },
  { id: "monet-bretton", t: "monet", title: "Bretton Woods és bukása", dia: [192, 193] },
  { id: "monet-lebego", t: "monet", title: "Lebegő árfolyamok; monetáris rezsimek; a nemzetközi rend mérlege", dia: [194, 196] },

  { id: "allam-poroszo", t: "allam", title: "Nyitó eset: a porosz kötelező (társadalom)biztosítás", dia: [197, 198] },
  { id: "allam-fordulat", t: "allam", title: "Gazdaság és állam a 20. századig; az újraelosztási arány; fordulat", dia: [199, 200] },
  { id: "allam-keynes", t: "allam", title: "Keynes szerepe", dia: [201, 201] },
  { id: "allam-totalitarius", t: "allam", title: "Totalitárius rendszerek: Németország, Szovjetunió (tervutasítás)", dia: [202, 204] },
  { id: "allam-ortodoxia", t: "allam", title: "Stagfláció; feltámad az ortodoxia", dia: [205, 205] },

  { id: "jolet-felfutas", t: "jolet", title: "A jóléti állam felfutása; intertemporális jövedelem-átcsoportosítás", dia: [206, 207] },
  { id: "jolet-miert", t: "jolet", title: "Miért az állam? A jóléti állam kompromisszuma", dia: [208, 209] },

  { id: "szint-forrasok", t: "szint", title: "A hosszú távú fejlődés alapforrásai", dia: [210, 211] },
  { id: "szint-csapda", t: "szint", title: "A fejlettség csapdája; a fejlődés nem végállapot", dia: [212, 213] },
  { id: "szint-essze", t: "szint", title: "Esszéírás lépésről lépésre (Kiegészítés)", dia: null }
];

// Megírt fejezetek: ide kerül a témakör azonosítója, amikor a leckeoldala elkészült (pl. "bev").
// Amíg egy fejezet nincs itt, a kvízek linkje a tartalomjegyzék megfelelő fejezetére mutat.
window.LESSONS_READY = ["bev", "ker", "nep"];

(function () {
  // A témakör leckeoldala a TOPICS sorrendje szerint: 01-bev.html, 02-ker.html, …
  function lessonFile(t) {
    const i = window.TOPICS.findIndex(x => x.id === t);
    return String(i + 1).padStart(2, "0") + "-" + t + ".html";
  }

  // Kérdés → szakasz. Sorrend: a kérdés saját „sec” mezője; különben az a szakasz, amelynek
  // diatartományába a kérdés „dia” száma esik (elsősorban a saját témakörében; a szintézis-kérdéseknél
  // ez másik fejezet is lehet); különben (pl. „1–35” alakú, témakör-szintű kérdés) a fejezet összefoglalója.
  function sectionOf(q) {
    if (q.sec) return window.SECTIONS.find(s => s.id === q.sec) || null;
    if (typeof q.dia === "number") {
      const has = s => s.dia && s.dia[0] <= q.dia && q.dia <= s.dia[1];
      const s = window.SECTIONS.find(s => s.t === q.t && has(s)) || window.SECTIONS.find(has);
      if (s) return s;
    }
    const topic = window.TOPICS.find(x => x.id === q.t);
    return { id: q.t + "-osszegzes", t: q.t, title: "Összefoglalás – " + topic.title, dia: null };
  }

  // Link a szakaszhoz, a hívó oldal helyétől függő előtaggal ("" a főoldalról, "../" a leckeoldalakról).
  // Meg nem írt fejezetnél a tartalomjegyzék fejezetére mutat.
  function sectionHref(s, base) {
    const dir = base + "tananyag/";
    return window.LESSONS_READY.includes(s.t) ? dir + lessonFile(s.t) + "#" + s.id : dir + "index.html#" + s.t;
  }

  // Link a fejezet elejére (meg nem írt fejezetnél a tartalomjegyzékbe).
  function chapterHref(t, base) {
    const dir = base + "tananyag/";
    return window.LESSONS_READY.includes(t) ? dir + lessonFile(t) : dir + "index.html#" + t;
  }

  window.Lessons = { lessonFile, sectionOf, sectionHref, chapterHref };
})();
