// Subtle ambient Web Audio synthesizer for award-winning digital tactile feel
let audioCtx: AudioContext | null = null;
let soundEnabled = false;

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (soundEnabled && !audioCtx) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch {
      soundEnabled = false;
    }
  }
  return soundEnabled;
}

export function isSoundActive(): boolean {
  return soundEnabled;
}

export function playChime(freq = 520, type: OscillatorType = 'sine', duration = 0.4) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Soft gentle fade in and smooth exponential decay
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Graceful silence
  }
}

export function playReminderAlertSound() {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (!audioCtx) return;

    // Harmonic two-tone chime (587Hz then 880Hz)
    const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    const gain2 = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const secondStart = now + 0.18;
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, secondStart); // A5
    gain2.gain.setValueAtTime(0.001, secondStart);
    gain2.gain.exponentialRampToValueAtTime(0.2, secondStart + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, secondStart + 0.8);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(secondStart);
    osc2.stop(secondStart + 0.8);
  } catch {
    // Audio context not allowed yet
  }
}

