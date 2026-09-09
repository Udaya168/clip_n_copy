// Synthesized Web Audio API Alarm Sound for New Order Alerts
// Uses dual sine-wave bell tones (880Hz & 1046.5Hz - A5 & C6)
// Automatically stops after a maximum specified duration (default 10 seconds)

class OrderAlarmSound {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private autoStopTimer: any = null;
  private isPlaying = false;
  private onStopCallback: (() => void) | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx && AudioCtx) {
      this.ctx = new AudioCtx();
    }
    return this.ctx;
  }

  unlock(): boolean {
    const ctx = this.getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      // Play a short silent/quiet test tone to unlock browser audio
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  start(durationMs: number = 10000, onStop?: () => void) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onStopCallback = onStop || null;

    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      this.playChime();
      this.intervalId = setInterval(() => {
        if (this.isPlaying) {
          this.playChime();
        } else {
          this.clearTimers();
        }
      }, 2500);

      // Auto-stop sound after maximum duration (default 10 seconds)
      if (durationMs > 0) {
        this.autoStopTimer = setTimeout(() => {
          this.stop();
        }, durationMs);
      }
    } catch (e) {
      console.warn("[OrderAlarmSound] AudioContext init notice:", e);
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
      } catch (e) {
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

  private playChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      // Dual bell tones: 880Hz (A5) then 1046.5Hz (C6)
      const frequencies = [880, 1046.5];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        // Envelope: quick attack, exponential decay
        gain.gain.setValueAtTime(0.3, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.7);
      });
    } catch (err) {
      console.warn("[OrderAlarmSound] Play error:", err);
    }
  }
}

export const orderAlarm = new OrderAlarmSound();
