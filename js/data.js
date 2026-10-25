// Leerpad, trucjes en teksten. Alle inhoud van de app staat hier,
// zodat nieuwe units toevoegen vooral een kwestie van data is.

export const TIPS = {
  t1_10: {
    title: 'Tafel van 1 en 10',
    body: 'Maal 1 verandert niets: 7 × 1 = 7. Maal 10 zet je gewoon een 0 achter het getal.',
    example: '8 × 10 = 80',
  },
  t2: {
    title: 'Tafel van 2: verdubbelen',
    body: 'Maal 2 is het getal bij zichzelf optellen. Dat doe je sneller dan je denkt.',
    example: '7 × 2 = 7 + 7 = 14',
  },
  t5: {
    title: 'Tafel van 5: de helft van 10',
    body: 'Reken eerst maal 10 en neem dan de helft. Een antwoord van de tafel van 5 eindigt altijd op 0 of 5.',
    example: '8 × 5 → 80, helft = 40',
  },
  wissel: {
    title: 'De wisseltruc',
    body: '3 × 7 is hetzelfde als 7 × 3. Kies altijd de kant die jij het makkelijkst vindt. Zo valt bijna de helft van alle tafels weg!',
    example: '9 × 2 = 2 × 9 = 18',
  },
  t3: {
    title: 'Tafel van 3: maal 2 en nog eens erbij',
    body: 'Verdubbel het getal en tel het er nog één keer bij. Controle: de cijfers van een antwoord uit de tafel van 3 tellen op tot 3, 6 of 9.',
    example: '3 × 7 = 14 + 7 = 21 (2 + 1 = 3 ✓)',
  },
  t4: {
    title: 'Tafel van 4: twee keer verdubbelen',
    body: 'Maal 4 is twee keer na elkaar verdubbelen.',
    example: '4 × 7 → 14 → 28',
  },
  t6: {
    title: 'Tafel van 6: maal 5 plus één keer',
    body: 'Neem maal 5 en tel het getal er nog één keer bij. Bonus: 6 maal een even getal eindigt op dat getal.',
    example: '6 × 7 = 35 + 7 = 42 · 6 × 8 = 48',
  },
  t9: {
    title: 'Tafel van 9: maal 10 min één keer',
    body: 'Reken maal 10 en trek het getal er één keer af. De cijfers van het antwoord tellen altijd op tot 9.',
    example: '9 × 7 = 70 − 7 = 63 (6 + 3 = 9 ✓)',
  },
  t8: {
    title: 'Tafel van 8: drie keer verdubbelen',
    body: 'Maal 8 is drie keer na elkaar verdubbelen.',
    example: '8 × 6 → 12 → 24 → 48',
  },
  t7: {
    title: 'Tafel van 7: splitsen in 5 en 2',
    body: 'Splits 7 in 5 + 2 en tel de twee stukjes op. Ezelsbrug voor de lastigste: 5, 6, 7, 8 → 56 = 7 × 8.',
    example: '7 × 6 = 30 + 12 = 42',
  },
  kwadraat: {
    title: 'Kwadraten als anker',
    body: 'Ken je 6 × 6, 7 × 7 en 8 × 8 uit je hoofd? Dan zit je naast elk lastig feit maar één stapje ernaast.',
    example: '7 × 8 = 7 × 7 + 7 = 49 + 7 = 56',
  },
  t11: {
    title: 'Tafel van 11: het cijfer dubbel',
    body: 'Tot 9 schrijf je het cijfer gewoon twee keer. Voor 10, 11 en 12: reken maal 10 en tel het getal erbij.',
    example: '11 × 7 = 77 · 11 × 12 = 120 + 12 = 132',
  },
  t12: {
    title: 'Tafel van 12: maal 10 plus maal 2',
    body: 'Splits 12 in 10 + 2. Maal 10 is makkelijk, maal 2 is verdubbelen.',
    example: '12 × 7 = 70 + 14 = 84',
  },
  delen: {
    title: 'Delen is de tafel achterstevoren',
    body: 'Bij 56 : 7 vraag je je af: 7 maal hoeveel is 56? Ken je je tafels, dan ken je je delingen.',
    example: '56 : 7 → 7 × 8 = 56 → 8',
  },
  delen5: {
    title: 'Delen door 5: maal 2 en dan door 10',
    body: 'Verdubbel het getal en haal de 0 weg.',
    example: '45 : 5 → 90 → 9',
  },
  delen4: {
    title: 'Delen door 4 en 8: halveren',
    body: 'Delen door 4 is twee keer halveren. Delen door 8 is drie keer halveren.',
    example: '48 : 8 → 24 → 12 → 6',
  },
  delen9: {
    title: 'Delen door 9: kijk naar het tiental',
    body: 'Bij een getal uit de tafel van 9 (tot 90) is het antwoord het tiental plus 1.',
    example: '63 : 9 → 6 + 1 = 7',
  },
  delen12: {
    title: 'Delen door 11 en 12',
    body: 'Door 11: bij 22, 33, 44 … is het antwoord gewoon het cijfer. Door 12: deel door 6 en halveer daarna.',
    example: '84 : 12 → 84 : 6 = 14 → 7',
  },
  ontbrekend: {
    title: 'Het ontbrekende getal',
    body: 'Bij 7 × ? = 56 zoek je eigenlijk de deling 56 : 7. Vermenigvuldigen en delen zijn twee kanten van hetzelfde feit.',
    example: '7 × ? = 56 → 56 : 7 = 8',
  },
  snelheid: {
    title: 'Weten, niet tellen',
    body: 'Het doel is dat je het antwoord ziet zonder te rekenen. Twijfel je? Gebruik het trucje, maar zeg het antwoord daarna nog eens in je hoofd. Zo slijt het in.',
    example: '7 × 8 … 56!',
  },
};

