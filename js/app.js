import { UNITS, TIPS, COMING_SOON, BONUS_SOON, PRAISE, PRAISE_FAST, ENCOURAGE } from './data.js';
import * as store from './store.js';
import { state } from './store.js';
import * as E from './engine.js';
import { sfx, unlockAudio } from './sound.js';
import { mascot, piSvg } from './mascot.js';

const VERSION = '0.3.0';
const BLITZ_SECONDS = 60;

const app = document.getElementById('app');
const ui = {
  screen: state.welcomed ? 'home' : 'welcome',
  tab: 'path',
  sheet: null,       // { type: 'node', id } | { type: 'tip', id }
  lesson: null,
  result: null,
  statsMode: 'mul',
  scrollToCurrent: true,
};

let deferredInstall = null;
let pendingReload = false;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nodeById = (id) => E.NODES.find((n) => n.id === id);
const fmtSec = (ms) => (ms / 1000).toFixed(1).replace('.', ',');

// ---------- Rendering ----------

function render() {
  if (ui.screen === 'welcome') app.innerHTML = welcomeView();
  else if (ui.screen === 'lesson') return renderLesson();
  else if (ui.screen === 'result') app.innerHTML = resultView();
  else if (ui.screen === 'settings') app.innerHTML = settingsView();
  else app.innerHTML = homeView();

  if (ui.screen === 'home' && ui.tab === 'path' && ui.scrollToCurrent) {
    ui.scrollToCurrent = false;
    requestAnimationFrame(() => {
      const el = app.querySelector('.node.current') || [...app.querySelectorAll('.node.done')].pop();
      if (el) el.scrollIntoView({ block: 'center' });
    });
  }
  if (ui.screen === 'result' && ui.result.celebrate) confetti();
}

function welcomeView() {
  return `
  <div class="welcome">
    ${mascot('cheer', 'huge bounce')}
    <h1>Hoi Ma 'Nilla!</h1>
    <p>Ik ben Pi, je rekenmaatje. Welkom bij Mathsapp! Elke dag een paar rondes van twee minuten en je tafels zitten er binnenkort ingebakken.</p>
    <p class="muted">Ken je je tafels al een beetje? Doe dan de niveautest, dan sla je over wat je al kent.</p>
    <div class="stack">
      <button class="btn primary c-blue" data-action="welcome-start">Begin bij het begin</button>
      <button class="btn ghost" data-action="welcome-test">Doe de niveautest</button>
    </div>
  </div>`;
}

function topbar() {
  const streak = store.currentStreak();
  const activeToday = state.lastDay === store.today();
  return `
  <header class="topbar">
    <div class="brand">${mascot()}<span>Mathsapp</span></div>
    <div class="top-stats">
      <span class="pill streak ${activeToday ? 'on' : ''}" title="Streak">🔥 ${streak}</span>
      <span class="pill xp" title="XP">⚡ ${state.xp}</span>
      <button class="icon-btn" data-action="settings" aria-label="Instellingen">⚙️</button>
    </div>
  </header>`;
}

function homeView() {
  const tabs = [
    ['path', '🗺️', 'Pad'],
    ['practice', '🎯', 'Oefenen'],
    ['stats', '📊', 'Tafels'],
    ['tips', '💡', 'Trucjes'],
  ];
  const content = { path: pathView, practice: practiceView, stats: statsView, tips: tipsView }[ui.tab]();
  return `
  <div class="home">
    ${topbar()}
    <main class="tab-content">${content}</main>
    ${ui.tab === 'path' ? `<button class="fab btn primary c-blue" data-action="play">▶ ${E.allDone() ? 'Slim oefenen' : 'Speel verder'}</button>` : ''}
    <nav class="tabbar">
      ${tabs.map(([id, icon, label]) => `
        <button class="tab ${ui.tab === id ? 'active' : ''}" data-action="tab" data-tab="${id}">
          <span class="tab-icon">${icon}</span><span>${label}</span>
        </button>`).join('')}
    </nav>
    ${sheetView()}
  </div>`;
}

function dailyView() {
  const done = store.dailyRounds();
  const goal = state.settings.dailyGoal;
  const pct = Math.min(100, Math.round((done / goal) * 100));
  return `
  <div class="daily ${done >= goal ? 'met' : ''}">
    <div class="daily-text">${done >= goal ? '🎉 Dagdoel gehaald!' : `🎯 Dagdoel: ${done} van ${goal} rondes`}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
  </div>`;
}

const ZIGZAG = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

