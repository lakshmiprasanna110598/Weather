/**
 * Atmospheric Ambient Sound Generator using Web Audio API.
 * 100% offline-ready, self-contained, no external audio files required.
 * Generates natural rain, wind, night ambient pads, and warm solar harmonic chimes.
 */

export type SoundscapeType = 'rain' | 'wind' | 'night' | 'sunny';

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentType: SoundscapeType = 'sunny';
  private volume: number = 0.5;

  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private timerIds: number[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }

  public stop() {
    this.isRunning = false;
    this.timerIds.forEach((id) => window.clearTimeout(id));
    this.timerIds = [];

    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  public play(type: SoundscapeType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.isRunning = true;
    this.currentType = type;

    switch (type) {
      case 'rain':
        this.startRainSound();
        break;
      case 'wind':
        this.startWindSound();
        break;
      case 'night':
        this.startNightSound();
        break;
      case 'sunny':
      default:
        this.startSunnySound();
        break;
    }
  }

  private createNoiseBuffer(durationSeconds = 4): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }
    return buffer;
  }

  /* 🌧️ 1. Gentle Rain Soundscape */
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(5);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, lowpass, rainGain);

    const scheduleDrop = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();

      const freq = 1200 + Math.random() * 1400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.07 + Math.random() * 0.08, this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);

      const nextTime = 100 + Math.random() * 280;
      const tid = window.setTimeout(scheduleDrop, nextTime);
      this.timerIds.push(tid);
    };

    scheduleDrop();
  }

  /* 🍃 2. Soft Wind Breeze Soundscape */
  private startWindSound() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(6);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(340, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(2.4, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();

    this.activeNodes.push(noiseSource, bandpass, lfo, lfoGain, windGain);
  }

  /* 🌙 3. Astral Night Calm & Crickets Soundscape */
  private startNightSound() {
    if (!this.ctx || !this.masterGain) return;

    const freqs = [130.81, 196.00, 246.94]; // C3, G3, B3
    freqs.forEach((f) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      padGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      osc.connect(padGain);
      padGain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push(osc, padGain);
    });

    const scheduleCricket = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const cricketGain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4600 + Math.random() * 300, this.ctx.currentTime);

      cricketGain.gain.setValueAtTime(0.028, this.ctx.currentTime);
      cricketGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(cricketGain);
      cricketGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);

      const next = 200 + Math.random() * 450;
      const tid = window.setTimeout(scheduleCricket, next);
      this.timerIds.push(tid);
    };

    scheduleCricket();
  }

  /* ☀️ 4. Sunny Warm Ambient Drone & Golden Chimes */
  private startSunnySound() {
    if (!this.ctx || !this.masterGain) return;

    const notes = [146.83, 220.0, 293.66, 440.0]; // D3, A3, D4, A4
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      noteGain.gain.setValueAtTime(0.08 / (idx + 1), this.ctx.currentTime);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push(osc, noteGain);
    });

    const bellNotes = [587.33, 659.25, 739.99, 880.0, 987.77];
    const scheduleBell = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const note = bellNotes[Math.floor(Math.random() * bellNotes.length)];
      const osc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      bellGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);

      osc.connect(bellGain);
      bellGain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.3);

      const next = 2200 + Math.random() * 3000;
      const tid = window.setTimeout(scheduleBell, next);
      this.timerIds.push(tid);
    };

    scheduleBell();
  }
}

export const ambientSound = new AmbientSoundEngine();
