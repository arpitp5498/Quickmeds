/**
 * reminderSound.js — Web Audio API Medicine Reminder Chime
 *
 * Generates a pleasant two-tone ascending notification chime programmatically.
 * No external audio files required. Repeats ~4 times over ~10 seconds, then stops.
 *
 * Usage:
 *   import { initAudioContext, playReminderChime, stopChime, isPlaying } from './reminderSound';
 *   initAudioContext();                     // Call on user interaction to unlock audio
 *   const cleanup = playReminderChime();    // Start ~10s chime
 *   stopChime();                            // Stop immediately
 */

let audioCtx = null;
let activeOscillators = [];
let repeatTimer = null;
let stopTimer = null;
let playing = false;

// Frequencies for a pleasant two-tone ascending chime (C5 → E5 → G5)
const CHIME_NOTES = [
  { freq: 523.25, duration: 0.15 },  // C5
  { freq: 659.25, duration: 0.15 },  // E5
  { freq: 783.99, duration: 0.25 },  // G5 (slightly longer for resolution)
];
const VOLUME = 0.3;          // 30% volume — audible but not jarring
const REPEAT_INTERVAL = 2500; // ms between chime cycles
const TOTAL_DURATION = 10000; // ms total alert duration

/**
 * Initialize (or resume) the AudioContext.
 * Must be called from a user-gesture handler (click/tap) to satisfy
 * browser autoplay policies. Safe to call multiple times.
 */
export function initAudioContext() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {
    console.warn('[ReminderSound] AudioContext init failed:', e);
  }
}

/**
 * Play a single chime cycle: three ascending tones with short gaps.
 */
function playSingleChime() {
  if (!audioCtx) {
    initAudioContext();
  }
  if (!audioCtx) return;

  // Resume if suspended (e.g. tab was backgrounded)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  let offset = audioCtx.currentTime;

  for (const note of CHIME_NOTES) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.freq, offset);

    // Envelope: quick attack, sustain, smooth decay
    gainNode.gain.setValueAtTime(0, offset);
    gainNode.gain.linearRampToValueAtTime(VOLUME, offset + 0.02);       // 20ms attack
    gainNode.gain.setValueAtTime(VOLUME, offset + note.duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, offset + note.duration);    // 50ms decay

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(offset);
    oscillator.stop(offset + note.duration);

    activeOscillators.push(oscillator);

    // Clean up reference when done
    oscillator.onended = () => {
      activeOscillators = activeOscillators.filter(o => o !== oscillator);
    };

    offset += note.duration + 0.08; // 80ms gap between notes
  }
}

/**
 * Start the full ~10-second reminder chime.
 * Plays chime immediately, then repeats every REPEAT_INTERVAL ms.
 * Automatically stops after TOTAL_DURATION ms.
 *
 * @returns {Function} cleanup function to stop early
 */
export function playReminderChime() {
  // Prevent overlapping alerts
  if (playing) {
    return () => stopChime();
  }

  playing = true;

  // Play first chime immediately
  playSingleChime();

  // Repeat chime every REPEAT_INTERVAL
  let elapsed = 0;
  repeatTimer = setInterval(() => {
    elapsed += REPEAT_INTERVAL;
    if (elapsed >= TOTAL_DURATION) {
      stopChime();
      return;
    }
    playSingleChime();
  }, REPEAT_INTERVAL);

  // Hard stop after TOTAL_DURATION
  stopTimer = setTimeout(() => {
    stopChime();
  }, TOTAL_DURATION);

  return () => stopChime();
}

/**
 * Immediately stop all chime playback, clear timers, reset state.
 */
export function stopChime() {
  // Stop all active oscillators
  for (const osc of activeOscillators) {
    try {
      osc.stop();
    } catch (e) {
      // Already stopped — ignore
    }
  }
  activeOscillators = [];

  // Clear timers
  if (repeatTimer) {
    clearInterval(repeatTimer);
    repeatTimer = null;
  }
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  playing = false;
}

/**
 * @returns {boolean} Whether a chime is currently playing
 */
export function isPlaying() {
  return playing;
}
