import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Sliders, 
  Trash2, 
  RefreshCw, 
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { calculateIntegratedLUFS, calculateLoudnessRange, estimateTruePeak } from '../utils/audioDsp';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../utils/translations';

export default function DualReferenceComparator() {
  const { lang } = useLanguageStore();
  const t = translations[lang]?.comparator || translations.en.comparator;

  // Slot A State
  const [fileA, setFileA] = useState(null);
  const [bufferA, setBufferA] = useState(null);
  const [metricsA, setMetricsA] = useState(null);
  const [isAnalyzingA, setIsAnalyzingA] = useState(false);
  const [isDragA, setIsDragA] = useState(false);

  // Slot B State
  const [fileB, setFileB] = useState(null);
  const [bufferB, setBufferB] = useState(null);
  const [metricsB, setMetricsB] = useState(null);
  const [isAnalyzingB, setIsAnalyzingB] = useState(false);
  const [isDragB, setIsDragB] = useState(false);

  // Playback & Fader States
  const [isPlaying, setIsPlaying] = useState(false);
  const [faderPosition, setFaderPosition] = useState(50); // 0 = 100% Track A, 100 = 100% Track B
  const [matchLoudness, setMatchLoudness] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Audio Context & Nodes Refs
  const audioCtxRef = useRef(null);
  const sourceARef = useRef(null);
  const sourceBRef = useRef(null);
  const gainARef = useRef(null);
  const gainBRef = useRef(null);
  const masterGainRef = useRef(null);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const progressAnimRef = useRef(null);

  // Calculate maximum common duration
  useEffect(() => {
    const durA = bufferA ? bufferA.duration : 0;
    const durB = bufferB ? bufferB.duration : 0;
    setTotalDuration(Math.max(durA, durB));
  }, [bufferA, bufferB]);

  // Update Crossfade & Match Loudness in real-time
  useEffect(() => {
    if (!gainARef.current || !gainBRef.current) return;

    const norm = faderPosition / 100; // 0 to 1
    // Equal-power crossfade curves
    let gainA = Math.cos(norm * 0.5 * Math.PI);
    let gainB = Math.sin(norm * 0.5 * Math.PI);

    // Apply Loudness Matching if active and both metrics are available
    if (matchLoudness && metricsA && metricsB) {
      const lufsA = metricsA.lufs;
      const lufsB = metricsB.lufs;
      if (isFinite(lufsA) && isFinite(lufsB)) {
        const diff = lufsA - lufsB; // e.g. -14 - (-8) = -6dB (B is 6dB louder than A)
        if (diff < 0) {
          // Track B is louder: attenuate B
          const attenLinear = Math.pow(10, diff / 20);
          gainB *= attenLinear;
        } else {
          // Track A is louder: attenuate A
          const attenLinear = Math.pow(10, -diff / 20);
          gainA *= attenLinear;
        }
      }
    }

    const now = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
    gainARef.current.gain.setTargetAtTime(gainA, now, 0.02);
    gainBRef.current.gain.setTargetAtTime(gainB, now, 0.02);
  }, [faderPosition, matchLoudness, metricsA, metricsB]);

  // Stop playback cleanly
  const stopPlayback = () => {
    if (sourceARef.current) {
      try { sourceARef.current.stop(); sourceARef.current.disconnect(); } catch (e) {}
      sourceARef.current = null;
    }
    if (sourceBRef.current) {
      try { sourceBRef.current.stop(); sourceBRef.current.disconnect(); } catch (e) {}
      sourceBRef.current = null;
    }
    setIsPlaying(false);
    if (progressAnimRef.current) {
      cancelAnimationFrame(progressAnimRef.current);
    }
  };

  // Start synchronized dual playback
  const startPlayback = () => {
    if (!bufferA && !bufferB) return;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AC();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!masterGainRef.current) {
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.connect(ctx.destination);
    }

    if (!gainARef.current) {
      gainARef.current = ctx.createGain();
      gainARef.current.connect(masterGainRef.current);
    }

    if (!gainBRef.current) {
      gainBRef.current = ctx.createGain();
      gainBRef.current.connect(masterGainRef.current);
    }

    const offset = pauseOffsetRef.current % (totalDuration || 1);

    // Setup Source A
    if (bufferA) {
      const srcA = ctx.createBufferSource();
      srcA.buffer = bufferA;
      srcA.loop = true;
      srcA.connect(gainARef.current);
      srcA.start(0, offset % bufferA.duration);
      sourceARef.current = srcA;
    }

    // Setup Source B
    if (bufferB) {
      const srcB = ctx.createBufferSource();
      srcB.buffer = bufferB;
      srcB.loop = true;
      srcB.connect(gainBRef.current);
      srcB.start(0, offset % bufferB.duration);
      sourceBRef.current = srcB;
    }

    startTimeRef.current = ctx.currentTime - offset;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!ctx || (!sourceARef.current && !sourceBRef.current)) return;
      const cur = (ctx.currentTime - startTimeRef.current) % (totalDuration || 1);
      setCurrentTime(cur);
      progressAnimRef.current = requestAnimationFrame(updateProgress);
    };

    updateProgress();
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        pauseOffsetRef.current = (audioCtxRef.current.currentTime - startTimeRef.current) % (totalDuration || 1);
      }
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleSeek = (e) => {
    const newPercent = Number(e.target.value);
    const newTime = (newPercent / 100) * totalDuration;
    pauseOffsetRef.current = newTime;
    setCurrentTime(newTime);
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  };

  // Process File for a specific slot
  const handleProcessFile = async (file, slot) => {
    if (!file || !file.type.startsWith('audio/')) return;

    if (slot === 'A') {
      setIsAnalyzingA(true);
      setFileA(file);
    } else {
      setIsAnalyzingB(true);
      setFileB(file);
    }

    // Reset playback state when loading new files
    stopPlayback();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AC = window.AudioContext || window.webkitAudioContext;
      const decContext = new AC();
      const decoded = await decContext.decodeAudioData(arrayBuffer);
      decContext.close();

      const lufs = calculateIntegratedLUFS(decoded);
      const lra = calculateLoudnessRange(decoded);
      const tp = await estimateTruePeak(decoded);

      const metrics = {
        lufs: isFinite(lufs) ? lufs.toFixed(1) : '-14.0',
        lra: isFinite(lra) ? lra.toFixed(1) : '6.0',
        tp: isFinite(tp) ? tp.toFixed(2) : '-0.50',
        duration: decoded.duration
      };

      if (slot === 'A') {
        setBufferA(decoded);
        setMetricsA(metrics);
      } else {
        setBufferB(decoded);
        setMetricsB(metrics);
      }
    } catch (err) {
      console.error('Error analyzing audio buffer:', err);
    } finally {
      if (slot === 'A') setIsAnalyzingA(false);
      else setIsAnalyzingB(false);
    }
  };

  const clearSlot = (slot) => {
    stopPlayback();
    pauseOffsetRef.current = 0;
    setCurrentTime(0);

    if (slot === 'A') {
      setFileA(null);
      setBufferA(null);
      setMetricsA(null);
    } else {
      setFileB(null);
      setBufferB(null);
      setMetricsB(null);
    }
  };

  // Delta calculations
  const hasBoth = metricsA && metricsB;
  const deltaLUFS = hasBoth ? (parseFloat(metricsB.lufs) - parseFloat(metricsA.lufs)).toFixed(1) : null;
  const deltaTP = hasBoth ? (parseFloat(metricsB.tp) - parseFloat(metricsA.tp)).toFixed(2) : null;
  const deltaLRA = hasBoth ? (parseFloat(metricsB.lra) - parseFloat(metricsA.lra)).toFixed(1) : null;

  return (
    <section id="ab-comparator" aria-label="A/B Reference Audio Comparator" className="py-20 border-t border-white/5 relative z-10 bg-[#050505]/40 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#9D4EDD]/15 border border-[#9D4EDD]/30 mb-4">
            <ArrowLeftRight className="w-3 h-3 text-[#E0AAFF]" />
            <span className="text-[9px] font-mono tracking-[0.4em] text-[#E0AAFF] uppercase font-bold">
              {t.badge}
            </span>
          </div>
          <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
            {t.title} <span className="font-serif italic text-white/70">{t.titleAccent}</span> {t.titleSuffix}
          </h3>
          <p className="text-xs text-[#9ca3af]/70 uppercase tracking-[0.2em] font-mono mt-3 max-w-xl">
            {t.subtitle}
          </p>
        </div>

        {/* Dual Dropzone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* SLOT A */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragA(true); }}
            onDragLeave={() => setIsDragA(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragA(false);
              if (e.dataTransfer.files.length) handleProcessFile(e.dataTransfer.files[0], 'A');
            }}
            className={`border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative ${
              fileA 
                ? 'bg-[#0a0a0a]/90 border-white/20 shadow-xl' 
                : isDragA 
                  ? 'bg-[#9D4EDD]/10 border-[#9D4EDD] shadow-[0_0_30px_rgba(157,78,221,0.2)]'
                  : 'bg-[#080808]/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40"></span>
                  <span className="font-modern text-white tracking-wider text-base font-bold">
                    {t.slotA}
                  </span>
                </div>
                {fileA && (
                  <button 
                    onClick={() => clearSlot('A')}
                    className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!fileA ? (
                <label className="border border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#9D4EDD]/50 hover:bg-white/[0.02] transition-all group min-h-[190px]">
                  <Upload className="w-8 h-8 text-white/30 group-hover:text-[#E0AAFF] transition-colors mb-3" />
                  <span className="text-xs font-mono text-white/70 uppercase tracking-wider mb-1">
                    {t.dropA}
                  </span>
                  <span className="text-[10px] font-mono text-white/30">
                    {t.dropFormats}
                  </span>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files.length) handleProcessFile(e.target.files[0], 'A');
                    }}
                  />
                </label>
              ) : isAnalyzingA ? (
                <div className="py-12 flex flex-col items-center justify-center min-h-[190px]">
                  <RefreshCw className="w-6 h-6 text-[#E0AAFF] animate-spin mb-3" />
                  <span className="text-[10px] font-mono text-[#E0AAFF] tracking-widest uppercase">
                    {t.analyzing}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl mb-4 flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-bold truncate max-w-[240px]">
                      {fileA.name}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {(fileA.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  {/* Telemetry Numbers */}
                  {metricsA && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/50 border border-white/5 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-white/40 block mb-1">INTEGRATED</span>
                        <span className="text-sm font-mono font-bold text-white">{metricsA.lufs} <span className="text-[9px] font-normal text-white/40">LUFS</span></span>
                      </div>
                      <div className="bg-black/50 border border-white/5 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-white/40 block mb-1">TRUE PEAK</span>
                        <span className="text-sm font-mono font-bold text-white">{metricsA.tp} <span className="text-[9px] font-normal text-white/40">dBTP</span></span>
                      </div>
                      <div className="bg-black/50 border border-white/5 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-white/40 block mb-1">DYNAMICS</span>
                        <span className="text-sm font-mono font-bold text-white">{metricsA.lra} <span className="text-[9px] font-normal text-white/40">LU</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SLOT B */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragB(true); }}
            onDragLeave={() => setIsDragB(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragB(false);
              if (e.dataTransfer.files.length) handleProcessFile(e.dataTransfer.files[0], 'B');
            }}
            className={`border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative ${
              fileB 
                ? 'bg-[#9D4EDD]/[0.05] border-[#9D4EDD]/30 shadow-xl' 
                : isDragB 
                  ? 'bg-[#9D4EDD]/10 border-[#9D4EDD] shadow-[0_0_30px_rgba(157,78,221,0.2)]'
                  : 'bg-[#080808]/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E0AAFF] animate-pulse"></span>
                  <span className="font-modern text-[#E0AAFF] tracking-wider text-base font-bold">
                    {t.slotB}
                  </span>
                </div>
                {fileB && (
                  <button 
                    onClick={() => clearSlot('B')}
                    className="text-white/40 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!fileB ? (
                <label className="border border-dashed border-[#9D4EDD]/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#9D4EDD] hover:bg-[#9D4EDD]/[0.03] transition-all group min-h-[190px]">
                  <Upload className="w-8 h-8 text-[#E0AAFF]/40 group-hover:text-[#E0AAFF] transition-colors mb-3" />
                  <span className="text-xs font-mono text-[#E0AAFF] uppercase tracking-wider mb-1">
                    {t.dropB}
                  </span>
                  <span className="text-[10px] font-mono text-white/30">
                    {t.dropFormats}
                  </span>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files.length) handleProcessFile(e.target.files[0], 'B');
                    }}
                  />
                </label>
              ) : isAnalyzingB ? (
                <div className="py-12 flex flex-col items-center justify-center min-h-[190px]">
                  <RefreshCw className="w-6 h-6 text-[#E0AAFF] animate-spin mb-3" />
                  <span className="text-[10px] font-mono text-[#E0AAFF] tracking-widest uppercase">
                    {t.analyzing}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="bg-[#9D4EDD]/10 border border-[#9D4EDD]/20 p-3 rounded-xl mb-4 flex items-center justify-between">
                    <span className="text-xs font-mono text-white font-bold truncate max-w-[240px]">
                      {fileB.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#E0AAFF]/60">
                      {(fileB.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>

                  {/* Telemetry Numbers */}
                  {metricsB && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-black/50 border border-[#9D4EDD]/20 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-[#E0AAFF]/60 block mb-1">INTEGRATED</span>
                        <span className="text-sm font-mono font-bold text-[#E0AAFF]">{metricsB.lufs} <span className="text-[9px] font-normal text-white/40">LUFS</span></span>
                      </div>
                      <div className="bg-black/50 border border-[#9D4EDD]/20 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-[#E0AAFF]/60 block mb-1">TRUE PEAK</span>
                        <span className="text-sm font-mono font-bold text-[#E0AAFF]">{metricsB.tp} <span className="text-[9px] font-normal text-white/40">dBTP</span></span>
                      </div>
                      <div className="bg-black/50 border border-[#9D4EDD]/20 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-[#E0AAFF]/60 block mb-1">DYNAMICS</span>
                        <span className="text-sm font-mono font-bold text-[#E0AAFF]">{metricsB.lra} <span className="text-[9px] font-normal text-white/40">LU</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Playback & Fader Console (Enabled if at least 1 track is loaded) */}
        {(bufferA || bufferB) && (
          <div className="border border-white/10 bg-[#080808] rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            
            {/* Playhead & Progress */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={togglePlay}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                    isPlaying
                      ? 'bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] text-white shadow-[0_0_25px_rgba(157,78,221,0.5)] scale-105'
                      : 'bg-white/10 hover:bg-[#9D4EDD] text-white hover:shadow-[0_0_20px_rgba(157,78,221,0.3)]'
                  }`}
                  title={isPlaying ? 'Pause' : 'Play Both in Sync'}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                </button>

                <div>
                  <div className="text-white font-modern text-sm font-bold tracking-wide">
                    {isPlaying ? t.playingSync : t.readyAudition}
                  </div>
                  <div className="text-[10px] font-mono text-white/40 mt-0.5">
                    {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
                  </div>
                </div>
              </div>

              {/* Progress Bar / Scrubber */}
              <div className="w-full sm:flex-1 sm:max-w-md">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={totalDuration ? (currentTime / totalDuration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#9D4EDD]"
                />
              </div>

              {/* Match Loudness Button */}
              {hasBoth && (
                <button
                  onClick={() => setMatchLoudness(!matchLoudness)}
                  className={`px-3.5 py-2 rounded-xl text-[9px] font-mono tracking-widest uppercase transition-all border flex items-center gap-2 cursor-pointer ${
                    matchLoudness
                      ? 'bg-[#9D4EDD]/20 border-[#9D4EDD] text-[#E0AAFF] shadow-[0_0_15px_rgba(157,78,221,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}
                  title="Level-match louder track to audition true tone without loudness bias"
                >
                  <RefreshCw className={`w-3 h-3 ${matchLoudness ? 'animate-spin' : ''}`} />
                  <span>{t.matchLufs}: {matchLoudness ? 'ON' : 'OFF'}</span>
                </button>
              )}
            </div>

            {/* A/B Fader Control */}
            <div className="bg-black/60 border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono tracking-widest uppercase">
                <button
                  onClick={() => setFaderPosition(0)}
                  disabled={!bufferA}
                  className={`transition-colors cursor-pointer disabled:opacity-30 ${
                    faderPosition < 30 ? 'text-white font-bold underline decoration-[#9D4EDD]' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {t.soloA}
                </button>

                <span className="text-[#E0AAFF] font-bold text-center">
                  {faderPosition === 0 && t.listenA}
                  {faderPosition === 100 && t.listenB}
                  {faderPosition > 0 && faderPosition < 100 && `${t.blend} (${100 - faderPosition}% A / ${faderPosition}% B)`}
                </span>

                <button
                  onClick={() => setFaderPosition(100)}
                  disabled={!bufferB}
                  className={`transition-colors cursor-pointer disabled:opacity-30 ${
                    faderPosition > 70 ? 'text-[#E0AAFF] font-bold underline decoration-[#9D4EDD]' : 'text-white/40 hover:text-[#E0AAFF]'
                  }`}
                >
                  {t.soloB}
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={faderPosition}
                  onChange={(e) => setFaderPosition(Number(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-[#9D4EDD] focus:outline-none"
                />
              </div>

              <div className="flex justify-between text-[9px] font-mono text-white/30 mt-2">
                <span>100% A</span>
                <span className="text-white/20">{t.dragNotice}</span>
                <span>100% B</span>
              </div>
            </div>

            {/* Delta Comparison Summary (When both are analyzed) */}
            {hasBoth && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3 text-center sm:text-left">
                  {t.differentialTitle}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <span className="text-[8px] font-mono text-white/40 block mb-0.5">{t.lufsDiff}</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deltaLUFS > 0 ? `+${deltaLUFS} dB ${t.louder}` : `${deltaLUFS} dB ${t.quieter}`}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <span className="text-[8px] font-mono text-white/40 block mb-0.5">{t.peakDiff}</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deltaTP > 0 ? `+${deltaTP} dB ${t.higherPeak}` : `${deltaTP} dB ${t.lowerPeak}`}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <span className="text-[8px] font-mono text-white/40 block mb-0.5">{t.dynamicsDiff}</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {deltaLRA > 0 ? `+${deltaLRA} LU ${t.moreDynamic}` : `${Math.abs(deltaLRA)} LU ${t.moreCompressed}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </section>
  );
}
