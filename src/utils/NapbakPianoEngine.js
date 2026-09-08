// Napbak Concert Piano Engine - Web Audio DSP
// Designed for Napbak CTRL - Sample-accurate, zero-latency acoustic piano engine

class NapbakPianoEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.filterNode = null;
    this.compressor = null;
    
    // Sample buffer cache: midiNote -> AudioBuffer
    this.buffers = new Map();
    this.activeVoices = new Map(); // midiNote -> [{ source, gainNode }]
    
    // State
    this.isLoaded = false;
    this.loadingProgress = 0;
    this.sustainPedal = false;
    this.sustainedNotes = new Set();
    
    // Default DSP parameters
    this.settings = {
      volume: 0.85,
      reverb: 0.35,      // 0 to 1
      warmth: 0.75,      // 0 (dark felt) to 1 (bright concert)
      releaseTime: 0.45  // seconds
    };

    // Note name mapping
    this.noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  }

  // Initialize Web Audio Context on first user interaction
  init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Master Output & Safety Limiter
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.settings.volume, this.ctx.currentTime);

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.1, this.ctx.currentTime);

    // 2. Warmth Filter (Tone Control)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.updateWarmth(this.settings.warmth);

    // 3. Reverb DSP (Synthetic Lush Concert Hall Impulse)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();

    this.generateConcertImpulse(2.2, 2.0);
    this.updateReverb(this.settings.reverb);

    // Routing Graph:
    // Voices -> Filter -> Dry -> Master -> Compressor -> Destination
    //                   -> Reverb -> ReverbGain -> Master
    this.filterNode.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.filterNode.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // Start loading high-res acoustic grand samples in background
    this.loadAcousticSamples();
  }

  // Generate algorithmic lush hall impulse response for ConvolverNode
  generateConcertImpulse(duration, decay) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      const envelope = Math.pow(n / length, decay);
      left[i] = ((Math.random() * 2) - 1) * envelope;
      right[i] = ((Math.random() * 2) - 1) * envelope;
    }

    this.reverbNode.buffer = impulse;
  }

  // Load Acoustic Grand Piano soundfont samples
  async loadAcousticSamples() {
    const cdnBase = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3';
    
    // Core octave range (C3=48 to C6=84)
    const notesToPreload = [];
    for (let m = 36; m <= 84; m += 2) {
      notesToPreload.push(m);
    }

    let loadedCount = 0;
    const total = notesToPreload.length;

    const fetchNote = async (midi) => {
      const noteName = this.midiToName(midi);
      try {
        const response = await fetch(`${cdnBase}/${noteName}.mp3`);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(midi, audioBuffer);
      } catch {
        // Silently fallback to synthesized model if network fails
      } finally {
        loadedCount++;
        this.loadingProgress = Math.round((loadedCount / total) * 100);
        if (loadedCount >= Math.floor(total * 0.5)) {
          this.isLoaded = true;
        }
      }
    };

    // Parallel batches
    await Promise.allSettled(notesToPreload.map(fetchNote));
    this.isLoaded = true;
  }

  midiToName(midi) {
    const octave = Math.floor(midi / 12) - 1;
    const note = this.noteNames[midi % 12];
    return `${note}${octave}`;
  }

  setVolume(val) {
    this.settings.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.settings.volume, this.ctx.currentTime, 0.02);
    }
  }

  updateReverb(val) {
    this.settings.reverb = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.dryGain && this.ctx) {
      const wet = Math.sin((this.settings.reverb * Math.PI) / 2);
      const dry = Math.cos((this.settings.reverb * Math.PI) / 2);
      this.reverbGain.gain.setTargetAtTime(wet * 0.8, this.ctx.currentTime, 0.02);
      this.dryGain.gain.setTargetAtTime(dry, this.ctx.currentTime, 0.02);
    }
  }

  updateWarmth(val) {
    this.settings.warmth = Math.max(0, Math.min(1, val));
    if (this.filterNode && this.ctx) {
      const minFreq = 600;
      const maxFreq = 18000;
      const freq = minFreq * Math.pow(maxFreq / minFreq, this.settings.warmth);
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
    }
  }

  setSustain(isHeld) {
    this.sustainPedal = isHeld;
    if (!isHeld) {
      this.sustainedNotes.forEach((midiNote) => {
        this.stopNote(midiNote, true);
      });
      this.sustainedNotes.clear();
    }
  }

  // Find nearest cached sample buffer and calculate playbackRate pitch ratio
  getNearestBuffer(midiNote) {
    if (this.buffers.has(midiNote)) {
      return { buffer: this.buffers.get(midiNote), rate: 1.0 };
    }

    let nearest = null;
    let minDiff = Infinity;

    for (const cachedMidi of this.buffers.keys()) {
      const diff = Math.abs(cachedMidi - midiNote);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = cachedMidi;
      }
    }

    if (nearest !== null && minDiff <= 6) {
      const rate = Math.pow(2, (midiNote - nearest) / 12);
      return { buffer: this.buffers.get(nearest), rate };
    }

    return null;
  }

  // Play a note (midiNote: 21 to 108, velocity: 0 to 127)
  playNote(midiNote, velocity = 90) {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const normalizedVel = Math.max(0.1, Math.min(1, velocity / 127));

    // Kill prior voice of same note to avoid phase build-up
    this.stopNote(midiNote, true);

    const voiceGain = this.ctx.createGain();
    const nearestSample = this.getNearestBuffer(midiNote);

    let sourceNode;

    if (nearestSample && nearestSample.buffer) {
      // 1. Play real acoustic sample buffer
      sourceNode = this.ctx.createBufferSource();
      sourceNode.buffer = nearestSample.buffer;
      sourceNode.playbackRate.setValueAtTime(nearestSample.rate, now);

      // Velocity sensitive gain curve
      const peakGain = Math.pow(normalizedVel, 1.4) * 0.9;
      voiceGain.gain.setValueAtTime(peakGain, now);

      sourceNode.connect(voiceGain);
      voiceGain.connect(this.filterNode);

      sourceNode.start(now);
    } else {
      // 2. High-fidelity Procedural Acoustic Piano Fallback
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      
      const osc1 = this.ctx.createOscillator(); // Fundamental
      const osc2 = this.ctx.createOscillator(); // Octave harmonic
      const osc3 = this.ctx.createOscillator(); // Fifth harmonic

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc3.type = 'sine';

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 2, now);
      osc3.frequency.setValueAtTime(freq * 3, now);

      const subGain = this.ctx.createGain();
      const peakGain = Math.pow(normalizedVel, 1.2) * 0.5;

      voiceGain.gain.setValueAtTime(0.001, now);
      voiceGain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
      voiceGain.gain.exponentialRampToValueAtTime(peakGain * 0.6, now + 0.3);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc1.connect(subGain);
      osc2.connect(subGain);
      osc3.connect(subGain);
      subGain.connect(voiceGain);
      voiceGain.connect(this.filterNode);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      sourceNode = {
        stop: (time) => {
          try {
            osc1.stop(time);
            osc2.stop(time);
            osc3.stop(time);
          } catch {}
        }
      };
    }

    if (!this.activeVoices.has(midiNote)) {
      this.activeVoices.set(midiNote, []);
    }
    this.activeVoices.get(midiNote).push({ source: sourceNode, gainNode: voiceGain });
  }

  // Release a note
  stopNote(midiNote, force = false) {
    if (!this.ctx) return;

    if (this.sustainPedal && !force) {
      this.sustainedNotes.add(midiNote);
      return;
    }

    const voices = this.activeVoices.get(midiNote);
    if (!voices || voices.length === 0) return;

    const now = this.ctx.currentTime;
    const release = this.settings.releaseTime;

    voices.forEach(({ source, gainNode }) => {
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + release);

        if (source && typeof source.stop === 'function') {
          source.stop(now + release + 0.05);
        }
      } catch {}
    });

    this.activeVoices.delete(midiNote);
    this.sustainedNotes.delete(midiNote);
  }

  // All notes off
  panic() {
    if (!this.ctx) return;
    this.activeVoices.forEach((_, note) => this.stopNote(note, true));
    this.sustainedNotes.clear();
  }
}

// Export singleton instance
export const pianoEngine = new NapbakPianoEngine();