function pathView() {
  const installed = window.matchMedia('(display-mode: standalone)').matches;
  let html = '';
  if (deferredInstall && !installed) {
    html += `<button class="install-banner" data-action="install">📲 Zet Mathsapp op je startscherm</button>`;
  }
  html += dailyView();
  let zi = 0;
  UNITS.forEach((unit, ui_) => {
    const first = E.NODES.find((n) => n.unitIndex === ui_);
    const unitLocked = E.nodeStatus(first) === 'locked';
    html += `
    <section class="unit c-${unit.color} ${unitLocked ? 'locked' : ''}">
      <div class="unit-banner">
        <div>
          <div class="unit-label">Unit ${ui_ + 1}</div>
          <h2>${unit.title}</h2>
          <p>${unit.subtitle}</p>
        </div>
        ${unitLocked ? `<button class="jump-btn" data-action="jump" data-unit="${ui_}">Spring<br>hierheen</button>` : ''}
      </div>
      <div class="nodes">
        ${unit.nodes.map((n) => {
          const node = nodeById(n.id);
          const status = E.nodeStatus(node);
          const pct = Math.round((E.nodeProgress(node) / E.roundsNeeded(node)) * 100);
          const x = ZIGZAG[zi++ % ZIGZAG.length];
          return `
          <div class="node-row" style="--x:${x}">
            ${status === 'current' ? '<div class="start-bubble">START</div>' : ''}
            <button class="node ${status} ${node.review ? 'review' : ''}" style="--p:${pct}" data-action="node" data-id="${node.id}" aria-label="${node.title}">
              <span class="node-face">${status === 'locked' ? '🔒' : node.icon}</span>
            </button>
            ${status === 'current' ? `<div class="node-mascot" style="--side:${x > 0 ? -1 : 1}">${piSvg()}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </section>`;
  });
  html += COMING_SOON.map((c) => `
    <section class="unit soon">
      <div class="unit-banner"><div><div class="unit-label">Binnenkort</div><h2>${c.title}</h2><p>${c.subtitle}</p></div></div>
    </section>`).join('');
  html += `
    <section class="unit soon bonus">
      <div class="unit-banner"><div><div class="unit-label">🧩 Bonusparcours · binnenkort</div><h2>Uitdagingen</h2><p>${BONUS_SOON.join(' · ')}</p></div></div>
    </section>`;
  return `<div class="path">${html}<div class="path-end"></div></div>`;
}

function practiceView() {
  const mistakes = E.mistakeFacts().length;
  return `
  <div class="page">
    <h1>Oefenen</h1>
    <button class="card c-blue" data-action="practice">
      <span class="card-icon">🎯</span>
      <span><b>Slim oefenen</b><small>10 oefeningen uit alles wat je al kent. Je zwakke plekken krijgen voorrang.</small></span>
    </button>
    <button class="card c-gold" data-action="blitz">
      <span class="card-icon">⚡</span>
      <span><b>Blitz</b><small>Zoveel mogelijk juiste antwoorden in ${BLITZ_SECONDS} seconden. Je record: ${state.blitzBest}</small></span>
    </button>
    <button class="card c-pink ${mistakes ? '' : 'disabled'}" data-action="mistakes">
      <span class="card-icon">🔁</span>
      <span><b>Fouten herhalen</b><small>${mistakes ? `${mistakes} ${mistakes === 1 ? 'feit' : 'feiten'} die je onlangs fout had.` : 'Geen recente fouten. Straf!'}</small></span>
    </button>
    <div class="card soon">
      <span class="card-icon">🧩</span>
      <span><b>Bonusparcours</b><small>Binnenkort: ${BONUS_SOON.slice(0, 3).join(', ').toLowerCase()} en meer.</small></span>
    </div>
  </div>`;
}

function levelClass(key) {
  const l = E.factLevel(key);
  return l < 0 ? 'lvl-none' : `lvl-${l}`;
}

function statsView() {
  const mulKeys = new Set();
  for (let a = 1; a <= 12; a++) for (let b = a; b <= 12; b++) mulKeys.add(E.mulKey(a, b));
  const mastered = [...mulKeys].filter((k) => E.factLevel(k) >= E.MASTERED_BOX).length;
  const divKeys = [];
  for (let d = 2; d <= 12; d++) for (let q = 1; q <= (d >= 11 ? 12 : 10); q++) divKeys.push(E.divKey(d, q));
  const divMastered = divKeys.filter((k) => E.factLevel(k) >= E.MASTERED_BOX).length;

  let grid = '';
  if (ui.statsMode === 'mul') {
    grid += '<div class="grid g13"><div class="gh corner">×</div>';
    for (let b = 1; b <= 12; b++) grid += `<div class="gh">${b}</div>`;
    for (let a = 1; a <= 12; a++) {
      grid += `<div class="gh">${a}</div>`;
      for (let b = 1; b <= 12; b++) {
        const k = E.mulKey(a, b);
        grid += `<button class="gc ${levelClass(k)}" data-action="cell" data-key="${k}" data-label="${a} × ${b} = ${a * b}"></button>`;
      }
    }
    grid += '</div>';
  } else {
    grid += '<div class="grid g13"><div class="gh corner">:</div>';
    for (let q = 1; q <= 12; q++) grid += `<div class="gh">${q}</div>`;
    for (let d = 2; d <= 12; d++) {
      grid += `<div class="gh">${d}</div>`;
      for (let q = 1; q <= 12; q++) {
        if (q > (d >= 11 ? 12 : 10)) { grid += '<div class="gc empty"></div>'; continue; }
        const k = E.divKey(d, q);
        grid += `<button class="gc ${levelClass(k)}" data-action="cell" data-key="${k}" data-label="${d * q} : ${d} = ${q}"></button>`;
      }
    }
    grid += '</div><p class="muted small">Rij = waardoor je deelt, kolom = de uitkomst.</p>';
  }

  const weak = E.weakestFacts(6);
  return `
  <div class="page">
    <h1>Jouw tafels</h1>
    <div class="tiles">
      <div class="tile"><b>${mastered}/${mulKeys.size}</b><span>maal beheerst</span></div>
      <div class="tile"><b>${divMastered}/${divKeys.length}</b><span>delen beheerst</span></div>
      <div class="tile"><b>${state.bestStreak}</b><span>beste streak</span></div>
      <div class="tile"><b>${state.rounds}</b><span>rondes</span></div>
    </div>
    <div class="seg">
      <button class="${ui.statsMode === 'mul' ? 'active' : ''}" data-action="stats-mode" data-mode="mul">Maal ×</button>
      <button class="${ui.statsMode === 'div' ? 'active' : ''}" data-action="stats-mode" data-mode="div">Delen :</button>
    </div>
    ${grid}
    <div class="legend">
      <span><i class="lvl-none"></i>Nieuw</span><span><i class="lvl-0"></i>Lastig</span><span><i class="lvl-2"></i>Bezig</span>
      <span><i class="lvl-3"></i>Bijna</span><span><i class="lvl-5"></i>Beheerst</span>
    </div>
    <p class="muted small">Groen wordt het pas als je een feit juist én snel weet, een paar keer na elkaar.</p>
    ${weak.length ? `
      <h2>Jouw lastigste</h2>
      <div class="weak-list">${weak.map(({ key, f }) => `<div class="weak"><b>${labelForKey(key)}</b><span>${Math.round((f.correct / f.seen) * 100)}% juist${f.avgMs ? ` · ${fmtSec(f.avgMs)} s` : ''}</span></div>`).join('')}</div>
      <p class="muted small">Die krijg je vaker te zien, vanzelf.</p>` : ''}
  </div>`;
}

function labelForKey(key) {
  const [kind, rest] = key.split(':');
  const [x, y] = rest.split('x').map(Number);
  return kind === 'm' ? `${x} × ${y} = ${x * y}` : `${x * y} : ${x} = ${y}`;
}

function tipUnlocked(tipId) {
  if (state.tipsSeen[tipId]) return true;
  return E.NODES.some((n) => n.tip === tipId && E.nodeStatus(n) !== 'locked');
}

function tipsView() {
  const order = [...new Set(E.NODES.filter((n) => n.tip).map((n) => n.tip))];
  const open = order.filter(tipUnlocked);
  return `
  <div class="page">
    <h1>Trucjesboek</h1>
    <p class="muted">${open.length} van ${order.length} trucjes ontgrendeld. Je vindt er meer naarmate je verder op het pad komt.</p>
    ${order.map((id) => tipUnlocked(id) ? tipCard(id) : `
      <div class="tip-card locked"><div class="tip-title">🔒 Nog verborgen</div><p>Speel verder op het pad om dit trucje te ontgrendelen.</p></div>`).join('')}
  </div>`;
}

function tipCard(id) {
  const t = TIPS[id];
  return `
  <div class="tip-card">
    <div class="tip-title">💡 ${t.title}</div>
    <p>${t.body}</p>
    <div class="tip-example">${t.example}</div>
  </div>`;
}

function sheetView() {
  if (!ui.sheet) return '';
  let inner = '';
  let color = 'blue';
  if (ui.sheet.type === 'tip') {
    inner = `${tipCard(ui.sheet.id)}<button class="btn primary c-blue" data-action="close-sheet">Begrepen</button>`;
  } else {
    const node = nodeById(ui.sheet.id);
    color = node.unit.color;
    const status = E.nodeStatus(node);
    const need = E.roundsNeeded(node);
    const prog = E.nodeProgress(node);
    const dots = Array.from({ length: need }, (_, i) => `<span class="dot ${i < prog ? 'on' : ''}"></span>`).join('');
    const statusText = status === 'done' ? 'Voltooid ✓ Je kan altijd opnieuw oefenen.'
      : status === 'current' ? `Ronde ${prog + 1} van ${need}`
        : 'Nog op slot. Speel eerst de bolletjes ervoor.';
    inner = `
      <div class="sheet-head">
        <div class="sheet-icon">${node.icon}</div>
        <div><div class="sheet-title">${node.title}</div><div class="sheet-sub">Unit ${node.unitIndex + 1} · ${node.unit.title}</div></div>
      </div>
      <div class="dots">${dots}</div>
      <p class="sheet-status">${statusText}</p>
      ${node.tip && status !== 'locked' ? `<button class="btn ghost" data-action="show-tip" data-tip="${node.tip}">💡 ${TIPS[node.tip].title}</button>` : ''}
      ${status === 'locked'
        ? '<button class="btn disabled" disabled>🔒 Op slot</button>'
        : `<button class="btn primary c-${color}" data-action="start-node" data-id="${node.id}">${status === 'done' ? 'Opnieuw oefenen' : 'Start'}</button>`}`;
  }
  return `
    <div class="sheet-backdrop" data-action="close-sheet"></div>
    <div class="sheet c-${color}">${inner}</div>`;
}

function settingsView() {
  const s = state.settings;
  const installed = window.matchMedia('(display-mode: standalone)').matches;
  return `
  <div class="settings">
    <header class="subbar"><button class="icon-btn" data-action="back">←</button><h1>Instellingen</h1></header>
    <div class="page">
      <h2>Dagdoel</h2>
      <div class="seg">
        ${[1, 3, 5, 10].map((g) => `<button class="${s.dailyGoal === g ? 'active' : ''}" data-action="goal" data-goal="${g}">${g} ${g === 1 ? 'ronde' : 'rondes'}</button>`).join('')}
      </div>
      <h2>Geluid en trillen</h2>
      <label class="toggle"><span>🔊 Geluid</span><input type="checkbox" data-action="toggle" data-key="sound" ${s.sound ? 'checked' : ''}></label>
      <label class="toggle"><span>📳 Trillen</span><input type="checkbox" data-action="toggle" data-key="vibrate" ${s.vibrate ? 'checked' : ''}></label>
      ${deferredInstall && !installed ? `<h2>App</h2><button class="btn primary c-blue" data-action="install">📲 Zet op startscherm</button>` : ''}
      <h2>Back-up</h2>
      <p class="muted small">Je voortgang staat enkel op deze gsm. Wis je ooit de gegevens van Chrome, dan ben je ze kwijt. Maak af en toe een back-up.</p>
      <button class="btn ghost" data-action="export">💾 Back-up opslaan</button>
      <button class="btn ghost" data-action="import">📂 Back-up terugzetten</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
      <h2>Opnieuw beginnen</h2>
      <button class="btn danger-ghost" data-action="reset">🗑️ Alle voortgang wissen</button>
      <p class="muted small center">Mathsapp ${VERSION} · gemaakt voor Ma 'Nilla</p>
    </div>
  </div>`;
}

// ---------- Les ----------

function startLesson(opts, { replace = false } = {}) {
  unlockAudio();
  const L = {
    mode: opts.mode, node: opts.node || null, unit: opts.unit ?? null,
    items: [], idx: 0, initial: 0, resolved: 0, firstTry: 0, mistakes: 0, xp: 0, times: [],
    typed: '', locked: false, t0: 0, timers: [], intro: null, finished: false,
    wasDone: opts.node ? E.isDone(opts.node) : false,
  };
  let questions = [];
  if (L.mode === 'node') {
    questions = E.buildNodeRound(L.node);
    if (L.node.tip && !state.tipsSeen[L.node.tip]) L.intro = L.node.tip;
  } else if (L.mode === 'practice') questions = E.buildPracticeRound();
  else if (L.mode === 'mistakes') questions = E.buildMistakeRound();
  else if (L.mode === 'jump') questions = E.buildJumpRound(L.unit);
  else if (L.mode === 'blitz') {
    questions = [E.nextBlitzQuestion()];
    L.blitz = { score: 0, endsAt: 0 };
    L.intro = 'blitz';
  }
  if (!questions.length) {
    toast('Hier is nog niets om te oefenen.');
    return;
  }
  L.items = questions.map((q) => ({ q, tries: 0 }));
  L.initial = L.items.length;
  ui.lesson = L;
  ui.sheet = null;
  ui.screen = 'lesson';
  if (replace) history.replaceState({ s: 'lesson' }, '');
  else history.pushState({ s: 'lesson' }, '');
  render();
}

function renderLesson() {
  const L = ui.lesson;
  const color = L.node ? L.node.unit.color : { practice: 'blue', blitz: 'gold', mistakes: 'pink', jump: 'indigo' }[L.mode];
  if (L.intro) {
    app.innerHTML = `
    <div class="lesson c-${color}">
      <header class="lesson-top"><button class="icon-btn" data-action="quit" aria-label="Stoppen">✕</button></header>
      <div class="intro">
        ${L.intro === 'blitz' ? `
          ${mascot('cheer', 'huge bounce')}
          <h1>Blitz!</h1>
          <p>${BLITZ_SECONDS} seconden. Zoveel mogelijk juiste antwoorden. Een fout kost je enkel tijd.</p>
          <p class="muted">Je record: <b>${state.blitzBest}</b></p>`
        : `${mascot('happy', 'huge')}<p class="intro-lead">Eerst een trucje!</p>${tipCard(L.intro)}`}
      </div>
      <div class="answer-area"><button class="btn primary c-${color}" data-action="intro-ok">${L.intro === 'blitz' ? 'Start!' : 'Begrepen, start!'}</button></div>
    </div>`;
    return;
  }
  const item = L.items[L.idx];
  const q = item.q;
  const label = { input: 'Reken uit', missing: 'Welk getal ontbreekt?', mc: 'Kies het juiste antwoord', tf: 'Waar of niet waar?' }[q.format];
  let top;
  if (L.mode === 'blitz') {
    top = `<div class="progress timer"><div class="bar" id="timer-bar"></div></div><span class="lesson-meta">⚡ ${L.blitz.score}</span>`;
  } else {
    const pct = Math.round((L.resolved / L.initial) * 100);
    top = `<div class="progress"><div class="bar" style="width:${pct}%"></div></div>`;
    if (L.mode === 'jump') top += `<span class="lesson-meta">${L.mistakes === 0 ? '🛡️' : '⚠️'} ${L.mistakes}/1</span>`;
  }
  let answer;
  if (q.format === 'mc') {
    answer = `<div class="options">${q.options.map((o) => `<button class="option" data-action="option" data-v="${o}">${o}</button>`).join('')}</div>`;
  } else if (q.format === 'tf') {
    answer = `<div class="options tf">
      <button class="option yes" data-action="tf" data-v="1">✓ Waar</button>
      <button class="option no" data-action="tf" data-v="0">✗ Niet waar</button></div>`;
  } else {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'skip'];
    answer = `<div class="keypad">${keys.map((k) => `<button class="key ${k === 'back' || k === 'skip' ? 'fn' : ''}" data-action="key" data-k="${k}">${k === 'back' ? '⌫' : k === 'skip' ? '<small>weet ik<br>niet</small>' : k}</button>`).join('')}</div>`;
  }
  app.innerHTML = `
  <div class="lesson c-${color}">
    <header class="lesson-top">
      <button class="icon-btn" data-action="quit" aria-label="Stoppen">✕</button>
      ${top}
    </header>
    <div class="lesson-body">
      <div class="mascot-row">${mascot()}<div class="bubble">${label}</div></div>
      <div class="question pop">${q.tokens.map(tokenHtml).join('')}</div>
    </div>
    <div class="answer-area">${answer}</div>
    <div class="feedback" id="feedback"></div>
  </div>`;
  L.t0 = performance.now();
  if (L.mode === 'blitz') updateTimer();
}

