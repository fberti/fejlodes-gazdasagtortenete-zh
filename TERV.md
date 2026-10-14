# Tananyag-terv – A fejlődés gazdaságtörténete (GTGVÖ120BL)

Cél: a `Fegatt.pdf` diasor (213 dia) **teljes** anyagát feldolgozó, könnyen olvasható, kerek szövegű tananyag,
amely beépül a meglévő ZH-gyakorló oldalba, és kétirányú kapcsolatban áll a kvízkérdésekkel:

- a kvízkérdés magyarázata alatt link visz a tananyag megfelelő szakaszához („📖 Olvasd el”);
- a tananyag minden szakasza végén csukott lenyílóban ott vannak a szakaszhoz tartozó kvízkérdések,
  a fejezet végén pedig link a témakör teljes gyakorlásához.

Források: `…/resources/Fegatt.pdf` (diasor), `gtgvo120bl.pdf` (tantárgyi program: ZH + esszévizsga),
`minta_fegatt.pdf` (mintazh). A diasor mellett a kötelező irodalom (Persson–Sharp) szellemében kiegészíthető
a szöveg; minden, ami nincs a diákon, **„Kiegészítés”** jelölést kap.

---

## 1. Architektúra

```
index.html                 ← meglévő SPA (ZH, témakörök, mintazh, hibáim) + új „Tananyag” menüpont
assets/app.js              ← kvíz-magyarázatban „📖 Olvasd el” link, témakör-listában „Tananyag” gomb
assets/theme.js            ← ÚJ: a téma-kapcsoló kiemelve az app.js-ből (a leckeoldalak is használják)
assets/lesson.js           ← ÚJ: leckeoldalak kvízmotorja (questions.js-ből, közös localStorage-statisztika)
assets/style.css           ← ÚJ dobozok, ábrák, lenyílók, tartalomjegyzék
data/questions.js          ← meglévő 194 kérdés + új kérdések; opcionális új mező: sec (szakasz-azonosító)
data/sections.js           ← ÚJ: a szakaszok egyetlen forrása (id, témakör, cím, diatartomány)
tananyag/index.html        ← tartalomjegyzék (15 fejezet, szakaszokkal)
tananyag/01-bev.html … 15-szint.html   ← fejezetenként egy statikus oldal
tananyag/img/dia-NNN.png   ← a diasorból kivágott ábrák
tools/dia-kep.sh           ← ábra kivágása a PDF-ből (pdftoppm)
tools/check.mjs            ← automatikus ellenőrzés (lefedettség, horgonyok, képek, lenyílók, kérdésmezők)
```

**Miért statikus leckeoldalak?** Hosszú, olvasásra szánt szöveg: JS nélkül is olvasható, könyvjelzőzhető,
nyomtatható, és a horgonylinkek (`01-bev.html#bev-fejlodes`) stabilak. A kvízrész már most is SPA; ehhez nem nyúlunk
jobban, mint ami a linkeléshez kell.

### 1.1 Kvíz ↔ tananyag összekötés

`data/sections.js`:

```js
window.SECTIONS = [
  { id: "bev-fejlodes", t: "bev", file: "01-bev.html", title: "Növekedés, fejlődés, fejlettség", dia: [7, 10] },
  …
];
```

- A szakaszok diatartományai **hézag és átfedés nélkül** lefedik az 1–213. diát (ezt a `check.mjs` ellenőrzi) –
  így a diasor teljes lefedettsége gépileg igazolható.
- Kérdés → szakasz (`Lessons.sectionOf`): ha a kérdésnek van `sec` mezője, az dönt; különben a `dia` szám alapján
  (a tartományba eső szakasz – elsősorban a saját témakörben, ha ott nincs, akkor bármelyikben; így a szintézis-kérdések
  oda visznek, ahol a dia tartalma van). A témakör-szintű `dia: "1–35"` alakú kérdések a fejezet összefoglalójára (`#<t>-osszegzes`) mutatnak.
  → A meglévő 194 kérdést **nem kell kézzel átírni**, csak ahol a dia-alapú besorolás félrevisz.
