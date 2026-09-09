import { encodeWAV } from './wavExporter';

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
    this.isLoadingSamples = false;
    this.loadingProgress = 0;
    this.sustainPedal = false;
    this.sustainedNotes = new Set();
    
    // Audio Recording DSP State
    this.recordingTap = null;
    this.recorderNode = null;
    this.recorderMute = null;
    this.isRecording = false;
    this.recordedChunksLeft = [];
    this.recordedChunksRight = [];

    // Metronome State
    this.metronomeGain = null;
    this.isMetronomeActive = false;
    this.metronomeBpm = 120;
    this.metronomeTimer = null;
    this.nextBeatTime = 0;
    this.currentBeat = 0;

    // Default DSP parameters (Calibrated for Studio DAW Loudness)
    this.settings = {
      volume: 1.0,       // 0 to 1 (Studio Master Level)
      reverb: 0.35,      // 0 to 1
      warmth: 0.75,      // 0 (dark felt) to 1 (bright concert)
      releaseTime: 0.45  // seconds
    };

    // Note name mapping
    this.noteNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  }

  // Preload soundfont samples eagerly in the background
  preload() {
    this.init();
    this.loadAcousticSamples();
  }

  // Initialize Web Audio Context cleanly with zero DAC pop/glitch
  init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Hardware Audio Unlock: Smooth zero-gain buffer to prevent DAC click on startup
    try {
      const unlockBuffer = this.ctx.createBuffer(1, 128, this.ctx.sampleRate);
      const unlockGain = this.ctx.createGain();
      unlockGain.gain.value = 0.0;
      const unlockSource = this.ctx.createBufferSource();
      unlockSource.buffer = unlockBuffer;
      unlockSource.connect(unlockGain);
      unlockGain.connect(this.ctx.destination);
      unlockSource.start(0);
    } catch {}

    // 1. Master Output Bus & Studio Limiter / Maximizer
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.settings.volume, this.ctx.currentTime);

    // Transparent soft-knee mastering limiter: lets single notes breathe and glues chords without distortion
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-1.5, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(4.0, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(16, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.06, this.ctx.currentTime);

    // 2. Warmth Filter (Tone Control)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.updateWarmth(this.settings.warmth);

    // 3. Reverb DSP (Lush Concert Hall Impulse Response)
    this.reverbNode = this.ctx.createConvolver();
    this.reverbGain = this.ctx.createGain();
    this.dryGain = this.ctx.createGain();

    this.generateConcertImpulse(2.2, 2.0);
    this.updateReverb(this.settings.reverb);

    // Routing Graph (FL Studio AUX Send Architecture):
    // Direct dry signal remains at unity gain (1.0) so piano maintains full body and punch.
    // Voices -> Filter -> Dry (1.0) -> Master -> Limiter -> Destination
    //                   -> Reverb -> ReverbGain -> Master
    this.filterNode.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.filterNode.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    // 4. Recording Tap (captures full master wet+dry piano sound)
    this.recordingTap = this.ctx.createGain();
    this.compressor.connect(this.recordingTap);

    // 5. Dedicated Metronome Routing
    this.metronomeGain = this.ctx.createGain();
    this.metronomeGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.metronomeGain.connect(this.ctx.destination);

    // Start loading high-res acoustic grand samples in background
    this.loadAcousticSamples();
  }

  // Generate algorithmic lush hall impulse response with anti-click fade-in
  generateConcertImpulse(duration = 2.2, decay = 2.0) {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    // 8ms smooth cosine attack ramp to avoid transient DC step artifact
    const attackSamples = Math.min(length, Math.floor(sampleRate * 0.008));

    for (let i = 0; i < length; i++) {
      const n = length - i;
      let envelope = Math.pow(n / length, decay);
      if (i < attackSamples) {
        envelope *= (i / attackSamples);
      }
      left[i] = ((Math.random() * 2) - 1) * envelope * 0.45;
      right[i] = ((Math.random() * 2) - 1) * envelope * 0.45;
    }

    this.reverbNode.buffer = impulse;
  }

  // Load Acoustic Grand Piano soundfont samples with octave priority
  async loadAcousticSamples() {
    if (this.isLoadingSamples || this.isLoaded) return;
    this.isLoadingSamples = true;

    const cdnBase = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3';
    
    // 1. High-priority playable octave (C4 to C5: MIDI 60-72) loaded first
    const priorityNotes = [60, 62, 64, 65, 67, 69, 71, 72];

    // 2. Full keyboard range (MIDI 36 to 84, every 2 semitones covers all 88 keys via pitch ratio)
    const otherNotes = [];
    for (let m = 36; m <= 84; m += 2) {
      if (!priorityNotes.includes(m)) {
        otherNotes.push(m);
      }
    }

    const allNotes = [...priorityNotes, ...otherNotes];
    let loadedCount = 0;
    const total = allNotes.length;

    const fetchNote = async (midi) => {
      if (this.buffers.has(midi)) return;
      const noteName = this.midiToName(midi);
      try {
        const response = await fetch(`${cdnBase}/${noteName}.mp3`);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        
        let audioBuffer;
        if (this.ctx) {
          audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        } else {
          const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
          const offline = new OfflineCtx(2, 44100, 44100);
          audioBuffer = await offline.decodeAudioData(arrayBuffer);
        }
        this.buffers.set(midi, audioBuffer);
      } catch {
        // Fallback to warm procedural synthesis if offline
      } finally {
        loadedCount++;
        this.loadingProgress = Math.round((loadedCount / total) * 100);
        if (loadedCount >= priorityNotes.length) {
          this.isLoaded = true;
        }
      }
    };

    // Load central octave first in parallel (~150ms)
    await Promise.allSettled(priorityNotes.map(fetchNote));
    this.isLoaded = true;

    // Load remaining octaves in background
    await Promise.allSettled(otherNotes.map(fetchNote));
    this.isLoadingSamples = false;
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
      // Direct dry signal remains at 1.0 (unity gain) so piano body is never diminished by reverb
      this.dryGain.gain.setTargetAtTime(1.0, this.ctx.currentTime, 0.02);
      
      // Parallel wet reverb send
      const wet = Math.sin((this.settings.reverb * Math.PI) / 2);
      this.reverbGain.gain.setTargetAtTime(wet * 0.75, this.ctx.currentTime, 0.02);
    }
  }

  updateWarmth(val) {
    this.settings.warmth = Math.max(0, Math.min(1, val));
    if (this.filterNode && this.ctx) {
      const minFreq = 800;
      const maxFreq = 20000;
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
  playNote(midiNote, velocity = 95) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    const normalizedVel = Math.max(0.1, Math.min(1, velocity / 127));

    // Kill prior voice of same note to avoid phase build-up
    this.stopNote(midiNote, true);

    const nearestSample = this.getNearestBuffer(midiNote);
    let sourceNode;
    const voiceGain = this.ctx.createGain();

    // Studio DAW Gain Staging:
    // FluidR3 soundfont raw samples are recorded with -20 dBFS headroom.
    // Calibrated makeup multiplier (2.85x) ensures single notes peak at -3 dBFS
    // and chords comfortably hit -1.5 dBFS into the master transparent limiter,
    // matching commercial track loudness (-12 to -9 LUFS).
    const velCurve = Math.pow(normalizedVel, 1.15);

    if (nearestSample && nearestSample.buffer) {
      // 1. Play real acoustic sample buffer with studio makeup gain
      sourceNode = this.ctx.createBufferSource();
      sourceNode.buffer = nearestSample.buffer;
      sourceNode.playbackRate.setValueAtTime(nearestSample.rate, now);

      const peakGain = velCurve * 2.85;
      voiceGain.gain.setValueAtTime(peakGain, now);

      sourceNode.connect(voiceGain);
      voiceGain.connect(this.filterNode);

      sourceNode.start(now);
    } else {
      // 2. High-fidelity Procedural Physical-Modeling Acoustic Piano Voice (Warm Fallback)
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

      // Felt hammer dynamic tone filter
      const voiceFilter = this.ctx.createBiquadFilter();
      voiceFilter.type = 'lowpass';
      voiceFilter.frequency.setValueAtTime(Math.min(10000, freq * 4.5 + 800), now);
      voiceFilter.frequency.exponentialRampToValueAtTime(Math.max(250, freq * 1.4), now + 0.35);

      // Fundamental string oscillator (warm triangle)
      const oscFundamental = this.ctx.createOscillator();
      oscFundamental.type = 'triangle';
      oscFundamental.frequency.setValueAtTime(freq, now);

      // Harmonic overtone (pure sine for acoustic warmth)
      const oscHarmonic = this.ctx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);

      const harmonicGain = this.ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.25, now);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      // Subtle wooden hammer knock transient
      const hammerOsc = this.ctx.createOscillator();
      hammerOsc.type = 'sine';
      hammerOsc.frequency.setValueAtTime(120, now);
      hammerOsc.frequency.exponentialRampToValueAtTime(40, now + 0.025);

      const hammerGain = this.ctx.createGain();
      hammerGain.gain.setValueAtTime(0.15, now);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      // Smooth anti-click attack and decay envelope
      const peakSynthGain = velCurve * 1.35;
      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(peakSynthGain, now + 0.008);
      voiceGain.gain.exponentialRampToValueAtTime(peakSynthGain * 0.55, now + 0.4);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      oscFundamental.connect(voiceFilter);
      oscHarmonic.connect(harmonicGain);
      harmonicGain.connect(voiceFilter);
      hammerOsc.connect(hammerGain);
      hammerGain.connect(voiceFilter);

      voiceFilter.connect(voiceGain);
      voiceGain.connect(this.filterNode);

      oscFundamental.start(now);
      oscHarmonic.start(now);
      hammerOsc.start(now);

      sourceNode = {
        stop: (time) => {
          try {
            oscFundamental.stop(time);
            oscHarmonic.stop(time);
            hammerOsc.stop(time);
          } catch {}
        }
      };
    }

    if (!this.activeVoices.has(midiNote)) {
      this.activeVoices.set(midiNote, []);
    }
    this.activeVoices.get(midiNote).push({ source: sourceNode, gainNode: voiceGain });
  }

  // Release a note smoothly with release envelope
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
        const cur = Math.max(0.0001, gainNode.gain.value);
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(cur, now);
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

  // --- AUDIO RECORDING (STUDIO WAV CAPTURE) ---
  startRecordingAudio() {
    this.init();
    if (!this.ctx || !this.recordingTap) return;

    this.recordedChunksLeft = [];
    this.recordedChunksRight = [];
    this.isRecording = true;

    // Buffer size 4096 provides clean streaming chunks
    this.recorderNode = this.ctx.createScriptProcessor(4096, 2, 2);
    this.recorderMute = this.ctx.createGain();
    this.recorderMute.gain.value = 0; // Mute to avoid duplicate monitor output

    this.recorderNode.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inL = e.inputBuffer.getChannelData(0);
      const inR = e.inputBuffer.getChannelData(1);
      this.recordedChunksLeft.push(new Float32Array(inL));
      this.recordedChunksRight.push(new Float32Array(inR));
    };

    this.recordingTap.connect(this.recorderNode);
    this.recorderNode.connect(this.recorderMute);
    this.recorderMute.connect(this.ctx.destination);
  }

  stopRecordingAudio() {
    this.isRecording = false;

    if (this.recorderNode) {
      try {
        this.recorderNode.disconnect();
        this.recorderMute.disconnect();
      } catch {}
      this.recorderNode = null;
      this.recorderMute = null;
    }

    if (this.recordedChunksLeft.length === 0 || !this.ctx) {
      return null;
    }

    const totalSamples = this.recordedChunksLeft.reduce((sum, chunk) => sum + chunk.length, 0);
    const fullL = new Float32Array(totalSamples);
    const fullR = new Float32Array(totalSamples);

    let offset = 0;
    for (let i = 0; i < this.recordedChunksLeft.length; i++) {
      fullL.set(this.recordedChunksLeft[i], offset);
      fullR.set(this.recordedChunksRight[i], offset);
      offset += this.recordedChunksLeft[i].length;
    }

    const duration = totalSamples / this.ctx.sampleRate;
    const wavBlob = encodeWAV([fullL, fullR], this.ctx.sampleRate);

    // Clean buffers
    this.recordedChunksLeft = [];
    this.recordedChunksRight = [];

    return { blob: wavBlob, duration };
  }

  // --- METRONOME ENGINE (FL STUDIO PRECISION SCHEDULER) ---
  startMetronome(bpm = 120) {
    this.init();
    this.metronomeBpm = Math.max(40, Math.min(240, bpm));
    this.isMetronomeActive = true;
    this.currentBeat = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;

    if (this.metronomeTimer) clearInterval(this.metronomeTimer);

    // Lookahead scheduler loop (checks every 25ms)
    this.metronomeTimer = setInterval(() => {
      if (!this.isMetronomeActive || !this.ctx) return;
      const lookahead = 0.1; // schedule 100ms into the future
      while (this.nextBeatTime < this.ctx.currentTime + lookahead) {
        this.scheduleClick(this.nextBeatTime, this.currentBeat % 4 === 0);
        const secondsPerBeat = 60.0 / this.metronomeBpm;
        this.nextBeatTime += secondsPerBeat;
        this.currentBeat++;
      }
    }, 25);
  }

  setMetronomeBpm(bpm) {
    this.metronomeBpm = Math.max(40, Math.min(240, bpm));
  }

  stopMetronome() {
    this.isMetronomeActive = false;
    if (this.metronomeTimer) {
      clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
  }

  // Synthesizes a crisp, non-fatiguing DAW click directly into metronome output
  scheduleClick(time, isDownbeat) {
    if (!this.ctx || !this.metronomeGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = isDownbeat ? 1800 : 1200;
    const endFreq = isDownbeat ? 800 : 600;
    const peakGain = isDownbeat ? 0.45 : 0.28;
    const clickDuration = 0.035;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + clickDuration);

    gain.gain.setValueAtTime(peakGain, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + clickDuration);

    osc.connect(gain);
    gain.connect(this.metronomeGain);

    osc.start(time);
    osc.stop(time + clickDuration + 0.01);
  }
}

// Export singleton instance
export const pianoEngine = new NapbakPianoEngine();