function tokenHtml(t) {
  if (t === E.SLOT) {
    const L = ui.lesson;
    return `<span class="slot ${L.typed ? 'filled' : ''}" id="slot">${L.typed || '?'}</span>`;
  }
  if (t === '×' || t === ':' || t === '=') return `<span class="op">${t}</span>`;
  return `<span class="num">${t}</span>`;
}

function pressKey(k) {
  const L = ui.lesson;
  if (!L || L.locked || L.intro) return;
  const q = L.items[L.idx].q;
  if (q.format === 'mc' || q.format === 'tf') return;
  const slot = document.getElementById('slot');
  if (k === 'back') {
    L.typed = L.typed.slice(0, -1);
  } else if (k === 'skip') {
    answer(null);
    return;
  } else {
    if (L.typed.length >= String(q.answer).length) return;
    L.typed += k;
  }
  sfx.tap();
  if (slot) {
    slot.textContent = L.typed || '?';
    slot.classList.toggle('filled', !!L.typed);
  }
  // Zodra je evenveel cijfers typte als het antwoord heeft, wordt er gecontroleerd.
  if (L.typed.length === String(q.answer).length) answer(L.typed);
}

function answer(value) {
  const L = ui.lesson;
  if (L.locked || L.finished) return;
  L.locked = true;
  const item = L.items[L.idx];
  const q = item.q;
  const ms = performance.now() - L.t0;
  const correct = value !== null && (q.format === 'tf' ? value === q.tfTrue : Number(value) === q.answer);
  E.recordAnswer(q.fact, { correct, ms, format: q.format, answer: q.answer, placement: L.mode === 'jump' });
  markChoice(q, value, correct);

  if (correct) {
    const fast = q.format !== 'mc' && q.format !== 'tf' && E.isFast(ms, q.answer);
    if (L.mode === 'blitz') {
      L.blitz.score += 1;
      L.xp += 3;
    } else {
      L.xp += (item.tries === 0 ? 10 : 5) + (fast ? 2 : 0);
      if (item.tries === 0) L.firstTry += 1;
      L.resolved += 1;
    }
    L.times.push(ms);
    sfx.correct(fast);
    showFeedback(true, q, fast);
    later(next, L.mode === 'blitz' ? 220 : 700);
    return;
  }

  L.mistakes += 1;
  sfx.wrong();
  if (L.mode === 'blitz') {
    showFeedback(false, q);
    later(next, 1100);
    return;
  }
  if (L.mode === 'jump') {
    L.resolved += 1;
  } else if (item.tries < 2) {
    // Fout? Dan komt hetzelfde feit iets later terug, nu om in te typen.
    const retry = { q: E.makeQuestion(q.fact, q.format === 'missing' ? 'missing' : 'input'), tries: item.tries + 1 };
    L.items.splice(Math.min(L.idx + 3, L.items.length), 0, retry);
  } else {
    L.resolved += 1;
  }
  showFeedback(false, q);
}