- `app.js` `explainHtml`: a „Diasor: N. dia körül” sor helyett
  `📖 Olvasd el: <szakaszcím> (N. dia)` → `tananyag/01-bev.html#bev-fejlodes`.
- `app.js` témakörlista: minden témakör mellé „📖 Tananyag” gomb; főoldal: új „📖 Tananyag” kártya; fejléc: új menüpont.
- Leckeoldal: minden szakasz végén
  `<details class="box quiz" data-section="bev-fejlodes"><summary>🎯 Kvíz – …</summary></details>` (csukva);
  a `lesson.js` tölti fel a szakasz kérdéseivel (opciók keverve, 💡 Tipp, magyarázat). Ugyanazt a
  `fegatt-zh-gyakorlo:v1` localStorage-kulcsot használja, tehát az itt elrontott kérdés is bekerül a „Hibáim” közé.
- Fejezet végén: „🎯 A teljes témakör gyakorlása” → `../index.html#/tema/<t>`, és a fejezet összes kérdése egy csukott blokkban.

### 1.2 Egy fejezet felépítése (a `tananyag` skill sémája, gazdaságtörténetre igazítva)

A diasor jelöléseit tartjuk, mert a ZH és a vizsga is ezekre épít:

| Diasor-jelölés | Doboz a tananyagban | Megjelenés |
|---|---|---|
| [D] definíció | `box def` | „Fogalom” – pontos, rövid definíció + egymondatos „mit jelent ez a gyakorlatban?” |
| [M] mechanizmus | `box mech` | „Mechanizmus” – ok-okozati lánc nyilakkal (A → B → C), szükség esetén ábrával |
| [E] eset | `box eset` | „Eset” – történeti példa, a mechanizmushoz kötve („ez azért példa X-re, mert…”) |
| [V] vitatott | `box vita` | „Vitatott” – az állítás + az ellenérv / alternatív magyarázat |
| – | `box warn` | „Buktató” – tipikus félreértés, ZH-csapda (abszolút állítások, fordított okság) |
| – | `box tip` | összefoglaló, hüvelykujjszabály, kapcsolódás más fejezethez |

Fejezetsablon:

1. **Nyitó eset (motiváció)** – a diasor minden fejezete egy esettel indul (konténer, fogamzásgátló, XIV. Lajos,
   GPU, M-Pesa, Palmstruch, Gutenberg, áruház…). Ebből egy kérdés, amire a fejezet végén választ adunk.
2. **Útiterv** – számozott lista a szakaszokra, horgonylinkekkel.
3. **Szakaszok** (egyszerűtől a bonyolultig, mindegyik a `SECTIONS` egy elemére): folyó, kerek szöveg;
   a dobozok csak kiemelnek, nem helyettesítik a szöveget. A fogalom mindig egy konkrét esetből/kérdésből nő ki.
   Ábra ott, ahol mechanizmust mutat vagy az eset lényege (lásd 3. fejezet). Szakasz vége:
   - ✏️ **Gondold végig** (csukott `details.box.practice`): 3–5 rövid, esszé-stílusú kérdés, feladatonként lenyíló
     mintaválasszal („Miért…?”, „Hogyan magyarázná X-szel az Y esetet?”) – ez a vizsgára készít;
   - 🎯 **Kvíz** (csukott, `lesson.js`) – a szakasz feleletválasztós kérdései.
4. **Összefoglalás** (`#<t>-osszegzes`): 5–8 pontos „mit vigyünk magunkkal” (a diasor záródiája alapján),
   + **esszétáblázat**: „ha az esetben ezt látod → ezt a fogalmat/mechanizmust használd”.
5. **Kapcsolódások**: mely más fejezetek fogalmai kapcsolódnak (az esszé „szintézis” szempontja 4 pontot ér).
6. **Fejezetvégi kvíz** + link a témakör-gyakorláshoz.

Stílus: tegező, rövid mondatok, a számadatok csak illusztrálnak (a diasor 1. diája szerint nem kell megtanulni őket –
ezt a szöveg is jelezze). Magyar idézőjel („…”), gondolatjel (–).

