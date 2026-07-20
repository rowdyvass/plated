/**
 * Lab foley — procedural but physical-sounding.
 *
 * Everything is synthesized from filtered noise + short pitch envelopes, which
 * reads as material contact rather than the oscillator "beeps" of the current
 * AudioManager. Real recorded foley slots in later; this module defines the
 * event vocabulary (pickup / thud / slide / scatter / pour).
 */

type NoiseBuffers = { white: AudioBuffer; pink: AudioBuffer };

class LabAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers: NoiseBuffers | null = null;

  // Continuous sauce-pour loop, gain tied to gesture speed
  private pourSource: AudioBufferSourceNode | null = null;
  private pourGain: GainNode | null = null;
  private pourFilter: BiquadFilterNode | null = null;

  /** Must be called from a user gesture. Safe to call repeatedly. */
  ensure(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this.buffers = this.makeNoise(this.ctx);
  }

  private makeNoise(ctx: AudioContext): NoiseBuffers {
    const length = ctx.sampleRate * 2;
    const white = ctx.createBuffer(1, length, ctx.sampleRate);
    const pink = ctx.createBuffer(1, length, ctx.sampleRate);
    const w = white.getChannelData(0);
    const p = pink.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < length; i++) {
      const n = Math.random() * 2 - 1;
      w[i] = n;
      // Paul Kellet's economy pink-noise approximation
      b0 = 0.99765 * b0 + n * 0.099046;
      b1 = 0.963 * b1 + n * 0.2965164;
      b2 = 0.57 * b2 + n * 1.0526913;
      p[i] = (b0 + b1 + b2 + n * 0.1848) * 0.18;
    }
    return { white, pink };
  }

  private burst(opts: {
    buffer: 'white' | 'pink';
    duration: number;
    volume: number;
    filterType: BiquadFilterType;
    freqStart: number;
    freqEnd?: number;
    q?: number;
    delay?: number;
  }): void {
    if (!this.ctx || !this.master || !this.buffers) return;
    const t0 = this.ctx.currentTime + (opts.delay ?? 0);
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[opts.buffer];
    src.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = opts.filterType;
    filter.Q.value = opts.q ?? 0.8;
    filter.frequency.setValueAtTime(opts.freqStart, t0);
    if (opts.freqEnd !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(30, opts.freqEnd), t0 + opts.duration);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(opts.volume, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + opts.duration);

    src.connect(filter).connect(gain).connect(this.master);
    src.start(t0);
    src.stop(t0 + opts.duration + 0.05);
  }

  /** Weighted contact: protein landing on ceramic. size 0..1 scales depth. */
  thud(size = 0.6): void {
    if (!this.ctx || !this.master) return;
    this.ensure();
    this.burst({
      buffer: 'pink',
      duration: 0.12 + size * 0.06,
      volume: 0.32 + size * 0.3,
      filterType: 'lowpass',
      freqStart: 380 + size * 160,
      freqEnd: 90,
    });
    // Body resonance under the noise
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + size * 60, t0);
    osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.11);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, t0);
    g.gain.linearRampToValueAtTime(0.16 + size * 0.12, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.13);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.16);
  }

  /** Soft dairy slide — the quenelle release. */
  slide(): void {
    this.ensure();
    this.burst({
      buffer: 'pink',
      duration: 0.22,
      volume: 0.14,
      filterType: 'bandpass',
      freqStart: 900,
      freqEnd: 300,
      q: 1.2,
    });
  }

  /** Herbs landing: a stagger of tiny ticks. */
  scatter(count: number): void {
    this.ensure();
    for (let i = 0; i < count; i++) {
      this.burst({
        buffer: 'white',
        duration: 0.03,
        volume: 0.05 + Math.random() * 0.04,
        filterType: 'bandpass',
        freqStart: 2400 + Math.random() * 1800,
        q: 3,
        delay: i * 0.045 + Math.random() * 0.02,
      });
    }
  }

  /** Picking something up off the plate. */
  pickup(): void {
    this.ensure();
    this.burst({
      buffer: 'white',
      duration: 0.04,
      volume: 0.07,
      filterType: 'bandpass',
      freqStart: 1600,
      q: 2,
    });
  }

  /** Start the continuous sauce-pour bed (gain driven by pourLevel). */
  pourStart(): void {
    this.ensure();
    if (!this.ctx || !this.master || !this.buffers || this.pourSource) return;
    this.pourSource = this.ctx.createBufferSource();
    this.pourSource.buffer = this.buffers.pink;
    this.pourSource.loop = true;
    this.pourFilter = this.ctx.createBiquadFilter();
    this.pourFilter.type = 'lowpass';
    this.pourFilter.frequency.value = 700;
    this.pourGain = this.ctx.createGain();
    this.pourGain.gain.value = 0;
    this.pourSource.connect(this.pourFilter).connect(this.pourGain).connect(this.master);
    this.pourSource.start();
  }

  /** speed 0..1 — smoothed into pour loudness + brightness. */
  pourLevel(speed: number): void {
    if (!this.ctx || !this.pourGain || !this.pourFilter) return;
    const t = this.ctx.currentTime;
    this.pourGain.gain.setTargetAtTime(0.05 + speed * 0.22, t, 0.05);
    this.pourFilter.frequency.setTargetAtTime(500 + speed * 900, t, 0.08);
  }

  pourEnd(): void {
    if (!this.ctx || !this.pourGain || !this.pourSource) return;
    const t = this.ctx.currentTime;
    this.pourGain.gain.setTargetAtTime(0, t, 0.06);
    const src = this.pourSource;
    src.stop(t + 0.4);
    this.pourSource = null;
    this.pourGain = null;
    this.pourFilter = null;
  }

  destroy(): void {
    this.pourEnd();
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.master = null;
    this.buffers = null;
  }
}

export const labAudio = new LabAudio();
