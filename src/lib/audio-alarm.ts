// Reliable Web Audio API Alarm Sound for Admin Order Alerts
// Uses synthesized multi-tone oscillators through master GainNode
// Plays continuously for 10 seconds per unique order alert and automatically stops.

class OrderAlarmSound {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;
  private isPlaying = false;
  private activeAlarmTimer: any = null;
  private chimeIntervalTimer: any = null;
  private playedRequestIds = new Set<string>();

  constructor() {
    if (typeof window !== "undefined") {
      console.log("[ALARM] Audio initialized");
      const handleUnlock = () => {
        console.log("[ALARM] Audio unlock attempted");
        this.unlockAudioContext();
        if (this.isAudioUnlocked) {
          window.removeEventListener("pointerdown", handleUnlock, true);
          window.removeEventListener("click", handleUnlock, true);
          window.removeEventListener("keydown", handleUnlock, true);
        }
      };

      window.addEventListener("pointerdown", handleUnlock, { passive: true, capture: true });
      window.addEventListener("click", handleUnlock, { passive: true, capture: true });
      window.addEventListener("keydown", handleUnlock, { passive: true, capture: true });
    }
  }

  unlockAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx) {
        console.log(`[ALARM] audio context state: ${this.ctx.state}`);
      }

      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().then(() => {
          if (this.ctx) {
            console.log(`[ALARM] audio context resumed: ${this.ctx.state}`);
            this.isUnlocked = true;
          }
        }).catch((err) => {
          console.error("[ALARM ERROR] AudioContext resume error:", err);
        });
      } else if (this.ctx && this.ctx.state === "running") {
        this.isUnlocked = true;
      }
    } catch (err) {
      console.error("[ALARM ERROR] AudioContext initialization failed:", err);
    }

    return this.ctx;
  }

  unlock(): boolean {
    return !!this.unlockAudioContext();
  }

  playAlertSound(requestId: string): boolean {
    console.log(`[ALARM] sound requested: ${requestId}`);

    if (this.playedRequestIds.has(requestId)) {
      console.log(`[ALARM] Duplicate request ID ignored: ${requestId}`);
      return false;
    }
    this.playedRequestIds.add(requestId);

    if (this.isPlaying) {
      console.log(`[ALARM] Alarm already active. Request ${requestId} registered without overlapping.`);
      return true;
    }

    this.start10SecAlarm(requestId);
    return true;
  }

  private start10SecAlarm(requestId: string) {
    this.isPlaying = true;
    console.log(`[ALARM] Starting 10-second alert sound for request: ${requestId}`);

    const playChimeSequence = () => {
      if (!this.isPlaying) return;
      const ctx = this.unlockAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume().then(() => {
          if (this.isPlaying && this.ctx) {
            this.triggerChime(this.ctx, requestId);
          }
        }).catch(() => {});
      } else if (ctx.state === "running") {
        this.triggerChime(ctx, requestId);
      }
    };

    // Play first chime immediately
    playChimeSequence();

    // Repeat chime every 1.2 seconds for continuous 10-second alert
    if (this.chimeIntervalTimer) {
      clearInterval(this.chimeIntervalTimer);
    }
    this.chimeIntervalTimer = setInterval(() => {
      if (this.isPlaying) {
        playChimeSequence();
      }
    }, 1200);

    // Automatically stop after EXACTLY 10 seconds
    if (this.activeAlarmTimer) {
      clearTimeout(this.activeAlarmTimer);
    }
    this.activeAlarmTimer = setTimeout(() => {
      console.log("[ALARM] 10-second alarm duration reached. Automatically stopping sound.");
      this.stop();
    }, 10000);
  }

  private triggerChime(ctx: AudioContext, requestId: string) {
    try {
      const now = ctx.currentTime;
      console.log(`[ALARM] oscillator started: ${requestId}`);

      // High-attention 4-note chime sequence: B5 (987.77Hz) -> E6 (1318.51Hz) -> A6 (1760.00Hz) -> C7 (2093.00Hz)
      const notes = [
        { freq: 987.77, time: now, duration: 0.25 },
        { freq: 1318.51, time: now + 0.15, duration: 0.25 },
        { freq: 1760.00, time: now + 0.3, duration: 0.3 },
        { freq: 2093.00, time: now + 0.5, duration: 0.45 },
      ];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.85, now);
      masterGain.connect(ctx.destination);

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, note.time);

        noteGain.gain.setValueAtTime(0.001, note.time);
        noteGain.gain.linearRampToValueAtTime(0.9, note.time + 0.005);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, note.time + note.duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(note.time);
        osc.stop(note.time + note.duration);
      });

      setTimeout(() => {
        console.log(`[ALARM] oscillator finished: ${requestId}`);
      }, 1000);
    } catch (err) {
      console.error(`[ALARM ERROR] Oscillator trigger failed for ${requestId}:`, err);
    }
  }

  start(durationMs: number = 10000, onStop?: () => void) {
    this.start10SecAlarm("test-sound");
    if (durationMs > 0 && onStop) {
      setTimeout(() => {
        this.stop();
        onStop();
      }, durationMs);
    }
  }

  stop() {
    console.log("[ALARM] Stopping alert sound");
    this.isPlaying = false;
    if (this.activeAlarmTimer) {
      clearTimeout(this.activeAlarmTimer);
      this.activeAlarmTimer = null;
    }
    if (this.chimeIntervalTimer) {
      clearInterval(this.chimeIntervalTimer);
      this.chimeIntervalTimer = null;
    }
  }

  get active(): boolean {
    return this.isPlaying;
  }

  get isAudioUnlocked(): boolean {
    return this.isUnlocked || (this.ctx !== null && this.ctx.state === "running");
  }
}

export const orderAlarm = new OrderAlarmSound();

export function stopAdminAlertSound() {
  orderAlarm.stop();
}