function markChoice(q, value, correct) {
  if (q.format === 'mc') {
    app.querySelectorAll('.option').forEach((b) => {
      const v = Number(b.dataset.v);
      if (v === q.answer) b.classList.add('right');
      else if (v === Number(value)) b.classList.add('wrong');
      b.disabled = true;
    });
  } else if (q.format === 'tf') {
    app.querySelectorAll('.option').forEach((b) => {
      const v = b.dataset.v === '1';
      if (v === q.tfTrue) b.classList.add('right');
      else if (v === value) b.classList.add('wrong');
      b.disabled = true;
    });
  } else {
    const slot = document.getElementById('slot');
    if (slot) slot.classList.add(correct ? 'right' : 'wrong');
  }
}

function showFeedback(ok, q, fast) {
  const pi = app.querySelector('.mascot-row .mascot');
  if (pi) pi.innerHTML = piSvg(ok ? 'cheer' : 'oops');
  const fb = document.getElementById('feedback');
  if (!fb) return;
  if (ok) {
    fb.className = 'feedback ok show';
    fb.innerHTML = `<div class="fb-title">✓ ${pick(fast ? PRAISE_FAST : PRAISE)}</div>`;
    return;
  }
  const hint = E.hintFor(q.fact);
  const title = q.format === 'tf' ? `Dat was ${q.tfTrue ? 'wél' : 'niet'} waar` : pick(ENCOURAGE);
  fb.className = 'feedback bad show';
  fb.innerHTML = `
    <div class="fb-title">${title}</div>
    <div class="fb-answer">${q.solved}</div>
    ${hint && ui.lesson.mode !== 'blitz' ? `<div class="fb-tip">💡 ${hint}</div>` : ''}
    ${ui.lesson.mode !== 'blitz' ? '<button class="btn danger" data-action="next">Verder</button>' : ''}`;
}

