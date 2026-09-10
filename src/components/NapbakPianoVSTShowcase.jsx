import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Sliders, 
  Waves, 
  Headphones, 
  ShieldCheck, 
  Cpu,
  ChevronDown,
  Zap,
  CheckCircle2
} from 'lucide-react';

const DAW_GUIDES = [
  {
    id: 'flstudio',
    name: 'FL STUDIO',
    version: 'FL 20 / 21 / 24+',
    recommendedMethod: 'DirectWave (SFZ) or Native VST3',
    steps: [
      {
        title: 'Option A: Instant Drag & Drop (DirectWave - 100% Free)',
        desc: 'Unzip the Universal Pack. Drag the "Napbak_Concert_Grand.sfz" file directly onto the FL Studio Channel Rack. DirectWave loads the samples instantly with zero configuration.'
      },
      {
        title: 'Option B: Native VST3 Plugin',
        desc: 'Download the Windows VST3 binary. Extract "Napbak Concert Grand.vst3" and place it inside your Common VST3 directory. Open FL Studio > Manage Plugins > Find Installed Plugins.'
      },
      {
        title: 'Automation & Piano Roll Ready',
        desc: 'Works with FL Studio Velocity curve, slide notes, native automation clips, and the Fruity Limiter / Soundgoodizer chain seamlessly.'
      }
    ],
    pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
    pathMac: '~/Library/Audio/Plug-Ins/VST3/'
  },
  {
    id: 'ableton',
    name: 'ABLETON LIVE',
    version: 'Live 10 / 11 / 12 (Suite / Standard / Intro)',
    recommendedMethod: 'Decent Sampler (VST3 / AU)',
    steps: [
      {
        title: '1. Load Decent Sampler into a MIDI Track',
        desc: 'Download the free Decent Sampler plugin. Insert Decent Sampler onto any MIDI track in Ableton Live.'
      },
      {
        title: '2. Drag & Drop the Preset File',
        desc: 'Drag "Napbak_Concert_Grand.dspreset" from the Universal Pack straight into the Decent Sampler interface (or click File -> Load).'
      },
      {
        title: '3. Ableton Push & Macro Integration',
        desc: 'Map Volume, Warmth, Reverb, and Release to your Ableton Rack Macros for live performance and automation recording.'
      }
    ],
    pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
    pathMac: '/Library/Audio/Plug-Ins/VST3/'
  },
  {
    id: 'logic',
    name: 'LOGIC PRO / GARAGEBAND',
    version: 'Logic Pro X / 11 & GarageBand (macOS)',
    recommendedMethod: 'Audio Units (AU) via Decent Sampler',
    steps: [
      {
        title: '1. Free Decent Sampler AU Host',
        desc: 'Install the free Decent Sampler Audio Unit (AU) component on your Mac (fully optimized for Apple Silicon M1/M2/M3/M4 & Intel).'
      },
      {
        title: '2. Open AU Instrument in Logic',
        desc: 'Create an Instrument Track > AU Instruments > Decent Samples > Decent Sampler > Stereo.'
      },
      {
        title: '3. Load the Napbak Acoustic Model',
        desc: 'Open "Napbak_Concert_Grand.dspreset". Enjoy native CoreAudio low-latency performance and macOS MIDI pedal integration.'
      }
    ],
    pathWin: 'N/A (macOS Exclusive)',
    pathMac: '/Library/Audio/Plug-Ins/Components/'
  },
  {
    id: 'reaper',
    name: 'REAPER / CUBASE / STUDIO ONE',
    version: 'All Modern 64-bit DAWs',
    recommendedMethod: 'VST3 (Win/Mac) or SFZ Player',
    steps: [
      {
        title: '1. Standard VST3 Location',
        desc: 'Place the VST3 bundle into your system VST3 directory. All modern DAWs monitor this universal path automatically.'
      },
      {
        title: '2. Rescan Plugin Database',
        desc: 'In Cubase (Studio > VST Plug-in Manager) or Reaper (Preferences > VST > Rescan), trigger a quick plugin refresh.'
      },
      {
        title: '3. Insert & Play',
        desc: 'Insert "Napbak Concert Grand" as a virtual instrument. Zero sample-loading time, instant session loading.'
      }
    ],
    pathWin: 'C:\\Program Files\\Common Files\\VST3\\',
    pathMac: '/Library/Audio/Plug-Ins/VST3/'
  }
];

