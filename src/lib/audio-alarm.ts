// High-Attention Synthesized Web Audio API Alarm Sound for New Order Alerts
// Uses a 4-note high-penetration chime pulse through a DynamicsCompressorNode
// Maximum clear volume without digital distortion or clipping

class OrderAlarmSound {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private intervalId: any = null;
  private autoStopTimer: any = null;
  private isPlaying = false;
  private onStopCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const unlockAudio = () => {
        this.unlock();
      };
      window.addEventListener("pointerdown", unlockAudio, { passive: true, capture: true });
      window.addEventListener("keydown", unlockAudio, { passive: true, capture: true });
      window.addEventListener("click", unlockAudio, { passive: true, capture: true });
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx && AudioCtx) {
      try {
        this.ctx = new AudioCtx();
        // Master Compressor to maximize gain without clipping or distortion
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        // Master Gain Node set to maximum practical level
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      } catch (e) {
        console.warn("[OrderAlarmSound] AudioContext creation warning:", e);
      }
    }
    return this.ctx;
  }

  unlock(): boolean {
    const ctx = this.getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  start(durationMs: number = 0, onStop?: () => void) {
    if (onStop) {
      this.onStopCallback = onStop;
    }

    // If already playing, do not start multiple overlapping alarm loops
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;

    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Play immediate first pulse
      this.playChimePulse();

      // Loop alarm pulse every 1400ms continuously until stop() is called
      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          this.playChimePulse();
        } else {
          this.clearTimers();
        }
      }, 1400);

      // Optional auto-stop timer if durationMs > 0 (e.g. for test sound)
      if (durationMs > 0) {
        this.autoStopTimer = setTimeout(() => {
          this.stop();
        }, durationMs);
      }
    } catch (e) {
      console.warn("[OrderAlarmSound] AudioContext start error:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    this.clearTimers();
    if (this.onStopCallback) {
      const cb = this.onStopCallback;
      this.onStopCallback = null;
      try {
        cb();
      } catch {
        // ignore
      }
    }
  }

  get active(): boolean {
    return this.isPlaying;
  }

  private clearTimers() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
  }

  private playChimePulse() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      // 4-note high-attention sequence: B5 (987.77Hz) -> E6 (1318.51Hz) -> A6 (1760.00Hz) -> C7 (2093.00Hz)
      const notes = [
        { freq: 987.77, startOffset: 0.0, duration: 0.28, gain: 0.95 },
        { freq: 1318.51, startOffset: 0.12, duration: 0.28, gain: 0.95 },
        { freq: 1760.00, startOffset: 0.24, duration: 0.35, gain: 1.0 },
        { freq: 2093.00, startOffset: 0.42, duration: 0.45, gain: 0.85 },
      ];

      notes.forEach((note) => {
        const startTime = now + note.startOffset;

        // Primary bright sine wave
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(note.freq, startTime);

        // Secondary rich triangle wave for acoustic body & warmth without clipping
        const osc2 = ctx.createOscillator();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(note.freq, startTime);

        // Crisp envelope: 5ms linear attack, exponential decay
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(note.gain, startTime + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.duration);

        osc1.connect(noteGain);
        osc2.connect(noteGain);

        noteGain.connect(this.masterGain!);

        osc1.start(startTime);
        osc2.start(startTime);

        osc1.stop(startTime + note.duration);
        osc2.stop(startTime + note.duration);
      });
    } catch (err) {
      console.warn("[OrderAlarmSound] Play error:", err);
    }
  }
}

export const orderAlarm = new OrderAlarmSound();