function later(fn, ms) {
  const L = ui.lesson;
  L.timers.push(setTimeout(fn, ms));
}

function clearTimers(L) {
  L.timers.forEach(clearTimeout);
  L.timers = [];
  if (L.blitz && L.blitz.interval) clearInterval(L.blitz.interval);
}

function next() {
  const L = ui.lesson;
  if (!L || L.finished || ui.screen !== 'lesson' || !L.locked) return;
  L.timers.forEach(clearTimeout);
  L.timers = [];
  if (L.mode === 'jump' && L.mistakes > 1) return finishLesson();
  L.idx += 1;
  L.typed = '';
  L.locked = false;
  if (L.mode === 'blitz') {
    if (Date.now() >= L.blitz.endsAt) return finishLesson();
    const prev = L.items[L.idx - 1].q.fact.key;
    L.items.push({ q: E.nextBlitzQuestion(prev), tries: 0 });
  }
  if (L.idx >= L.items.length) return finishLesson();
  renderLesson();
}

function startBlitzTimer() {
  const L = ui.lesson;
  L.blitz.endsAt = Date.now() + BLITZ_SECONDS * 1000;
  L.blitz.interval = setInterval(() => {
    if (!updateTimer()) {
      clearInterval(L.blitz.interval);
      if (!L.locked) finishLesson();
      // Bij een lopende feedback eindigt next() de ronde.
    }
  }, 100);
}