### 1.3 Ábrák

- Kivágás: `tools/dia-kep.sh <dia> [x y w h]` → `tananyag/img/dia-NNN.png` (150 dpi, opcionális kivágás).
- Megjelenés: `<figure class="dia"><img …><figcaption>… (Forrás: diasor, N. dia; eredeti forrás, ha a dián szerepel)</figcaption></figure>`;
  sötét témában fehér háttérlapon.
- **Táblázatos diák** (pl. 4, 40, 62, 64, 67, 102, 156, 158, 185, 195) nem képként, hanem **HTML-táblázatként** kerülnek át
  (olvashatóbb, sötét témában is jó).
- Pusztán dekoratív képek (portré, illusztráció) nem kellenek; a szöveg leírja őket.

---

## 2. Új kérdések – szabályok

- Formátum a meglévő: `{ t, dia, sec?, q, a, w:[3], hint, ex }` – négy válasz, egy helyes; nincs számbeírós kérdés.
- Cél: **minden szakaszhoz legalább 2 kérdés**. A `check.mjs` kilistázza a kevés kérdésű szakaszokat; ezeket töltjük fel.
- Rossz válaszok tipikus hibákból (fordított okság, abszolút állítás, fogalomcsere: kizsákmányoló ↔ befogadó,
  Malthus ↔ Pepys, aranystandard ↔ Bretton Woods…), hihetők, hasonló hosszúak.
- `hint` a megoldás irányát adja, nem a választ; `ex` a jelöléssel ([D]/[M]/[E]/[V]) kezdődik, mint eddig.
- A mintazh-kérdések (`minta`) szövegéhez és sorrendjéhez nem nyúlunk.

---

## 3. Tartalmi felosztás – a teljes diasor szakaszokra bontva

Jelmagyarázat: **Á** = ábra a diasorból (kép), **T** = táblázat HTML-ként, **–** = nincs kép.
A tartományok együtt hézagmentesen lefedik az 1–213. diát.

### 1. Fejlődés, növekedés és a nyugati recept — `01-bev.html` (1–35)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| bev-bevezetes | 1–6 | Bevezetés: jólétünket érintő döntések; hogyan használd az anyagot (D/M/E/V) | T 4; Á 5, 6 |
| bev-fejlodes | 7–10 | Növekedés, fejlődés, fejlettség; a három kihívás; Amartya Sen | – |
| bev-tortenelem | 11–14 | „A történelem rímel” – miért hasznos a gazdaságtörténet; Gallia 2000 éve és ma | Á 14 |
| bev-utak | 15–19 | A fejlődés receptje: egy út vagy sok? Unilineáris fejlődés, világrend; Veblen: cél-e a növekedés? | Á 17 |
| bev-kornyezet | 20–26 | Növekedés és környezet: energia, CO₂, Jevons-paradoxon | Á 20, 21, 23/24 (válogatva), 25 |
| bev-nyugat | 27–32 | A nyugati kapitalizmus mint cél; hosszú távú fejlődés; ipari forradalmak | Á 31 |
| bev-eroforras | 33–35 | Erőforrások és a növekedés alapmodellje; a nyugati recept három állítása | – |

### 2. A kereskedelem hasznai — `02-ker.html` (36–51)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| ker-kontener | 36–37 | Nyitó eset: a konténer | Á 37 |
| ker-piac | 38–41 | Belső és külső kereskedelem; a centrum; szállítási költségek | Á 39, 41; T 40 |
| ker-szakosodas | 42–43 | Szakosodás, munkamegosztás, növekvő hatékonyság | Á 43 |
| ker-globalizacio | 44–46 | Globalizációk: római pénzérme, selyemút | Á 46 |
| ker-hatarok | 47–51 | Miért nem teljes a szakosodás? Népesség, urbanizáció, „régi” kereskedelem; összegzés | Á 48, 50 |

