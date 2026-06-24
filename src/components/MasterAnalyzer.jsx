import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { 
  calculateIntegratedLUFS, 
  calculateLoudnessRange, 
  estimateTruePeak
} from '../utils/audioDsp';

export default function MasterAnalyzer({ onPlaybackStart }) {
  // --- States ---
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Audio Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Freemium States
  const [isPro, setIsPro] = useState(false);
  const [remainingFreeRuns, setRemainingFreeRuns] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // --- Refs ---
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const spectrumCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const checkStatus = () => {
      const localProStatus = localStorage.getItem('napbak_pro') === 'true';
      setIsPro(localProStatus);

      const today = new Date().toISOString().split('T')[0];
      const limitObjStr = localStorage.getItem('napbak_analyzer_limit');
      
      if (limitObjStr) {
        try {
          const limitObj = JSON.parse(limitObjStr);
          if (limitObj.date === today) {
            setRemainingFreeRuns(Math.max(0, 3 - limitObj.count));
          } else {
            localStorage.setItem('napbak_analyzer_limit', JSON.stringify({ date: today, count: 0 }));
            setRemainingFreeRuns(3);
          }
        } catch (e) {
          localStorage.setItem('napbak_analyzer_limit', JSON.stringify({ date: today, count: 0 }));
          setRemainingFreeRuns(3);
        }
      } else {
        localStorage.setItem('napbak_analyzer_limit', JSON.stringify({ date: today, count: 0 }));
        setRemainingFreeRuns(3);
      }
    };

    checkStatus();

    window.addEventListener('storage', checkStatus);
    window.addEventListener('napbak_pro_changed', checkStatus);

    return () => {
      window.removeEventListener('storage', checkStatus);
      window.removeEventListener('napbak_pro_changed', checkStatus);
    };
  }, []);

  const waveformRefCallback = useCallback((node) => {
    canvasRef.current = node;
  }, []);

  useEffect(() => {
    if (analysisResult && canvasRef.current) {
      requestAnimationFrame(() => {
        drawWaveform(analysisResult.peaks, playbackTime, duration);
      });
    }
  }, [playbackTime, duration, analysisResult]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

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
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const incrementUsageCounter = () => {
    if (isPro) return;
    const today = new Date().toISOString().split('T')[0];
    const limitObjStr = localStorage.getItem('napbak_analyzer_limit');
    let count = 0;
    if (limitObjStr) {
      try {
        const limitObj = JSON.parse(limitObjStr);
        count = limitObj.date === today ? limitObj.count + 1 : 1;
      } catch (e) {
        count = 1;
      }
    } else {
      count = 1;
    }
    localStorage.setItem('napbak_analyzer_limit', JSON.stringify({ date: today, count }));
    setRemainingFreeRuns(Math.max(0, 3 - count));
  };

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setErrorMsg('Please select a valid audio file (.wav, .mp3, .m4a, .ogg).');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (!isPro && remainingFreeRuns <= 0) {
      setShowPaywall(true);
      return;
    }

    setFile(selectedFile);
    setAnalysisResult(null);
    setIsPlaying(false);
    setPlaybackTime(0);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    
    analyzeAudioFile(selectedFile);
  };

  const analyzeAudioFile = async (audioFile) => {
    setIsAnalyzing(true);
    incrementUsageCounter();
    
    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const ACClass = window.AudioContext || window.webkitAudioContext;
      const decContext = new ACClass();
      const decodedBuffer = await decContext.decodeAudioData(arrayBuffer);
      decContext.close();

      setDuration(decodedBuffer.duration);
      const lufs = calculateIntegratedLUFS(decodedBuffer);
      const lra = calculateLoudnessRange(decodedBuffer);
      const truePeak = await estimateTruePeak(decodedBuffer);
      const peaks = getWaveformPeaks(decodedBuffer, 300);

      setAnalysisResult({
        lufs,
        truePeak,
        lra,
        peaks
      });

      setTimeout(() => {
        if (canvasRef.current) {
          drawWaveform(peaks, 0, decodedBuffer.duration);
        }
      }, 50);

    } catch (e) {
      console.error(e);
      setErrorMsg('Error decoding and analyzing the file. Try another master.');
      setFile(null);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getWaveformPeaks = (audioBuffer, width) => {
    const channelData = audioBuffer.getChannelData(0);
    const step = Math.floor(channelData.length / width);
    const peaks = new Float32Array(width);
    
    for (let i = 0; i < width; i++) {
      let max = 0;
      const start = i * step;
      const end = start + step;
      for (let j = start; j < end; j++) {
        const val = Math.abs(channelData[j]);
        if (val > max) max = val;
      }
      peaks[i] = max;
    }
    return peaks;
  };

  const drawWaveform = (peaks, currentSec, totalSec) => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || peaks.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    let clientWidth = rect.width;
    let clientHeight = rect.height;

    if (!clientWidth || !clientHeight) {
      const parent = canvas.parentElement;
      clientWidth = parent?.clientWidth || 300;
      clientHeight = parent?.clientHeight || 80;
    }

    canvas.width = clientWidth * dpr;
    canvas.height = clientHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = clientWidth;
    const height = clientHeight;
    const padding = 6;
    const innerHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    const playRatio = totalSec > 0 ? currentSec / totalSec : 0;
    const playheadPixel = width * playRatio;
    const barWidth = width / peaks.length;

    for (let i = 0; i < peaks.length; i++) {
      const barHeight = Math.max(2, peaks[i] * innerHeight);
      const x = i * barWidth;
      const y = padding + (innerHeight - barHeight) / 2;
      const isPlayed = x <= playheadPixel;

      ctx.fillStyle = isPlayed
        ? 'rgba(157, 78, 221, 0.9)'
        : 'rgba(255, 255, 255, 0.3)';

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }

    if (playRatio > 0) {
      ctx.strokeStyle = 'rgba(224, 170, 255, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadPixel, 0);
      ctx.lineTo(playheadPixel, height);
      ctx.stroke();
    }
  };

  const initLiveAudioContext = () => {
    if (audioContextRef.current) return;

    const ACClass = window.AudioContext || window.webkitAudioContext;
    const actx = new ACClass();
    const analyser = actx.createAnalyser();
    
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.82;

    const sourceNode = actx.createMediaElementSource(audioRef.current);
    sourceNode.connect(analyser);
    analyser.connect(actx.destination);

    audioContextRef.current = actx;
    analyserRef.current = analyser;
    sourceNodeRef.current = sourceNode;
  };

  const handlePlayToggle = async () => {
    if (!audioRef.current) return;

    if (isPlayingRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    } else {
      if (onPlaybackStart) {
        onPlaybackStart();
      }

      initLiveAudioContext();

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      audioRef.current.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
      
      renderSpectrumFrame();
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setPlaybackTime(0);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const renderSpectrumFrame = () => {
    if (!isPlayingRef.current || !analyserRef.current || !spectrumCanvasRef.current) return;

    const canvas = spectrumCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const clientWidth = rect.width || canvas.offsetWidth || canvas.clientWidth || 300;
    const clientHeight = rect.height || canvas.offsetHeight || canvas.clientHeight || 80;

    canvas.width = clientWidth * window.devicePixelRatio;
    canvas.height = clientHeight * window.devicePixelRatio;
    
    const width = canvas.width;
    const height = canvas.height;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = 'rgba(5, 5, 5, 0.3)';
    ctx.fillRect(0, 0, width, height);

    const activeCutoff = Math.floor(bufferLength * 0.75);
    const barWidth = width / activeCutoff;
    
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#ec4899');
    gradient.addColorStop(1, '#9D4EDD');

    ctx.beginPath();
    ctx.moveTo(0, height);
    
    for (let i = 0; i < activeCutoff; i++) {
      const rawVal = dataArray[i] / 255.0;
      const ampHeight = rawVal * height * 0.95;
      
      const x = i * barWidth;
      const y = height - ampHeight;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < activeCutoff; i++) {
      const rawVal = dataArray[i] / 255.0;
      const ampHeight = rawVal * height * 0.95;
      const x = i * barWidth;
      const y = height - ampHeight;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(renderSpectrumFrame);
  };

  const handleSimulatePayment = () => {
    localStorage.setItem('napbak_pro', 'true');
    setIsPro(true);
    setShowPaywall(false);
  };

  const handleResetLimits = () => {
    localStorage.removeItem('napbak_pro');
    localStorage.setItem('napbak_analyzer_limit', JSON.stringify({ 
      date: new Date().toISOString().split('T')[0], 
      count: 0 
    }));
    setIsPro(false);
    setRemainingFreeRuns(3);
    setShowPaywall(false);
  };

  const formatSecs = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getCompliance = (metric, platform) => {
    const lufsVal = analysisResult?.lufs ?? -100;
    const peakVal = analysisResult?.truePeak ?? -100;

    const targetLUFS = platform === 'apple' ? -16 : -14;

    if (metric === 'lufs') {
      const diff = lufsVal - targetLUFS;
      if (diff > 1.5) {
        return {
          status: 'warning',
          text: `${lufsVal.toFixed(1)} LUFS — Spotify/Apple will lower volume by ~${diff.toFixed(1)} dB`,
          badge: 'OVER TARGET',
          context: "If it's Metal, EDM, Hip-Hop or any high-density genre, this can be a valid artistic choice. Platforms will passively attenuate the volume."
        };
      } else if (diff < -2.0) {
        return {
          status: 'fail',
          text: `${lufsVal.toFixed(1)} LUFS — Very low level`,
          badge: 'TOO QUIET',
          context: 'Platforms will artificially boost the volume, triggering internal limiters. Apply more gain or limiting on your master.'
        };
      } else {
        return {
          status: 'pass',
          text: `${lufsVal.toFixed(1)} LUFS — Ideal range`,
          badge: 'PERFECT',
          context: 'Your loudness is in the sweet spot. Platforms will not aggressively modify the level.'
        };
      }
    } else {
      if (peakVal >= -0.2) {
        return {
          status: 'fail',
          text: `${peakVal.toFixed(1)} dBTP — Clipping risk`,
          badge: 'CLIPPING RISK',
          context: 'Inter-sample peaks will cause distortion when encoding for streaming. Lower the final limiter to -1.0 dBTP.'
        };
      } else if (peakVal >= -1.0) {
        return {
          status: 'warning',
          text: `${peakVal.toFixed(1)} dBTP — On the limit`,
          badge: 'HIGH PEAKS',
          context: 'Tolerated limit. -1.0 dBTP is recommended as the maximum ceiling for safe distribution.'
        };
      } else {
        return {
          status: 'pass',
          text: `${peakVal.toFixed(1)} dBTP — Safe`,
          badge: 'CLEAN',
          context: 'Your peaks are within standard. No inter-sample distortion when compressing.'
        };
      }
    }
  };

  const isLocked = !isPro && remainingFreeRuns <= 0;

  return (
    <div id="analyzer" className="relative w-full max-w-5xl mx-auto pt-6 pb-6 px-4 md:px-6 z-10 h-[calc(100vh-120px)] min-h-[500px] flex flex-col">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* The Hero Header has been moved inside the Drop Zone (Step 6) */}

      {/* Main Drag & Drop / Results Panel Box */}
      <div className="relative flex-1 border border-[#9D4EDD]/20 bg-[#070707] rounded-[2rem] overflow-hidden p-6 md:p-8 shadow-2xl flex flex-col justify-between group/panel transition-all duration-500">
        
        {/* Step 2 & 3: Grid Background & Scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.05) 0%, transparent 70%)' }}></div>
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50"></div>
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] opacity-50"></div>

        {/* Step 3: Corner Decorations (Only in idle state) */}
        {!file && !isAnalyzing && (
          <>
            <div className="absolute top-5 left-6 text-[8px] font-mono text-[#9D4EDD]/40 tracking-[0.2em] hidden md:block pointer-events-none">[ CH:0 | SR:48k ]</div>
            <div className="absolute top-5 right-6 text-[8px] font-mono text-[#9D4EDD]/40 tracking-[0.2em] hidden md:block pointer-events-none">[ TP:MAX | LUFS:I ]</div>
            <div className="absolute bottom-5 left-6 text-[8px] font-mono text-[#9D4EDD]/40 tracking-[0.2em] hidden md:block pointer-events-none">[ SYNC:EXT ]</div>
            <div className="absolute bottom-5 right-6 text-[8px] font-mono text-[#9D4EDD]/40 tracking-[0.2em] hidden md:block pointer-events-none">[ OUT:1-2 ]</div>
          </>
        )}

        {errorMsg && (
          <div className="absolute top-4 inset-x-6 z-20 bg-red-950/80 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs font-mono text-center flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Freemium Limit Bar */}
        <div className="flex justify-between items-center mb-6 text-[10px] tracking-widest uppercase font-mono text-white/40 pb-4 border-b border-white/5">
          <div>
            STATUS: <span className={isPro ? 'text-[#E0AAFF] font-bold' : 'text-white/60'}>{isPro ? 'PRO SUBSCRIPTION' : 'FREE PLAN'}</span>
          </div>
          {!isPro && (
            <div className="flex items-center gap-2">
              DAILY LIMIT: <span className={`font-bold ${remainingFreeRuns === 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{remainingFreeRuns} / 3 REMAINING</span>
            </div>
          )}
        </div>

        {/* 1. Drag & Drop box (Locked or Active) */}
        {!file && !isAnalyzing && (
          <div 
            onDragOver={!isLocked ? handleDragOver : undefined}
            onDragLeave={!isLocked ? handleDragLeave : undefined}
            onDrop={!isLocked ? handleDrop : undefined}
            onClick={() => {
              if (!isLocked) {
                fileInputRef.current?.click();
              } else {
                setShowPaywall(true);
              }
            }}
            className={`relative flex-1 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 group overflow-hidden z-10
              ${!isLocked 
                ? isDragActive ? 'bg-[#9D4EDD]/[0.05] border border-[#9D4EDD]/40' : 'bg-transparent border border-transparent' 
                : 'border border-red-500/20 bg-red-950/[0.02]'
              }`}
          >
            {/* VU Meters Decorativos (Step 5) */}
            {!isLocked && (
              <>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1/2 w-2 bg-black/50 border border-white/5 rounded-full overflow-hidden flex flex-col justify-end">
                  <div className={`w-full bg-[#9D4EDD] transition-all duration-300 ease-out ${isDragActive ? 'h-[95%]' : 'h-[15%] animate-pulse'}`}></div>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-1/2 w-2 bg-black/50 border border-white/5 rounded-full overflow-hidden flex flex-col justify-end">
                  <div className={`w-full bg-[#9D4EDD] transition-all duration-300 ease-out delay-75 ${isDragActive ? 'h-[90%]' : 'h-[20%] animate-pulse'}`}></div>
                </div>
              </>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="audio/*" 
              className="hidden" 
              disabled={isLocked}
            />
            {isLocked ? (
              <div className="z-20">
                <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4 shadow-xl animate-pulse">
                  <Lock className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-sm font-modern text-red-300 font-bold uppercase tracking-wider">
                  Free analysis limit reached
                </p>
                <p className="text-[10px] text-red-400/60 font-mono tracking-widest mt-2 uppercase">
                  Click to unlock Pro Access
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full z-20">
                {/* Hero Text Re-ubicado (Step 6) */}
                <div className={`transition-all duration-500 transform ${isDragActive ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'} mb-6`}>
                  <h1 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter leading-tight mb-2">
                    Analyze your master. <br />
                    <span className="font-serif italic text-white/70 text-2xl md:text-4xl">Know your numbers. Take CTRL.</span>
                  </h1>
                  <h2 className="text-[8px] md:text-[9px] font-mono tracking-widest uppercase text-white/40 mt-3 max-w-xl mx-auto leading-relaxed">
                    Free audio analyzer — entirely in your browser. <br className="hidden md:block" />
                    <span className="text-[#9D4EDD]/80">No uploads. No signup. 100% client-side.</span>
                  </h2>
                </div>

                {/* Iris y Círculo Central (Step 4) */}
                <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48 mb-6">
                  {/* Anillo Pulsante */}
                  <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${isDragActive ? 'border-[#9D4EDD] scale-110 blur-sm' : 'border-white/10 animate-pulse'}`}></div>
                  <div className={`absolute inset-4 rounded-full border border-dashed transition-all duration-500 ${isDragActive ? 'border-[#9D4EDD] animate-spin-slow' : 'border-white/20'}`}></div>
                  
                  {/* Círculo Principal */}
                  <div className={`absolute inset-8 rounded-full flex items-center justify-center transition-all duration-300 ${isDragActive ? 'bg-[#9D4EDD]/20 shadow-[0_0_50px_rgba(157,78,221,0.5)]' : 'bg-black/40 border border-white/5 group-hover:border-[#9D4EDD]/40'}`}>
                    {isDragActive ? (
                      <span className="font-serif italic text-[#E0AAFF] text-2xl md:text-3xl animate-pulse">Drop it.</span>
                    ) : (
                      <div className="flex flex-col items-center text-white/30 group-hover:text-white/80 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="16"/>
                          <line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Onda Senoidal Decorativa */}
                  {!isDragActive && (
                    <div className="absolute -bottom-12 w-full flex items-center justify-center opacity-30">
                      <svg width="100" height="20" viewBox="0 0 100 20" className="animate-pulse">
                        <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="#9D4EDD" strokeWidth="1"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-500 transform ${isDragActive ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                  <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase mb-1">
                    Drag and drop your audio file
                  </p>
                  <p className="text-[8px] text-white/20 font-mono tracking-widest uppercase">
                    WAV, MP3, M4A, OGG
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Loading state */}
        {isAnalyzing && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[250px]">
            <div className="relative w-12 h-12 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-[#9D4EDD]/20 border-t-[#9D4EDD] animate-spin"></div>
            </div>
            <p className="text-xs font-mono tracking-widest text-[#E0AAFF] uppercase animate-pulse">
              Decoding waveforms & calculating EBU R128 metrics...
            </p>
            <p className="text-[9px] font-mono text-white/30 uppercase mt-2">
              4x Upsampling active to estimate streaming True Peak
            </p>
          </div>
        )}

        {/* 3. Results view */}
        {file && analysisResult && !isAnalyzing && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* File info bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-[#9D4EDD]/10 rounded-lg border border-[#9D4EDD]/20 flex-shrink-0">
                  <Volume2 className="w-5 h-5 text-[#9D4EDD]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-white font-mono truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[9px] text-white/40 font-mono tracking-wider mt-0.5">
                    DURATION: {formatSecs(duration)} • SIZE: {file.size ? (file.size / (1024 * 1024)).toFixed(1) : '--'} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayToggle}
                  className="flex items-center justify-center gap-2 bg-[#9D4EDD] hover:bg-[#b56ef5] text-white text-[10px] tracking-widest font-mono font-bold uppercase px-4 py-2 rounded-full transition-colors duration-300"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" /> PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" /> PLAY MASTER
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setAnalysisResult(null);
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlaying(false);
                  }}
                  className="p-2 border border-white/10 hover:border-white/20 rounded-full transition-colors text-white/40 hover:text-white"
                  title="Upload another track"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Waveform and FFT Spectrum player */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-white/10 bg-[#070707] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] tracking-wider uppercase text-white/40 font-mono">OFFLINE WAVEFORM</span>
                  <span className="text-[9px] text-[#9D4EDD] font-mono tracking-wide">
                    {formatSecs(playbackTime)} / {formatSecs(duration)}
                  </span>
                </div>
                <div className="relative h-20 w-full bg-white/[0.01] rounded-lg overflow-hidden border border-white/5">
                  <canvas ref={waveformRefCallback} className="absolute inset-0 w-full h-full" />
                </div>
              </div>

              <div className="border border-white/10 bg-[#070707] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] tracking-wider uppercase text-white/40 font-mono">FREQUENCY SPECTRUM (FFT)</span>
                  <span className="text-[9px] text-[#3b82f6] font-mono tracking-wide">20 Hz - 20 kHz</span>
                </div>
                <div className="relative h-20 w-full bg-white/[0.01] rounded-lg overflow-hidden border border-white/5">
                  <canvas ref={spectrumCanvasRef} className="absolute inset-0 w-full h-full" />
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] text-[8px] text-white/30 tracking-widest uppercase font-mono">
                      Hit PLAY to view real-time spectrum
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <div className="text-[9px] text-white/40 tracking-wider uppercase font-mono">Integrated Loudness</div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-modern text-white font-bold">
                    {analysisResult.lufs !== -Infinity ? analysisResult.lufs.toFixed(1) : '-INF'}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">LUFS</span>
                </div>
                <div className="text-[8px] text-white/30 font-mono uppercase">
                  Spotify Target: -14 LUFS
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <div className="text-[9px] text-white/40 tracking-wider uppercase font-mono">Max True Peak (4x)</div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className={`text-3xl font-modern font-bold ${analysisResult.truePeak >= -0.2 ? 'text-red-400' : 'text-white'}`}>
                    {analysisResult.truePeak !== -Infinity ? analysisResult.truePeak.toFixed(1) : '-INF'}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">dBTP</span>
                </div>
                <div className="text-[8px] text-white/30 font-mono uppercase">
                  Safe Limit: -1.0 dBTP
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/10 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <div className="text-[9px] text-white/40 tracking-wider uppercase font-mono">Loudness Range (LRA)</div>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-modern text-white font-bold">
                    {analysisResult.lra.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">LU</span>
                </div>
                <div className="text-[8px] text-[#9ca3af]/40 font-mono uppercase">
                  {analysisResult.lra < 4 ? 'Squashed / Limited' : analysisResult.lra <= 9 ? 'Commercial Dynamic' : 'Very Dynamic'}
                </div>
              </div>
            </div>

            {/* Target Compliance Checklist */}
            <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 md:p-6 mt-2">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/50 mb-4 font-mono font-bold">
                PLATFORM STANDARDS CHECKLIST
              </h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-modern text-white font-semibold">Spotify / Tidal / YouTube</span>
                    <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60 font-mono">TARGET: -14 LUFS | -1.0 dBTP</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {getCompliance('lufs', 'spotify').status === 'pass'    && <CheckCircle    className="w-3.5 h-3.5 text-green-500" />}
                      {getCompliance('lufs', 'spotify').status === 'warning' && <AlertTriangle   className="w-3.5 h-3.5 text-yellow-500" />}
                      {getCompliance('lufs', 'spotify').status === 'fail'    && <XCircle         className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-white/80 font-mono">{getCompliance('lufs', 'spotify').text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getCompliance('peak', 'spotify').status === 'pass'    && <CheckCircle    className="w-3.5 h-3.5 text-green-500" />}
                      {getCompliance('peak', 'spotify').status === 'warning' && <AlertTriangle   className="w-3.5 h-3.5 text-yellow-500" />}
                      {getCompliance('peak', 'spotify').status === 'fail'    && <XCircle         className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-white/80 font-mono">{getCompliance('peak', 'spotify').text}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-modern text-white font-semibold">Apple Music</span>
                    <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60 font-mono">TARGET: -16 LUFS | -1.0 dBTP</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      {getCompliance('lufs', 'apple').status === 'pass' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      {getCompliance('lufs', 'apple').status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                      {getCompliance('lufs', 'apple').status === 'fail' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-white/80 font-mono">{getCompliance('lufs', 'apple').text}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {getCompliance('peak', 'apple').status === 'pass' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      {getCompliance('peak', 'apple').status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                      {getCompliance('peak', 'apple').status === 'fail' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-white/80 font-mono">{getCompliance('peak', 'apple').text}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verdict Recommendation */}
              <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-white/60 font-mono space-y-2 leading-relaxed">
                <span className="text-[#E0AAFF] font-bold">FINAL MASTERING RECOMMENDATION:</span>
                {analysisResult.truePeak >= -0.2 ? (
                  <p>
                    ⚠️ ALERT: Your absolute peak level is excessively high ({analysisResult.truePeak.toFixed(1)} dBTP). When Spotify encodes your track to Ogg Vorbis/AAC, it will cause analog saturation. <strong className="text-white">Lower your DAW's limiter fader to -1.0 dB.</strong>
                  </p>
                ) : analysisResult.lufs > -11 ? (
                  <p>
                    ✓ Your track meets safe peak limits. Note that at {analysisResult.lufs.toFixed(1)} LUFS, your master is quite loud and Spotify will passively turn it down by about {(analysisResult.lufs - (-14)).toFixed(1)} dB. For urban or EDM genres it's normal to sacrifice dynamics for density, but if it's an acoustic or indie track, consider bouncing a version with less compression.
                  </p>
                ) : analysisResult.lufs < -16.5 ? (
                  <p>
                    ⚠️ WARNING: Loudness is very low ({analysisResult.lufs.toFixed(1)} LUFS). Platforms will artificially raise the volume by engaging internal limiters. <strong className="text-white">Apply a subtle limiter or gain to push the master to around -14 LUFS.</strong>
                  </p>
                ) : (
                  <p>
                    ✓ Congratulations! Your track is in the ideal range for digital distribution. It maintains an excellent dynamic to RMS power ratio, won't suffer severe attenuation, and will sound transparent and faithful on streaming platforms.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Dynamic Paywall Overlay screen */}
        {showPaywall && (
          <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl z-30 flex flex-col justify-center items-center text-center p-6 transition-all duration-500">
            <button 
              onClick={() => setShowPaywall(false)}
              className="absolute top-6 right-6 text-[10px] tracking-widest text-white/40 hover:text-white uppercase font-mono transition-colors"
            >
              ✕ Close
            </button>
            <div className="w-16 h-16 bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 rounded-2xl flex items-center justify-center mb-5 shadow-2xl">
              <Lock className="w-7 h-7 text-[#E0AAFF]" />
            </div>
            <h3 className="font-modern text-2xl text-white font-light tracking-tight mb-2">
              Daily limit reached
            </h3>
            <p className="text-xs text-white/50 font-mono tracking-wide max-w-sm mb-6 leading-relaxed uppercase">
              You've used your 3 free mastering analyses for today. Upgrade to Pro for unlimited analyses, precise LRA measurement, and advanced streaming recommendations.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button 
                onClick={handleSimulatePayment}
                className="w-full relative overflow-hidden rounded-full border border-[#9D4EDD]/50 hover:border-[#b56ef5]/80 bg-gradient-to-r from-[#9D4EDD]/40 to-[#ec4899]/30 hover:to-[#ec4899]/50 text-white font-mono text-[10px] tracking-widest font-bold uppercase py-3.5 transition-all duration-300 shadow-[0_0_30px_rgba(157,78,221,0.2)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Upgrade to Pro — $9/month
              </button>
              
              <button 
                onClick={handleSimulatePayment}
                className="text-[9px] tracking-widest uppercase font-mono text-[#E0AAFF] hover:text-[#f8fafc] border-b border-[#E0AAFF]/20 hover:border-[#f8fafc]/50 pb-0.5 mx-auto transition-all"
              >
                [ Simulate Payment Success ]
              </button>
            </div>
          </div>
        )}

      </div>

      {isPro && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleResetLimits}
            className="text-[8px] tracking-[0.3em] font-mono uppercase text-white/30 hover:text-white/60 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-full transition-all bg-black/40"
          >
            [ DEV: Reset Pro Status & Limits ]
          </button>
        </div>
      )}
    </div>
  );
}
