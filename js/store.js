// Alle voortgang wordt lokaal in de browser bewaard (localStorage).
// Exporteren en importeren als JSON-bestand dient als back-up.

const KEY = 'rekenvos.v1';

function fresh() {
  return {
    version: 1,
    createdAt: Date.now(),
    xp: 0,
    streak: 0,
    bestStreak: 0,
    lastDay: null,
    daily: { date: null, rounds: 0, xp: 0 },
    nodes: {},        // nodeId -> aantal voltooide rondes
    facts: {},        // feitsleutel -> { box, seen, correct, wrong, avgMs, last, due, lastWrong }
    tipsSeen: {},     // tipId -> true
    blitzBest: 0,
    rounds: 0,
    settings: { dailyGoal: 3, sound: true, vibrate: true },
    welcomed: false,
  };
}

export let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    return merge(fresh(), JSON.parse(raw));
  } catch {
    return fresh();
  }
}

function merge(base, data) {
  const out = { ...base, ...data };
  out.settings = { ...base.settings, ...(data.settings || {}) };
  out.daily = { ...base.daily, ...(data.daily || {}) };
  return out;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Opslag vol of geblokkeerd: de app blijft werken, alleen zonder bewaren.
  }
}

export function today(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return today(d);
}

// Streak die vandaag zichtbaar moet zijn: een streak van eergisteren is verloren.
export function currentStreak() {
  if (state.lastDay === today() || state.lastDay === yesterday()) return state.streak;
  return 0;
}

export function dailyRounds() {
  return state.daily.date === today() ? state.daily.rounds : 0;
}

export function recordRound(xp) {
  const t = today();
  if (state.lastDay !== t) {
    state.streak = state.lastDay === yesterday() ? state.streak + 1 : 1;
    state.lastDay = t;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  }
  if (state.daily.date !== t) state.daily = { date: t, rounds: 0, xp: 0 };
  state.daily.rounds += 1;
  state.daily.xp += xp;
  state.xp += xp;
  state.rounds += 1;
  save();
}

export function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rekenvos-backup-${today()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function importBackup(file) {
  const data = JSON.parse(await file.text());
  if (!data || typeof data !== 'object' || data.version !== 1 || typeof data.facts !== 'object') {
    throw new Error('Dit is geen geldige Rekenvos-back-up.');
  }
  state = merge(fresh(), data);
  save();
}

export function resetAll() {
  state = fresh();
  state.welcomed = true;
  save();
}
