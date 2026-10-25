// De rekenmotor: welke feiten bestaan er, hoe goed ken je ze,
// en welke oefeningen krijg je in een ronde.

import { UNITS } from './data.js';
import { state, save } from './store.js';

export const ROUND_SIZE = 10;
export const JUMP_SIZE = 12;
export const BOX_MAX = 5;
export const MASTERED_BOX = 4;

// Hoe lang tot een feit opnieuw "aan de beurt" is, per doos (in minuten).
const INTERVAL_MIN = [0, 10, 60 * 24, 60 * 24 * 3, 60 * 24 * 7, 60 * 24 * 21];

export const NODES = UNITS.flatMap((u, ui) =>
  u.nodes.map((n, ni) => ({ ...n, unit: u, unitIndex: ui, indexInUnit: ni })));
NODES.forEach((n, i) => { n.index = i; });

export const roundsNeeded = (node) => (node.boss ? 3 : 2);

// ---------- Feiten ----------

const rangeFor = (t) => (t >= 11 ? 12 : 10);

export function mulKey(a, b) {
  return `m:${Math.min(a, b)}x${Math.max(a, b)}`;
}
export function divKey(divisor, quotient) {
  return `d:${divisor}x${quotient}`;
}

function mulFacts(tables, squaresOnly) {
  const out = new Map();
  for (const t of tables) {
    for (let m = 1; m <= rangeFor(t); m++) {
      if (squaresOnly && !tables.includes(m)) continue;
      const key = mulKey(t, m);
      if (!out.has(key)) out.set(key, { kind: 'mul', key, table: t, other: m });
    }
  }
  return [...out.values()];
}

function divFacts(divisors) {
  const out = [];
  for (const d of divisors) {
    for (let q = 1; q <= rangeFor(d); q++) {
      out.push({ kind: 'div', key: divKey(d, q), divisor: d, quotient: q });
    }
  }
  return out;
}

export function nodePool(node) {
  const pool = [];
  if (node.mul) pool.push(...mulFacts(node.mul, node.squaresFocus));
  if (node.div) pool.push(...divFacts(node.div));
  return pool;
}

function uniqueFacts(facts) {
  const seen = new Map();
  for (const f of facts) if (!seen.has(f.key)) seen.set(f.key, f);
  return [...seen.values()];
}

// ---------- Voortgang op het pad ----------

export function nodeProgress(node) {
  return Math.min(state.nodes[node.id] || 0, roundsNeeded(node));
}

export function isDone(node) {
  return nodeProgress(node) >= roundsNeeded(node);
}

export function currentNodeIndex() {
  const i = NODES.findIndex((n) => !isDone(n));
  return i === -1 ? NODES.length : i;
}

export function nodeStatus(node) {
  const c = currentNodeIndex();
  if (node.index < c) return 'done';
  if (node.index === c) return 'current';
  return 'locked';
}

export function allDone() {
  return currentNodeIndex() >= NODES.length;
}

// Alle feiten die je al tegenkwam op het pad (tot en met de huidige node).
export function unlockedFacts() {
  const last = Math.min(currentNodeIndex(), NODES.length - 1);
  return uniqueFacts(NODES.slice(0, last + 1).flatMap(nodePool));
}

export function completeNodeRound(node) {
  state.nodes[node.id] = (state.nodes[node.id] || 0) + 1;
  save();
}

export function passJumpTest(unitIndex) {
  for (const n of NODES) {
    if (n.unitIndex < unitIndex) state.nodes[n.id] = Math.max(state.nodes[n.id] || 0, roundsNeeded(n));
  }
  save();
}

// ---------- Geheugen per feit ----------

export function factInfo(key) {
  return state.facts[key];
}

export function factLevel(key) {
  const f = state.facts[key];
  return f ? f.box : -1;
}

function digits(n) {
  return String(n).length;
}

export function isFast(ms, answer) {
  return ms <= 2000 + 700 * digits(answer);
}