// Een node is één bolletje op het pad.
//   mul: tafels die vermenigvuldigd worden, div: delers
//   formats: welke vraagvormen mogen voorkomen
export const UNITS = [
  {
    id: 'u1', title: 'Makkelijke tafels', subtitle: 'Tafels van 1, 2, 5 en 10', color: 'orange',
    nodes: [
      { id: 'u1n1', title: '× 1 en × 10', icon: '1', mul: [1, 10], tip: 't1_10' },
      { id: 'u1n2', title: 'Tafel van 2', icon: '2', mul: [2], tip: 't2' },
      { id: 'u1n3', title: 'Tafel van 5', icon: '5', mul: [5], tip: 't5' },
      { id: 'u1n4', title: 'De wisseltruc', icon: '⇄', mul: [2, 5, 10], tip: 'wissel' },
      { id: 'u1n5', title: 'Herhaling', icon: '★', mul: [1, 2, 5, 10], review: true },
    ],
  },
  {
    id: 'u2', title: 'Middelste tafels', subtitle: 'Tafels van 3, 4 en 6', color: 'blue',
    nodes: [
      { id: 'u2n1', title: 'Tafel van 3', icon: '3', mul: [3], tip: 't3' },
      { id: 'u2n2', title: 'Tafel van 4', icon: '4', mul: [4], tip: 't4' },
      { id: 'u2n3', title: 'Tafel van 6', icon: '6', mul: [6], tip: 't6' },
      { id: 'u2n4', title: 'Mix 3, 4, 6', icon: '✦', mul: [3, 4, 6] },
      { id: 'u2n5', title: 'Herhaling', icon: '★', mul: [2, 3, 4, 5, 6, 10], review: true },
    ],
  },
  {
    id: 'u3', title: 'Moeilijke tafels', subtitle: 'Tafels van 7, 8 en 9', color: 'purple',
    nodes: [
      { id: 'u3n1', title: 'Tafel van 9', icon: '9', mul: [9], tip: 't9' },
      { id: 'u3n2', title: 'Tafel van 8', icon: '8', mul: [8], tip: 't8' },
      { id: 'u3n3', title: 'Tafel van 7', icon: '7', mul: [7], tip: 't7' },
      { id: 'u3n4', title: 'Kwadraten', icon: '■', mul: [6, 7, 8, 9], tip: 'kwadraat', squaresFocus: true },
      { id: 'u3n5', title: 'Mix 7, 8, 9', icon: '✦', mul: [7, 8, 9] },
      { id: 'u3n6', title: 'Herhaling', icon: '★', mul: [3, 4, 6, 7, 8, 9], review: true },
    ],
  },
  {
    id: 'u4', title: 'Tafels van 11 en 12', subtitle: 'De grote tafels', color: 'pink',
    nodes: [
      { id: 'u4n1', title: 'Tafel van 11', icon: '11', mul: [11], tip: 't11' },
      { id: 'u4n2', title: 'Tafel van 12', icon: '12', mul: [12], tip: 't12' },
      { id: 'u4n3', title: 'Mix 11 en 12', icon: '✦', mul: [11, 12] },
      { id: 'u4n4', title: 'Alle tafels', icon: '★', mul: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12], review: true, tip: 'snelheid' },
    ],
  },
  {
    id: 'u5', title: 'Delen, deel 1', subtitle: 'Delen door 2, 3, 4, 5 en 10', color: 'teal',
    nodes: [
      { id: 'u5n1', title: 'Delen door 2 en 10', icon: ':', div: [2, 10], tip: 'delen' },
      { id: 'u5n2', title: 'Delen door 5', icon: ':5', div: [5], tip: 'delen5' },
      { id: 'u5n3', title: 'Delen door 3', icon: ':3', div: [3], tip: 'delen' },
      { id: 'u5n4', title: 'Delen door 4', icon: ':4', div: [4], tip: 'delen4' },
      { id: 'u5n5', title: 'Herhaling', icon: '★', div: [2, 3, 4, 5, 10], review: true },
    ],
  },
  {
    id: 'u6', title: 'Delen, deel 2', subtitle: 'Delen door 6 tot 12', color: 'green',
    nodes: [
      { id: 'u6n1', title: 'Delen door 6', icon: ':6', div: [6], tip: 'delen' },
      { id: 'u6n2', title: 'Delen door 9', icon: ':9', div: [9], tip: 'delen9' },
      { id: 'u6n3', title: 'Delen door 8', icon: ':8', div: [8], tip: 'delen4' },
      { id: 'u6n4', title: 'Delen door 7', icon: ':7', div: [7], tip: 'delen' },
      { id: 'u6n5', title: 'Delen door 11 en 12', icon: ':12', div: [11, 12], tip: 'delen12' },
      { id: 'u6n6', title: 'Herhaling', icon: '★', div: [6, 7, 8, 9, 11, 12], review: true },
    ],
  },
  {
    id: 'u7', title: 'Tafelmeester', subtitle: 'Alles door elkaar, op snelheid', color: 'gold',
    nodes: [
      { id: 'u7n1', title: 'Ontbrekend getal', icon: '?', mul: [3, 4, 6, 7, 8, 9, 12], formats: ['missing'], tip: 'ontbrekend' },
      { id: 'u7n2', title: 'Maal en delen', icon: '×:', mul: [3, 4, 6, 7, 8, 9], div: [3, 4, 6, 7, 8, 9] },
      { id: 'u7n3', title: 'Waar of niet waar', icon: '✓', mul: [6, 7, 8, 9, 11, 12], div: [6, 7, 8, 9], formats: ['tf', 'input'] },
      { id: 'u7n4', title: 'Eindbaas', icon: '👑', mul: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12], div: [2, 3, 4, 5, 6, 7, 8, 9, 11, 12], review: true, boss: true },
    ],
  },
];