### 3. Népességnövekedés és hatásai — `03-nep.html` (52–72)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| nep-pirula | 52–53 | Nyitó eset: a fogamzásgátló tabletta | – |
| nep-malthus | 54–56 | Malthus elmélete és hibái | **Á 55** (mechanizmus) |
| nep-atmenet | 57–59 | Gyerekvállalási stratégiák; demográfiai átmenet | **Á 58**; T/Á 59 |
| nep-pepys | 60–62 | Pepys-hipotézis; az ipari forradalom előtti növekedés modellje | T 62 |
| nep-tfp | 63–65 | Teljes tényezőtermelékenység (TFP) az agrártársadalmakban | T 64 |
| nep-eletszinvonal | 66–69 | Fogel és az élelmezés; várható élettartam; munkaidő, nem fizetett munka | T 67; Á 68, 69 |
| nep-jovo | 70–72 | Ha a népesség nem nő tovább: „fordított Pepys”; összegzés | Á 70, 71 |

### 4. Az intézmények szerepe — `04-int.html` (73–84)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| int-lajos | 73–74 | Nyitó eset: „Az állam én vagyok” | – |
| int-fogalom | 75–76 | Mi az intézmény, és miért fontos? (tranzakciós költség, ösztönzők) | – |
| int-rendek | 77–78 | Korlátozott és nyílt hozzáférésű rend (NWW); kizsákmányoló és befogadó intézmények (AR) | – |
| int-ajr | 79–80 | Az AJR-modell és tanulságai | mechanizmus-ábra HTML-ben (79) |
| int-felvilagosodas | 81–82 | A felvilágosodás eszméi és gyakorlati következményei (Dicsőséges forradalom) | – |
| int-hatekony | 83–84 | Hatékony és kevésbé hatékony intézményi rendszerek; összegzés | – |

### 5. Tudomány, tudás és technológiatranszfer — `05-tud.html` (85–104)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| tud-gpu | 85–86 | Nyitó eset: a videókártyától az MI-ig | – |
| tud-megismeres | 87–88 | Gyakorlati és tudományos megismerés; Fourier-sortól a Netflixig | – |
| tud-felvilagosodas | 89–91 | Tudományos felvilágosodás, empiricizmus | Á 91 |
| tud-fokozatvaltas | 92–95 | Fokozatváltás: 1. és 2. ipari forradalom; Nordhaus fényára | T/Á 95 |
| tud-innovacio | 96 | Az innovációra épülő fejlődés modellje | folyamatábra HTML-ben |
| tud-transzfer | 97–100 | Tudástranszfer, felzárkózás 1870–1975 | Á 98–100 (egy ábrasorként) |
| tud-humantoke | 101–104 | Emberitőke-elmélet; oktatásban töltött évek; tanulságok | T 102; Á 103 |

### 6. Pénz és pénzügyi piacok — `06-penz.html` (105–115)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| penz-mpesa | 105–106 | Nyitó eset: M-Pesa, Kenya | – |
| penz-szuletes | 107–109 | A pénz születése: barter, árupénz, pénzevolúció | – |
| penz-bankok | 110–111 | A bankok közvetítő szerepe és hatása a növekedésre | – |
| penz-tozsde | 112–113 | Tőzsdék; a pénzügyi rendszer csökkenti a kockázatot | Á 113 |
| penz-harari | 114–115 | Harari: a hitel mint a jövőbe vetett bizalom; összegzés | – |

### 7. Ciklikus ingadozás, buborékok, válságok — `07-ciklus.html` (116–133)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| ciklus-palmstruch | 116–118 | Nyitó eset: az első bankjegy; a pénzügyi rendszer jó és rossz oldala | – |
| ciklus-buborekok | 119–123 | Buborékok a történelemben: tulipánmánia, South Sea, dot-com, kripto | Á 119, 121, 122, 123 (válogatva) |
| ciklus-minsky | 124–126 | Hogyan keletkeznek a buborékok? Minsky–Kindleberger | **Á 125**, 126 |
| ciklus-ponzi | 127–129 | Buborék csalással: Ponzi, Albánia 1996–97 | – |
| ciklus-valsag | 130–133 | Keresleti sokk; a pénzügyi válság reálgazdasági válsággá válik; nagy világválság | Á 130, 132 |

