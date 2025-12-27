import { Howl, Howler } from 'howler';

type SoundType = 'ui' | 'gameplay' | 'ambient';

interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
  type: SoundType;
}

// Sound IDs for the game
export type SoundId =
  // Gesture sounds
  | 'place_pickup'
  | 'place_drop'
  | 'dot_drop'
  // Feedback sounds
  | 'perfect'
  | 'great'
  | 'good'
  | 'miss'
  | 'timer_warning'
  // UI sounds
  | 'button_tap'
  | 'star_reveal';

// Tone configuration for Web Audio API placeholder sounds
interface ToneConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  // Optional frequency modulation for more complex sounds
  frequencyEnd?: number;
  // Attack/decay envelope
  attack?: number;
  decay?: number;
}

// Placeholder tone configurations (these create pleasant, subtle sounds)
const TONE_CONFIGS: Record<SoundId, ToneConfig> = {
  // Gesture sounds
  place_pickup: { frequency: 800, duration: 0.08, type: 'sine', volume: 0.15, frequencyEnd: 1200, attack: 0.01 },
  place_drop: { frequency: 600, duration: 0.12, type: 'triangle', volume: 0.2, frequencyEnd: 400, attack: 0.01 },
  dot_drop: { frequency: 700, duration: 0.06, type: 'sine', volume: 0.18, frequencyEnd: 500, attack: 0.005 },  // Soft "plip" sound
  // Feedback sounds
  perfect: { frequency: 880, duration: 0.35, type: 'sine', volume: 0.25, attack: 0.02, decay: 0.3 },
  great: { frequency: 660, duration: 0.25, type: 'sine', volume: 0.2, attack: 0.02, decay: 0.2 },
  good: { frequency: 523, duration: 0.2, type: 'sine', volume: 0.15, attack: 0.02, decay: 0.15 },
  miss: { frequency: 200, duration: 0.15, type: 'triangle', volume: 0.15, frequencyEnd: 150, attack: 0.01 },
  timer_warning: { frequency: 440, duration: 0.2, type: 'sine', volume: 0.2, attack: 0.01, decay: 0.15 },
  // UI sounds
  button_tap: { frequency: 1000, duration: 0.05, type: 'sine', volume: 0.1, attack: 0.005 },
  star_reveal: { frequency: 1047, duration: 0.4, type: 'sine', volume: 0.2, frequencyEnd: 1319, attack: 0.02, decay: 0.35 },
};

export class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private volumes: Record<SoundType, number> = {
    ui: 1,
    gameplay: 1,
    ambient: 0.5,
  };
  private muted = false;
  private initialized = false;
  private audioContext: AudioContext | null = null;
  private useWebAudio = true; // Use Web Audio API for placeholder sounds

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Initialize audio context (must be called from user interaction)
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Resume Howler's audio context if suspended
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        await Howler.ctx.resume();
      }

      // Create our own audio context for Web Audio API tones
      this.audioContext = new AudioContext();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.initialized = true;
    } catch (error) {
      console.warn('[AudioManager] Failed to initialize:', error);
    }
  }

  // Play a synthesized tone (Web Audio API placeholder)
  private playTone(config: ToneConfig): void {
    if (!this.audioContext || this.muted) return;

    try {
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = config.type;
      osc.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // Frequency slide if specified
      if (config.frequencyEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          config.frequencyEnd,
          ctx.currentTime + config.duration
        );
      }

      // Envelope
      const attack = config.attack ?? 0.01;
      const decay = config.decay ?? config.duration * 0.8;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(config.volume, ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + attack + decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + config.duration + 0.1);
    } catch (error) {
      console.warn('[AudioManager] Failed to play tone:', error);
    }
  }

  // Play a chime sound (for perfect placement and star reveals)
  private playChime(baseFrequency: number, volume: number): void {
    if (!this.audioContext || this.muted) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Play harmonics for a richer sound
    const harmonics = [1, 1.5, 2];
    const volumes = [volume, volume * 0.5, volume * 0.25];

    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = baseFrequency * harmonic;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volumes[i], now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  register(id: string, config: SoundConfig): void {
    const sound = new Howl({
      src: config.src,
      volume: (config.volume ?? 1) * this.volumes[config.type],
      loop: config.loop ?? false,
    });
    this.sounds.set(id, sound);
  }

  play(id: SoundId): number | undefined {
    if (this.muted) return undefined;

    // First try Howl sounds (for when real audio files are loaded)
    const sound = this.sounds.get(id);
    if (sound) {
      return sound.play();
    }

    // Fall back to Web Audio API tones
    if (this.useWebAudio && this.audioContext) {
      const config = TONE_CONFIGS[id];
      if (config) {
        // Special handling for certain sounds
        if (id === 'perfect' || id === 'star_reveal') {
          this.playChime(config.frequency, config.volume);
        } else {
          this.playTone(config);
        }
      }
    }

    return undefined;
  }

  // Play star reveal with staggered timing (call for each star)
  playStarReveal(starIndex: number): void {
    if (this.muted) return;

    // Each star plays at a slightly higher pitch
    const baseFreq = 880 + (starIndex * 220); // C5, E5, G5 approximately
    setTimeout(() => {
      this.playChime(baseFreq, 0.2);
    }, starIndex * 200); // Stagger by 200ms
  }

  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.stop();
    }
  }

  setVolume(type: SoundType, volume: number): void {
    this.volumes[type] = Math.max(0, Math.min(1, volume));
    // Update all sounds of this type
    this.sounds.forEach((sound) => {
      // Would need to track type per sound for proper implementation
      sound.volume(volume);
    });
  }

  mute(): void {
    this.muted = true;
    Howler.mute(true);
  }

  unmute(): void {
    this.muted = false;
    Howler.mute(false);
  }

  toggleMute(): boolean {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const audioManager = AudioManager.getInstance();
