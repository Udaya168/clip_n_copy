// Synthesized Web Audio API Alarm Sound for New Order Alerts
// Uses dual sine-wave bell tones (880Hz & 1046.5Hz - A5 & C6)

class OrderAlarmSound {
  private ctx: AudioContext | null = null;
  private intervalId: any = null;
  private isPlaying = false;

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

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

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
          this.clearTimer();
        }
      }, 2500);
    } catch (e) {
      console.warn("[OrderAlarmSound] AudioContext init notice:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    this.clearTimer();
  }

  get active(): boolean {
    return this.isPlaying;
  }

  private clearTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
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