### 8. Versenykényszer és Európa felemelkedése — `08-eur.html` (134–151)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| eur-gutenberg | 134–135 | Nyitó eset: a nyomtatás | – |
| eur-megosztottsag | 136–140 | Európa megosztottsága; verseny vagy háború; az egység átka | Á 136 |
| eur-felfedezok | 141–143 | Felfedezők és az „új” kereskedelem | Á 141/142, 143 |
| eur-gyarmatok | 144–148 | Gyarmatok: a spanyol és az angol út | Á 145, 148 |
| eur-rabszolgasag | 149–151 | Rabszolgaság; Európa felemelkedése mint többtényezős folyamat | Á 150 |

### 9. Fogyasztói társadalom — `09-fogy.html` (152–165)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| fogy-aruhaz | 152–153 | Nyitó eset: az áruház | – |
| fogy-textil | 154–156 | A textilipar felemelkedése; mit kezdenek a rengeteg szövettel? | T 156 |
| fogy-berek | 157–159 | Keleti és nyugati bérek; reálbérek Európában | Á 157; T/Á 158–159 |
| fogy-arnyoldal | 160–161 | Árnyoldalak és jogkiterjesztés | – |
| fogy-20szazad | 162–165 | Totalitárius felzárkózás; USA a háború után; farmer; összegzés | – |

### 10. Munkamorál és értékrend — `10-ert.html` (166–175)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| ert-bosegkep | 166–168 | Nyitó eset: a bőség képzete; összefügg-e értékrend és fejlődés? | – |
| ert-weber | 169–170 | Weber: protestáns etika; vallás és üzlet | – |
| ert-tarsadalmitoke | 171–172 | Társadalmi tőke (Putnam); mi függ mitől? | – |
| ert-meritokracia | 173–175 | Meritokrácia; kölcsönös egymásra hatás | Á 174 |

### 11. Nemzetközi rend: kereskedelempolitika — `11-kerpol.html` (176–185)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| kerpol-hajo | 176–177 | Nyitó eset: egy 3500 éves hajóroncs | – |
| kerpol-vedelem | 178–180 | Nemzetközi intézmények; kereskedelempolitika; növendékipar-védelem | **Á 180** |
| kerpol-ketoldalu | 181–182 | Vámok leépítése 1.: kétoldalú megállapodások | Á 182 |
| kerpol-valsag | 183 | Vámok visszaépítése a nagy világválságban | – |
| kerpol-tobboldalu | 184–185 | Vámok leépítése 2.: GATT/WTO; kereskedelempolitikai rendszerek | T 185 |

### 12. Nemzetközi monetáris rend — `12-monet.html` (186–196)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| monet-vilagpenz | 186–187 | A világpénz előnyei | – |
| monet-arany | 188–189 | Az aranystandard; bukás – feltámadás – bukás | – |
| monet-trilemma | 190–191 | A trilemma | **Á 191** (vagy HTML-háromszög) |
| monet-bretton | 192–193 | Bretton Woods és bukása | – |
| monet-lebego | 194–196 | Lebegő árfolyamok; monetáris rezsimek; a nemzetközi rend mérlege | T 195 |

### 13. Állam, Keynes, tervgazdaság, stagfláció — `13-allam.html` (197–205)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| allam-poroszo | 197–198 | Nyitó eset: a porosz kötelező (társadalom)biztosítás | – |
| allam-fordulat | 199–200 | Gazdaság és állam a 20. századig; az újraelosztási arány; fordulat | – |
| allam-keynes | 201 | Keynes szerepe | – |
| allam-totalitarius | 202–204 | Totalitárius rendszerek: Németország, Szovjetunió (tervutasítás) | Á 203 |
| allam-ortodoxia | 205 | Stagfláció; feltámad az ortodoxia | – |

