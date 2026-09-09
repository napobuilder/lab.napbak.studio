import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pianoEngine } from '../utils/NapbakPianoEngine';
import { parseMidiFile, exportMidiFile } from '../utils/midiHandler';
import { 
  Volume2, 
  Sparkles, 
  Radio, 
  Download, 
  Play, 
  Pause, 
  Square, 
  Circle, 
  Upload, 
  Clock, 
  Music, 
  X, 
  RotateCcw,
  Sliders,
  FileMusic,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Chord Recognition helper
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function detectChord(activeNotes) {
  if (activeNotes.length < 2) return null;
  const semitones = Array.from(activeNotes).map(n => n % 12).sort((a, b) => a - b);
  const uniqueSemitones = Array.from(new Set(semitones));
  
  if (uniqueSemitones.length < 2) return null;

  for (let root of uniqueSemitones) {
    const intervals = uniqueSemitones.map(n => (n - root + 12) % 12).sort((a, b) => a - b);
    const rootName = NOTE_NAMES[root];
    const key = intervals.join(',');

    if (key === '0,4,7') return `${rootName} Maj`;
    if (key === '0,3,7') return `${rootName} min`;
    if (key === '0,4,7,11') return `${rootName}maj7`;
    if (key === '0,3,7,10') return `${rootName}m7`;
    if (key === '0,4,7,10') return `${rootName}7`;
    if (key === '0,3,6') return `${rootName}dim`;
    if (key === '0,4,8') return `${rootName}aug`;
    if (key === '0,2,7') return `${rootName}sus2`;
    if (key === '0,5,7') return `${rootName}sus4`;
    if (key === '0,2,4,7') return `${rootName}add9`;
    if (key === '0,3,7,10,14' || key === '0,2,3,7,10') return `${rootName}m9`;
    if (key === '0,4,7,11,14' || key === '0,2,4,7,11') return `${rootName}maj9`;
    if (key === '0,3,6,10') return `${rootName}m7b5`;
  }
  return null;
}

// 2-Octave Keyboard layout (24 semitones from C to B)
const KEYS_DEFINITION = [
  // Octave 1
  { semitone: 0, isBlack: false, note: 'C', keyBind: 'A' },
  { semitone: 1, isBlack: true, note: 'C#', keyBind: 'W' },
  { semitone: 2, isBlack: false, note: 'D', keyBind: 'S' },
  { semitone: 3, isBlack: true, note: 'D#', keyBind: 'E' },
  { semitone: 4, isBlack: false, note: 'E', keyBind: 'D' },
  { semitone: 5, isBlack: false, note: 'F', keyBind: 'F' },
  { semitone: 6, isBlack: true, note: 'F#', keyBind: 'T' },
  { semitone: 7, isBlack: false, note: 'G', keyBind: 'G' },
  { semitone: 8, isBlack: true, note: 'G#', keyBind: 'Y' },
  { semitone: 9, isBlack: false, note: 'A', keyBind: 'H' },
  { semitone: 10, isBlack: true, note: 'A#', keyBind: 'U' },
  { semitone: 11, isBlack: false, note: 'B', keyBind: 'J' },
  // Octave 2
  { semitone: 12, isBlack: false, note: 'C', keyBind: 'K' },
  { semitone: 13, isBlack: true, note: 'C#', keyBind: 'O' },
  { semitone: 14, isBlack: false, note: 'D', keyBind: 'L' },
  { semitone: 15, isBlack: true, note: 'D#', keyBind: 'P' },
  { semitone: 16, isBlack: false, note: 'E', keyBind: 'Ñ' },
  { semitone: 17, isBlack: false, note: 'F', keyBind: ';' },
  { semitone: 18, isBlack: true, note: 'F#', keyBind: '' },
  { semitone: 19, isBlack: false, note: 'G', keyBind: '' },
  { semitone: 20, isBlack: true, note: 'G#', keyBind: '' },
  { semitone: 21, isBlack: false, note: 'A', keyBind: '' },
  { semitone: 22, isBlack: true, note: 'A#', keyBind: '' },
  { semitone: 23, isBlack: false, note: 'B', keyBind: '' }
];

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 10);
  return `${m}:${s}.${ms}`;
}