export function recordAnswer(fact, { correct, ms, format, answer, placement = false }) {
  const now = Date.now();
  const f = state.facts[fact.key] || { box: 0, seen: 0, correct: 0, wrong: 0, avgMs: 0, last: 0, due: 0, lastWrong: 0 };
  f.seen += 1;
  f.last = now;
  const recognition = format === 'mc' || format === 'tf';

  if (correct) {
    f.correct += 1;
    if (!recognition) f.avgMs = f.avgMs ? Math.round(f.avgMs * 0.7 + ms * 0.3) : ms;
    if (recognition) {
      if (f.box < 2) f.box += 1;
    } else if (isFast(ms, answer)) {
      // Een vlot antwoord in de niveautest: dat feit ken je al, niet opnieuw drillen.
      f.box = placement ? Math.max(f.box + 1, 3) : Math.min(BOX_MAX, f.box + 1);
    } else if (f.box < 2) {
      f.box += 1;
    }
  } else {
    f.wrong += 1;
    f.lastWrong = now;
    f.box = f.box <= 2 ? 0 : f.box - 2;
  }
  f.due = now + INTERVAL_MIN[f.box] * 60000;
  state.facts[fact.key] = f;
  save();
}

function weight(fact, { inFocus = true } = {}) {
  const f = state.facts[fact.key];
  let w;
  if (!f) w = 4;
  else {
    w = [6, 4, 3, 2, 1, 0.5][f.box];
    const now = Date.now();
    if (now >= f.due) {
      const interval = Math.max(INTERVAL_MIN[f.box], 1) * 60000;
      w *= 1 + Math.min(3, (now - f.due) / interval);
    } else {
      w *= 0.5;
    }
  }
  // Maal 1 en maal 10 hoef je niet eindeloos te herhalen buiten hun eigen les.
  if (!inFocus && isTrivial(fact)) w *= 0.15;
  return w;
}

function isTrivial(fact) {
  if (fact.kind === 'mul') return fact.table === 1 || fact.other === 1 || fact.table === 10 || fact.other === 10;
  return fact.divisor === 10 || fact.quotient === 1;
}

function pickWeighted(pool, n, opts = {}) {
  const out = [];
  let bag = pool.map((f) => ({ f, w: weight(f, opts) }));
  while (out.length < n && pool.length) {
    if (!bag.length) bag = pool.map((f) => ({ f, w: weight(f, opts) }));
    const total = bag.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < bag.length - 1; idx++) {
      r -= bag[idx].w;
      if (r <= 0) break;
    }
    out.push(bag[idx].f);
    bag.splice(idx, 1);
  }
  return out;
}