### 14. A jóléti állam — `14-jolet.html` (206–209)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| jolet-felfutas | 206–207 | A jóléti állam felfutása; intertemporális jövedelem-átcsoportosítás | **Á 207** |
| jolet-miert | 208–209 | Miért az állam? A jóléti állam kompromisszuma | – |

### 15. Szintézis: mit tanít a gazdaságtörténet? — `15-szint.html` (210–213)
| id | dia | Szakasz | Ábrák |
|---|---|---|---|
| szint-forrasok | 210–211 | A hosszú távú fejlődés alapforrásai | – |
| szint-csapda | 212–213 | A fejlettség csapdája; a fejlődés nem végállapot | – |
| szint-essze | – | **Kiegészítés:** esszéírás lépésről lépésre a tantárgyi program Korea-példáján (fogalomválasztás → oksági lánc → szintézis), értékelési szempontokkal | – |

(A `szint-essze` szakasznak nincs diatartománya; a `check.mjs` ezt külön engedi.)

---

## 4. Mérföldkövek

Mindegyik önállóan futtatható a projekt slash-parancsával (Claude Code-ban, ebben a mappában):

```
/tananyag-lepes M0
/tananyag-lepes M1
…
```

A parancs (`.claude/commands/tananyag-lepes.md`) beolvassa ezt a tervet, végrehajtja a megadott mérföldkövet,
lefuttatja az ellenőrzést, kipipálja az alábbi listában, és külön commitot készít. Sorrend: M0 kötelezően első,
utána M1–M8 tetszőleges sorrendben (de ajánlott sorban), M9 a végén.

- [x] **M0 – Infrastruktúra és mintalecke váza**
  `data/sections.js` (a 3. fejezet összes szakasza), `assets/theme.js` kiemelése, `assets/lesson.js`,
  új CSS-dobozok (`def`, `mech`, `eset`, `vita`, `warn`, `practice`, `quiz`, `figure.dia`), `tananyag/index.html`
  tartalomjegyzék, leckesablon (`tananyag/_sablon.html`), `tools/dia-kep.sh`, `tools/check.mjs`;
  `app.js`: „📖 Olvasd el” link, „Tananyag” menüpont/kártya/gomb. Még meg nem írt fejezetre a link a tartalomjegyzékre mutat
  („hamarosan”). Kész, ha: `node tools/check.mjs` lefut, a lefedettség 1–213 hézagmentes, minden kérdés besorolható
  szakaszba, a meglévő oldal változatlanul működik böngészőben (világos/sötét téma).
- [x] **M1 – 1. fejezet: Fejlődés, növekedés és a nyugati recept** (1–35; a leghosszabb, ezért önálló)
- [x] **M2 – 2. Kereskedelem + 3. Népesség** (36–72)
- [x] **M3 – 4. Intézmények + 5. Tudomány és tudás** (73–104)
- [x] **M4 – 6. Pénz + 7. Ciklusok, buborékok, válságok** (105–133)
- [x] **M5 – 8. Európa felemelkedése + 9. Fogyasztói társadalom** (134–165)
- [x] **M6 – 10. Értékrend + 11. Kereskedelempolitika** (166–185)
- [ ] **M7 – 12. Monetáris rend + 13. Állam + 14. Jóléti állam** (186–209)
- [ ] **M8 – 15. Szintézis + esszéfelkészítő + kapcsolódások**
  15. fejezet és `szint-essze`; minden fejezet „Kapcsolódások” részének összefésülése (kölcsönös linkek);
  `tananyag/fogalomtar.html`: az összes [D] fogalom ábécérendben, linkkel a szakaszra.
- [ ] **M9 – Végső ellenőrzés és simítás**
  Teljes `check.mjs`; böngészős bejárás (agent-browser, friss munkamenet): minden fejezet, világos/sötét téma, mobil szélesség,
  egyik kvíz/gyakorló blokk sincs nyitva betöltéskor; ZH-nézetből 10 véletlen kérdés „📖” linkje a jó szakaszra visz;
  helyesírás- és stílusátnézés; README a tananyag szerkezetéről.

### Minden fejezet-mérföldkő (M1–M7) teendői