function updateTimer() {
  const L = ui.lesson;
  const left = Math.max(0, L.blitz.endsAt - Date.now());
  const bar = document.getElementById('timer-bar');
  if (bar) {
    bar.style.width = `${(left / (BLITZ_SECONDS * 1000)) * 100}%`;
    bar.classList.toggle('hurry', left < 10000);
  }
  return left > 0;
}

function finishLesson() {
  const L = ui.lesson;
  if (L.finished) return;
  L.finished = true;
  clearTimers(L);

  const streakBefore = store.currentStreak();
  const goalBefore = store.dailyRounds() >= state.settings.dailyGoal;
  const r = { mode: L.mode, actions: [], celebrate: true, lines: [] };
  const avg = L.times.length ? L.times.reduce((a, b) => a + b, 0) / L.times.length : 0;

  if (L.mode === 'blitz') {
    const score = L.blitz.score;
    const record = score > state.blitzBest;
    if (record) state.blitzBest = score;
    r.title = record ? `Nieuw record: ${score}!` : `${score} juist!`;
    r.sub = record ? 'Amai, sneller dan ooit.' : `Je record blijft ${state.blitzBest}. Nog eens?`;
    r.celebrate = record || score >= 10;
    r.tiles = [[`${score}`, 'juist'], [`${L.mistakes}`, 'fout'], [avg ? `${fmtSec(avg)} s` : '-', 'per vraag']];
    r.actions = [{ label: 'Nog een Blitz', action: 'again-blitz' }];
  } else if (L.mode === 'jump') {
    const passed = L.mistakes <= 1;
    const nextUnit = L.unit + 1;
    if (passed) {
      E.passJumpTest(L.unit);
      L.xp += 20;
      r.title = 'Geslaagd!';
      r.sub = `Je springt naar unit ${L.unit + 1}: ${UNITS[L.unit].title}.`;
      if (nextUnit < UNITS.length) r.actions.push({ label: `Test ook unit ${nextUnit + 1}`, action: 'jump', data: nextUnit });
      r.actions.push({ label: 'Begin hier', action: 'play' });
    } else {
      r.title = 'Net niet';
      r.sub = 'Geen probleem: dan oefenen we het gewoon. Wat je al kent, gaat dan extra snel.';
      r.celebrate = false;
      r.actions.push({ label: 'Begin met oefenen', action: 'play' });
    }
    r.tiles = [[`${L.firstTry}/${L.initial}`, 'juist'], [avg ? `${fmtSec(avg)} s` : '-', 'per vraag']];
  } else {
    const perfect = L.mistakes === 0;
    if (perfect) L.xp += 10;
    if (L.mode === 'node') {
      E.completeNodeRound(L.node);
      if (!L.wasDone && E.isDone(L.node)) {
        const nxt = E.NODES[L.node.index + 1];
        r.lines.push(nxt ? `🔓 Nieuw vrijgespeeld: <b>${nxt.title}</b>` : '👑 Je hebt het hele pad uitgespeeld!');
        if (nxt && nxt.unitIndex !== L.node.unitIndex) r.lines.push(`🏆 Unit ${L.node.unitIndex + 1} afgewerkt!`);
      }
    }
    r.title = perfect ? 'Perfecte ronde!' : 'Ronde klaar!';
    r.sub = perfect ? 'Geen enkele fout. Straf!' : 'Je fouten komen later nog eens terug, zodat ze blijven hangen.';
    r.tiles = [[`${Math.round((L.firstTry / L.initial) * 100)}%`, 'juist'], [avg ? `${fmtSec(avg)} s` : '-', 'per vraag']];
    if (L.mode === 'node') r.actions.push({ label: E.allDone() ? 'Slim oefenen' : 'Volgende ronde', action: 'play' });
    if (L.mode === 'practice') r.actions.push({ label: 'Nog een ronde', action: 'again-practice' });
    if (L.mode === 'mistakes') {
      r.actions.push(E.mistakeFacts().length
        ? { label: 'Nog meer fouten herhalen', action: 'again-mistakes' }
        : { label: 'Slim oefenen', action: 'again-practice' });
    }
  }

  store.recordRound(L.xp);
  r.xp = L.xp;
  r.tiles.unshift([`+${L.xp}`, 'XP']);
  const streakAfter = store.currentStreak();
  if (streakAfter > streakBefore) r.lines.push(`🔥 Streak: ${streakAfter} ${streakAfter === 1 ? 'dag' : 'dagen'}!`);
  if (!goalBefore && store.dailyRounds() >= state.settings.dailyGoal) r.lines.push('🎯 Dagdoel gehaald!');

  ui.result = r;
  ui.screen = 'result';
  ui.scrollToCurrent = true;
  sfx.finish();
  render();
}