const SPECS_DATA = [
  { label: 'Acoustic Model', val: 'Concert Grand Piano (Steinway Soundboard Voicing)' },
  { label: 'Engine Architecture', val: 'Hybrid Sample-Modeling & Algorithmic DSP' },
  { label: 'Plugin Formats', val: 'VST3 (64-bit), AU, AAX (Decent Sampler), SFZ' },
  { label: 'Operating Systems', val: 'Windows 10 / 11 (64-bit), macOS 10.13+ (Apple Silicon & Intel)' },
  { label: 'Sample Rates Supported', val: '44.1 kHz, 48 kHz, 88.2 kHz, 96 kHz, 192 kHz (32-bit Float)' },
  { label: 'Memory (RAM) Footprint', val: '~45 MB loaded (98% lighter than traditional 4GB sample packs)' },
  { label: 'Latency & Performance', val: '0 Samples (Sample-accurate zero-latency real-time performance)' },
  { label: 'Dynamic Layers', val: 'Expressive Multi-Velocity with Smooth Dampening Interpolation' },
  { label: 'Onboard DSP Processors', val: 'Master Gain, Warmth Felt Filter, Convolving Hall Reverb, Release' },
  { label: 'MIDI Control', val: 'CC64 (Sustain Pedal), CC1 (Modulation), CC7 (Master Gain), Pitch Bend' },
  { label: 'License & Rights', val: '100% Free & Royalty-Free for Commercial Streaming & Music Releases' }
];

const FAQS = [
  {
    q: 'Do I need iLok, serial numbers or an internet activation?',
    a: 'None whatsoever. We believe nothing should stand between your creative impulse and your DAW. Napbak Concert Grand is 100% installer-free, dongle-free, and DRM-free. You download it, drop it into your plugin folder, and it works immediately.'
  },
  {
    q: 'Why is the file size so small (~4MB) compared to 80GB piano libraries?',
    a: 'Traditional libraries record 50 layers of room noise, mechanical creaks, and microphone positions you rarely need in a modern mix, which hogs your SSD and slows session loading. Napbak uses an intelligent hybrid engine: surgically sampled attack transients coupled with procedural harmonic resonance and algorithmic convolution reverb. The result is pure acoustic clarity that sits effortlessly in dense mixes without lagging your DAW.'
  },
  {
    q: 'How does the "Warmth" control work?',
    a: 'The Warmth parameter is modeled after vintage felt-piano damping systems. When set to maximum (100%), it simulates a thick piece of wool felt placed between the hammers and the strings, softening aggressive high frequencies and bringing out rich, intimate fundamental tones beloved in neoclassical and lo-fi productions.'
  },
  {
    q: 'Can I release music commercially on Spotify, Apple Music, and YouTube?',
    a: 'Yes, 100% royalty-free. Whether you are producing a billboard-charting pop hit, an indie film score, or background music for YouTube videos, you retain complete ownership of your recordings.'
  },
  {
    q: 'Does it support external MIDI keyboards and sustain pedals?',
    a: 'Absolutely. Both the online web workstation and the downloadable VST plugins natively respond to MIDI keyboard velocity, pitch wheels, and standard hardware sustain pedals (MIDI CC64).'
  }
];