1. A fejezet diáinak szövege: `pdftotext -f A -l B -layout Fegatt.pdf -`, és az ábrás diák képként is megnézve
   (`pdftoppm -f N -l N -r 80 -png`), hogy semmi ne maradjon ki.
2. A meglévő kérdések átnézése a témakörben → mit kérdez a ZH, mire kell a szövegnek mindenképp kitérnie.
3. Ábrák kivágása (`tools/dia-kep.sh`), táblázatok HTML-be.
4. A fejezet megírása a 1.2 sablon szerint; **minden diának** nyoma legyen a szövegben (a diaszám HTML-kommentben
   vagy `data-dia` attribútumban jelölve, a `check.mjs` ezt is számolja).
5. Új kérdések, amíg minden szakasznak legalább 2 kérdése van; ahol a dia-alapú besorolás rossz, `sec` mező.
6. `node --check data/*.js assets/*.js`, `node tools/check.mjs`, böngészős szemle (agent-browser).
7. A témakör felvétele a `data/sections.js` `LESSONS_READY` listájába (ettől kezdve a kvízek „📖 Olvasd el” linkje
   és a tartalomjegyzék a fejezetre mutat).
8. A terv mérföldkő-sorának kipipálása, commit: „Tananyag: <fejezetcím(ek)>”.

**Gyakorlati tudnivalók (M0 után):**
- Új fejezet: `cp tananyag/_sablon.html tananyag/NN-<t>.html`; a sablon fejkommentje összefoglalja a szabályokat.
- A lefedettséget a tartalmi elemek `data-dia="8"` / `data-dia="7-10"` attribútuma jelöli (a `<section>` sajátja nem számít).
- Az útiterv (`ol.roadmap[data-roadmap]`), a lapozó (`nav.lesson-nav[data-chapter]`) és a kvízek
  (`details.quiz[data-section]`, `details.quiz[data-topic]`) összefoglaló sora üresen hagyva automatikusan töltődik.
- Ábra: `tools/dia-kep.sh 55` (teljes dia) vagy `tools/dia-kep.sh 55 x y w h -n utotag` (kivágás, 150 dpi-s képpontban;
  egy dia 2000×1125 px).
- Fotószerű képeknél (festmény, fénykép, kézirat) a 256 színes PNG nagy marad: ezeket max. 1000 px szélesre kicsinyítve
  JPEG-be (`dia-NNN.jpg`, minőség 80) érdemes menteni; a térképeket és sűrű ábrákat elég 1000 px szélesre kicsinyíteni.
- Böngészős szemléhez: `python3 -m http.server` a projekt gyökerében (a leckeoldalak `file://`-ról is működnek).

### Ellenőrzés (`tools/check.mjs`) – mit néz?

- `SECTIONS`: egyedi id-k, létező témakör, a diatartományok hézag és átfedés nélkül lefedik az 1–213-at.
- Minden kérdés: van `hint`, `ex`, 3 rossz válasz, és besorolható szakaszba; szakaszonkénti kérdésszám (figyelmeztetés < 2 esetén).
- Minden megírt leckeoldal: minden saját szakasz-`id` létezik; minden `href="…#x"` létező horgonyra mutat;
  minden `img` fájl létezik; nincs `details.practice[open]` / `details.quiz[open]`; a `data-dia` jelölések lefedik a fejezet diáit.
- Összesítő: hány fejezet kész, hány dia van lefedve szöveggel, hány kérdés szakaszonként.

---

## 5. Nyitott kérdések / döntések (alapértelmezés zárójelben)

- Videómagyarázatok nem állnak rendelkezésre; a kiegészítések a kötelező irodalom szellemében, jelölve készülnek.
  (Ha megvannak a videók átiratai, a `resources` mappába téve a mérföldkövek felhasználják őket.)
- Az ábrák a diasorból kivágott képek; ha az oldal nyilvános lesz (GitHub Pages), a harmadik féltől származó ábrák
  (Economist, Our World in Data stb.) forrását a képaláírás mindig megnevezi. (Alapértelmezés: átvesszük, forrással.)