function resultView() {
  const r = ui.result;
  const done = store.dailyRounds();
  const goal = state.settings.dailyGoal;
  return `
  <div class="result">
    ${mascot(r.celebrate || r.mode !== 'jump' ? 'cheer' : 'oops', `huge ${r.celebrate ? 'bounce' : ''}`)}
    <h1>${r.title}</h1>
    <p>${r.sub}</p>
    <div class="tiles">${r.tiles.map(([b, s]) => `<div class="tile"><b>${b}</b><span>${s}</span></div>`).join('')}</div>
    ${r.lines.map((l) => `<div class="result-line">${l}</div>`).join('')}
    <div class="daily ${done >= goal ? 'met' : ''}">
      <div class="daily-text">${done >= goal ? '🎉 Dagdoel gehaald' : `🎯 Dagdoel: ${done} van ${goal}`}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, (done / goal) * 100)}%"></div></div>
    </div>
    <div class="stack result-actions">
      ${r.actions.map((a, i) => `<button class="btn ${i === 0 ? 'primary c-blue' : 'ghost'}" data-action="${a.action}" ${a.data !== undefined ? `data-unit="${a.data}"` : ''} data-from="result">${a.label}</button>`).join('')}
      <button class="btn ghost" data-action="done">Klaar voor nu</button>
    </div>
  </div>`;
}

function quitLesson() {
  const L = ui.lesson;
  if (!L || L.finished) return;
  modal({
    title: 'Stoppen?',
    text: 'Deze ronde telt dan niet mee. Wat je al juist had, onthoud ik wel.',
    buttons: [
      { label: 'Verder spelen', cls: 'primary c-blue' },
      {
        label: 'Stoppen', cls: 'ghost', onClick: () => {
          clearTimers(L);
          L.finished = true;
          goHome(true);
        },
      },
    ],
  });
}

function goHome(viaHistory) {
  if (viaHistory && history.state && history.state.s) {
    history.back(); // popstate rendert het startscherm
    return;
  }
  toHome();
}

function toHome() {
  ui.screen = 'home';
  ui.lesson = null;
  ui.sheet = null;
  ui.scrollToCurrent = true;
  if (pendingReload) return location.reload();
  render();
}

// ---------- Acties ----------

function startCurrent(replace) {
  if (E.allDone()) return startLesson({ mode: 'practice' }, { replace });
  const node = E.NODES[E.currentNodeIndex()];
  startLesson({ mode: 'node', node }, { replace });
}

