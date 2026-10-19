class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(enabled?: boolean) {
    this.isEnabled = enabled !== undefined ? enabled : !this.isEnabled;
    return this.isEnabled;
  }

  public get enabled() {
    return this.isEnabled;
  }

  // Soft organic seed drop sound
  public playSeedSound() {
    if (!this.isEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore audio failure
    }
  }

  // Sprout / growth gentle harp tone
  public playSproutSound() {
    if (!this.isEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.35); // C5

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore audio failure
    }
  }

  // Heavenly wedding floral bloom chord (Pentatonic arpeggio)
  public playBloomChime() {
    if (!this.isEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      // F# major / ethereal pentatonic: F#4, A#4, C#5, D#5, F#5
      const freqs = [369.99, 466.16, 554.37, 622.25, 739.99];
      const now = this.ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.6);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const soundManager = new SoundSynthesizer();
