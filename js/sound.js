// Geluidjes en trillingen, volledig gegenereerd (geen audiobestanden nodig).

import { state } from './store.js';

let ctx;

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.18 } = {}) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function buzz(pattern) {
  if (state.settings.vibrate && navigator.vibrate) navigator.vibrate(pattern);
}

export const sfx = {
  correct(fast) {
    buzz(12);
    if (!state.settings.sound) return;
    tone(660, 0, 0.12, { type: 'triangle' });
    tone(fast ? 1320 : 990, 0.08, 0.18, { type: 'triangle' });
  },
  wrong() {
    buzz([40, 40, 40]);
    if (!state.settings.sound) return;
    tone(220, 0, 0.18, { type: 'square', gain: 0.06 });
    tone(180, 0.12, 0.22, { type: 'square', gain: 0.06 });
  },
  tap() {
    if (!state.settings.sound) return;
    tone(520, 0, 0.04, { type: 'sine', gain: 0.05 });
  },
  finish() {
    buzz([20, 60, 20, 60, 60]);
    if (!state.settings.sound) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, { type: 'triangle' }));
  },
  tick() {
    if (!state.settings.sound) return;
    tone(880, 0, 0.03, { type: 'sine', gain: 0.04 });
  },
};

// Moet bij een eerste aanraking gebeuren, anders blokkeert Chrome het geluid.
export function unlockAudio() {
  audio();
}
