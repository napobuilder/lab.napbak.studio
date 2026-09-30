import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Mail, 
  Key, 
  Download, 
  ArrowRight
} from 'lucide-react';

const META_PIXEL_ID = 'PLACEHOLDER';
const TIKTOK_PIXEL_ID = 'PLACEHOLDER';

export default function CourseThankYou({ onNavigateToStudio }) {
  // ── TRACKING DE COMPRA (PURCHASE / COMPLETE PAYMENT) EN CLIENTE ────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Meta Pixel Purchase
      try {
        if (window.fbq && META_PIXEL_ID !== 'PLACEHOLDER') {
          window.fbq('track', 'Purchase', {
            content_name: 'Toma el Control: Método Spotify Ready',
            value: 59.00,
            currency: 'USD'
          });
        }
      } catch (err) {
        console.warn('[Pixel Notice] Meta Purchase:', err);
      }

      // 2. TikTok Pixel CompletePayment
      try {
        if (window.ttq && TIKTOK_PIXEL_ID !== 'PLACEHOLDER') {
          window.ttq.track('CompletePayment', {
            content_name: 'Toma el Control: Método Spotify Ready',
            value: 59.00,
            currency: 'USD'
          });
        }
      } catch (err) {
        console.warn('[Pixel Notice] TikTok Purchase:', err);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans antialiased selection:bg-[#9D4EDD] selection:text-white pb-24 relative overflow-hidden">
      
      {/* Luces de fondo ambientales */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-[#9D4EDD]/15 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#070709]/80 backdrop-blur-xl sticky top-0 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onNavigateToStudio}
            className="flex items-center gap-3 text-left cursor-pointer transition-opacity hover:opacity-90"
            title="Volver a la suite CTRL"
          >
            <img 
              src="/ctrl-academy.png" 
              alt="CTRL ACADEMY" 
              className="h-8 w-auto object-contain drop-shadow-[0_0_15px_rgba(157,78,221,0.25)]" 
            />
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded uppercase hidden sm:inline-block">
              COMPRA EXITOSA
            </span>
          </button>

          <button
            onClick={onNavigateToStudio}
            className="text-[11px] font-mono tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            ← Ir a la Suite CTRL
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pt-10 sm:pt-14">
        
        {/* Badge de confirmación */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-300 uppercase">
              PAGO CONFIRMADO • ORDEN PROCESADA
            </span>
          </div>
        </div>

        {/* Titular */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 font-modern">
            ¡Felicidades y bienvenido a bordo!
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto leading-relaxed font-sans">
            Ya eres parte oficial de <strong className="text-white">Toma el Control: Método Spotify Ready</strong>. A continuación tienes los pasos exactos para acceder a tu entrenamiento y activar tus licencias.
          </p>
        </div>

        {/* Pasos a seguir */}
        <div className="space-y-4 mb-10">
          
          {/* Paso 1 */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-sm shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Paso 1: Revisa tu Correo Electrónico
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                Gumroad te acaba de enviar el recibo de compra junto con tu enlace personal de acceso directo a la plataforma de video donde están todos los clips del curso.
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-sm shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Paso 2: Tu Licencia Lifetime de CTRL
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                En el mismo correo encontrarás tu clave de licencia Lifetime de CTRL. Puedes desbloquear tu acceso permanente en la web haciendo clic en "Get Pro" e ingresando tu código o iniciando sesión.
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center font-mono font-bold text-[#E0AAFF] text-sm shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Paso 3: Descarga el Piano VST3 y las Plantillas
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">
                Dentro del correo tienes los enlaces para descargar el plugin Napbak Concert Grand (VST3/AU para Windows y Mac) y las plantillas para FL Studio, Ableton y Reaper.
              </p>
            </div>
          </div>
        </div>

        {/* Botón hacia la app */}
        <div className="text-center p-6 rounded-3xl border border-[#9D4EDD]/30 bg-gradient-to-b from-[#140b20] to-black/60 shadow-xl mb-10">
          <h3 className="text-base font-bold text-white mb-2">
            ¿Listo para analizar tu primera canción?
          </h3>
          <p className="text-xs text-white/60 mb-5">
            Abre la suite CTRL en tu navegador y comienza a medir tus pistas de referencia.
          </p>
          <button
            onClick={onNavigateToStudio}
            className="px-6 py-3.5 rounded-xl bg-[#9D4EDD] hover:bg-[#E0AAFF] hover:text-black text-white font-mono font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_0_25px_rgba(157,78,221,0.5)] cursor-pointer inline-flex items-center gap-2"
          >
            <span>ABRIR CTRL ANALYZER AHORA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Soporte */}
        <div className="text-center text-xs font-mono text-white/40">
          <p>¿Tienes alguna duda o no encuentras tu correo?</p>
          <p className="mt-1 text-white/60">
            Escríbenos directamente a <a href="mailto:soporte@napbak.studio" className="text-[#E0AAFF] underline">soporte@napbak.studio</a> y te ayudamos en minutos.
          </p>
        </div>

      </main>
    </div>
  );
}
