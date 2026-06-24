import React, { useState, useRef, useEffect } from 'react';
import MasterAnalyzer from './components/MasterAnalyzer';
import { useProStore } from './store/useProStore';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDotStolen, setIsDotStolen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados Pro usando Zustand
  const { isPro, unlockPro, lockPro } = useProStore();

  const cursorRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const canvasRef = useRef(null);

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
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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

      <nav className={`fixed top-0 w-full px-6 md:px-10 flex justify-between items-center z-40 transition-all duration-500 opacity-100 ${isScrolled ? 'py-4 md:py-6 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'py-6 md:py-10 bg-transparent'}`}>
        
        <div className="flex flex-col relative z-10 flex-1 items-start group">
          <span className="font-modern text-2xl md:text-3xl text-white font-light tracking-tighter relative z-10 flex items-center">
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
          </span>
          <span className="text-[8px] tracking-[0.4em] text-[#9ca3af] uppercase mt-1">SPOTIFY LOUDNESS CHECKER</span>
        </div>

        <div className="absolute inset-0 hidden md:flex justify-center items-center pointer-events-none z-20">
          <div className="flex gap-8 text-[10px] tracking-widest uppercase pointer-events-auto">
            <a 
              href="#analyzer" 
              onClick={(e) => scrollTo(e, 'analyzer')} 
              className="hover:text-white transition-colors cursor-pointer text-[#9D4EDD] font-bold"
            >
              Analyzer
            </a>
            <a 
              href="#features" 
              onClick={(e) => scrollTo(e, 'features')} 
              className="hover:text-white transition-colors cursor-pointer text-white/70 font-bold"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollTo(e, 'pricing')} 
              className="hover:text-white transition-colors cursor-pointer text-white/70 font-bold"
            >
              Pricing
            </a>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 lg:gap-6 relative z-10 flex-1">
          {/* Botón PRO reactivo en Nav */}
          {isPro ? (
            <span className="text-[9px] md:text-[10px] tracking-widest text-[#E0AAFF] font-bold border border-[#9D4EDD]/30 bg-[#9D4EDD]/10 px-4 py-2 rounded-full hidden sm:block">
              PRO ACTIVE
            </span>
          ) : (
            <button 
              onClick={() => {
                unlockPro('nav-click');
                const element = document.getElementById('analyzer');
                element?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="text-[9px] md:text-[10px] tracking-widest bg-[#9D4EDD] text-white border border-[#9D4EDD] px-4 py-2 rounded-full hover:bg-[#E0AAFF] hover:border-[#E0AAFF] hover:text-black transition-all font-bold hidden sm:block shadow-lg shadow-[#9D4EDD]/10"
            >
              GET PRO
            </button>
          )}

          <button 
            onClick={() => setIsContactOpen(true)} 
            className="text-[9px] md:text-[10px] tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all whitespace-nowrap"
          >
            CONTACT
          </button>
        </div>
      </nav>

      <main className="transition-opacity duration-1000 delay-300 opacity-100">
        
        {/* Mastering & Spectrum Analyzer directly in Hero position */}
        <div className="pt-24">
          <MasterAnalyzer />
        </div>

        {/* Features / Marketing Section */}
        <section id="features" className="py-24 border-t border-white/5 relative z-10 bg-[#050505]/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6">
            
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-4">01. ENGINE FEATURES</h2>
              <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
                Precision technology for your <span className="font-serif italic text-white/70">masters</span>
              </h3>
              <p className="text-xs text-[#9ca3af]/60 uppercase tracking-[0.2em] font-mono mt-2">
                Monitor the behavior of your mastering according to international standards
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">Integrated Loudness (EBU R128)</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  Calculate the real cumulative integrated loudness of your track. Prevent platforms from dynamically compressing your audio in an undesirable way.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 3 18.375v-5.25ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-9.75ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">True Peak Estimator (4x Oversampling)</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  Detect inter-sample peaks that cause clipping distortion when encoding your digital audio into compressed streaming formats (Ogg, AAC, MP3).
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-sm rounded-2xl p-6 hover:border-[#9D4EDD]/20 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#9D4EDD]/10 transition-colors">
                  <svg className="w-5 h-5 text-[#E0AAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <h4 className="text-sm font-modern text-white font-bold tracking-wider uppercase mb-2">Dynamic Range (LRA)</h4>
                <p className="text-xs leading-relaxed text-white/50 font-mono">
                  Evaluate the real volume difference in LU units between the most expressive and lowest intensity moments to balance your mix.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Pricing / Suscripción Section */}
        <section id="pricing" className="py-24 border-t border-white/5 relative z-10 bg-[#050505]/40 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6">
            
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-[10px] tracking-[0.5em] text-[#9D4EDD] mb-4">02. MEMBERSHIP</h2>
              <h3 className="font-modern text-3xl md:text-5xl font-light text-white tracking-tighter">
                Simple, transparent <span className="font-serif italic text-white/70">plans</span>
              </h3>
              <p className="text-xs text-[#9ca3af]/60 uppercase tracking-[0.2em] font-mono mt-2">
                Unleash the true potential of your music without limits
              </p>
            </div>

            <div className="max-w-5xl mx-auto w-full overflow-hidden border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-sm rounded-3xl relative shadow-[0_0_50px_rgba(157,78,221,0.03)]">
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-6 md:p-8 font-modern text-white tracking-widest text-lg uppercase w-1/3">
                        FREE
                        <span className="text-[10px] text-white/40 font-mono tracking-widest block mt-1">(Status: Active)</span>
                      </th>
                      <th className="p-6 md:p-8 font-modern text-[#E0AAFF] tracking-widest text-lg uppercase w-1/3 border-l border-white/5 bg-[#9D4EDD]/[0.02]">
                        PRO
                        <span className="text-[10px] text-[#E0AAFF]/50 font-mono tracking-widest block mt-1">(Monthly)</span>
                      </th>
                      <th className="p-6 md:p-8 font-modern text-[#E0AAFF] tracking-widest text-lg uppercase w-1/3 relative border-l border-white/5 bg-[#9D4EDD]/[0.04]">
                        LIFETIME
                        <span className="text-[10px] text-[#E0AAFF]/50 font-mono tracking-widest block mt-1">(One-Time)</span>
                        <div className="absolute top-4 right-4 bg-[#9D4EDD] text-white text-[8px] font-mono tracking-widest uppercase px-3 py-1 rounded-full hidden sm:block shadow-[0_0_15px_rgba(157,78,221,0.5)]">
                          BEST VALUE
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono text-white/70">
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">3 Daily Analyses</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">Unlimited Analyses</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.04] font-bold">Unlimited Analyses</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">LUFS & True Peak</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">Dynamic Range (LRA)</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.04] font-bold">Dynamic Range (LRA)</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-5 text-white/80">100% Client-Side Processing</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.02] font-bold">100% Client-Side Processing</td>
                      <td className="p-6 md:px-8 py-5 text-[#E0AAFF] border-l border-white/5 bg-[#9D4EDD]/[0.04] font-bold">100% Client-Side Processing</td>
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 md:px-8 py-6 font-serif italic text-3xl text-white/80">$0</td>
                      <td className="p-6 md:px-8 py-6 border-l border-white/5 bg-[#9D4EDD]/[0.02]">
                        <span className="font-serif italic text-3xl text-[#E0AAFF] font-bold">$4.99<span className="text-xs font-mono lowercase text-[#E0AAFF]/50 not-italic font-normal"> / mo</span></span>
                      </td>
                      <td className="p-6 md:px-8 py-6 border-l border-white/5 bg-[#9D4EDD]/[0.04]">
                        <span className="font-serif italic text-3xl text-[#E0AAFF] font-bold">$29.99<span className="text-[10px] tracking-widest font-mono uppercase text-[#E0AAFF]/50 not-italic font-normal ml-2">(One-Time)</span></span>
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
                          Active Free Plan
                        </button>
                      </td>
                      <td className="p-6 md:p-8 border-l border-white/5 bg-[#9D4EDD]/[0.02] align-bottom">
                        <button 
                          onClick={() => {
                            unlockPro('monthly');
                            const element = document.getElementById('analyzer');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full max-w-[200px] py-3.5 rounded-full border border-[#9D4EDD]/50 text-[#E0AAFF] hover:bg-[#9D4EDD]/20 hover:border-[#9D4EDD] transition-colors text-[9px] tracking-widest uppercase font-bold mx-auto block"
                        >
                          Subscribe Monthly
                        </button>
                      </td>
                      <td className="p-6 md:p-8 border-l border-white/5 bg-[#9D4EDD]/[0.04] align-bottom">
                        <button 
                          onClick={() => {
                            unlockPro('lifetime');
                            const element = document.getElementById('analyzer');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full max-w-[200px] py-3.5 rounded-full bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] text-white hover:from-[#E0AAFF] hover:to-[#fbcfe8] hover:text-black transition-colors text-[9px] tracking-widest uppercase font-bold shadow-[0_0_30px_rgba(157,78,221,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] mx-auto block"
                        >
                          Get Lifetime Access
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                    DONE-FOR-YOU: HANDCRAFTED MASTERING
                  </h4>
                  <h3 className="font-modern text-2xl md:text-3xl text-white font-light tracking-tight mb-4">
                    Tired of automated limiters? <br className="hidden md:block" />
                    Send your -6dB mix and let a real producer take <span className="font-bold">CTRL</span>.
                  </h3>
                  <p className="text-xs text-white/50 font-mono leading-relaxed max-w-xl mx-auto md:mx-0">
                    Custom EQ, dynamic balance, and human ears. Delivered in 48 hours.
                  </p>
                </div>
                
                <div className="flex-shrink-0 w-full md:w-auto relative group/btn">
                  <div className="absolute inset-0 bg-[#E0AAFF] opacity-0 group-hover/btn:opacity-20 blur-xl transition-opacity duration-500 rounded-full"></div>
                  <a 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsContactOpen(true); }}
                    className="relative inline-flex items-center justify-center w-full md:w-auto px-8 py-5 rounded-full border border-[#E0AAFF]/30 bg-black text-[#E0AAFF] hover:bg-white/5 hover:border-[#E0AAFF]/70 transition-all duration-300 text-[10px] tracking-[0.2em] font-mono uppercase font-bold"
                  >
                    [ GET PRO MASTER FOR $20 ] <span className="ml-3 group-hover/btn:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        <footer className="w-full py-12 border-t border-white/5 flex flex-col items-center justify-center gap-6 relative z-10 bg-[#050505]">
          <h1 className="font-modern text-2xl text-white font-light tracking-tighter flex items-center">
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
          </h1>
          <div className="flex gap-6 text-[10px] tracking-widest uppercase text-[#9ca3af] items-center">
            <a href="https://www.instagram.com/napbak.studio" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <div className="w-[1px] h-3 bg-white/10 hidden md:block"></div>
            <a href="https://napbak.studio/" target="_blank" rel="noreferrer" className="text-[#9D4EDD] hover:text-[#E0AAFF] transition-colors flex items-center gap-1 group">
              STUDIO <span className="group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transition-transform text-[8px]">↗</span>
            </a>
          </div>
          <p className="text-[9px] tracking-widest text-white/20 mt-8">© {new Date().getFullYear()} ALL RIGHTS RESERVED.</p>
        </footer>

      </main>

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
