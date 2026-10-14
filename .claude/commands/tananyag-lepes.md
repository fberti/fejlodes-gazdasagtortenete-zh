---
description: A TERV.md egy mérföldkövének végrehajtása (pl. /tananyag-lepes M3)
argument-hint: M0 | M1 | … | M9
---

Hajtsd végre a `TERV.md` **$ARGUMENTS** mérföldkövét.

1. Olvasd el a teljes `TERV.md`-t (architektúra, fejezetsablon, a 3. fejezet szakasztáblázata, a mérföldkő leírása),
   és töltsd be a `tananyag` skillt. Ha a terv és a skill eltér, a terv dönt (pl. számolós feladatok helyett esszé-stílusú
   „Gondold végig” kérdések; KaTeX nem kell).
2. Ellenőrizd az előfeltételt: M1–M9 előtt az M0-nak késznek kell lennie (`TERV.md`-ben kipipálva, `tools/check.mjs` létezik).
   Ha nincs kész, állj meg és szólj.
3. Forrás: `/forlinux/MEGA/MEGABase/obsidian/Vault/ME/ACTIVE/A fejlődés gazdaságtörténete/resources/Fegatt.pdf`
   (diasor), `gtgvo120bl.pdf` (tantárgyi program), `minta_fegatt.pdf` (mintazh). A fejezet minden diáját olvasd el
   szövegként (`pdftotext -f A -l B -layout`), az ábrás/táblázatos diákat képként is nézd meg (`pdftoppm -r 80 -png`
   egy ideiglenes mappába, majd Read).
4. Fejezet-mérföldkőnél kövesd a terv „Minden fejezet-mérföldkő teendői” listáját: a szöveg legyen kerek, folyó,
   könnyen olvasható, tegező; minden dia tartalma jelenjen meg; a diákon kívüli magyarázat „Kiegészítés” jelölést kap.
   Minden szakasz végén csukott „Gondold végig” blokk és csukott kvíz; fejezet végén összefoglalás, esszétáblázat,
   kapcsolódások, link a témakör-gyakorláshoz. Új kvízkérdésekkel érd el, hogy minden szakasznak legalább 2 kérdése legyen.
5. Ellenőrzés: `node --check` az összes módosított JS-re, `node tools/check.mjs` hiba nélkül, böngészős szemle
   agent-browserrel friss munkamenetben (világos és sötét téma; betöltéskor egy kvíz/gyakorló blokk sincs nyitva;
   a ZH-nézetből a „📖 Olvasd el” link a jó szakaszra visz).
6. Pipáld ki a mérföldkövet a `TERV.md`-ben, és készíts egy commitot (`Tananyag: <mérföldkő címe>`).
7. Végül röviden számolj be: mi készült el, hány új kérdés, mely diákat dolgoztad fel ábraként, maradt-e nyitott kérdés.
