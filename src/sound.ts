/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Audio Context is lazily initialized on first interaction
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subtly play a clicking bubble sound
  playClick() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const src = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      src.type = 'sine';
      src.frequency.setValueAtTime(600, this.ctx.currentTime);
      src.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      src.connect(gain);
      gain.connect(this.ctx.destination);

      src.start();
      src.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Click audio failed:', e);
    }
  }

  // Play ascending cute melody: C4, E4, G4, C5
  playCorrect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, now + idx * 0.1);

        gainNode.gain.setValueAtTime(0, now + idx * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);

        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        oscillator.start(now + idx * 0.1);
        oscillator.stop(now + idx * 0.1 + 0.3);
      });
    } catch (e) {
      console.warn('Correct audio failed:', e);
    }
  }

  // Play short flat buzzer sound: 160Hz and 150Hz detuned dual saw-wave
  playIncorrect() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, now);
      osc1.frequency.linearRampToValueAtTime(100, now + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(145, now);
      osc2.frequency.linearRampToValueAtTime(105, now + 0.35);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Incorrect audio failed:', e);
    }
  }

  // Play celebratory festive chords as fanfare
  playLevelUp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chords = [
        [262, 329, 392], // C-major base hook
        [349, 440, 523], // F-major climb
        [392, 494, 587], // G-major lead
        [523, 659, 784]  // Higher C-major resolve
      ];

      chords.forEach((chord, stepIdx) => {
        chord.forEach((freq, noteIdx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = noteIdx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + stepIdx * 0.18);

          // Add vibrato/detuning for brass feel
          osc.frequency.setValueAtTime(freq + 1.2, now + stepIdx * 0.18 + 0.05);

          gain.gain.setValueAtTime(0, now + stepIdx * 0.18);
          gain.gain.linearRampToValueAtTime(0.08, now + stepIdx * 0.18 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.005, now + stepIdx * 0.18 + 0.45);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + stepIdx * 0.18);
          osc.stop(now + stepIdx * 0.18 + 0.5);
        });
      });
    } catch (e) {
      console.warn('Celebration audio failed:', e);
    }
  }
}

export const sound = new SoundEngine();
