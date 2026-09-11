import React, { useState, useRef, useEffect } from 'react';
import MasterAnalyzer from './components/MasterAnalyzer';
import NapbakPiano from './components/NapbakPiano';
import DualReferenceComparator from './components/DualReferenceComparator';
import SecretDealLanding from './components/SecretDealLanding';
import { pianoEngine } from './utils/NapbakPianoEngine';
import { useProStore } from './store/useProStore';
import { useLanguageStore } from './store/useLanguageStore';
import { translations, faqDataByLang } from './utils/translations';

export default function App() {
  const { lang, setLang } = useLanguageStore();
  const t = translations[lang] || translations.en;
  const currentFaq = faqDataByLang[lang] || faqDataByLang.en;

  const [openFaq, setOpenFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDotStolen, setIsDotStolen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados Pro usando Zustand
  const { isPro, unlockPro, lockPro } = useProStore();

  // Routing view state (supports '/', '/piano', and '/vip' / '/deal')
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname;
    if (path === '/piano') return 'piano';
    if (path === '/vip' || path === '/deal') return 'vip';
    return 'analyzer';
  });

  const navigateTo = (view) => {
    setCurrentView(view);
    const newPath = view === 'piano' ? '/piano' : view === 'vip' ? '/vip' : '/';
    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/piano') setCurrentView('piano');
      else if (path === '/vip' || path === '/deal') setCurrentView('vip');
      else setCurrentView('analyzer');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (currentView === 'vip') {
      const vipTitle = lang === 'es'
        ? "CTRL VIP Creator Pass | Oferta Secreta de Acceso Lifetime ($39)"
        : "CTRL VIP Creator Pass | Secret Lifetime Deal ($39)";
      const vipDesc = lang === 'es'
        ? "Acceso secreto para creadores: Medidor LUFS, Comparador A/B con crossfader y Piano Acústico VST3 por solo $39 de por vida."
        : "Secret creator access: LUFS meter, A/B comparator with live crossfader, and Acoustic Piano VST3 for only $39 lifetime.";

      document.title = vipTitle;
      if (metaDesc) metaDesc.setAttribute('content', vipDesc);
      if (ogTitle) ogTitle.setAttribute('content', vipTitle);
      if (ogDesc) ogDesc.setAttribute('content', vipDesc);
      if (canonical) canonical.setAttribute('href', 'https://ctrl.napbak.studio/vip');
      if (ogUrl) ogUrl.setAttribute('href', 'https://ctrl.napbak.studio/vip');
    } else if (currentView === 'piano') {
      const pianoTitle = lang === 'es'
        ? "Napbak Concert Grand | Piano Acústico de Concierto Online Gratis & VST3"
        : "Napbak Concert Grand | Free Online Acoustic Grand Piano & VST3 Plugin";
      const pianoDesc = lang === 'es'
        ? "Toca el piano acústico de concierto con motor DSP, grabación QWERTY/MIDI y descarga el plugin VST3, AU y DirectWave 100% gratis para FL Studio, Ableton y Logic."
        : "Play the acoustic grand piano online with DSP engine, QWERTY/MIDI recording, and download the free VST3, AU & DirectWave plugin for FL Studio, Ableton, and Logic.";

      document.title = pianoTitle;
      if (metaDesc) metaDesc.setAttribute('content', pianoDesc);
      if (ogTitle) ogTitle.setAttribute('content', pianoTitle);
      if (ogDesc) ogDesc.setAttribute('content', pianoDesc);
      if (canonical) canonical.setAttribute('href', 'https://ctrl.napbak.studio/piano');
      if (ogUrl) ogUrl.setAttribute('href', 'https://ctrl.napbak.studio/piano');
    } else {
      document.title = t.seo.title;
      if (metaDesc) metaDesc.setAttribute('content', t.seo.description);
      if (ogTitle) ogTitle.setAttribute('content', t.seo.title);
      if (ogDesc) ogDesc.setAttribute('content', t.seo.description);
      if (canonical) canonical.setAttribute('href', 'https://ctrl.napbak.studio/');
      if (ogUrl) ogUrl.setAttribute('href', 'https://ctrl.napbak.studio/');
    }
  }, [currentView, lang, t]);

  const cursorRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const canvasRef = useRef(null);

  // Precarga silenciosa en segundo plano de los samples del piano
  useEffect(() => {
    pianoEngine.preload();
  }, []);

  // Sincronizar estado PRO reactivo por si hay cambios en localStorage de la versión anterior
  useEffect(() => {
    const legacyPro = localStorage.getItem('napbak_pro');
    if (legacyPro === 'true' && !isPro) {
      unlockPro('legacy-migrated');
      localStorage.removeItem('napbak_pro');
    }
  }, [isPro, unlockPro]);

  // ── PARTÍCULAS Y AURAS DE FONDO ───────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const glowOpacities = { ether: 0.08, bass: 0.10, arp: 0.10, drums: 0.05 };
    const currentIntensity = 1.5;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.baseVx = (Math.random() - 0.5) * 0.4;
        this.baseVy = (Math.random() - 0.5) * 0.4;
        const colors = ['157, 78, 221', '59, 130, 246', '236, 72, 153', '255, 255, 255'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update(intensity) {
        this.x += this.baseVx * intensity;
        this.y -= (Math.abs(this.baseVy) + 0.2) * intensity;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y < 0) this.y = canvas.height;
      }

      draw(ctx, intensity) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${Math.min(0.1 + (intensity * 0.05), 0.6)})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 60 }, () => new Particle());

    const drawAura = (x, y, radius, colorStr, opacity, timeStr) => {
      if (opacity <= 0.01) return;
      const xPos = x + Math.sin(timeStr) * 150;
      const yPos = y + Math.cos(timeStr * 0.8) * 150;
      
      const gradient = ctx.createRadialGradient(xPos, yPos, 0, xPos, yPos, radius);
      gradient.addColorStop(0, `rgba(${colorStr}, ${opacity})`);
      gradient.addColorStop(1, `rgba(${colorStr}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const timeSec = Date.now() * 0.0005;

      ctx.globalCompositeOperation = 'screen';

      const w = canvas.width;
      const h = canvas.height;
      drawAura(w * 0.3, h * 0.4, w * 0.5, '157, 78, 221', glowOpacities.ether, timeSec);
      drawAura(w * 0.7, h * 0.7, w * 0.4, '59, 130, 246', glowOpacities.bass, timeSec + 1);
      drawAura(w * 0.5, h * 0.3, w * 0.4, '236, 72, 153', glowOpacities.arp, timeSec + 2);
      drawAura(w * 0.5, h * 0.8, w * 0.3, '255, 255, 255', glowOpacities.drums, timeSec + 3);

      particles.forEach(p => {
        p.update(currentIntensity);
        p.draw(ctx, currentIntensity);
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ── CURSOR INTERACTIVO ───────────────
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let reqId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const loop = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      reqId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove);
    reqId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(reqId);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, .dot-slot')) {
        cursorInnerRef.current?.classList.add('scale-[3]');
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, .dot-slot')) {
        cursorInnerRef.current?.classList.remove('scale-[3]');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDotStolen) {
      document.body.classList.add('cursor-stolen');
    } else {
      document.body.classList.remove('cursor-stolen');
    }
  }, [isDotStolen]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    if (currentView !== 'analyzer') {
      setCurrentView('analyzer');
      window.history.pushState({}, '', '/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCopyEmail = () => {
    const textArea = document.createElement("textarea");
    textArea.value = "hello@napbak.studio";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="bg-[#050505] text-[#9ca3af] font-mono selection:bg-[#9D4EDD] selection:text-white min-h-screen relative scroll-smooth">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@100;400;700&family=Outfit:wght@100;300;400;700&display=swap');
        
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-modern { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Instrument Serif', serif; }
        
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        
        ${isDotStolen ? `
        @media (pointer: fine) {
          body, a, button, input, .dot-slot { cursor: none !important; }
        }
        ` : ''}
        
        .noise-overlay {
          position: fixed;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 50;
        }
      `}</style>
      
      <div 
        ref={cursorRef} 
        className={`hidden md:block fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference will-change-transform transition-opacity duration-300 ${isDotStolen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          ref={cursorInnerRef} 
          className="w-3 h-3 bg-white rounded-full transition-transform duration-300 ease-out"
        ></div>
      </div>

      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-40 transition-opacity duration-1000"
      />

      <div className="noise-overlay"></div>

      {currentView === 'vip' ? (
        <SecretDealLanding onNavigateToStudio={() => navigateTo('analyzer')} />
      ) : (
        <>
          <nav aria-label="Main navigation" className={`fixed top-0 w-full px-6 md:px-10 flex justify-between items-center z-40 transition-all duration-500 opacity-100 ${isScrolled ? 'py-4 md:py-6 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'py-6 md:py-10 bg-transparent'}`}>
        
        <div className="flex flex-col relative z-10 flex-1 items-start group">
          <h1 className="font-modern text-2xl md:text-3xl text-white font-light tracking-tighter relative z-10 flex items-center">
            <span className="text-white/30 mr-1 font-mono">[</span>
            <span className="font-bold tracking-widest text-white uppercase">CTRL</span>
            <span className="text-white/30 ml-1 font-mono">]</span>
            <span className="text-[10px] tracking-widest text-white/50 font-mono uppercase ml-3 flex items-baseline relative top-[2px]">
              by napbak
              <span 
                className={`font-serif italic text-[#9D4EDD] tracking-normal transition-opacity duration-300 px-[1px] cursor-pointer dot-slot ${isDotStolen ? 'opacity-0' : 'opacity-100'}`}
                onMouseEnter={() => setIsDotStolen(true)}
                onClick={() => setIsDotStolen(false)}
              >.</span>
            </span>
          </h1>
          <span className="text-[8px] tracking-[0.4em] text-[#9ca3af] uppercase mt-1">{t.nav.subtitle}</span>
        </div>

        <div className="absolute inset-0 hidden md:flex justify-center items-center pointer-events-none z-20">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 p-1 rounded-full pointer-events-auto backdrop-blur-md shadow-lg shadow-black/40">
            <button
              onClick={() => navigateTo('analyzer')}
              className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'analyzer'
                  ? 'bg-[#9D4EDD] text-white font-bold shadow-md shadow-[#9D4EDD]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>🎚️</span> {t.nav.analyzer}
            </button>
            <button
              onClick={() => navigateTo('piano')}
              className={`px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                currentView === 'piano'
                  ? 'bg-[#9D4EDD] text-white font-bold shadow-md shadow-[#9D4EDD]/30'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>🎹</span> {t.nav.piano}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 sm:gap-4 relative z-10 flex-1">
          {/* Language Switcher ES | EN */}
          <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-full p-0.5 backdrop-blur-md">
            <button
              onClick={() => setLang('es')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
                lang === 'es' 
                  ? 'bg-[#9D4EDD] text-white font-bold shadow-sm shadow-[#9D4EDD]/40' 
                  : 'text-white/40 hover:text-white'
              }`}
              title="Cambiar a Español"
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
                lang === 'en' 
                  ? 'bg-[#9D4EDD] text-white font-bold shadow-sm shadow-[#9D4EDD]/40' 
                  : 'text-white/40 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          {/* Botón PRO reactivo en Nav */}
          {isPro ? (
            <span className="text-[9px] md:text-[10px] tracking-widest text-[#E0AAFF] font-bold border border-[#9D4EDD]/30 bg-[#9D4EDD]/10 px-4 py-2 rounded-full hidden sm:block">
              {t.nav.proActive}
            </span>
          ) : (
            <a 
              href="https://napoacademy.gumroad.com/l/pro-monthly" 
              data-gumroad-overlay-checkout="true"
              className="text-[9px] md:text-[10px] tracking-widest bg-[#9D4EDD] text-white border border-[#9D4EDD] px-4 py-2 rounded-full hover:bg-[#E0AAFF] hover:border-[#E0AAFF] hover:text-black transition-all font-bold hidden sm:block shadow-lg shadow-[#9D4EDD]/10 text-center"
            >
              {t.nav.getPro}
            </a>
          )}
        </div>
      </nav>

      <main role="main" className="transition-opacity duration-1000 delay-300 opacity-100">
        
        {currentView === 'piano' ? (
          /* Dedicated Piano Workstation View */
          <div className="pt-24 min-h-[85vh]">
            <NapbakPiano onBack={() => navigateTo('analyzer')} isDedicatedPage={true} />
          </div>
        ) : (
          /* Master Analyzer Main Landing View */
          <>
            <div className="pt-24">
              <MasterAnalyzer />
            </div>

            {/* Dual A/B Reference Comparator */}
            <DualReferenceComparator />

        {/* Features / Marketing Section */}
        <section id="features" aria-label="Engine features and capabilities" className="py-24 border-t border-white/5 relative z-10 bg-[#050505]/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6">
            
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-4">{t.features.tag}</h2>
              <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
                {t.features.title} <span className="font-serif italic text-white/70">{t.features.titleAccent}</span>
              </h3>
              <p className="text-xs text-[#9ca3af]/60 uppercase tracking-[0.2em] font-mono mt-2">
                {t.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">{t.features.f1_title}</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  {t.features.f1_desc}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-9.75ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">{t.features.f2_title}</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  {t.features.f2_desc}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">{t.features.f3_title}</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  {t.features.f3_desc}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">{t.features.f4_title}</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  {t.features.f4_desc}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Pricing / Suscripción Section */}
        <section id="pricing" aria-label="Pricing plans and membership options" className="py-24 border-t border-white/5 relative z-10 bg-[#050505]/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6">
            
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-4">{t.pricing.tag}</h2>
              <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
                {t.pricing.title} <span className="font-serif italic text-white/70">{t.pricing.titleAccent}</span>
              </h3>
              <p className="text-xs text-[#9ca3af]/60 uppercase tracking-[0.2em] font-mono mt-2">
                {t.pricing.subtitle}
              </p>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block max-w-5xl mx-auto w-full overflow-hidden border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-sm rounded-3xl relative shadow-[0_0_50px_rgba(157,78,221,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-6 md:p-8 font-modern text-white tracking-widest text-lg uppercase w-1/3">
                        {t.pricing.freeTitle}
                        <span className="text-[10px] text-white/40 font-mono tracking-widest block mt-1">{t.pricing.freeStatus}</span>
                      </th>
                      <th className="p-6 md:p-8 font-modern text-[#E0AAFF] tracking-widest text-lg uppercase w-1/3 border-l border-white/5 bg-[#9D4EDD]/[0.02]">
                        {t.pricing.monthlyTitle}
                        <span className="text-[10px] text-[#E0AAFF]/50 font-mono tracking-widest block mt-1">{t.pricing.monthlyPeriod}</span>
                      </th>
                      <th className="p-6 md:p-8 font-modern text-[#E0AAFF] tracking-widest text-lg uppercase w-1/3 relative border-l border-white/5 border-t-2 border-t-[#9D4EDD] bg-[#9D4EDD]/[0.06]">
                        {t.pricing.lifetimeTitle}
                        <span className="text-[10px] text-[#E0AAFF]/50 font-mono tracking-widest block mt-1">{t.pricing.lifetimePeriod}</span>
                        <div className="absolute top-4 right-4 bg-[#9D4EDD] text-white text-[8px] font-mono tracking-widest uppercase px-3 py-1 rounded-full hidden sm:block shadow-[0_0_15px_rgba(157,78,221,0.5)]">
                          {t.pricing.bestValue}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono text-white/70">
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">{t.pricing.analysesLimitFree}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">{t.pricing.analysesUnlimited}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.06] font-bold">{t.pricing.analysesUnlimited}</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">LUFS & True Peak</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">{t.pricing.dynamicsFeature}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.06] font-bold">{t.pricing.dynamicsFeature}</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">{t.pricing.clientSideFeature}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">{t.pricing.clientSideFeature}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.06] font-bold">{t.pricing.clientSideFeature}</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">{t.pricing.simulationFeature}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">{t.pricing.simulationFeature}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.06] font-bold">{t.pricing.simulationFeature}</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/30 font-mono">—</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF]/60 border-l border-white/5 bg-[#9D4EDD]/[0.02] font-mono">{t.pricing.webPianoOnly}</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.06] font-bold">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD]/50 text-[#E0AAFF] text-[10px] uppercase tracking-wider shadow-[0_0_15px_rgba(157,78,221,0.2)]">
                          {t.pricing.vstBonusIncluded}
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-6 font-serif italic text-3xl text-white/80">{t.pricing.freePrice}</td>
                      <td className="p-6 md:px-8 py-6 border-l border-white/5 bg-[#9D4EDD]/[0.02]">
                        <span className="font-serif italic text-3xl text-[#E0AAFF] font-bold">{t.pricing.monthlyPrice}<span className="text-xs font-mono lowercase text-[#E0AAFF]/50 not-italic font-normal">{t.pricing.monthlySuffix}</span></span>
                      </td>
                      <td className="p-6 md:px-8 py-6 border-l border-white/5 bg-[#9D4EDD]/[0.06]">
                        <span className="font-serif italic text-3xl text-[#E0AAFF] font-bold">{t.pricing.lifetimePrice}<span className="text-[10px] tracking-widest font-mono uppercase text-[#E0AAFF]/50 not-italic font-normal ml-2">{t.pricing.lifetimeSuffix}</span></span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-6 md:p-8 align-bottom">
                        <button 
                          onClick={() => {
                            lockPro();
                            const element = document.getElementById('analyzer');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full max-w-[200px] py-3.5 rounded-full border border-white/10 text-[9px] tracking-widest uppercase hover:bg-white/5 transition-colors font-mono mx-auto block"
                        >
                          {t.pricing.activeFreeBtn}
                        </button>
                      </td>
                      <td className="p-6 md:p-8 border-l border-white/5 bg-[#9D4EDD]/[0.02] align-bottom">
                        <a 
                          href="https://napoacademy.gumroad.com/l/pro-monthly"
                          data-gumroad-overlay-checkout="true"
                          className="w-full max-w-[200px] py-3.5 rounded-full border border-[#9D4EDD]/50 text-[#E0AAFF] hover:bg-[#9D4EDD]/20 hover:border-[#9D4EDD] transition-colors text-[9px] tracking-widest uppercase font-bold mx-auto flex items-center justify-center"
                        >
                          {t.pricing.subscribeMonthlyBtn}
                        </a>
                      </td>
                      <td className="p-6 md:p-8 border-l border-white/5 bg-[#9D4EDD]/[0.06] align-bottom border-b-2 border-b-[#9D4EDD]">
                        <a 
                          href="https://napoacademy.gumroad.com/l/ctrl-pro-lifetime"
                          data-gumroad-overlay-checkout="true"
                          className="w-full max-w-[200px] py-3.5 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] text-white hover:from-[#E0AAFF] hover:to-[#fbcfe8] hover:text-black transition-colors text-[9px] tracking-widest uppercase font-bold shadow-[0_0_30px_rgba(157,78,221,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] mx-auto flex items-center justify-center"
                        >
                          {t.pricing.getLifetimeBtn}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Stacked Pricing Cards */}
            <div className="grid grid-cols-1 gap-6 md:hidden">
              
              {/* Free Plan */}
              <div className="border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-sm rounded-3xl p-6 relative shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-modern text-white tracking-widest text-lg font-bold uppercase">{t.pricing.freeTitle}</span>
                    <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase border border-white/10 px-2 py-0.5 rounded">{t.pricing.freeStatus}</span>
                  </div>
                  <div className="font-serif italic text-4xl text-white mb-6">{t.pricing.freePrice}</div>
                  <ul className="text-xs font-mono text-white/70 space-y-3 mb-8">
                    <li className="flex items-center gap-2">✓ {t.pricing.analysesLimitFree}</li>
                    <li className="flex items-center gap-2">✓ LUFS & True Peak</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.clientSideFeature}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.simulationFeature}</li>
                  </ul>
                </div>
                <button 
                  onClick={() => {
                    lockPro();
                    const element = document.getElementById('analyzer');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-3.5 rounded-full border border-white/10 text-[9px] tracking-widest uppercase hover:bg-white/5 transition-colors font-mono font-bold"
                >
                  {t.pricing.activeFreeBtn}
                </button>
              </div>

              {/* Pro Monthly */}
              <div className="border border-[#9D4EDD]/30 bg-[#9D4EDD]/[0.02] backdrop-blur-sm rounded-3xl p-6 relative shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-modern text-[#E0AAFF] tracking-widest text-lg font-bold uppercase">{t.pricing.monthlyTitle}</span>
                    <span className="text-[9px] text-[#E0AAFF]/70 font-mono tracking-widest uppercase border border-[#9D4EDD]/20 px-2 py-0.5 rounded">{t.pricing.monthlyPeriod}</span>
                  </div>
                  <div className="font-serif italic text-4xl text-[#E0AAFF] font-bold mb-6">{t.pricing.monthlyPrice}<span className="text-xs font-mono lowercase text-[#E0AAFF]/50 not-italic font-normal">{t.pricing.monthlySuffix}</span></div>
                  <ul className="text-xs font-mono text-[#E0AAFF]/80 space-y-3 mb-8">
                    <li className="flex items-center gap-2">✓ {t.pricing.analysesUnlimited}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.dynamicsFeature}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.clientSideFeature}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.simulationFeature}</li>
                    <li className="flex items-center gap-2 text-white/50">✓ {t.pricing.webPianoOnly}</li>
                  </ul>
                </div>
                <a 
                  href="https://napoacademy.gumroad.com/l/pro-monthly"
                  data-gumroad-overlay-checkout="true"
                  className="w-full py-3.5 rounded-full border border-[#9D4EDD]/50 text-[#E0AAFF] hover:bg-[#9D4EDD]/20 hover:border-[#9D4EDD] transition-colors text-[9px] tracking-widest uppercase font-bold flex items-center justify-center"
                >
                  {t.pricing.subscribeMonthlyBtn}
                </a>
              </div>

              {/* Lifetime Access */}
              <div className="border border-[#9D4EDD] bg-[#9D4EDD]/[0.06] backdrop-blur-sm rounded-3xl p-6 relative shadow-[0_0_30px_rgba(157,78,221,0.2)] flex flex-col justify-between">
                <div className="absolute top-4 right-4 bg-[#9D4EDD] text-white text-[8px] font-mono tracking-widest uppercase px-3 py-1 rounded-full">
                  {t.pricing.bestValue}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4 mt-2">
                    <span className="font-modern text-[#E0AAFF] tracking-widest text-lg font-bold uppercase">{t.pricing.lifetimeTitle}</span>
                  </div>
                  <div className="font-serif italic text-4xl text-[#E0AAFF] font-bold mb-6">{t.pricing.lifetimePrice}<span className="text-[10px] tracking-widest font-mono uppercase text-[#E0AAFF]/50 not-italic font-normal ml-2">{t.pricing.lifetimeSuffix}</span></div>
                  <ul className="text-xs font-mono text-[#E0AAFF]/80 space-y-3 mb-8">
                    <li className="flex items-center gap-2">✓ {t.pricing.analysesUnlimited}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.dynamicsFeature}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.clientSideFeature}</li>
                    <li className="flex items-center gap-2">✓ {t.pricing.simulationFeature}</li>
                    <li className="flex items-center gap-2 text-[#E0AAFF] font-bold bg-[#9D4EDD]/20 px-3 py-1.5 rounded-xl border border-[#9D4EDD]/40 mt-2">
                      {t.pricing.vstBonusIncluded}
                    </li>
                  </ul>
                </div>
                <a 
                  href="https://napoacademy.gumroad.com/l/ctrl-pro-lifetime"
                  data-gumroad-overlay-checkout="true"
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] text-white hover:from-[#E0AAFF] hover:to-[#fbcfe8] hover:text-black transition-colors text-[9px] tracking-widest uppercase font-bold shadow-[0_0_30px_rgba(157,78,221,0.3)] flex items-center justify-center"
                >
                  {t.pricing.getLifetimeBtn}
                </a>
              </div>

            </div>

            {/* Upsell Card */}
            <div className="mt-12 max-w-5xl mx-auto w-full relative overflow-hidden rounded-3xl border border-[#9D4EDD]/20 bg-[#070707] p-8 md:p-12 shadow-[0_0_50px_rgba(157,78,221,0.05)] group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#9D4EDD]/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-[10px] tracking-[0.4em] text-[#E0AAFF] font-mono uppercase mb-4 font-bold flex items-center justify-center md:justify-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E0AAFF] animate-pulse"></span>
                    {t.pricing.upsellBadge}
                  </h4>
                  <h3 className="font-modern text-2xl md:text-3xl text-white font-light tracking-tight mb-4">
                    {t.pricing.upsellTitle}
                  </h3>
                  <p className="text-xs text-white/50 font-mono leading-relaxed max-w-xl mx-auto md:mx-0">
                    {t.pricing.upsellDesc}
                  </p>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-auto relative group/btn">
                  <div className="absolute inset-0 bg-[#E0AAFF] opacity-0 group-hover/btn:opacity-20 blur-xl transition-opacity duration-500 rounded-full"></div>
                  <a 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}
                    className="relative inline-flex items-center justify-center w-full md:w-auto px-8 py-5 rounded-full border border-[#E0AAFF]/30 bg-black text-[#E0AAFF] hover:bg-white/5 hover:border-[#E0AAFF]/70 transition-all duration-300 text-[10px] tracking-[0.2em] font-mono uppercase font-bold"
                  >
                    {t.pricing.upsellBtn} <span className="ml-3 group-hover/btn:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Ecosystem / More from Napbak Lab Section */}
        <section id="ecosystem" aria-label="More tools from Napbak Studio" className="py-20 border-t border-white/5 relative z-10 bg-[#070707]/60 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl border border-[#9D4EDD]/30 bg-gradient-to-br from-[#9D4EDD]/10 via-[#0a0a0a] to-[#070707] p-8 md:p-12 shadow-[0_10px_50px_rgba(157,78,221,0.08)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#9D4EDD]/15 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#9D4EDD]/25 transition-all duration-700"></div>

              <div className="flex-1 relative z-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xl">🎹</span>
                  <span className="text-[9px] font-mono tracking-[0.4em] text-[#E0AAFF] uppercase font-bold">
                    {t.ecosystem.tag}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest bg-[#9D4EDD]/30 text-[#E0AAFF] border border-[#9D4EDD]/50 px-2 py-0.5 rounded-full uppercase font-bold">
                    {t.ecosystem.badge}
                  </span>
                </div>
                <h3 className="font-modern text-2xl md:text-4xl text-white font-light tracking-tight mb-3">
                  {t.ecosystem.title} <span className="font-serif italic text-[#E0AAFF]">{t.ecosystem.titleAccent}</span>
                </h3>
                <p className="text-xs text-white/60 font-mono leading-relaxed max-w-xl mb-4">
                  {t.ecosystem.desc}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-white/40">
                  <span>{t.ecosystem.b1}</span>
                  <span>•</span>
                  <span>{t.ecosystem.b2}</span>
                  <span>•</span>
                  <span>{t.ecosystem.b3}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
                <button
                  onClick={() => navigateTo('piano')}
                  className="w-full sm:w-auto px-6 py-4 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] hover:from-[#E0AAFF] hover:to-[#fbcfe8] text-white hover:text-black font-mono text-[10px] font-bold tracking-widest uppercase transition-all shadow-lg shadow-[#9D4EDD]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  {t.ecosystem.openBtn} <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" aria-label="Frequently asked questions about loudness and mastering" className="py-24 border-t border-white/5 relative z-10 bg-[#050505]/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-4">{t.faq.tag}</h2>
              <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
                {t.faq.title} <span className="font-serif italic text-white/70">{t.faq.titleAccent}</span>
              </h3>
            </div>

            <div className="space-y-4">
              {currentFaq.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index} 
                    className="border border-white/5 bg-[#0a0a0a]/30 rounded-2xl overflow-hidden transition-all duration-300 hover:border-white/10"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-6 text-left flex justify-between items-center gap-4 text-white focus:outline-none"
                    >
                      <span className="font-modern font-semibold text-sm tracking-wide">{faq.question}</span>
                      <span className={`text-[#E0AAFF] font-mono text-lg transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    <div 
                      className={`transition-all duration-500 ease-in-out ${
                        isOpen ? 'max-h-[1000px] border-t border-white/5 opacity-100 p-6' : 'max-h-0 opacity-0 overflow-hidden'
                      }`}
                    >
                      <div className="text-xs text-white/60 font-mono leading-relaxed space-y-4">
                        {faq.answer.split('\n\n').map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        </>
        )}

        <footer className="w-full py-16 px-6 md:px-12 border-t border-white/5 relative z-10 bg-[#050505] text-[#9ca3af]">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            
            {/* Column 1: Brand Info */}
            <div className="flex flex-col items-start gap-4">
              <div className="font-modern text-2xl text-white font-light tracking-tighter flex items-center">
                <span className="text-white/30 mr-1 font-mono">[</span>
                <span className="font-bold tracking-widest uppercase">CTRL</span>
                <span className="text-white/30 ml-1 font-mono">]</span>
                <span className="text-[10px] tracking-widest text-white/50 font-mono uppercase ml-3 flex items-baseline relative top-[2px]">
                  by napbak
                  <span 
                    className={`font-serif italic text-[#9D4EDD] tracking-normal transition-opacity duration-300 px-[1px] cursor-pointer dot-slot ${isDotStolen ? 'opacity-0' : 'opacity-100'}`}
                    onMouseEnter={() => setIsDotStolen(true)}
                    onClick={() => setIsDotStolen(false)}
                  >.</span>
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-white/40 font-mono max-w-[220px]">
                {t.footer.desc}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="flex flex-col items-start gap-3">
              <span className="text-[9px] tracking-widest font-mono uppercase text-white font-bold mb-2">{t.footer.quickLinks}</span>
              <button onClick={() => navigateTo('analyzer')} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors cursor-pointer text-left">{t.nav.analyzer}</button>
              <button onClick={() => navigateTo('piano')} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors cursor-pointer text-left text-[#E0AAFF]">{t.nav.piano}</button>
              <a href="#features" onClick={(e) => scrollTo(e, 'features')} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors">{t.features.titleAccent}</a>
              <a href="#pricing" onClick={(e) => scrollTo(e, 'pricing')} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors">{t.pricing.titleAccent}</a>
              <a href="#faq" onClick={(e) => scrollTo(e, 'faq')} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors">FAQ</a>
            </div>

            {/* Column 3: Contact & Studio */}
            <div className="flex flex-col items-start gap-3">
              <span className="text-[9px] tracking-widest font-mono uppercase text-white font-bold mb-2">{t.footer.contact}</span>
              <button onClick={() => setIsContactOpen(true)} className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] text-left transition-colors">
                {t.footer.contactBtn}
              </button>
              <a href="https://www.instagram.com/napbak.studio" target="_blank" rel="noreferrer" className="text-[10px] tracking-wide font-mono hover:text-[#E0AAFF] transition-colors">Instagram</a>
              <a href="https://napbak.studio/" target="_blank" rel="noreferrer" className="text-[10px] tracking-wide font-mono text-[#9D4EDD] hover:text-[#E0AAFF] transition-colors flex items-center gap-1 group">
                Napbak Studio <span className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform text-[8px]">↗</span>
              </a>
            </div>

            {/* Column 4: System Status */}
            <div className="flex flex-col items-start gap-3">
              <span className="text-[9px] tracking-widest font-mono uppercase text-white font-bold mb-2">ENGINE STATUS</span>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-green-400 uppercase">
                  DSP CORE: ONLINE
                </span>
              </div>
              <p className="text-[9px] leading-relaxed text-white/30 font-mono">
                Running 100% client-side. No audio data ever leaves your computer. Secure & private.
              </p>
            </div>
            
          </div>
          
          <div className="max-w-5xl mx-auto border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] tracking-widest text-white/20 font-mono">
            <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED.</span>
            <span>DESIGNED BY NAPBAK</span>
          </div>
        </footer>

      </main>
        </>
      )}

      <div className={`fixed inset-0 z-[200] bg-[#050505]/95 backdrop-blur-xl flex flex-col justify-center items-center transition-all duration-700 ${isContactOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => setIsContactOpen(false)} 
          className="absolute top-8 right-8 md:top-12 md:right-12 text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
        >
          CLOSE <span className="group-hover:rotate-90 transition-transform duration-300">✕</span>
        </button>
        
        <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-8">INITIATE CONNECTION</h2>
        
        <div className="flex flex-col items-center gap-12 text-center">
          <button 
            onClick={handleCopyEmail} 
            className="group relative inline-block"
          >
            <span className={`block font-serif italic text-4xl md:text-7xl lg:text-8xl transition-colors duration-500 ${copied ? 'text-[#1DB954]' : 'text-white group-hover:text-[#9D4EDD]'}`}>
              {copied ? 'Copied to clipboard.' : 'hello@napbak.studio'}
            </span>
            <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-widest uppercase transition-opacity duration-300 ${copied ? 'opacity-0' : 'opacity-0 group-hover:opacity-50'}`}>
              Click to copy
            </span>
          </button>
          
          <div className="flex flex-col items-center gap-6 mt-8">
            <p className="text-[9px] tracking-[0.4em] text-white/30 uppercase">Or reach out via</p>
            <div className="flex gap-4 md:gap-8">
              <a href="https://wa.me/5804121479466" target="_blank" rel="noreferrer" className="border border-white/20 px-6 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                WhatsApp
              </a>
              <a href="https://www.instagram.com/napbak.studio" target="_blank" rel="noreferrer" className="border border-white/20 px-6 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
