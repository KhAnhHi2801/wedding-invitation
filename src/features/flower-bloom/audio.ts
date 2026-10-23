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

  // Thân vươn lên: mỗi nốt là một đoạn thân mọc thêm, cao dần theo `step` (0, 1, 2...), nhẹ như gảy đàn hạc
  public playGrowthNote(step: number) {
    if (!this.isEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const scale = [392.0, 440.0, 493.88, 587.33, 659.25]; // G4 A4 B4 D5 E5
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(scale[Math.min(step, scale.length - 1)], now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore audio failure
    }
  }

  // Nụ hình thành: một nhịp trầm tròn, như nụ căng lên
  public playBudSound() {
    if (!this.isEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(196, now);
      osc.frequency.exponentialRampToValueAtTime(293.66, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Hợp âm nở hoa (arpeggio ngũ cung). `spanSec` là thời gian rải các nốt: truyền đúng thời gian cánh hoa nở
   * (mốc bắt đầu nở đến lúc nở xong) để nốt cuối rơi vào lúc hoa nở trọn.
   */
  public playBloomChime(spanSec = 0.32) {
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
        const startTime = now + (idx * spanSec) / (freqs.length - 1);

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
