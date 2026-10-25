# 🦊 Mathsapp

Een persoonlijke rekenapp in Duolingo-stijl: tafels, delingen en hoofdrekenen,
in rondes van twee minuten. Werkt offline en installeer je op je Android-gsm
als een gewone app.

## Op je gsm zetten

1. **GitHub Pages aanzetten (eenmalig).** Ga in deze repository naar
   *Settings → Pages*. Kies bij *Source* voor **Deploy from a branch**,
   selecteer de branch `claude/duolingo-math-android-app-ll7ly5` en de map
   `/ (root)`, en klik op *Save*. Na een minuutje staat de app op
   **https://benzken.github.io/test/**
2. **Openen in Chrome** op je gsm via die link.
3. **Installeren:** tik op de knop "Zet Mathsapp op je startscherm" in de app,
   of kies in het Chrome-menu (⋮) voor **App installeren** /
   **Toevoegen aan startscherm**.

Daarna start je Mathsapp gewoon vanaf je startscherm, ook zonder internet.

## Wat zit erin (versie 0.2)

- **Leerpad met 7 units:** tafels van 1 tot 12, delen door 2 tot 12, en een
  eindunit met alles door elkaar.
- **Slimme herhaling:** elk feit (zoals 7 × 8) wordt apart bijgehouden, op
  juistheid én snelheid. Wat je moeilijk vindt, komt vaker terug.
- **Trucjes:** een korte uitleg bij elke nieuwe stap, en bij een fout een hint
  die uitrekent hoe je dát feit sneller vindt.
- **Blitz:** 60 seconden, zoveel mogelijk juiste antwoorden.
- **Fouten herhalen**, een **tafelrooster** dat groen kleurt, een
  **streak** en een **dagdoel**.
- **Niveautest:** bij elke unit kan je "Spring hierheen" kiezen om over te
  slaan wat je al kent.

## Back-up

Alle voortgang staat lokaal op je gsm. Via *Instellingen → Back-up opslaan*
bewaar je die als bestand, en zet je ze later terug.

## Voor de ontwikkelaar

Geen build-stap, gewoon HTML, CSS en JavaScript-modules.

| Bestand | Inhoud |
|---|---|
| `js/data.js` | Leerpad, units, trucjes en teksten |
| `js/engine.js` | Feiten, geheugen per feit, opbouw van rondes, hints |
| `js/store.js` | Opslag, streak, dagdoel, back-up |
| `js/app.js` | Schermen en interactie |
| `sw.js` | Offline cache. **Verhoog `VERSION` bij elke wijziging.** |

Lokaal testen: `python3 -m http.server` in deze map en open
`http://localhost:8000`.
