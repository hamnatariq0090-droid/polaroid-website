// Synthesizes soft, authentic instant camera shutter & film roller sounds using Web Audio API

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playCameraShutterAndPrint() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Crisp mechanical shutter click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      clickGain.gain.setValueAtTime(0.22, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.05);

      // 2. Second mirror slap click
      const slapOsc = ctx.createOscillator();
      const slapGain = ctx.createGain();
      slapOsc.type = 'sine';
      slapOsc.frequency.setValueAtTime(620, now + 0.055);
      slapOsc.frequency.exponentialRampToValueAtTime(110, now + 0.095);

      slapGain.gain.setValueAtTime(0.16, now + 0.055);
      slapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      slapOsc.connect(slapGain);
      slapGain.connect(ctx.destination);
      slapOsc.start(now + 0.055);
      slapOsc.stop(now + 0.11);

      // 3. Soft instant-film roller whir (printing paper out)
      const motorOsc = ctx.createOscillator();
      const motorFilter = ctx.createBiquadFilter();
      const motorGain = ctx.createGain();

      motorOsc.type = 'sawtooth';
      motorOsc.frequency.setValueAtTime(155, now + 0.14);
      motorOsc.frequency.linearRampToValueAtTime(168, now + 0.6);
      motorOsc.frequency.linearRampToValueAtTime(148, now + 1.45);

      motorFilter.type = 'lowpass';
      motorFilter.frequency.setValueAtTime(420, now + 0.14);

      motorGain.gain.setValueAtTime(0.001, now + 0.14);
      motorGain.gain.linearRampToValueAtTime(0.045, now + 0.22);
      motorGain.gain.setValueAtTime(0.045, now + 1.25);
      motorGain.gain.exponentialRampToValueAtTime(0.001, now + 1.48);

      motorOsc.connect(motorFilter);
      motorFilter.connect(motorGain);
      motorGain.connect(ctx.destination);

      motorOsc.start(now + 0.14);
      motorOsc.stop(now + 1.5);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  public playSoftPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.065);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.075);
    } catch {
      // Ignore
    }
  }

  public playSparkleChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 1046.5]; // E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.07, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundFX = new SoundEffects();
