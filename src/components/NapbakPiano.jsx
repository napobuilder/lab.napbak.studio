import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pianoEngine } from '../utils/NapbakPianoEngine';
import { Volume2, Sparkles, Sliders, Music, Download, Radio } from 'lucide-react';

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

export default function NapbakPiano({ onBack, isDedicatedPage = false }) {
  const [octave, setOctave] = useState(4); // Base Octave C4 (MIDI 60)
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [sustain, setSustain] = useState(false);
  const [reverb, setReverb] = useState(35);
  const [warmth, setWarmth] = useState(75);
  const [volume, setVolume] = useState(85);
  const [midiDevice, setMidiDevice] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [detectedChord, setDetectedChord] = useState(null);

  // Key tracking to prevent repetitive trigger on keydown holding
  const pressedKeysRef = useRef(new Set());

  // Handle note trigger
  const triggerNoteOn = useCallback((midiNote, velocity = 95) => {
    pianoEngine.playNote(midiNote, velocity);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.add(midiNote);
      return next;
    });
  }, []);

  const triggerNoteOff = useCallback((midiNote) => {
    pianoEngine.stopNote(midiNote);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(midiNote);
      return next;
    });
  }, []);

  // Update Chord Display on note change
  useEffect(() => {
    if (activeNotes.size >= 2) {
      setDetectedChord(detectChord(activeNotes));
    } else {
      setDetectedChord(null);
    }
  }, [activeNotes]);

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
        // Note On
        triggerNoteOn(note, velocity);
      } else if (command === 8 || (command === 9 && velocity === 0)) {
        // Note Off
        triggerNoteOff(note);
      } else if (command === 11 && note === 64) {
        // CC 64 Sustain Pedal
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
      .catch(() => {
        // MIDI unavailable or denied
      });

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
                01.5 INSTRUMENT LAB // REALTIME DSP
              </span>
            </div>
            <h2 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
              Napbak <span className="font-serif italic text-[#E0AAFF]">Concert Grand</span>
            </h2>
            <p className="text-xs text-white/40 font-mono tracking-wider mt-1 uppercase">
              Free Online Acoustic Grand Piano • Studio Grade Physical Modeling • Zero Latency
            </p>
          </div>

          {/* Quick Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {midiDevice ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] tracking-widest uppercase">
                <Radio className="w-3 h-3 animate-pulse" />
                MIDI: {midiDevice}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 font-mono text-[9px] tracking-widest uppercase">
                <Radio className="w-3 h-3 opacity-40" />
                MIDI READY (USB AUTO-DETECT)
              </div>
            )}

            {detectedChord && (
              <div className="px-4 py-1 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD] text-[#E0AAFF] font-mono text-[11px] font-bold tracking-widest animate-bounce">
                CHORD: {detectedChord}
              </div>
            )}
          </div>
        </div>

        {/* Master Piano Enclosure */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] via-[#0a0a0a] to-[#050505] p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#9D4EDD]/10 blur-3xl pointer-events-none"></div>

          {/* Top Control Bar */}
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

          {/* Interactive Piano Keyboard (Responsive Bed) */}
          <div 
            className="relative select-none overflow-x-auto pb-4 pt-2 flex justify-center"
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
                const isActive = activeNotes.has(midiNote);

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
                      className={`absolute z-20 top-0 w-6 md:w-8 h-28 md:h-40 rounded-b-md transition-all duration-75 flex flex-col justify-between items-center pb-2 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-b from-[#7B2CBF] to-[#9D4EDD] shadow-[0_0_25px_#9D4EDD] translate-y-[2px]'
                          : 'bg-gradient-to-b from-[#1a1a1a] via-[#111111] to-[#080808] border-b-4 border-black/80 hover:bg-[#222]'
                      }`}
                      style={{
                        // Standard piano geometric offset for black keys
                        left: `${getBlackKeyPosition(idx)}px`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1"></span>
                      <div className="flex flex-col items-center">
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
                    className={`relative z-10 w-8 md:w-11 h-full rounded-b-xl border-r border-black/20 transition-all duration-75 flex flex-col justify-end items-center pb-3 cursor-pointer ${
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

          {/* Bottom Guide & VST Callout Banner */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
            
            <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase">
              <span className="flex items-center gap-1.5 text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9D4EDD]"></span>
                QWERTY: Keys [A - ;]
              </span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="hidden sm:inline text-white/50">Black Keys: [W E T Y U O P]</span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span className="text-white/50">Sustain: [SPACE]</span>
            </div>

            {/* VST Download Promo Pill */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-2xl hover:border-[#9D4EDD]/40 transition-colors">
              <div className="flex flex-col">
                <span className="text-[10px] text-white font-bold tracking-wider uppercase">
                  WANT THIS IN FL STUDIO OR ABLETON?
                </span>
                <span className="text-[8px] text-white/40 tracking-wider">
                  Free Decent Sampler / VST3 format preset pack
                </span>
              </div>
              <a
                href="https://napoacademy.gumroad.com"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#9D4EDD] text-white text-[9px] font-bold tracking-widest uppercase hover:bg-[#E0AAFF] hover:text-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md shadow-[#9D4EDD]/20"
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
  // White keys before this black key
  // Octave 1:
  // C# (idx 1) -> after 1 white key
  // D# (idx 3) -> after 2 white keys
  // F# (idx 6) -> after 4 white keys
  // G# (idx 8) -> after 5 white keys
  // A# (idx 10) -> after 6 white keys
  // Octave 2:
  // C# (idx 13) -> after 8 white keys
  // D# (idx 15) -> after 9 white keys
  // F# (idx 18) -> after 11 white keys
  // G# (idx 20) -> after 12 white keys
  // A# (idx 22) -> after 13 white keys
  
  // Note: mobile vs desktop width is scaled via CSS or relative offset
  const whiteKeyWidthDesktop = 44; // md:w-11 = 44px
  const blackKeyWidthDesktop = 32; // md:w-8 = 32px

  const whiteKeyCountMap = {
    1: 1, 3: 2, 6: 4, 8: 5, 10: 6,
    13: 8, 15: 9, 18: 11, 20: 12, 22: 13
  };

  const count = whiteKeyCountMap[keyIndex] || 0;
  return count * whiteKeyWidthDesktop - (blackKeyWidthDesktop / 2) + 4;
}