export function weakestFacts(n = 6) {
  return Object.entries(state.facts)
    .filter(([, f]) => f.seen >= 2 && (f.box < MASTERED_BOX))
    .map(([key, f]) => ({ key, f, score: f.wrong / f.seen + (f.avgMs || 6000) / 10000 - f.box * 0.1 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

export function mistakeFacts() {
  const all = uniqueFacts(NODES.flatMap(nodePool));
  return all
    .filter((f) => { const s = state.facts[f.key]; return s && s.lastWrong && s.box <= 2; })
    .sort((a, b) => state.facts[b.key].lastWrong - state.facts[a.key].lastWrong);
}

// ---------- Vragen ----------

const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SLOT = '__slot__';

function distractors(answer, near) {
  const cands = [...new Set(near.filter((x) => x > 0 && x !== answer))];
  const out = shuffle(cands.slice(0, 6)).slice(0, 3);
  let k = 1;
  while (out.length < 3) {
    const c = answer + (k % 2 ? k : -k);
    if (c > 0 && c !== answer && !out.includes(c)) out.push(c);
    k++;
  }
  return out;
}

const DIFFICULTY = { 1: 0, 10: 1, 2: 2, 5: 3, 11: 4, 3: 5, 4: 6, 6: 7, 9: 8, 12: 9, 8: 10, 7: 11 };
function easiestFactor(a, b) {
  return DIFFICULTY[a] <= DIFFICULTY[b] ? a : b;
}

// Een uitgewerkte hint voor precies dit feit, via de makkelijkste route.
export function hintFor(fact) {
  if (fact.kind === 'div') {
    const { divisor: d, quotient: q } = fact;
    const c = d * q;
    switch (d) {
      case 2: return `De helft van ${c} is ${q}`;
      case 10: return `Haal de 0 weg: ${c} → ${q}`;
      case 5: return `${c} × 2 = ${c * 2}, haal de 0 weg → ${q}`;
      case 4: return `Twee keer halveren: ${c} → ${c / 2} → ${q}`;
      case 8: return `Drie keer halveren: ${c} → ${c / 2} → ${c / 4} → ${q}`;
      case 9: if (q <= 10) return `Tiental van ${c} is ${Math.floor(c / 10)}, plus 1 → ${q}`; break;
      case 11: if (q <= 9) return `${c} : 11 → gewoon het cijfer: ${q}`; break;
      default: break;
    }
    return `${d} × ${q} = ${c}, dus ${c} : ${d} = ${q}`;
  }
  const x = easiestFactor(fact.table, fact.other);
  const n = x === fact.table ? fact.other : fact.table;
  switch (x) {
    case 1: return `Maal 1 verandert niets: ${n}`;
    case 10: return `Zet een 0 achter ${n} → ${n * 10}`;
    case 2: return `Verdubbelen: ${n} + ${n} = ${n * 2}`;
    case 5: return `${n} × 10 = ${n * 10}, de helft → ${n * 5}`;
    case 11: return n <= 9 ? `Het cijfer dubbel: ${n * 11}` : `${n} × 10 = ${n * 10}, plus ${n} → ${n * 11}`;
    case 3: return `${n} × 2 = ${n * 2}, plus ${n} → ${n * 3}`;
    case 4: return `Twee keer verdubbelen: ${n} → ${n * 2} → ${n * 4}`;
    case 6: return `${n} × 5 = ${n * 5}, plus ${n} → ${n * 6}`;
    case 9: return `${n} × 10 = ${n * 10}, min ${n} → ${n * 9}`;
    case 12: return `${n} × 10 = ${n * 10}, plus ${n} × 2 = ${n * 2} → ${n * 12}`;
    case 8: return `Drie keer verdubbelen: ${n} → ${n * 2} → ${n * 4} → ${n * 8}`;
    case 7: return `${n} × 5 = ${n * 5}, plus ${n} × 2 = ${n * 2} → ${n * 7}`;
    default: return '';
  }
}

export function makeQuestion(fact, format) {
  if (fact.kind === 'mul') {
    const [x, y] = Math.random() < 0.5 ? [fact.other, fact.table] : [fact.table, fact.other];
    const c = x * y;
    const near = [x * (y + 1), x * (y - 1), (x + 1) * y, (x - 1) * y, c + 10, c - 10, c + 1, c - 1, x + y];
    if (format === 'missing') {
      const hideFirst = Math.random() < 0.5;
      return {
        fact, format,
        tokens: hideFirst ? [SLOT, '×', y, '=', c] : [x, '×', SLOT, '=', c],
        answer: hideFirst ? x : y,
        solved: `${x} × ${y} = ${c}`,
      };
    }
    const q = { fact, format, tokens: [x, '×', y, '=', SLOT], answer: c, solved: `${x} × ${y} = ${c}` };
    return decorate(q, near);
  }
  const { divisor: d, quotient: qn } = fact;
  const c = d * qn;
  if (format === 'missing') {
    const hideDivisor = Math.random() < 0.6;
    return {
      fact, format,
      tokens: hideDivisor ? [c, ':', SLOT, '=', qn] : [SLOT, ':', d, '=', qn],
      answer: hideDivisor ? d : c,
      solved: `${c} : ${d} = ${qn}`,
    };
  }
  const near = [qn + 1, qn - 1, qn + 2, qn - 2, d, qn + 10];
  const q = { fact, format, tokens: [c, ':', d, '=', SLOT], answer: qn, solved: `${c} : ${d} = ${qn}` };
  return decorate(q, near);
}

function decorate(q, near) {
  if (q.format === 'mc') {
    q.options = shuffle([q.answer, ...distractors(q.answer, near)]);
  } else if (q.format === 'tf') {
    q.tfTrue = Math.random() < 0.5;
    q.shown = q.tfTrue ? q.answer : distractors(q.answer, near)[0];
    q.tokens = q.tokens.map((t) => (t === SLOT ? q.shown : t));
  }
  return q;
}

function formatFor(node, i, firstTime) {
  if (node && node.formats) return pick(node.formats);
  if (firstTime && i < 4) return 'mc';
  const r = Math.random();
  if (r < 0.12) return 'missing';
  if (r < 0.2) return 'tf';
  return 'input';
}

// Een ronde op het pad: vooral de feiten van deze node, plus wat herhaling.
export function buildNodeRound(node) {
  const pool = nodePool(node);
  const earlier = node.review ? [] : uniqueFacts(NODES.slice(0, node.index).flatMap(nodePool))
    .filter((f) => !pool.some((p) => p.key === f.key));
  const reviewCount = earlier.length ? 2 : 0;
  const facts = [
    ...pickWeighted(pool, ROUND_SIZE - reviewCount),
    ...pickWeighted(earlier, reviewCount, { inFocus: false }),
  ];
  const firstTime = !state.nodes[node.id];
  const ordered = firstTime ? facts : shuffle(facts);
  return spread(ordered).map((f, i) => makeQuestion(f, formatFor(node, i, firstTime)));
}

export function buildPracticeRound() {
  const facts = pickWeighted(unlockedFacts(), ROUND_SIZE, { inFocus: false });
  return spread(shuffle(facts)).map((f, i) => makeQuestion(f, formatFor(null, i, false)));
}

export function buildMistakeRound() {
  const facts = mistakeFacts().slice(0, ROUND_SIZE);
  return shuffle(facts).map((f) => makeQuestion(f, Math.random() < 0.2 ? 'missing' : 'input'));
}

// Sprongtest naar unit `targetUnit`: test alles wat je zou overslaan,
// met de nadruk op de unit net daarvoor.
export function buildJumpRound(targetUnit) {
  const pool = uniqueFacts(NODES.filter((n) => n.unitIndex < targetUnit).flatMap(nodePool))
    .filter((f) => !isTrivial(f));
  const thisUnit = new Set(NODES.filter((n) => n.unitIndex === targetUnit - 1).flatMap(nodePool).map((f) => f.key));
  const own = pool.filter((f) => thisUnit.has(f.key));
  const rest = pool.filter((f) => !thisUnit.has(f.key));
  const facts = shuffle(own).slice(0, rest.length ? Math.ceil(JUMP_SIZE * 0.6) : JUMP_SIZE);
  facts.push(...shuffle(rest).slice(0, JUMP_SIZE - facts.length));
  return shuffle(facts).map((f) => makeQuestion(f, 'input'));
}

export function nextBlitzQuestion(prevKey) {
  const pool = unlockedFacts();
  let f = pickWeighted(pool, 1, { inFocus: false })[0];
  if (f.key === prevKey && pool.length > 1) f = pickWeighted(pool.filter((x) => x.key !== prevKey), 1, { inFocus: false })[0];
  return makeQuestion(f, 'input');
}

// Vermijd twee keer hetzelfde feit na elkaar.
function spread(facts) {
  const out = [...facts];
  for (let i = 1; i < out.length; i++) {
    if (out[i].key === out[i - 1].key) {
      const j = out.findIndex((f, k) => k > i && f.key !== out[i].key);
      if (j > -1) [out[i], out[j]] = [out[j], out[i]];
    }
  }
  return out;
}