const actions = {
  'welcome-start'() {
    state.welcomed = true;
    store.save();
    ui.screen = 'home';
    render();
  },
  'welcome-test'() {
    state.welcomed = true;
    store.save();
    ui.screen = 'home';
    startLesson({ mode: 'jump', unit: 1 });
  },
  tab(d) {
    ui.tab = d.tab;
    ui.scrollToCurrent = d.tab === 'path';
    render();
  },
  settings() {
    ui.screen = 'settings';
    history.pushState({ s: 'settings' }, '');
    render();
  },
  back() {
    history.back();
  },
  play(d) {
    startCurrent(d.from === 'result');
  },
  node(d) {
    ui.sheet = { type: 'node', id: d.id };
    history.pushState({ s: 'sheet' }, '');
    render();
  },
  'show-tip'(d) {
    ui.sheet = { type: 'tip', id: d.tip };
    render();
  },
  'close-sheet'() {
    if (history.state && history.state.s === 'sheet') history.back();
    else { ui.sheet = null; render(); }
  },
  'start-node'(d) {
    startLesson({ mode: 'node', node: nodeById(d.id) }, { replace: history.state && history.state.s === 'sheet' });
  },
  jump(d) {
    startLesson({ mode: 'jump', unit: Number(d.unit) }, { replace: d.from === 'result' });
  },
  practice() {
    startLesson({ mode: 'practice' });
  },
  'again-practice'() {
    startLesson({ mode: 'practice' }, { replace: true });
  },
  blitz() {
    startLesson({ mode: 'blitz' });
  },
  'again-blitz'() {
    startLesson({ mode: 'blitz' }, { replace: true });
  },
  mistakes(d, el) {
    if (el.classList.contains('disabled')) return;
    startLesson({ mode: 'mistakes' });
  },
  'again-mistakes'() {
    startLesson({ mode: 'mistakes' }, { replace: true });
  },
  'intro-ok'() {
    const L = ui.lesson;
    if (L.intro && L.intro !== 'blitz') {
      state.tipsSeen[L.intro] = true;
      store.save();
    }
    if (L.intro === 'blitz') startBlitzTimer();
    L.intro = null;
    renderLesson();
  },
  key(d) { pressKey(d.k); },
  option(d) { answer(d.v); },
  tf(d) { answer(d.v === '1'); },
  next() { next(); },
  quit() { quitLesson(); },
  done() { goHome(true); },
  cell(d) {
    const f = E.factInfo(d.key);
    toast(f
      ? `${d.label} · ${f.seen}× gezien · ${Math.round((f.correct / f.seen) * 100)}% juist${f.avgMs ? ` · ${fmtSec(f.avgMs)} s` : ''}`
      : `${d.label} · nog niet geoefend`);
  },
  'stats-mode'(d) {
    ui.statsMode = d.mode;
    render();
  },
  goal(d) {
    state.settings.dailyGoal = Number(d.goal);
    store.save();
    render();
  },
  export() {
    store.exportBackup();
    toast('Back-up opgeslagen in je downloads.');
  },
  import() {
    const input = document.getElementById('import-file');
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        await store.importBackup(file);
        toast('Back-up teruggezet!');
        render();
      } catch (e) {
        toast(e.message || 'Dat bestand kon ik niet lezen.');
      }
    };
    input.click();
  },
  reset() {
    modal({
      title: 'Alles wissen?',
      text: 'Je XP, streak en alles wat je geleerd hebt, verdwijnt. Dit kan je niet ongedaan maken.',
      buttons: [
        { label: 'Toch niet', cls: 'primary c-blue' },
        { label: 'Ja, wis alles', cls: 'danger', onClick: () => { store.resetAll(); toast('Alles gewist. Frisse start!'); render(); } },
      ],
    });
  },
  async install() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    render();
  },
};

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT') return;
  const fn = actions[el.dataset.action];
  if (fn) fn(el.dataset, el);
});

app.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.action === 'toggle') {
    state.settings[el.dataset.key] = el.checked;
    store.save();
  }
});

document.addEventListener('keydown', (e) => {
  if (ui.screen !== 'lesson' || !ui.lesson) return;
  const L = ui.lesson;
  if (/^[0-9]$/.test(e.key)) pressKey(e.key);
  else if (e.key === 'Backspace') pressKey('back');
  else if (e.key === 'Enter') {
    if (L.intro) actions['intro-ok']();
    else if (L.locked) next();
  } else if (e.key === 'Escape') quitLesson();
});

window.addEventListener('popstate', () => {
  if (document.querySelector('.modal-backdrop')) closeModal();
  if (ui.screen === 'lesson' && ui.lesson && !ui.lesson.finished) {
    // Terugknop tijdens een les: eerst vragen of je echt wil stoppen.
    history.pushState({ s: 'lesson' }, '');
    quitLesson();
    return;
  }
  if (ui.screen !== 'home' || ui.sheet) toHome();
});

// ---------- Kleine hulpjes ----------

let toastTimer;
function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function modal({ title, text, buttons }) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      <p>${text}</p>
      <div class="stack">${buttons.map((b, i) => `<button class="btn ${b.cls}" data-i="${i}">${b.label}</button>`).join('')}</div>
    </div>`;
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-i]');
    if (!btn && e.target !== wrap) return;
    closeModal();
    if (btn) {
      const b = buttons[Number(btn.dataset.i)];
      if (b.onClick) b.onClick();
    }
  });
  document.body.appendChild(wrap);
}

function closeModal() {
  document.querySelectorAll('.modal-backdrop').forEach((m) => m.remove());
}

function confetti() {
  const colors = ['#2F80ED', '#5A67D8', '#A65CF2', '#FF5C9A', '#14C3B0', '#4CC93A', '#FFC21A'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = `${Math.random() * 0.6}s`;
    s.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    s.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    s.style.setProperty('--dx', `${Math.random() * 120 - 60}px`);
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3800);
}

// ---------- Opstarten ----------

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstall = e;
  if (ui.screen === 'home' || ui.screen === 'settings') render();
});

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('./sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) return;
    // Nieuwe versie geïnstalleerd: herladen, maar nooit midden in een les.
    if (ui.screen === 'lesson' || ui.screen === 'result') pendingReload = true;
    else location.reload();
  });
}

if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

history.replaceState({}, '');
render();