// Wat er na het prototype nog komt. Getoond als "binnenkort" op het pad.
export const COMING_SOON = [
  { title: 'Optellen en aftrekken', subtitle: 'Tot 100 en tot 1000, met slimme trucjes' },
  { title: 'Groter vermenigvuldigen', subtitle: '7 × 48, 25 × 16, maal 11' },
  { title: 'Groter delen', subtitle: '144 : 12, delen door 5 en 25' },
  { title: 'Procenten', subtitle: 'Korting, btw en fooi uit je hoofd' },
  { title: 'Breuken en kommagetallen', subtitle: '½, ¼, 0,75 en hun procent' },
];

export const BONUS_SOON = [
  'Eenvoudige vergelijkingen', 'Kwadraten en wortels', 'Schatten', 'Getallenreeksen', 'Voorrangsregels',
];

export const PRAISE = ['Goed zo!', 'Straf!', 'Top!', 'Vlot!', 'Juist!', 'Mooi!', 'Dat zit erin!', 'Netjes!'];
export const PRAISE_FAST = ['Amai, snel!', 'Bliksemsnel!', 'Raket!', 'Zonder nadenken!'];
export const ENCOURAGE = ['Bijna!', 'Niet erg!', 'Volgende keer!', 'Onthoud deze:'];
