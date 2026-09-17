import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  ChevronDown, 
  Check, 
  Mail, 
  Award,
  Sliders,
  Layers
} from 'lucide-react';

// ============================================================================
// 📊 CONFIGURACIÓN DE TRACKING (META PIXEL & TIKTOK PIXEL)
// ============================================================================
const META_PIXEL_ID = 'PLACEHOLDER';
const TIKTOK_PIXEL_ID = 'PLACEHOLDER';

// Enlace de Checkout de Gumroad (Reemplazar cuando el producto real esté publicado)
const GUMROAD_CHECKOUT_URL = 'https://gumroad.com/l/PLACEHOLDER-CURSO';

export default function CourseSalesLanding({ onNavigateToStudio }) {
  // Estado para el widget interactivo A/B
  const [faderPos, setFaderPos] = useState(70);

  // Estado para las FAQ interactivas
  const [openFaq, setOpenFaq] = useState(null);

  // Estado para captura de email (lead magnet para indecisos)
  const [leadEmail, setLeadEmail] = useState('');
  const [leadStatus, setLeadStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  // ── PIXELS DE TRACKING (SOLO EN CLIENTE DENTRO DE useEffect) ────────────────
  useEffect(() => {
    // 1. Meta Pixel
    if (typeof window !== 'undefined' && META_PIXEL_ID !== 'PLACEHOLDER') {
      try {
        if (!window.fbq) {
          /* eslint-disable */
          (function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          /* eslint-enable */
          window.fbq('init', META_PIXEL_ID);
        }
        window.fbq('track', 'PageView');
      } catch (err) {
        console.warn('[Pixel Notice] Meta Pixel setup:', err);
      }
    }

    // 2. TikTok Pixel
    if (typeof window !== 'undefined' && TIKTOK_PIXEL_ID !== 'PLACEHOLDER') {
      try {
        if (!window.ttq) {
          /* eslint-disable */
          (function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i;var s=d.createElement("script");s.type="text/javascript",s.async=!0,s.src=i+"?sdkid="+e+"&lib="+t;var o=d.getElementsByTagName("script")[0];o.parentNode.insertBefore(s,o)};
          })(window, document, 'ttq');
          /* eslint-enable */
          window.ttq.load(TIKTOK_PIXEL_ID);
          window.ttq.page();
        }
      } catch (err) {
        console.warn('[Pixel Notice] TikTok Pixel setup:', err);
      }
    }
  }, []);

  // Manejador centralizado para los 3 botones de compra
  const handleInitiateCheckout = (ctaLocation) => {
    if (typeof window !== 'undefined') {
      // Disparar eventos de tracking
      try {
        if (window.fbq && META_PIXEL_ID !== 'PLACEHOLDER') {
          window.fbq('track', 'InitiateCheckout', {
            content_name: 'Toma el Control: Método Spotify Ready',
            content_category: 'Course',
            value: 59.00,
            currency: 'USD',
            cta_location: ctaLocation
          });
        }
      } catch {
        // Safe fail
      }

      try {
        if (window.ttq && TIKTOK_PIXEL_ID !== 'PLACEHOLDER') {
          window.ttq.track('InitiateCheckout', {
            content_name: 'Toma el Control: Método Spotify Ready',
            value: 59.00,
            currency: 'USD',
            cta_location: ctaLocation
          });
        }
      } catch {
        // Safe fail
      }

      // Redirigir a Gumroad
      window.location.href = GUMROAD_CHECKOUT_URL;
    }
  };

  // Manejador del lead magnet (captura de email para indecisos)
  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (!leadEmail || !leadEmail.includes('@')) return;

    setLeadStatus('loading');

    // Guardado seguro en localStorage en cliente como fallback
    if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(localStorage.getItem('napbak_course_leads') || '[]');
        saved.push({ email: leadEmail, timestamp: new Date().toISOString() });
        localStorage.setItem('napbak_course_leads', JSON.stringify(saved));
      } catch {
        // Safe fail
      }
    }

    setTimeout(() => {
      setLeadStatus('success');
    }, 600);
  };

  // Cálculo de métricas simuladas para el widget interactivo A/B
  const blendFactor = faderPos / 100;
  const currentLufs = (-18.2 + (blendFactor * 9.7)).toFixed(1); // De -18.2 a -8.5
  const currentPeak = (+1.4 - (blendFactor * 2.2)).toFixed(1); // De +1.4 a -0.8
  const currentPenalty = (+4.2 - (blendFactor * 4.2)).toFixed(1); // De +4.2 a 0.0
  const isOptimal = faderPos >= 65;

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans antialiased selection:bg-[#9D4EDD] selection:text-white pb-28 relative overflow-hidden">
      
      {/* Luces de fondo ambientales sutiles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-b from-[#9D4EDD]/15 via-[#5A189A]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[50%] right-[-10%] w-[350px] h-[350px] bg-[#9D4EDD]/10 blur-[130px] rounded-full" />
      </div>

      {/* ── HEADER SUPERIOR / TOP BAR ── */}
      <header className="relative z-20 border-b border-white/10 bg-[#070709]/90 backdrop-blur-xl sticky top-0 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={onNavigateToStudio}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
              title="Volver a la suite CTRL"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9D4EDD] to-[#5A189A] flex items-center justify-center border border-white/10">
                <span className="font-mono font-black text-white text-xs tracking-tighter">NB</span>
              </div>
              <div>
                <span className="text-sm font-bold tracking-wider uppercase font-modern text-white block leading-none">
                  CTRL <span className="text-[#E0AAFF] font-normal text-xs">by Napbak</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase block mt-0.5">
                  [ ACADEMIA DE PRODUCTORES ]
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleInitiateCheckout('header-top')}
              className="px-3.5 py-1.5 rounded-full bg-[#9D4EDD] hover:bg-[#E0AAFF] hover:text-black text-white text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer border border-[#9D4EDD]/50"
            >
              ACCEDER AHORA $59
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-8 sm:pt-14">

        {/* ── 1. HERO SECTION ── */}
        <section aria-label="Introducción al curso" className="text-center mb-24 sm:mb-32">
          
          {/* Badge de Oferta Limitada (Sin emojis, con micro-etiqueta y dot sobrio) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#9D4EDD]/40 bg-[#9D4EDD]/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E0AAFF] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#E0AAFF] uppercase">
              [ OFERTA DE LANZAMIENTO • 100 CUPOS CON CTRL LIFETIME ]
            </span>
          </div>

          {/* Titular Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5 font-modern">
            Toma el Control: <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0AAFF] via-[#C77DFF] to-[#9D4EDD]">
              Método Spotify Ready
            </span>
          </h1>

          {/* Subtítulo de Resultado Concreto */}
          <p className="text-sm sm:text-base md:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed font-sans mb-8">
            Aprende el sistema paso a paso para mezclar y masterizar tus temas de 0 a 100 desde tu casa en clips cortos directos al grano, y consigue el volumen, pegada y claridad de Spotify usando <strong className="text-[#E0AAFF] font-semibold">CTRL</strong> como copiloto.
          </p>

          {/* Micro-tags técnicas de contexto */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 font-mono text-[10px] text-white/50">
            <span className="border border-white/10 px-2.5 py-1 rounded-md bg-white/[0.02]">[ MÓDULOS: 06 ]</span>
            <span className="border border-white/10 px-2.5 py-1 rounded-md bg-white/[0.02]">[ FORMATO: CLIPS 3-7 MIN ]</span>
            <span className="border border-white/10 px-2.5 py-1 rounded-md bg-white/[0.02]">[ SOFTWARE: CTRL INCLUIDO ]</span>
          </div>

          {/* ── CONTENEDOR DE VIDEO VSL (PLACEHOLDER CON BORDE PUNTEADO SUTIL) ── */}
          <div 
            data-placeholder="vsl-video"
            className="relative max-w-sm sm:max-w-md mx-auto aspect-[4/5] rounded-2xl border-2 border-dashed border-[#9D4EDD]/40 bg-[#0a0710]/90 p-3 sm:p-4 mb-8 group cursor-pointer"
            onClick={() => handleInitiateCheckout('vsl-play-click')}
          >
            {/* Grid sutil de fondo */}
            <div className="absolute inset-0 bg-[radial-gradient(#9D4EDD_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            {/* Poster / Thumbnail estilizado */}
            <div className="relative w-full h-full rounded-xl bg-black/70 border border-white/10 flex flex-col items-center justify-between p-6 overflow-hidden">
              
              {/* Barra superior del VSL */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-white/70 uppercase">
                    [ VIDEO VSL • 3 MIN ]
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">1080P HD</span>
              </div>

              {/* Botón central de Play */}
              <div className="relative my-auto flex flex-col items-center">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#9D4EDD] group-hover:bg-[#E0AAFF] transition-colors flex items-center justify-center border border-white/20">
                  <Play className="w-7 h-7 text-white group-hover:text-black fill-current translate-x-0.5 transition-colors" />
                </div>
                <span className="text-xs font-mono font-bold text-white tracking-wider uppercase mt-4 group-hover:text-[#E0AAFF] transition-colors">
                  VER VIDEO EXPLICATIVO
                </span>
                <span className="text-[10px] font-mono text-white/50 mt-1">
                  Explicado a cámara paso a paso
                </span>
              </div>

              {/* Pie del Video Placeholder */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-1 h-5 mb-2">
                  {[35, 60, 25, 80, 40, 70, 95, 55, 30, 65, 85, 45, 75, 35, 60, 80, 50, 25].map((h, i) => (
                    <span 
                      key={i} 
                      className="w-1 bg-[#9D4EDD]/60 rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-mono text-white/40 text-center uppercase tracking-wider">
                  /* INSERTAR AQUÍ EL ARCHIVO DE VIDEO FINAL O REPRODUCTOR (ej: &lt;video&gt; o embed VSL) */
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. CTA REPETIDO #1 (INMEDIATO TRAS EL HERO/VIDEO) ── */}
          <div className="mb-8">
            <button
              onClick={() => handleInitiateCheckout('hero-cta-1')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#9D4EDD] hover:bg-[#E0AAFF] hover:text-black text-white font-mono font-bold text-sm sm:text-base tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-3 cursor-pointer border border-[#9D4EDD]"
            >
              <span>QUIERO EL MÉTODO SPOTIFY READY ➔ $59 USD</span>
            </button>
            <p className="text-xs font-mono text-white/50 mt-3 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              Pago único • Acceso de por vida • Garantía incondicional de 14 días
            </p>
          </div>
        </section>

        {/* ── 3. DEMO INTERACTIVO: ANTES Y DESPUÉS DE UN MASTER + CAPTURA REAL DE CTRL ── */}
        <section aria-label="Comparativa interactiva antes y después" className="mb-24 sm:mb-32">
          
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#070709] relative">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  [ DEMO EN VIVO // CONTROL SPOTIFY READY ]
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white font-modern">
                  Mira lo que le pasa a tu canción cuando aplicas el método
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#E0AAFF] whitespace-nowrap self-start sm:self-auto">
                {faderPos < 35 ? '◄ 100% MEZCLA CRUDA' : faderPos > 65 ? '100% SPOTIFY READY ►' : 'A/B EN TRANSICIÓN'}
              </span>
            </div>

            {/* Slider / Crossfader A/B */}
            <div className="bg-black/60 rounded-xl p-4 sm:p-5 border border-white/10 mb-5">
              <div className="flex justify-between items-center text-xs font-mono mb-3">
                <span className={`px-2.5 py-1 rounded border transition-all ${faderPos <= 50 ? 'border-red-500/40 bg-red-500/10 text-red-300 font-bold' : 'border-transparent text-white/40'}`}>
                  TRACK A: MEZCLA SIN MASTER (-18.2 LUFS)
                </span>
                <span className={`px-2.5 py-1 rounded border transition-all ${faderPos > 50 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold' : 'border-transparent text-white/40'}`}>
                  TRACK B: MASTER CON CTRL (-8.5 LUFS)
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={faderPos}
                onChange={(e) => setFaderPos(Number(e.target.value))}
                className="w-full h-2.5 bg-black border border-white/20 rounded-lg appearance-none cursor-pointer accent-[#9D4EDD]"
              />

              <div className="flex justify-between text-[10px] font-mono text-white/40 mt-2">
                <span>◄ DESLIZA A LA IZQUIERDA (OPACA / BAJA)</span>
                <span className="text-[#E0AAFF] font-bold">ARRASTRA EL FADER</span>
                <span>DESLIZA A LA DERECHA (SPOTIFY READY) ►</span>
              </div>
            </div>

            {/* Métricas en Tiempo Real */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">LOUDNESS INTEGRADO</div>
                <div className={`text-base sm:text-lg font-bold mt-1 ${isOptimal ? 'text-[#E0AAFF]' : 'text-amber-400'}`}>
                  {currentLufs} LUFS
                </div>
                <div className="text-[9px] text-white/40 mt-0.5">
                  {isOptimal ? 'Volumen comercial' : 'Muy bajo (-6dB)'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">TRUE PEAK (dBTP)</div>
                <div className={`text-base sm:text-lg font-bold mt-1 ${Number(currentPeak) <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {Number(currentPeak) > 0 ? `+${currentPeak}` : currentPeak} dBTP
                </div>
                <div className="text-[9px] text-white/40 mt-0.5">
                  {Number(currentPeak) <= 0 ? 'Cero distorsión' : '¡Distorsiona al comprimir!'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">PENALIZACIÓN SPOTIFY</div>
                <div className={`text-base sm:text-lg font-bold mt-1 ${currentPenalty === '0.0' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentPenalty === '0.0' ? '0.0 dB' : `-${currentPenalty} dB`}
                </div>
                <div className="text-[9px] text-white/40 mt-0.5">
                  {currentPenalty === '0.0' ? 'Máxima fidelidad' : 'Spotify le bajará volumen'}
                </div>
              </div>
            </div>

            {/* Resumen explicativo */}
            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-white/70 font-sans flex items-center gap-3">
              <Zap className="w-4 h-4 text-[#E0AAFF] shrink-0" />
              <span>
                {isOptimal 
                  ? "Con el Método Spotify Ready y CTRL, tu tema adquiere pegada, el bajo y el bombo conviven sin saturar, y la voz se escucha con presencia en cualquier altavoz de teléfono."
                  : "Moviendo el fader hacia la derecha verás cómo la canción alcanza el estándar comercial sin romper el limitador ni sufrir distorsión en streaming."}
              </span>
            </div>

            {/* ── PRUEBA VISUAL TANGIBLE: CAPTURA REAL DE LA INTERFAZ DE CTRL ── */}
            <div 
              data-placeholder="ctrl-screenshot"
              className="mt-8 rounded-xl border-2 border-dashed border-[#9D4EDD]/40 bg-[#050505] overflow-hidden"
            >
              {/* Barra superior de ventana de software */}
              <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-white/20"></span>
                  </div>
                  <span className="text-[10px] font-mono text-white/50 tracking-wider">
                    CTRL Engine // Realtime Master Analyzer & Loudness Compliance
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#E0AAFF] bg-[#9D4EDD]/15 border border-[#9D4EDD]/30 px-2 py-0.5 rounded">
                  [ INCLUIDO DE POR VIDA EN EL BUNDLE ]
                </span>
              </div>

              {/* Contenedor de la captura (Proporción 16:9) */}
              <div className="aspect-video w-full flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-[radial-gradient(#9D4EDD_1px,transparent_1px)] [background-size:20px_20px]">
                <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center text-[#E0AAFF] mb-3">
                  <Sliders className="w-6 h-6" />
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider uppercase mb-1">
                  [ INSERTAR AQUÍ CAPTURA REAL DE LA INTERFAZ DE CTRL EN ACCIÓN ]
                </div>
                <p className="text-[11px] font-mono text-white/50 max-w-md leading-relaxed">
                  Resolución recomendada: 1920x1080 (16:9). Muestra la pantalla real con el medidor LUFS, True Peak 4x y el comparador A/B funcionando.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <span className="text-[9px] font-mono text-white/40 border border-white/10 px-2.5 py-0.5 rounded">
                    [ 100% CLIENT-SIDE ]
                  </span>
                  <span className="text-[9px] font-mono text-[#E0AAFF] border border-[#9D4EDD]/30 px-2.5 py-0.5 rounded">
                    [ LICENCIA LIFETIME INCLUIDA ]
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    [ SIN LÍMITES DE ANÁLISIS ]
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4. EL PROBLEMA VS LA SOLUCIÓN ── */}
        <section aria-label="El problema versus la solución" className="mb-24 sm:mb-32">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E0AAFF] uppercase block mb-1">
              [ EL ERROR QUE TODOS COMETEN ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-modern">
              ¿Por qué el 90% de los cursos de mezcla te hacen perder meses?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Columna El Problema */}
            <div className="p-6 rounded-2xl border border-red-500/20 bg-black/40">
              <div className="flex items-center gap-2 mb-4 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Los Cursos Tradicionales
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-white/70">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span><strong>35 horas de teoría infinita</strong> que te aburren y jamás terminas de ver.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Te enseñan emulaciones de consolas analógicas de 1980 que no aplican a la música moderna.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Te exigen plugins de $2,000 USD de Waves o UAD que no puedes pagar.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-400 font-bold mt-0.5">✕</span>
                  <span>Sigues subiendo temas a Spotify que suenan bajitos y sin vida.</span>
                </li>
              </ul>
            </div>

            {/* Columna La Solución */}
            <div className="p-6 rounded-2xl border border-[#9D4EDD]/40 bg-black/40">
              <div className="flex items-center gap-2 mb-4 text-[#E0AAFF] font-mono text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E0AAFF]" />
                El Método Spotify Ready (CTRL)
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-white/90">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span><strong>Clips directos al grano (3 a 7 minutos)</strong> que aplicas en tiempo real en tu DAW.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Enfocado 100% en el sonido urbano y comercial de hoy (graves gordos y voces al frente).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Usa los plugins nativos de tu DAW + el poder de medición en tiempo real de <strong>CTRL</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Resultados inmediatos: tu próximo tema sonará listo para playlist oficial.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 5. TEMARIO EN MÓDULOS / CLIPS CORTOS ── */}
        <section aria-label="Temario del curso" className="mb-24 sm:mb-32" data-placeholder="course-modules">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E0AAFF] uppercase block mb-1">
              [ CONTENIDO DEL ENTRENAMIENTO ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-modern">
              De 0 a Master Comercial en 6 Módulos Prácticos
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto mt-2">
              Grabado de forma directa al monitor, sin rodeos, para que vayas pausando y aplicando cada movimiento en tu propia canción.
            </p>
          </div>

          {/* Grid de Módulos */}
          <div className="space-y-3">
            
            {/* Módulo 1 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-white/10 hover:border-[#9D4EDD]/40 transition-colors" data-placeholder="module-mockup-1">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-xs shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      La Preparación Invisible: Gain Staging & Headroom
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      El truco para que tu master no sature antes de empezar. Cómo limpiar ruidos de fondo, balancear volúmenes relativos y dejar los 6dB de margen sagrados.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF]/70 bg-white/[0.04] px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-white/5">
                  [ 3 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo 2 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-white/10 hover:border-[#9D4EDD]/40 transition-colors" data-placeholder="module-mockup-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-xs shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      El Low-End Perfecto: Kick & 808 sin Choques
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Cómo hacer que el bombo golpee en el pecho mientras el subgrave retumba sin emborronar la mezcla ni forzar al limitador a distorsionar.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF]/70 bg-white/[0.04] px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-white/5">
                  [ 4 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo 3 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-white/10 hover:border-[#9D4EDD]/40 transition-colors" data-placeholder="module-mockup-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-xs shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Voces al Frente: Brillo, Presencia y Aire
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      El tratamiento vocal moderno: ecualización sustractiva, compresión en serie y el secreto para que las letras se entiendan perfectas en el altavoz del teléfono.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF]/70 bg-white/[0.04] px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-white/5">
                  [ 4 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo 4 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-white/10 hover:border-[#9D4EDD]/40 transition-colors" data-placeholder="module-mockup-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-xs shrink-0 mt-0.5">
                    04
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Espacio y Dimensión Estéreo Mono-Compatible
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Reverbs y delays que crean profundidad cinematográfica sin desfasar la mezcla al sonar en mono o en clubs.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF]/70 bg-white/[0.04] px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-white/5">
                  [ 3 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo 5 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-white/10 hover:border-[#9D4EDD]/40 transition-colors" data-placeholder="module-mockup-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-xs shrink-0 mt-0.5">
                    05
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      La Cadena de Masterización Spotify Ready
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      El paso a paso de tu bus master: pegamento analógico digital, saturación armónica sutil, clipping suave y el ajuste del limitador final para un sonido robusto.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF]/70 bg-white/[0.04] px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-white/5">
                  [ 5 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo 6 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-[#9D4EDD]/40" data-placeholder="module-mockup-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#9D4EDD] flex items-center justify-center font-mono font-bold text-white text-xs shrink-0 mt-0.5">
                    06
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      Auditoría y Certificación con CTRL
                      <span className="text-[9px] font-mono bg-[#E0AAFF] text-black px-2 py-0.5 rounded font-bold">
                        CLAVE
                      </span>
                    </h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Cómo subir tu canción a CTRL para medir el LUFS exacto de Spotify (-8 a -10 LUFS comercial), verificar el True Peak en 4x oversampling y escuchar la simulación de coche y celular antes del lanzamiento.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E0AAFF] bg-black/40 px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-[#9D4EDD]/30">
                  [ 4 CLIPS ]
                </span>
              </div>
            </div>

            {/* Módulo Bonus (Sin emoji, con tag sobrio) */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#070709] border border-amber-500/30" data-placeholder="module-mockup-bonus">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-amber-300 text-[10px] shrink-0 mt-0.5">
                    +
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Bonus Pack: Plantillas de Inicio Rápido & Cheatsheets
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Descarga templates de mezcla configurados para FL Studio, Ableton y Reaper, más la guía PDF con las frecuencias exactas para limpiar y potenciar cada instrumento.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-300 bg-black/40 px-2.5 py-1 rounded whitespace-nowrap shrink-0 border border-amber-500/30">
                  [ BONUS INCLUIDO ]
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. PLACEHOLDER DE PRUEBA SOCIAL / TESTIMONIOS (SIN NOMBRES INVENTADOS) ── */}
        <section 
          aria-label="Testimonios de productores" 
          className="mb-24 sm:mb-32"
          data-placeholder="testimonials-section"
        >
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E0AAFF] uppercase block mb-1">
              [ PRUEBA SOCIAL // PRODUCTORES EN ACCIÓN ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-modern">
              Resultados de Productores que ya Usan el Método
            </h2>
            <p className="text-xs font-mono text-white/40 mt-1 uppercase">
              /* ESPACIO LISTO PARA INSERTAR CAPTURAS REALES DE WHATSAPP / INSTAGRAM DM / AUDIO REVIEWS */
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            
            {/* Testimonio 1 (Placeholder real y honesto con borde punteado) */}
            <div 
              data-placeholder="testimonial-1"
              className="p-5 rounded-xl border-2 border-dashed border-white/15 bg-[#070709] flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-[#E0AAFF] mb-3">
                  [ TESTIMONIO 1 // FEEDBACK WHATSAPP ]
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-mono mb-4">
                  "Espacio reservado para captura de pantalla de WhatsApp o mensaje directo de alumno comentando su cambio de volumen antes vs después de aplicar el método."
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                [ INSERTAR CAPTURA O REVIEW ]
              </div>
            </div>

            {/* Testimonio 2 */}
            <div 
              data-placeholder="testimonial-2"
              className="p-5 rounded-xl border-2 border-dashed border-white/15 bg-[#070709] flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-[#E0AAFF] mb-3">
                  [ TESTIMONIO 2 // CASO LOW-END & CTRL ]
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-mono mb-4">
                  "Espacio reservado para captura de alumno mostrando cómo resolvió la pelea del Kick y 808 usando el medidor de CTRL para no saturar el limitador."
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                [ INSERTAR CAPTURA O REVIEW ]
              </div>
            </div>

            {/* Testimonio 3 */}
            <div 
              data-placeholder="testimonial-3"
              className="p-5 rounded-xl border-2 border-dashed border-white/15 bg-[#070709] flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono text-[#E0AAFF] mb-3">
                  [ TESTIMONIO 3 // LANZAMIENTO SPOTIFY ]
                </div>
                <p className="text-xs text-white/70 leading-relaxed font-mono mb-4">
                  "Espacio reservado para comentario de productor logrando el sonido competitivo en Spotify sin distorsión inter-sample."
                </p>
              </div>
              <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                [ INSERTAR CAPTURA O REVIEW ]
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. VALUE STACK (EL ANCLAJE DE PRECIO + MOCKUP DIGITAL DEL PAQUETE) ── */}
        <section aria-label="Desglose de valor de la oferta" className="mb-24 sm:mb-32">
          <div className="rounded-2xl border border-[#9D4EDD]/40 bg-[#070709] p-6 sm:p-9 relative">
            
            {/* Cinta superior de ahorro */}
            <div className="absolute top-0 right-0 bg-[#9D4EDD] text-white text-[10px] sm:text-xs font-mono font-bold tracking-widest px-4 py-1 rounded-bl-xl uppercase">
              AHORRAS MÁS DEL 75% HOY
            </div>

            <div className="text-xs font-mono font-bold tracking-widest text-[#E0AAFF] uppercase mb-1">
              [ PAQUETE COMPLETO DE LANZAMIENTO ]
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 font-modern">
              Todo lo que te llevas hoy:
            </h2>

            {/* ── MOCKUP DIGITAL DEL PRODUCTO / DIGITAL BUNDLE PLACEHOLDER ── */}
            <div 
              data-placeholder="course-mockup"
              className="mb-8 rounded-xl border-2 border-dashed border-[#9D4EDD]/40 bg-[#050505] p-6 sm:p-8 text-center"
            >
              <div className="aspect-[16/9] max-h-[260px] w-full flex flex-col items-center justify-center rounded-lg bg-black/60 border border-white/10 p-4">
                <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center text-[#E0AAFF] mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider uppercase mb-1">
                  [ INSERTAR AQUÍ MOCKUP DIGITAL DEL BUNDLE: CURSO + CTRL + VST ]
                </div>
                <p className="text-[11px] font-mono text-white/50 max-w-sm leading-relaxed">
                  Composición en ángulo tipo "producto físico" (Laptop con lección en video + Tablet + Caja digital + VST Napbak Piano).
                </p>
                <span className="text-[9px] font-mono text-[#E0AAFF]/70 mt-3">
                  Proporción recomendada: 16:9 • PNG transparente o fondo oscuro
                </span>
              </div>
            </div>

            {/* Lista del Value Stack */}
            <div className="space-y-3 mb-8">
              
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Curso Completo "Toma el Control: Método Spotify Ready"
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      6 Módulos en micro-clips prácticos de 0 a 100 con acceso ilimitado de por vida.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#E0AAFF] whitespace-nowrap font-bold">Valor $120</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      CTRL Loudness & Mastering Suite — Licencia LIFETIME Oficial
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Acceso de por vida sin suscripciones mensuales: medidor LUFS, True Peak 4x y comparador A/B.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#E0AAFF] whitespace-nowrap font-bold">Valor $79</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Napbak Concert Grand Piano VST3 / AU para tu DAW
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Plugin acústico de concierto con cero latencia y filtro felt cálido para FL Studio, Ableton y Logic.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#E0AAFF] whitespace-nowrap font-bold">Valor $49</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Plantillas de Masterización (FL, Ableton, Reaper) + Cheatsheet PDF
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Cadena de plugins lista para arrastrar y tabla de frecuencias clave.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#E0AAFF] whitespace-nowrap font-bold">Valor $20</span>
              </div>
            </div>

            {/* Cálculo de anclaje */}
            <div className="p-5 rounded-xl bg-black/70 border border-white/10 mb-6">
              <div className="flex justify-between items-center text-xs font-mono text-white/50 mb-2">
                <span>VALOR TOTAL POR SEPARADO:</span>
                <span className="line-through text-white/40 text-sm">$268 USD</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono text-white/60 mb-3">
                <span>PRECIO REGULAR EN LA WEB:</span>
                <span className="line-through text-white/50 text-sm">$149 USD</span>
              </div>

              <div className="h-px bg-white/10 my-3" />

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">
                    PRECIO ESPECIAL DE LANZAMIENTO:
                  </div>
                  <div className="text-[11px] font-mono text-white/50 mt-0.5">
                    (Pago único • Sin mensualidades • Acceso de por vida)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                    $59 <span className="text-base font-normal text-white/60">USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 8. CTA REPETIDO #2 (INMEDIATO TRAS EL VALUE STACK) ── */}
            <button
              onClick={() => handleInitiateCheckout('value-stack-cta-2')}
              className="w-full py-4 rounded-xl bg-[#9D4EDD] hover:bg-[#E0AAFF] hover:text-black text-white font-mono font-bold text-sm sm:text-base tracking-wider uppercase transition-colors flex items-center justify-center gap-3 cursor-pointer border border-[#9D4EDD]"
            >
              <span>OBTENER ACCESO COMPLETO POR $59 ➔</span>
            </button>
            <p className="text-[11px] font-mono text-white/50 text-center mt-2.5">
              Checkout cifrado de 256 bits vía Gumroad • Entrega inmediata por correo
            </p>
          </div>
        </section>

        {/* ── 9. GARANTÍA INCONDICIONAL DE 14 DÍAS ── */}
        <section aria-label="Garantía incondicional" className="mb-24 sm:mb-32">
          <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-[#070709] flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  [ 100% LIBRE DE RIESGO ]
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-modern">
                Garantía Incondicional de 14 Días
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
                Aplica el método en una de tus canciones y mídelo con CTRL. Si dentro de los primeros 14 días sientes que tus temas no suenan con más pegada, claridad y volumen comercial, simplemente nos mandas un correo y te devolvemos el 100% de tu dinero de inmediato. Sin preguntas incómodas.
              </p>
            </div>
          </div>
        </section>

        {/* ── 10. FAQ PARA PRODUCTORES ── */}
        <section aria-label="Preguntas frecuentes" className="mb-24 sm:mb-32">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E0AAFF] uppercase block mb-1">
              [ DUDAS FRECUENTES ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-modern">
              Preguntas de Productores
            </h2>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: "¿Necesito un estudio con tratamiento acústico o monitores caros?",
                a: "No. El 95% de los productores que aplican este método trabajan en su cuarto con audífonos normales o monitores de entrada. La ventaja de usar CTRL es que tienes métricas visuales exactas (LUFS, True Peak y simulación de altavoces de teléfono/coche), por lo que no dependes de la acústica de tu habitación para saber si el master está perfecto."
              },
              {
                q: "¿Funciona con mi DAW (FL Studio, Ableton, Logic, Reaper)?",
                a: "Totalmente. El método se enseña con conceptos de flujo de audio universales y cadenas de plugins estándar (EQ, saturación, compresión, clipping y limitación). Puedes aplicarlo exactamente igual en cualquier software de producción."
              },
              {
                q: "¿Necesito comprar plugins adicionales de miles de dólares?",
                a: "No. En el curso te mostramos cómo lograr el resultado usando plugins nativos de tu DAW y alternativas 100% gratuitas, complementadas con la herramienta CTRL (que ya la tienes incluida de por vida)."
              },
              {
                q: "¿Qué pasa si no sé nada de teoría musical o ingeniería acústica?",
                a: "Este curso no es un tratado universitario de física. Está diseñado en clips cortos y visuales explicados en lenguaje común de productor: qué perilla mover, cuánto subir, qué número mirar en CTRL y listo."
              },
              {
                q: "¿Cómo y cuándo recibo el acceso?",
                a: "La entrega es instantánea. Al completar el pago seguro en Gumroad, recibirás un correo electrónico con tus credenciales para ver las lecciones en video y tu clave de activación Lifetime de CTRL."
              },
              {
                q: "¿Tengo que pagar alguna mensualidad o suscripción?",
                a: "No. Esta oferta de lanzamiento incluye el curso y la licencia Lifetime de CTRL en un solo pago único de $59 USD. Tendrás acceso permanente y futuras actualizaciones incluidas."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-white/10 bg-[#070709] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-white font-modern">
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#E0AAFF] transition-transform duration-200 shrink-0 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-white/70 leading-relaxed font-sans border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 11. CAPTURA DE EMAIL PARA INDECISOS (LEAD MAGNET) ── */}
        <section aria-label="Boletín de consejos de mezcla" className="mb-24 sm:mb-32">
          <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#070709] text-center relative">
            
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5 text-[#E0AAFF]" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 font-modern">
              ¿Aún no estás listo para entrar hoy?
            </h3>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-5 leading-relaxed">
              Déjame tu correo y te mando de regalo la guía en PDF: <strong className="text-white">"Los 3 Errores Fatales al Mezclar que Spotify Penaliza con Bajar de Volumen"</strong>.
            </p>

            {leadStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono max-w-md mx-auto flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                ¡Listo! Revisa tu bandeja de entrada en unos minutos para descargar la guía.
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="Tu correo electrónico..."
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-black/80 border border-white/20 text-white placeholder-white/40 text-xs font-mono focus:outline-none focus:border-[#9D4EDD]"
                />
                <button
                  type="submit"
                  disabled={leadStatus === 'loading'}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-[#9D4EDD] hover:text-white text-white/90 text-xs font-mono font-bold tracking-wider uppercase transition-colors shrink-0 cursor-pointer border border-white/10"
                >
                  {leadStatus === 'loading' ? 'ENVIANDO...' : 'ENVIARME GUÍA'}
                </button>
              </form>
            )}
            <p className="text-[10px] font-mono text-white/30 mt-3">
              Cero spam. Solo consejos prácticos de producción y noticias de CTRL.
            </p>
          </div>
        </section>

        {/* ── 12. CTA FINAL DE COMPRA (REPETIDO #3) ── */}
        <section aria-label="Llamado a la acción final" className="text-center mb-16">
          <div className="p-8 sm:p-12 rounded-2xl border border-[#9D4EDD]/40 bg-[#070709]">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#E0AAFF] uppercase block mb-2">
              [ TU PRÓXIMO TEMA MERECE SONAR GRANDE ]
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 font-modern">
              Deja de adivinar en tus mezclas. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0AAFF] via-[#C77DFF] to-[#9D4EDD]">
                Toma el control hoy mismo.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto mb-8 leading-relaxed">
              Únete a los productores que ya están aplicando el Método Spotify Ready y llévate tu licencia Lifetime de CTRL antes de que se agoten los 100 cupos de lanzamiento.
            </p>

            <button
              onClick={() => handleInitiateCheckout('final-cta-3')}
              className="w-full sm:w-auto px-10 py-4.5 rounded-xl bg-[#9D4EDD] hover:bg-[#E0AAFF] hover:text-black text-white font-mono font-bold text-sm sm:text-base tracking-wider uppercase transition-colors inline-flex items-center justify-center gap-3 cursor-pointer border border-[#9D4EDD]"
            >
              <span>INSCRIBIRME AHORA — $59 USD ➔</span>
            </button>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/50 mt-5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> [ GARANTÍA 14 DÍAS ]
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#E0AAFF]" /> [ ACCESO INMEDIATO ]
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> [ CTRL LIFETIME ]
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER SIMPLE DE LA LANDING ── */}
      <footer className="relative z-10 border-t border-white/10 pt-8 pb-12 text-center text-xs font-mono text-white/40">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-modern">CTRL by Napbak</span>
            <span>•</span>
            <span>Herramientas para la nueva generación de productores</span>
          </div>
          <button
            onClick={onNavigateToStudio}
            className="text-white/60 hover:text-white transition-colors underline decoration-white/20 cursor-pointer"
          >
            ← Volver a CTRL Analyzer
          </button>
        </div>
      </footer>

    </div>
  );
}