export default function NapbakPianoVSTShowcase() {
  const [selectedDaw, setSelectedDaw] = useState('flstudio');
  const [copiedPath, setCopiedPath] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const activeDawData = DAW_GUIDES.find(d => d.id === selectedDaw) || DAW_GUIDES[0];

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(type);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  return (
    <div className="mt-20 border-t border-white/10 pt-24 text-white relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-b from-[#9D4EDD]/10 via-[#7B2CBF]/5 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-6xl mx-auto px-6">

        {/* ── 1. PRO VST HERO / PRODUCT MANIFESTO ──────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#9D4EDD]/20 to-pink-500/10 border border-[#9D4EDD]/30 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(157,78,221,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#E0AAFF]" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#E0AAFF] font-bold">
              STUDIO GRADE VIRTUAL INSTRUMENT
            </span>
          </div>

          <h2 className="font-modern text-3xl sm:text-5xl md:text-6xl font-light tracking-tighter text-white mb-6 leading-[1.1]">
            Bred for <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#E0AAFF] via-[#C77DFF] to-pink-400">translation</span>.<br />
            Voiced for <span className="font-serif italic font-normal text-white/90">pure emotion</span>.
          </h2>

          <p className="text-sm md:text-base font-mono text-white/60 leading-relaxed max-w-2xl mx-auto">
            Say goodbye to 80-Gigabyte bloatware libraries that take 5 minutes to load and disappear inside a modern mix. 
            Napbak Concert Grand delivers the velvety warmth, intimate felt damping, and dynamic authority of a world-class concert piano—in a featherweight architecture built for modern production.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-white/5 max-w-2xl mx-auto text-left">
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">RAM Footprint</span>
              <span className="font-modern text-lg font-bold text-white tracking-tight">~45 MB</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">Latency</span>
              <span className="font-modern text-lg font-bold text-emerald-400 tracking-tight">0 Samples</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">Format</span>
              <span className="font-modern text-lg font-bold text-[#E0AAFF] tracking-tight">VST3 • AU • SFZ</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">License</span>
              <span className="font-modern text-lg font-bold text-white tracking-tight">100% Royalty-Free</span>
            </div>
          </div>
        </div>

        {/* ── 2. SONIC ARCHITECTURE & CORE INNOVATIONS ─────────────────── */}
        <div className="mb-24">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              01. ACOUSTIC ENGINEERING
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              Surgical sound design, <span className="font-serif italic text-white/70">effortless mix fit</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Dynamic Velocity Curve
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Smooth, non-linear velocity curve modeled after acoustic hammer escapement. Responsive from delicate, whispered pianissimo to striking fortissimos that cut through 808s and heavy drum grooves.
              </p>
            </div>

            {/* Card 2 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Felt Warmth Acoustic Filter
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Tired of harsh high-frequency clatter? Our dedicated Warmth circuit attenuates abrasive hammer transients while enriching mid-body fundamentals, instantly dialing in that moody, cinematic felt piano timbre.
              </p>
            </div>

            {/* Card 3 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Stereo Impulse Hall Reverb
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Convolution-modeled concert hall space tailored specifically for piano acoustics. The dry signal remains locked at unity gain, guaranteeing the piano never loses punch or punchy body as you add lush spatial depth.
              </p>
            </div>

            {/* Card 4 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Zero-Bloat C++ Engine
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Native C++ architecture built with JUCE and lightweight Decent Sampler framework. Stack 20 instances across your project with near-zero CPU load and load your DAW sessions in less than two seconds.
              </p>
            </div>

            {/* Card 5 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Mono-Safe Phase Coherence
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                Auditioned across phone speakers and club sound systems. Phase-aligned microphone imaging ensures your chords stay punchy and present in mono summing without catastrophic comb filtering.
              </p>
            </div>

            {/* Card 6 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                Full 88-Key Expressive Span
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                From thunderous subsonic bass notes on C0 to crystalline, glassy bell tones at C8. Full octave shifting and comprehensive MIDI CC64 sustain pedal modeling included.
              </p>
            </div>

          </div>
        </div>

        {/* ── 3. DOWNLOAD VAULT (PRO CTA SECTION) ───────────────────────── */}
        <div className="mb-24 relative overflow-hidden rounded-3xl border border-[#9D4EDD]/30 bg-gradient-to-b from-[#110a1c]/80 via-[#0a0a0a]/90 to-[#070707] p-8 md:p-12 shadow-[0_10px_50px_rgba(157,78,221,0.12)]">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#E0AAFF] font-bold block mb-2">
              02. INSTANT DOWNLOAD VAULT
            </span>
            <h3 className="font-modern text-3xl sm:text-4xl font-light text-white tracking-tight">
              Get the <span className="font-serif italic text-white/90">Napbak Concert Grand</span> for your DAW
            </h3>
            <p className="text-xs sm:text-sm font-mono text-white/50 mt-2">
              No account required. No registration wall. 100% Free and ready to drop into your tracks today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Download Option 1: Native Windows VST3 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-[#9D4EDD]/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#9D4EDD]/20 text-[#E0AAFF] text-[9px] font-mono font-bold tracking-wider uppercase border border-[#9D4EDD]/30">
                    WINDOWS 64-BIT VST3
                  </span>
                  <span className="text-[10px] font-mono text-white/40">3.7 MB ZIP</span>
                </div>
                <h4 className="font-modern text-xl font-bold text-white mb-2">
                  Native Windows VST3 Plugin
                </h4>
                <p className="text-xs font-mono text-white/50 mb-6 leading-relaxed">
                  Compiled C++ VST3 binary for FL Studio, Ableton, Reaper, Cubase, and Studio One on Windows 10/11. Direct standalone installation with custom Napbak skin and onboard controls.
                </p>
                <div className="space-y-1.5 mb-6 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Drop into <code className="text-[#E0AAFF]">Common Files\VST3\</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant scan in FL Studio, Ableton &amp; Reaper</span>
                  </div>
                </div>
              </div>

              <a
                href="/downloads/Napbak_Concert_Grand_VST3_Win64.zip"
                download="Napbak_Concert_Grand_VST3_Win64.zip"
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] hover:from-[#E0AAFF] hover:to-[#fbcfe8] text-white hover:text-black font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(157,78,221,0.3)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] active:scale-98"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD WINDOWS VST3
              </a>
            </div>

            {/* Download Option 2: Universal DAW Multi-Pack */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-[#9D4EDD]/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold tracking-wider uppercase border border-emerald-500/20">
                    UNIVERSAL MULTI-DAW PACK
                  </span>
                  <span className="text-[10px] font-mono text-white/40">610 KB ZIP</span>
                </div>
                <h4 className="font-modern text-xl font-bold text-white mb-2">
                  Universal Mac &amp; Windows Pack
                </h4>
                <p className="text-xs font-mono text-white/50 mb-6 leading-relaxed">
                  Includes Decent Sampler <code className="text-white/80">.dspreset</code> (with custom UI skin, volume, reverb, warmth &amp; release) plus native <code className="text-white/80">.sfz</code> for FL Studio DirectWave and Logic Pro.
                </p>
                <div className="space-y-1.5 mb-6 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Works on macOS (Apple Silicon M1-M4 &amp; Intel), Win, Linux</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>1-Click drag &amp; drop onto FL Studio Channel Rack</span>
                  </div>
                </div>
              </div>

              <a
                href="/downloads/Napbak_Concert_Grand_Universal_VST_Pack.zip"
                download="Napbak_Concert_Grand_Universal_VST_Pack.zip"
                className="w-full py-3.5 px-5 rounded-xl bg-white/[0.08] hover:bg-white/20 border border-white/20 hover:border-white text-white font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD UNIVERSAL PACK (MAC &amp; WIN)
              </a>
            </div>

          </div>
        </div>

        {/* ── 4. INTERACTIVE DAW INSTALLATION & SETUP HUB ──────────────── */}
        <div className="mb-24">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              03. QUICK-START HUB
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              Installation &amp; setup <span className="font-serif italic text-white/70">in 60 seconds</span>
            </h3>
            <p className="text-xs font-mono text-white/50 mt-2">
              Select your DAW to see step-by-step instructions and one-click copyable plugin paths.
            </p>
          </div>

          {/* DAW Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {DAW_GUIDES.map(daw => (
              <button
                key={daw.id}
                onClick={() => setSelectedDaw(daw.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  selectedDaw === daw.id
                    ? 'bg-[#9D4EDD] text-white font-bold shadow-lg shadow-[#9D4EDD]/30 border border-[#9D4EDD]'
                    : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {daw.name}
              </button>
            ))}
          </div>

          {/* Active DAW Installation Card */}
          <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#E0AAFF] uppercase font-bold block">
                  SUPPORTED WORKSTATION
                </span>
                <h4 className="font-modern text-2xl font-bold text-white mt-0.5">
                  {activeDawData.name} <span className="text-sm font-normal text-white/40 font-mono">({activeDawData.version})</span>
                </h4>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Recommended: {activeDawData.recommendedMethod}</span>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-6 mb-8">
              {activeDawData.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-7 h-7 rounded-lg bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 text-[#E0AAFF] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-modern text-sm font-bold text-white tracking-wide uppercase mb-1">
                      {step.title}
                    </h5>
                    <p className="text-xs font-mono text-white/50 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Copyable Paths Drawer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/5">
              
              {/* Windows Path */}
              <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[9px] font-mono uppercase text-white/40 block">Windows VST3 Folder</span>
                  <span className="font-mono text-xs text-white/80 truncate block">{activeDawData.pathWin}</span>
                </div>
                {activeDawData.pathWin !== 'N/A (macOS Exclusive)' && (
                  <button
                    onClick={() => handleCopy(activeDawData.pathWin, 'win')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                    title="Copy path to clipboard"
                  >
                    {copiedPath === 'win' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Mac Path */}
              <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[9px] font-mono uppercase text-white/40 block">macOS Component / VST3 Folder</span>
                  <span className="font-mono text-xs text-white/80 truncate block">{activeDawData.pathMac}</span>
                </div>
                <button
                  onClick={() => handleCopy(activeDawData.pathMac, 'mac')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="Copy path to clipboard"
                >
                  {copiedPath === 'mac' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── 5. TECHNICAL SPECIFICATIONS MATRIX ──────────────────────── */}
        <div className="mb-24">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              04. SPECIFICATIONS
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              Studio grade <span className="font-serif italic text-white/70">technical matrix</span>
            </h3>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              {SPECS_DATA.map((spec, idx) => (
                <div 
                  key={idx} 
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                    {spec.label}
                  </span>
                  <span className="text-xs font-mono text-white/90 sm:text-right font-semibold">
                    {spec.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 6. VIRTUAL INSTRUMENT FAQ ────────────────────────────────── */}
        <div className="mb-20 max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              05. PRODUCER QUESTIONS
            </span>
            <h3 className="font-modern text-2xl md:text-3xl font-light tracking-tight text-white">
              Frequently asked <span className="font-serif italic text-white/70">questions</span>
            </h3>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="font-modern text-sm font-bold text-white tracking-wide uppercase">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#E0AAFF]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs font-mono text-white/50 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 7. FOOTER NOTE / FINAL CREATIVE SIGN-OFF ─────────────────── */}
        <div className="pt-12 border-t border-white/10 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/30 font-mono">[</span>
            <span className="font-bold tracking-widest text-white uppercase text-sm">NAPBAK STUDIO</span>
            <span className="text-white/30 font-mono">]</span>
          </div>
          <p className="text-xs font-mono text-white/40 max-w-md">
            Handcrafted acoustic modeling tools for bedroom producers and audio engineers worldwide.
          </p>
        </div>

      </div>

    </div>
  );
}