export default function NapbakPiano({ onBack, isDedicatedPage = false }) {
  // Piano DSP & Voice States
  const [octave, setOctave] = useState(4); // Base Octave C4 (MIDI 60)
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [playbackVisualNotes, setPlaybackVisualNotes] = useState(new Set());
  const [sustain, setSustain] = useState(false);
  const [reverb, setReverb] = useState(35);
  const [warmth, setWarmth] = useState(75);
  const [volume, setVolume] = useState(100);
  const [midiDevice, setMidiDevice] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [detectedChord, setDetectedChord] = useState(null);

  // Recording Engine States
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Metronome States
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);

  // MIDI File Drag & Drop States (Master Analyzer Inspired)
  const [loadedMidi, setLoadedMidi] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [midiError, setMidiError] = useState('');
  const [activeTab, setActiveTab] = useState('play'); // 'play' | 'midiDrop'

  // Playback Engine States (replaying recorded take OR loaded MIDI)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackTotalDuration, setPlaybackTotalDuration] = useState(0);

  // Refs for audio time synchronization & recording
  const pressedKeysRef = useRef(new Set());
  const fileInputRef = useRef(null);
  const isRecordingRef = useRef(false);
  const recordStartPerfRef = useRef(0);
  const recordedNotesRef = useRef([]);
  const activeRecordingsMapRef = useRef(new Map());
  const recordingTimerRef = useRef(null);

  // Playback refs
  const isPlayingRef = useRef(false);
  const playbackRafRef = useRef(null);
  const playbackStartAudioTimeRef = useRef(0);
  const playbackActiveNotesRef = useRef(new Map()); // midi -> stopTime
  const playbackNotesRef = useRef([]);
  const playbackNoteIndexRef = useRef(0);

  // Keep isRecordingRef updated
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Combined active notes for visual piano rendering
  const visuallyActiveNotes = new Set([...activeNotes, ...playbackVisualNotes]);

  // Update Chord Display on note change
  useEffect(() => {
    if (visuallyActiveNotes.size >= 2) {
      setDetectedChord(detectChord(visuallyActiveNotes));
    } else {
      setDetectedChord(null);
    }
  }, [visuallyActiveNotes]);

  // Preload soundfont samples eagerly on component mount
  useEffect(() => {
    pianoEngine.preload();
  }, []);

  // Mobile Audio Unlock on first touch/click anywhere
  useEffect(() => {
    const handleFirstInteraction = () => {
      pianoEngine.init();
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };

    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('touchend', handleFirstInteraction, { passive: true });
    window.addEventListener('click', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('touchend', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Handle note trigger (Live Playing)
  const triggerNoteOn = useCallback((midiNote, velocity = 95) => {
    pianoEngine.init();
    pianoEngine.playNote(midiNote, velocity);

    // Visual state
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.add(midiNote);
      return next;
    });

    // Capture in recording buffer if REC is active
    if (isRecordingRef.current) {
      const nowSec = (performance.now() - recordStartPerfRef.current) / 1000;
      activeRecordingsMapRef.current.set(midiNote, {
        time: Math.max(0, nowSec),
        velocity
      });
    }
  }, []);

  const triggerNoteOff = useCallback((midiNote) => {
    pianoEngine.stopNote(midiNote);

    // Visual state
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });

    // Capture note duration if REC is active
    if (isRecordingRef.current && activeRecordingsMapRef.current.has(midiNote)) {
      const startObj = activeRecordingsMapRef.current.get(midiNote);
      activeRecordingsMapRef.current.delete(midiNote);
      const nowSec = (performance.now() - recordStartPerfRef.current) / 1000;
      const duration = Math.max(0.08, nowSec - startObj.time);

      recordedNotesRef.current.push({
        midi: midiNote,
        time: startObj.time,
        duration,
        velocity: startObj.velocity
      });
    }
  }, []);

  // Sustain Pedal
  const toggleSustain = useCallback(() => {
    setSustain(prev => {
      const next = !prev;
      pianoEngine.setSustain(next);
      return next;
    });
  }, []);

  // Computer Keyboard Listeners (FL Studio style QWERTY mapping)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Spacebar toggles sustain pedal
      if (e.code === 'Space') {
        e.preventDefault();
        if (!pressedKeysRef.current.has('Space')) {
          pressedKeysRef.current.add('Space');
          pianoEngine.setSustain(true);
          setSustain(true);
        }
        return;
      }

      // Octave shifts with Z and X
      if (e.key === 'z' || e.key === 'Z') {
        setOctave(o => Math.max(2, o - 1));
        return;
      }
      if (e.key === 'x' || e.key === 'X') {
        setOctave(o => Math.min(6, o + 1));
        return;
      }

      const upperKey = e.key.toUpperCase();
      if (pressedKeysRef.current.has(upperKey)) return;

      const foundKey = KEYS_DEFINITION.find(k => k.keyBind === upperKey);
      if (foundKey) {
        pressedKeysRef.current.add(upperKey);
        const midiNote = (octave + 1) * 12 + foundKey.semitone;
        triggerNoteOn(midiNote);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        pressedKeysRef.current.delete('Space');
        pianoEngine.setSustain(false);
        setSustain(false);
        return;
      }

      const upperKey = e.key.toUpperCase();
      pressedKeysRef.current.delete(upperKey);

      const foundKey = KEYS_DEFINITION.find(k => k.keyBind === upperKey);
      if (foundKey) {
        const midiNote = (octave + 1) * 12 + foundKey.semitone;
        triggerNoteOff(midiNote);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octave, triggerNoteOn, triggerNoteOff]);

  // Web MIDI API Auto-detection
  useEffect(() => {
    if (!navigator.requestMIDIAccess) return;
    let midiAccessRef = null;

    const onMidiMessage = (event) => {
      const [status, note, velocity] = event.data;
      const command = status >> 4;

      if (command === 9 && velocity > 0) {
        triggerNoteOn(note, velocity);
      } else if (command === 8 || (command === 9 && velocity === 0)) {
        triggerNoteOff(note);
      } else if (command === 11 && note === 64) {
        const isHeld = velocity >= 64;
        pianoEngine.setSustain(isHeld);
        setSustain(isHeld);
      }
    };

    navigator.requestMIDIAccess({ sysex: false })
      .then((access) => {
        midiAccessRef = access;
        const inputs = Array.from(access.inputs.values());
        if (inputs.length > 0) {
          setMidiDevice(inputs[0].name || 'Generic USB MIDI');
          inputs.forEach(input => {
            input.onmidimessage = onMidiMessage;
          });
        }

        access.onstatechange = (e) => {
          if (e.port.type === 'input') {
            const currentInputs = Array.from(access.inputs.values());
            if (currentInputs.length > 0) {
              setMidiDevice(currentInputs[0].name || 'Generic USB MIDI');
              currentInputs.forEach(input => {
                input.onmidimessage = onMidiMessage;
              });
            } else {
              setMidiDevice(null);
            }
          }
        };
      })
      .catch(() => {});

    return () => {
      if (midiAccessRef) {
        const inputs = Array.from(midiAccessRef.inputs.values());
        inputs.forEach(input => {
          input.onmidimessage = null;
        });
      }
    };
  }, [triggerNoteOn, triggerNoteOff]);

  // DSP Parameter handlers
  const handleReverbChange = (e) => {
    const val = Number(e.target.value);
    setReverb(val);
    pianoEngine.updateReverb(val / 100);
  };

  const handleWarmthChange = (e) => {
    const val = Number(e.target.value);
    setWarmth(val);
    pianoEngine.updateWarmth(val / 100);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    pianoEngine.setVolume(val / 100);
  };

  // --- RECORDING ACTIONS (FL STUDIO STYLE) ---
  const handleToggleRecord = () => {
    pianoEngine.init();

    if (isRecording) {
      // STOP RECORDING
      stopRecording();
    } else {
      // START RECORDING
      // If currently playing back, stop playback first
      if (isPlaying) stopPlayback();

      // Reset buffers
      recordedNotesRef.current = [];
      activeRecordingsMapRef.current.clear();
      setRecordedNotes([]);
      setRecordedAudioBlob(null);
      setRecordingDuration(0);

      // Start audio capture in engine
      pianoEngine.startRecordingAudio();

      // Start metronome if turned on
      if (isMetronomeActive) {
        pianoEngine.startMetronome(metronomeBpm);
      }

      recordStartPerfRef.current = performance.now();
      setIsRecording(true);

      // Live timer update
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        const elapsed = (performance.now() - recordStartPerfRef.current) / 1000;
        setRecordingDuration(elapsed);
      }, 50);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // Stop metronome
    pianoEngine.stopMetronome();

    // Close any still active keys
    const nowSec = (performance.now() - recordStartPerfRef.current) / 1000;
    activeRecordingsMapRef.current.forEach((startObj, midiNote) => {
      recordedNotesRef.current.push({
        midi: midiNote,
        time: startObj.time,
        duration: Math.max(0.1, nowSec - startObj.time),
        velocity: startObj.velocity
      });
    });
    activeRecordingsMapRef.current.clear();

    // Stop and retrieve master audio WAV
    const wavResult = pianoEngine.stopRecordingAudio();
    if (wavResult) {
      setRecordedAudioBlob(wavResult.blob);
      setRecordingDuration(wavResult.duration);
    }

    const finalNotes = [...recordedNotesRef.current].sort((a, b) => a.time - b.time);
    setRecordedNotes(finalNotes);

    // If notes were captured, set total playback duration
    if (finalNotes.length > 0) {
      const lastNote = finalNotes[finalNotes.length - 1];
      const maxDur = Math.max(1, lastNote.time + lastNote.duration);
      setPlaybackTotalDuration(maxDur);
      setPlaybackTime(0);
    }
  };

  // --- METRONOME CONTROLS ---
  const toggleMetronome = () => {
    const nextState = !isMetronomeActive;
    setIsMetronomeActive(nextState);
    if (nextState) {
      pianoEngine.startMetronome(metronomeBpm);
    } else {
      pianoEngine.stopMetronome();
    }
  };

  const handleBpmChange = (delta) => {
    const next = Math.max(50, Math.min(220, metronomeBpm + delta));
    setMetronomeBpm(next);
    pianoEngine.setMetronomeBpm(next);
  };

  // --- PLAYBACK ENGINE (SYNCHRONIZED SOUND & VISUAL KEYS) ---
  const currentActiveNotesSource = loadedMidi ? loadedMidi.notes : recordedNotes;
  const currentTotalDuration = loadedMidi ? loadedMidi.duration : (recordedAudioBlob ? recordingDuration : playbackTotalDuration);

  const startPlayback = (fromTime = playbackTime) => {
    pianoEngine.init();
    if (!pianoEngine.ctx) return;
    if (currentActiveNotesSource.length === 0) return;

    // Panic previous voices
    pianoEngine.panic();
    setPlaybackVisualNotes(new Set());
    playbackActiveNotesRef.current.clear();

    const notesToPlay = [...currentActiveNotesSource].sort((a, b) => a.time - b.time);
    playbackNotesRef.current = notesToPlay;

    // Find starting index using binary search or simple loop
    let startIndex = 0;
    while (startIndex < notesToPlay.length && notesToPlay[startIndex].time < fromTime) {
      startIndex++;
    }
    playbackNoteIndexRef.current = startIndex;

    const startAudioTime = pianoEngine.ctx.currentTime - fromTime;
    playbackStartAudioTimeRef.current = startAudioTime;

    setIsPlaying(true);
    isPlayingRef.current = true;

    // RAF Loop
    const tickPlayback = () => {
      if (!isPlayingRef.current || !pianoEngine.ctx) return;

      const currentSongTime = pianoEngine.ctx.currentTime - playbackStartAudioTimeRef.current;
      setPlaybackTime(Math.min(currentTotalDuration, currentSongTime));

      // Trigger upcoming notes
      let idx = playbackNoteIndexRef.current;
      while (idx < notesToPlay.length && notesToPlay[idx].time <= currentSongTime + 0.02) {
        const note = notesToPlay[idx];
        pianoEngine.playNote(note.midi, note.velocity);
        playbackActiveNotesRef.current.set(note.midi, note.time + note.duration);
        idx++;
      }
      playbackNoteIndexRef.current = idx;

      // Check ended notes & update visual lights
      const activeVisual = new Set();
      playbackActiveNotesRef.current.forEach((endTime, midi) => {
        if (currentSongTime >= endTime) {
          pianoEngine.stopNote(midi);
          playbackActiveNotesRef.current.delete(midi);
        } else {
          activeVisual.add(midi);
        }
      });
      setPlaybackVisualNotes(activeVisual);

      // Check end of track
      if (currentSongTime >= currentTotalDuration + 0.3) {
        stopPlayback();
        setPlaybackTime(0);
        return;
      }

      playbackRafRef.current = requestAnimationFrame(tickPlayback);
    };

    playbackRafRef.current = requestAnimationFrame(tickPlayback);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (playbackRafRef.current) cancelAnimationFrame(playbackRafRef.current);
    pianoEngine.panic();
    setPlaybackVisualNotes(new Set());
    playbackActiveNotesRef.current.clear();
  };

  const stopPlayback = () => {
    pausePlayback();
    setPlaybackTime(0);
    playbackNoteIndexRef.current = 0;
  };

  // --- MIDI FILE DRAG & DROP (MASTER ANALYZER STYLE) ---
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files.length) {
      processSelectedMidiFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length) {
      processSelectedMidiFile(e.target.files[0]);
    }
  };

  const processSelectedMidiFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      setMidiError('Please upload a standard MIDI file (.mid or .midi)');
      setTimeout(() => setMidiError(''), 4000);
      return;
    }

    try {
      setMidiError('');
      const arrayBuffer = await file.arrayBuffer();
      const parsed = parseMidiFile(arrayBuffer);

      if (parsed.notes.length === 0) {
        setMidiError('The uploaded MIDI file contains no piano note events.');
        setTimeout(() => setMidiError(''), 4000);
        return;
      }

      // Stop any running playback/recording
      if (isPlaying) stopPlayback();
      if (isRecording) stopRecording();

      setLoadedMidi({
        ...parsed,
        fileName: file.name
      });
      setPlaybackTotalDuration(parsed.duration);
      setPlaybackTime(0);
      if (parsed.bpm) setMetronomeBpm(parsed.bpm);
      setActiveTab('play'); // Switch to main piano stage
    } catch (err) {
      console.error(err);
      setMidiError('Could not parse MIDI file. Ensure it is a valid SMF 0 or 1 file.');
      setTimeout(() => setMidiError(''), 4000);
    }
  };

  const handleClearLoadedMidi = () => {
    stopPlayback();
    setLoadedMidi(null);
    setPlaybackTime(0);
    setPlaybackTotalDuration(0);
  };

  // --- DOWNLOAD EXPORTS ---
  const handleDownloadWav = () => {
    if (!recordedAudioBlob) return;
    const url = URL.createObjectURL(recordedAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `napbak-concert-grand-${Date.now()}.wav`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadMidi = () => {
    const notesToExport = loadedMidi ? loadedMidi.notes : recordedNotes;
    if (!notesToExport || notesToExport.length === 0) return;

    const midiBlob = exportMidiFile(notesToExport, metronomeBpm, loadedMidi ? loadedMidi.name : 'Napbak Piano Take');
    const url = URL.createObjectURL(midiBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${loadedMidi ? loadedMidi.fileName : 'napbak-piano-take'}.mid`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const baseMidi = (octave + 1) * 12;

  return (
    <section id="piano" aria-label="Napbak Virtual Concert Grand Piano" className="py-20 relative z-10 border-t border-white/5 bg-[#050505]/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Back to Analyzer button in dedicated page mode */}
        {isDedicatedPage && onBack && (
          <div className="mb-6">
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#9D4EDD]/20 border border-white/10 hover:border-[#9D4EDD]/40 text-white/70 hover:text-white font-mono text-[10px] tracking-widest uppercase transition-all shadow-md active:scale-95"
            >
              <span className="group-hover:-translate-x-1 transition-transform text-[#9D4EDD]">←</span> BACK TO MASTER ANALYZER
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#9D4EDD] animate-pulse"></span>
              <span className="text-[10px] tracking-[0.4em] text-[#9D4EDD] uppercase font-mono font-bold">
                01.5 INSTRUMENT LAB // REALTIME DSP & RECORDER
              </span>
            </div>
            <h2 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
              Napbak <span className="font-serif italic text-[#E0AAFF]">Concert Grand</span>
            </h2>
            <p className="text-xs text-white/40 font-mono tracking-wider mt-1 uppercase">
              Free Acoustic Grand • Zero Latency • FL Studio Transport & MIDI Dropzone
            </p>
          </div>

          {/* Quick Status Badges & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* MIDI In Status */}
            {midiDevice ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] tracking-widest uppercase">
                <Radio className="w-3 h-3 animate-pulse" />
                MIDI: {midiDevice}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono text-[9px] tracking-widest uppercase">
                <Radio className="w-3 h-3 opacity-40" />
                MIDI READY (USB AUTO)
              </div>
            )}

            {/* Chord Detection Badge */}
            {detectedChord && (
              <div className="px-4 py-1 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD] text-[#E0AAFF] font-mono text-[11px] font-bold tracking-widest animate-bounce">
                CHORD: {detectedChord}
              </div>
            )}

            {/* View Switcher Tabs (Play Piano vs Dropzone) */}
            <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
              <button
                onClick={() => setActiveTab('play')}
                className={`px-3 py-1 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all ${
                  activeTab === 'play' 
                    ? 'bg-[#9D4EDD] text-white shadow-[0_0_15px_rgba(157,78,221,0.5)]' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                PIANO WORKSTATION
              </button>
              <button
                onClick={() => setActiveTab('midiDrop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] tracking-wider uppercase transition-all ${
                  activeTab === 'midiDrop' 
                    ? 'bg-[#9D4EDD] text-white shadow-[0_0_15px_rgba(157,78,221,0.5)]' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Upload className="w-3 h-3" />
                {loadedMidi ? 'MIDI LOADED' : 'DROP MIDI'}
              </button>
            </div>
          </div>
        </div>

        {/* Master Piano Enclosure */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] via-[#0a0a0a] to-[#050505] p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#9D4EDD]/10 blur-3xl pointer-events-none"></div>

          {/* FL STUDIO PRO TRANSPORT BAR */}
          <div className="mb-6 p-4 rounded-2xl bg-[#090909] border border-[#9D4EDD]/20 shadow-xl flex flex-wrap items-center justify-between gap-4 relative z-20">
            
            {/* 1. Playback / Recording Buttons */}
            <div className="flex items-center gap-2">
              {/* Record Button */}
              <button
                onClick={handleToggleRecord}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 border ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-pulse'
                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50'
                }`}
                title="Toggle Record Take (Audio & MIDI)"
              >
                <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-white' : 'fill-red-400'}`} />
                {isRecording ? 'RECORDING' : 'REC'}
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={() => {
                  if (isPlaying) {
                    pausePlayback();
                  } else {
                    startPlayback();
                  }
                }}
                disabled={isRecording || (recordedNotes.length === 0 && !loadedMidi)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 border disabled:opacity-30 disabled:pointer-events-none ${
                  isPlaying
                    ? 'bg-[#9D4EDD] text-white border-[#E0AAFF] shadow-[0_0_25px_rgba(157,78,221,0.6)]'
                    : 'bg-white/5 text-white/90 border-white/10 hover:bg-[#9D4EDD]/20 hover:border-[#9D4EDD]/40'
                }`}
                title="Play / Pause Replay"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    PLAY
                  </>
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={() => {
                  if (isRecording) stopRecording();
                  if (isPlaying) stopPlayback();
                  setPlaybackTime(0);
                }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-95"
                title="Stop & Reset"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>

            {/* 2. LCD Digital Timecode Display */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-white/10">
              <div className="flex flex-col">
                <span className="text-[8px] font-mono tracking-widest uppercase text-white/40">
                  {isRecording ? 'REC TIMECODE' : isPlaying ? 'PLAYHEAD' : 'TRANSPORT'}
                </span>
                <span className={`font-mono text-base md:text-lg font-bold tracking-widest ${
                  isRecording ? 'text-red-400 animate-pulse' : isPlaying ? 'text-[#E0AAFF]' : 'text-white/80'
                }`}>
                  {formatTime(isRecording ? recordingDuration : playbackTime)}
                </span>
              </div>

              {currentTotalDuration > 0 && !isRecording && (
                <span className="text-white/30 font-mono text-xs">
                  / {formatTime(currentTotalDuration)}
                </span>
              )}
            </div>

            {/* 3. Metronome & BPM Controls */}
            <div className="flex items-center gap-3">
              {/* Metronome Click Toggle */}
              <button
                onClick={toggleMetronome}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[10px] tracking-widest uppercase border transition-all ${
                  isMetronomeActive
                    ? 'bg-[#9D4EDD]/30 border-[#9D4EDD] text-[#E0AAFF] shadow-[0_0_15px_rgba(157,78,221,0.3)]'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
                }`}
                title="Metronome Click (Independent Master Output)"
              >
                <Clock className="w-3 h-3" />
                CLICK
              </button>

              {/* BPM Stepper */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                <button
                  onClick={() => handleBpmChange(-1)}
                  className="w-6 h-6 text-white/50 hover:text-white font-mono text-xs flex items-center justify-center active:scale-95"
                  title="Decrease BPM"
                >
                  -
                </button>
                <span className="px-2 font-mono text-xs font-bold text-white tracking-wider">
                  {metronomeBpm} <span className="text-[9px] text-white/40">BPM</span>
                </span>
                <button
                  onClick={() => handleBpmChange(1)}
                  className="w-6 h-6 text-white/50 hover:text-white font-mono text-xs flex items-center justify-center active:scale-95"
                  title="Increase BPM"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Export Buttons (Download WAV / Download MIDI) */}
            <div className="flex items-center gap-2">
              {/* Download Studio WAV */}
              <button
                onClick={handleDownloadWav}
                disabled={!recordedAudioBlob}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9D4EDD]/10 hover:bg-[#9D4EDD]/30 border border-[#9D4EDD]/30 hover:border-[#9D4EDD] text-white font-mono text-[10px] tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                title="Download 16-bit 44.1kHz Studio WAV"
              >
                <Download className="w-3 h-3 text-[#E0AAFF]" />
                WAV
              </button>

              {/* Download Standard MIDI */}
              <button
                onClick={handleDownloadMidi}
                disabled={recordedNotes.length === 0 && !loadedMidi}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#9D4EDD]/20 border border-white/10 hover:border-[#9D4EDD]/40 text-white font-mono text-[10px] tracking-widest uppercase transition-all disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                title="Export standard MIDI (.mid) for FL Studio / Ableton"
              >
                <Download className="w-3 h-3 text-[#9D4EDD]" />
                MIDI
              </button>
            </div>

          </div>

          {/* MASTER ANALYZER-STYLE MIDI DROP ZONE PANEL (When Tab Selected OR File Loaded) */}
          {activeTab === 'midiDrop' && (
            <div className="mb-8 relative border border-[#9D4EDD]/30 bg-[#070707] rounded-2xl overflow-hidden p-6 shadow-2xl transition-all duration-500">
              
              {/* Tech Scanline Background */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.08) 0%, transparent 70%)' }}></div>
              <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] opacity-60"></div>
              
              {/* Corner Tech Badges */}
              <div className="absolute top-3 left-4 text-[8px] font-mono text-[#9D4EDD]/60 tracking-[0.2em] hidden sm:block pointer-events-none">
                [ MIDI:IN // ENGINE:CONCERT GRAND ]
              </div>
              <div className="absolute top-3 right-4 text-[8px] font-mono text-[#9D4EDD]/60 tracking-[0.2em] hidden sm:block pointer-events-none">
                [ AUTO-CHORD:ACTIVE // SMF:0-1 ]
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".mid,.midi,audio/midi"
                className="hidden"
              />

              {midiError && (
                <div className="mb-4 bg-red-950/80 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-xs font-mono flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  {midiError}
                </div>
              )}

              {loadedMidi ? (
                /* Loaded MIDI Card */
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center text-[#E0AAFF] shadow-lg shadow-[#9D4EDD]/20">
                        <FileMusic className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-[#E0AAFF] tracking-widest uppercase font-bold">
                            MIDI TRACK LOADED
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <h4 className="font-modern text-lg md:text-xl text-white font-light tracking-tight">
                          {loadedMidi.fileName || loadedMidi.name}
                        </h4>
                        <p className="text-[10px] font-mono text-white/40 tracking-wider">
                          {loadedMidi.totalNotes} NOTES • {formatTime(loadedMidi.duration)} • {loadedMidi.bpm} BPM
                        </p>
                      </div>
                    </div>

                    {/* Action Controls for Loaded MIDI */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (isPlaying) pausePlayback();
                          else startPlayback();
                        }}
                        className="px-5 py-2 rounded-xl bg-[#9D4EDD] hover:bg-[#b05eed] text-white font-mono text-xs font-bold tracking-widest uppercase transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-[#9D4EDD]/30"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        {isPlaying ? 'PAUSE' : 'PLAY MIDI'}
                      </button>

                      <button
                        onClick={handleClearLoadedMidi}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 transition-colors"
                        title="Eject / Clear MIDI"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Playhead Timeline Scrubber */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-white/50">
                      <span>TIMELINE POSITION</span>
                      <span className="text-[#E0AAFF]">{formatTime(playbackTime)} / {formatTime(loadedMidi.duration)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={loadedMidi.duration || 1}
                      step="0.1"
                      value={playbackTime}
                      onChange={(e) => {
                        const targetTime = Number(e.target.value);
                        setPlaybackTime(targetTime);
                        if (isPlaying) {
                          startPlayback(targetTime);
                        }
                      }}
                      className="w-full accent-[#9D4EDD] bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                /* Empty Dropzone (Master Analyzer Style) */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl cursor-pointer transition-all duration-300 group z-10 ${
                    isDragActive 
                      ? 'bg-[#9D4EDD]/10 border-2 border-dashed border-[#9D4EDD] scale-[0.99]' 
                      : 'bg-white/[0.01] hover:bg-white/[0.03] border border-dashed border-white/10 hover:border-[#9D4EDD]/40'
                  }`}
                >
                  {/* Central Pulsing Iris Ring */}
                  <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                    <div className={`absolute inset-0 rounded-full border transition-all duration-700 ${
                      isDragActive 
                        ? 'border-[#9D4EDD] scale-110 blur-sm shadow-[0_0_30px_#9D4EDD]' 
                        : 'border-[#9D4EDD]/40 shadow-[0_0_20px_rgba(157,78,221,0.2)] animate-pulse'
                    }`}></div>
                    <div className="w-16 h-16 rounded-full bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-[#E0AAFF] group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>

                  <h3 className="font-modern text-xl md:text-2xl text-white font-light tracking-tight mb-1">
                    Drop your Piano MIDI File here
                  </h3>
                  <p className="text-xs text-white/50 font-mono tracking-wider uppercase mb-3">
                    Drag & Drop .mid / .midi to test with Napbak Concert Acoustic DSP
                  </p>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono text-[9px] tracking-widest uppercase group-hover:border-[#9D4EDD] group-hover:text-white transition-all">
                    OR BROWSE FROM COMPUTER
                  </span>
                </div>
              )}

            </div>
          )}

          {/* Master DSP Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            
            {/* Control 1: Octave Shift */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono tracking-widest uppercase text-white/40">OCTAVE (Z / X)</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setOctave(o => Math.max(2, o - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#9D4EDD]/20 border border-white/10 text-white font-mono text-xs flex items-center justify-center transition-all active:scale-95"
                  title="Octave Down (Z)"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-white tracking-widest px-2">
                  C{octave}
                </span>
                <button
                  onClick={() => setOctave(o => Math.min(6, o + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#9D4EDD]/20 border border-white/10 text-white font-mono text-xs flex items-center justify-center transition-all active:scale-95"
                  title="Octave Up (X)"
                >
                  +
                </button>
              </div>
            </div>

            {/* Control 2: Space / Reverb */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-white/40">
                <span>CONCERT REVERB</span>
                <span className="text-[#E0AAFF] font-bold">{reverb}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={reverb}
                onChange={handleReverbChange}
                className="w-full accent-[#9D4EDD] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>

            {/* Control 3: Warmth (Tone Filter) */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-white/40">
                <span>TONE / FELT</span>
                <span className="text-[#E0AAFF] font-bold">{warmth}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={warmth}
                onChange={handleWarmthChange}
                className="w-full accent-[#9D4EDD] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>

            {/* Control 4: Master Volume */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase text-white/40">
                <span>MASTER VOL</span>
                <span className="text-[#E0AAFF] font-bold">{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#9D4EDD] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer mt-3"
              />
            </div>

            {/* Control 5: Sustain Pedal Toggle */}
            <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
              <button
                onClick={toggleSustain}
                className={`w-full h-9 rounded-xl font-mono text-[10px] tracking-widest uppercase border transition-all duration-300 flex items-center justify-center gap-2 ${
                  sustain
                    ? 'bg-[#9D4EDD] text-white border-[#9D4EDD] shadow-[0_0_20px_rgba(157,78,221,0.4)]'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                SUSTAIN [SPACE]
              </button>
            </div>

          </div>

          {/* Interactive Piano Keyboard (Responsive Bed with Realtime Visual Lights) */}
          <div 
            className="relative select-none overflow-x-auto pb-4 pt-2 flex justify-center touch-pan-x"
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => {
              setIsMouseDown(false);
              pianoEngine.panic();
              setActiveNotes(new Set());
            }}
            onMouseLeave={() => {
              setIsMouseDown(false);
              pianoEngine.panic();
              setActiveNotes(new Set());
            }}
          >
            <div className="relative inline-flex h-48 md:h-64 shadow-[0_15px_40px_rgba(0,0,0,0.9)] rounded-b-2xl p-1 bg-[#141414] border border-white/10">
              
              {KEYS_DEFINITION.map((keyDef, idx) => {
                const midiNote = baseMidi + keyDef.semitone;
                const isActive = visuallyActiveNotes.has(midiNote);

                if (keyDef.isBlack) {
                  // Black Key (Placed absolute on top of adjacent white keys)
                  return (
                    <button
                      key={midiNote}
                      type="button"
                      aria-label={`Key ${keyDef.note}`}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        triggerNoteOn(midiNote);
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        triggerNoteOff(midiNote);
                      }}
                      onMouseEnter={() => {
                        if (isMouseDown) triggerNoteOn(midiNote);
                      }}
                      onMouseLeave={() => {
                        if (isMouseDown) triggerNoteOff(midiNote);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerNoteOn(midiNote);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerNoteOff(midiNote);
                      }}
                      onTouchCancel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerNoteOff(midiNote);
                      }}
                      className={`absolute z-20 top-0 w-6 md:w-8 h-28 md:h-40 rounded-b-md transition-all duration-75 flex flex-col justify-between items-center pb-2 cursor-pointer touch-none ${
                        isActive
                          ? 'bg-gradient-to-b from-[#7B2CBF] to-[#9D4EDD] shadow-[0_0_25px_#9D4EDD] translate-y-[2px]'
                          : 'bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#080808] border-b-4 border-black/80 hover:bg-[#222]'
                      }`}
                      style={{
                        left: `${getBlackKeyPosition(idx)}px`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1"></span>
                      <div className="flex flex-col items-center pointer-events-none">
                        <span className="text-[8px] font-mono text-white/50 tracking-tighter">{keyDef.keyBind}</span>
                        <span className="text-[7px] font-mono text-white/30">{keyDef.note}</span>
                      </div>
                    </button>
                  );
                }

                // White Key
                return (
                  <button
                    key={midiNote}
                    type="button"
                    aria-label={`Key ${keyDef.note}`}
                    onMouseDown={() => triggerNoteOn(midiNote)}
                    onMouseUp={() => triggerNoteOff(midiNote)}
                    onMouseEnter={() => {
                      if (isMouseDown) triggerNoteOn(midiNote);
                    }}
                    onMouseLeave={() => {
                      if (isMouseDown) triggerNoteOff(midiNote);
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      triggerNoteOn(midiNote);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      triggerNoteOff(midiNote);
                    }}
                    onTouchCancel={(e) => {
                      e.preventDefault();
                      triggerNoteOff(midiNote);
                    }}
                    className={`relative z-10 w-8 md:w-11 h-full rounded-b-xl border-r border-black/20 transition-all duration-75 flex flex-col justify-end items-center pb-3 cursor-pointer touch-none ${
                      isActive
                        ? 'bg-gradient-to-t from-[#E0AAFF] via-[#C77DFF] to-white shadow-[0_0_30px_rgba(157,78,221,0.8)] translate-y-[3px]'
                        : 'bg-gradient-to-b from-[#f8f8f8] via-[#e5e5e5] to-[#d4d4d4] hover:bg-white shadow-[inset_0_-4px_6px_rgba(0,0,0,0.15)]'
                    }`}
                  >
                    <div className="flex flex-col items-center pointer-events-none">
                      <span className={`text-[10px] font-mono font-bold tracking-tighter ${isActive ? 'text-black' : 'text-neutral-700'}`}>
                        {keyDef.keyBind}
                      </span>
                      <span className={`text-[8px] font-mono ${isActive ? 'text-black/70' : 'text-neutral-400'}`}>
                        {keyDef.note}
                      </span>
                    </div>
                  </button>
                );
              })}

            </div>
          </div>

          {/* Bottom Guide & Universal VST Pack Banner */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
            
            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-widest uppercase">
              <span className="flex items-center gap-1.5 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9D4EDD]"></span>
                QWERTY: Keys [A - ;]
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="hidden sm:inline text-white/50">Black Keys: [W E T Y U O P]</span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="text-white/50">Sustain: [SPACE]</span>
            </div>

            {/* Native VST3 Download Pill */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2.5 rounded-2xl hover:border-[#9D4EDD]/40 transition-colors">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  NATIVE VST3 PLUGIN FOR FL STUDIO & DAWS
                </span>
                <span className="text-[8px] text-white/40 tracking-wider">
                  Windows 64-bit VST3 • 88-Key Acoustic Grand • Reverb & Felt DSP
                </span>
              </div>
              <a
                href="/downloads/Napbak_Concert_Grand_VST3_Win64.zip"
                download="Napbak_Concert_Grand_VST3_Win64.zip"
                className="px-3.5 py-1.5 rounded-xl bg-[#9D4EDD] text-white text-[9px] font-bold tracking-widest uppercase hover:bg-[#E0AAFF] hover:text-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-[#9D4EDD]/30"
              >
                <Download className="w-3 h-3" />
                GET VST3
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

// Pixel offset calculation for black keys based on white key width
function getBlackKeyPosition(keyIndex) {
  const whiteKeyWidthDesktop = 44; // md:w-11 = 44px
  const blackKeyWidthDesktop = 32; // md:w-8 = 32px

  const whiteKeyCountMap = {
    1: 1, 3: 2, 6: 4, 8: 5, 10: 6,
    13: 8, 15: 9, 18: 11, 20: 12, 22: 13
  };

  const count = whiteKeyCountMap[keyIndex] || 0;
  return count * whiteKeyWidthDesktop - (blackKeyWidthDesktop / 2) + 4;
}
