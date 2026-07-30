/**
 * Arkan Game - Sound & Voice Narration Service
 * 
 * Provides:
 * 1. Web Audio API Procedural Synthesizer (Zero-latency, offline SFX for UI clicks, success, pops, coins, fanfares).
 * 2. Web Speech Synthesis API (Indonesian TTS narration for bedtime stories, animal names, numbers, colors).
 * 3. Audio Context auto-resume handling for browser autoplay policies.
 */

export type SfxType = 'click' | 'success' | 'wrong' | 'win' | 'pop' | 'coin' | 'whoosh' | 'star' | 'pedal';

export interface SpeechOptions {
  rate?: number;     // 0.5 to 2.0 (default: 0.9 for kids)
  pitch?: number;    // 0.5 to 2.0 (default: 1.05 for friendly tone)
  volume?: number;   // 0.0 to 1.0 (default: 1.0)
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SoundService {
  private audioCtx: AudioContext | null = null;
  private indonesianVoice: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private isSpeechActive: boolean = false;

  constructor() {
    this.initAudioContext();
    this.initVoiceEngine();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }

      // Auto-unlock audio context on first user gesture anywhere
      const unlock = () => {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      };

      window.addEventListener('click', unlock, { once: false });
      window.addEventListener('touchstart', unlock, { once: false });
      window.addEventListener('keydown', unlock, { once: false });
    }
  }

  private initVoiceEngine() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Priority for id-ID voices (e.g. Google Bahasa Indonesia, Microsoft Aris/Gadis)
        this.indonesianVoice = 
          voices.find(v => v.lang === 'id-ID' || v.lang === 'id_ID') ||
          voices.find(v => v.lang.startsWith('id')) ||
          voices.find(v => v.name.toLowerCase().includes('indonesia')) ||
          null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  /**
   * Play a real-time musical note frequency via Web Audio API (Piano Synthesizer)
   */
  public playNote(freq: number, duration: number = 0.5) {
    if (this.isMuted || !this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Triangle/sine hybrid for warm piano chime tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Error playing note frequency:', e);
    }
  }

  /**
   * Synthesize procedural SFX via Web Audio API
   */
  public playSfx(type: SfxType) {
    if (this.isMuted || !this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      switch (type) {
        case 'click': {
          // Soft bubble click
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'success': {
          // Upward happy major chord arpeggio (C5 - E5 - G5 - C6)
          const freqs = [523.25, 659.25, 783.99, 1046.50];
          freqs.forEach((freq, index) => {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const noteTime = now + index * 0.07;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0.25, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.2);
          });
          break;
        }

        case 'wrong': {
          // Low buzzing error tone (F3 to Eb3)
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(174.61, now); // F3
          osc.frequency.setValueAtTime(155.56, now + 0.1); // Eb3

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'pop': {
          // Pop sound for balloons & bubbles
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'coin': {
          // Shiny coin pickup ding (E6 -> B6)
          const osc1 = this.audioCtx.createOscillator();
          const osc2 = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(1318.51, now); // E6
          osc2.frequency.setValueAtTime(1975.53, now + 0.08); // B6

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc1.start(now);
          osc1.stop(now + 0.08);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.3);
          break;
        }

        case 'star': {
          // Magical sparkling star chime
          [1046.50, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const t = now + i * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, t);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.25);
          });
          break;
        }

        case 'win': {
          // Level completion fanfare (C5 - E5 - G5 - C6 - E6)
          const notes = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.2 },
            { f: 1318.51, d: 0.4 },
          ];
          let timeOffset = 0;

          notes.forEach((n) => {
            if (!this.audioCtx) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const noteStart = now + timeOffset;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, noteStart);

            gain.gain.setValueAtTime(0.3, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + n.d);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + n.d);

            timeOffset += n.d * 0.7;
          });
          break;
        }

        case 'whoosh': {
          // Soft transition noise sweep
          const bufferSize = this.audioCtx.sampleRate * 0.15;
          const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = this.audioCtx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, now);
          filter.frequency.exponentialRampToValueAtTime(1600, now + 0.15);

          const gain = this.audioCtx.createGain();
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.audioCtx.destination);

          noise.start(now);
          noise.stop(now + 0.15);
          break;
        }

        case 'pedal': {
          // Bike pedal click
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }
      }
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  /**
   * Speak Indonesian text narration using Web Speech Synthesis
   */
  public speak(text: string, options: SpeechOptions = {}) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // Stop existing speech before speaking new text
    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = options.rate ?? 0.9;   // Kid-friendly steady reading rate
    utterance.pitch = options.pitch ?? 1.05; // Slightly cheerful pitch
    utterance.volume = options.volume ?? 1.0;

    if (this.indonesianVoice) {
      utterance.voice = this.indonesianVoice;
    }

    utterance.onstart = () => {
      this.isSpeechActive = true;
    };

    utterance.onend = () => {
      this.isSpeechActive = false;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (err) => {
      this.isSpeechActive = false;
      if (options.onError) options.onError(err);
      else if (options.onEnd) options.onEnd();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Gagal membacakan narasi suara:', e);
      this.isSpeechActive = false;
      if (options.onEnd) options.onEnd();
    }
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeechActive = false;
    }
  }

  public pauseSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resumeSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return this.isSpeechActive;
  }
}

export const soundService = new SoundService();
