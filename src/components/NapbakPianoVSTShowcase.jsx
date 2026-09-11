import React, { useState } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useProStore } from '../store/useProStore';
import { verifyGumroadLicense } from '../utils/gumroad';
import { supabase } from '../lib/supabase';
import { 
  translations, 
  dawGuidesByLang, 
  specsDataByLang, 
  vstFaqsByLang 
} from '../utils/translations';
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
  CheckCircle2,
  Lock,
  X
} from 'lucide-react';

export default function NapbakPianoVSTShowcase() {
  const { lang } = useLanguageStore();
  const { isPro, unlockPro } = useProStore();

  const t = (translations[lang] || translations.en).pianoVst;
  const currentDawGuides = dawGuidesByLang[lang] || dawGuidesByLang.en;
  const currentSpecsData = specsDataByLang[lang] || specsDataByLang.en;
  const currentFaqs = vstFaqsByLang[lang] || vstFaqsByLang.en;

  const [selectedDaw, setSelectedDaw] = useState('flstudio');
  const [copiedPath, setCopiedPath] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Gating & Modals
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Email capture state for Universal Pack
  const [hasUnlockedUniversal, setHasUnlockedUniversal] = useState(() => {
    return localStorage.getItem('napbak_unlocked_universal') === 'true';
  });
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'loading' | 'success'

  // License verification state for Native VST3
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [licenseStatus, setLicenseStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [licenseMsg, setLicenseMsg] = useState('');

  const activeDawData = currentDawGuides.find(d => d.id === selectedDaw) || currentDawGuides[0];

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(type);
    setTimeout(() => setCopiedPath(null), 2500);
  };

  const handleUniversalEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;

    setEmailStatus('loading');
    try {
      if (supabase) {
        await supabase
          .from('leads')
          .insert([{ email: emailInput, source: 'piano-universal-pack', created_at: new Date().toISOString() }]);
      }
    } catch (err) {
      console.warn('Supabase insert notice:', err);
    }

    try {
      const leads = JSON.parse(localStorage.getItem('napbak_piano_leads') || '[]');
      leads.push({ email: emailInput, time: Date.now() });
      localStorage.setItem('napbak_piano_leads', JSON.stringify(leads));
      localStorage.setItem('napbak_unlocked_universal', 'true');
    } catch (err) {
      // silent
    }

    setHasUnlockedUniversal(true);
    setEmailStatus('success');

    // Trigger instant download
    const link = document.createElement('a');
    link.href = '/downloads/Napbak_Concert_Grand_Universal_VST_Pack.zip';
    link.download = 'Napbak_Concert_Grand_Universal_VST_Pack.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setShowEmailModal(false);
      setEmailStatus('idle');
    }, 1200);
  };

  const handleVerifyLicense = async (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;

    setLicenseStatus('loading');
    setLicenseMsg('');

    try {
      const res = await verifyGumroadLicense(licenseKeyInput.trim());
      if (res.success) {
        unlockPro(licenseKeyInput.trim());
        setLicenseStatus('success');
        setLicenseMsg(lang === 'es' ? '¡Licencia verificada con éxito! Descargando VST3...' : 'License verified! Downloading VST3...');

        // Trigger instant VST3 download
        const link = document.createElement('a');
        link.href = '/downloads/Napbak_Concert_Grand_VST3_Win64.zip';
        link.download = 'Napbak_Concert_Grand_VST3_Win64.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
          setShowUnlockModal(false);
          setLicenseStatus('idle');
        }, 1500);
      } else {
        setLicenseStatus('error');
        setLicenseMsg(res.message || (lang === 'es' ? 'Clave de licencia no válida.' : 'Invalid license key.'));
      }
    } catch (err) {
      setLicenseStatus('error');
      setLicenseMsg(lang === 'es' ? 'Error de conexión al verificar.' : 'Connection error during verification.');
    }
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
              {t.badge}
            </span>
          </div>

          <h2 className="font-modern text-3xl sm:text-5xl md:text-6xl font-light tracking-tighter text-white mb-6 leading-[1.1]">
            {t.heroTitle1}<span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#E0AAFF] via-[#C77DFF] to-pink-400">{t.heroAccent1}</span>.<br />
            {t.heroTitle2}<span className="font-serif italic font-normal text-white/90">{t.heroAccent2}</span>.
          </h2>

          <p className="text-sm md:text-base font-mono text-white/60 leading-relaxed max-w-2xl mx-auto">
            {t.heroDesc}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 pt-8 border-t border-white/5 max-w-2xl mx-auto text-left">
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">{t.ram}</span>
              <span className="font-modern text-lg font-bold text-white tracking-tight">~45 MB</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">{t.latency}</span>
              <span className="font-modern text-lg font-bold text-emerald-400 tracking-tight">{t.latencyVal}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">{t.format}</span>
              <span className="font-modern text-lg font-bold text-[#E0AAFF] tracking-tight">{t.formatVal}</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
              <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider block">{t.license}</span>
              <span className="font-modern text-lg font-bold text-white tracking-tight">{t.royaltyFree}</span>
            </div>
          </div>
        </div>

        {/* ── 2. SONIC ARCHITECTURE & CORE INNOVATIONS ─────────────────── */}
        <div className="mb-24">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              {t.sec1Tag}
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              {t.sec1Title}<span className="font-serif italic text-white/70">{t.sec1TitleAccent}</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Waves className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c1Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c1Desc}
              </p>
            </div>

            {/* Card 2 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Sliders className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c2Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c2Desc}
              </p>
            </div>

            {/* Card 3 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c3Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c3Desc}
              </p>
            </div>

            {/* Card 4 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c4Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c4Desc}
              </p>
            </div>

            {/* Card 5 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c5Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c5Desc}
              </p>
            </div>

            {/* Card 6 */}
            <div className="relative group bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-7 hover:border-[#9D4EDD]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 flex items-center justify-center text-[#E0AAFF] mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="font-modern text-lg font-bold text-white tracking-wide uppercase mb-2">
                {t.c6Title}
              </h4>
              <p className="text-xs font-mono text-white/50 leading-relaxed">
                {t.c6Desc}
              </p>
            </div>

          </div>
        </div>

        {/* ── 3. DOWNLOAD VAULT (PRO CTA SECTION) ───────────────────────── */}
        <div className="mb-24 relative overflow-hidden rounded-3xl border border-[#9D4EDD]/30 bg-gradient-to-b from-[#110a1c]/80 via-[#0a0a0a]/90 to-[#070707] p-8 md:p-12 shadow-[0_10px_50px_rgba(157,78,221,0.12)]">
          <div className="max-w-3xl mb-8">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#E0AAFF] font-bold block mb-2">
              {t.sec2Tag}
            </span>
            <h3 className="font-modern text-3xl sm:text-4xl font-light text-white tracking-tight">
              {t.sec2Title}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-white/50 mt-2">
              {t.sec2Desc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Download Option 1: Native Windows VST3 */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-[#9D4EDD]/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-[#9D4EDD]/20 text-[#E0AAFF] text-[9px] font-mono font-bold tracking-wider uppercase border border-[#9D4EDD]/30">
                    {t.winBadge}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">3.7 MB ZIP</span>
                </div>
                <h4 className="font-modern text-xl font-bold text-white mb-2">
                  {t.winTitle}
                </h4>
                <p className="text-xs font-mono text-white/50 mb-6 leading-relaxed">
                  {t.winDesc}
                </p>
                <div className="space-y-1.5 mb-6 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.winB1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.winB2}</span>
                  </div>
                </div>
              </div>

              {isPro ? (
                <a
                  href="/downloads/Napbak_Concert_Grand_VST3_Win64.zip"
                  download="Napbak_Concert_Grand_VST3_Win64.zip"
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  {lang === 'es' ? 'DESCARGAR VST3 (LICENCIA PRO ACTIVA)' : 'DOWNLOAD VST3 (PRO LICENSE ACTIVE)'}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] hover:from-[#E0AAFF] hover:to-[#fbcfe8] text-white hover:text-black font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(157,78,221,0.3)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] active:scale-98 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {lang === 'es' ? 'DESBLOQUEAR CON PASE LIFETIME' : 'UNLOCK WITH LIFETIME PASS'}
                </button>
              )}
            </div>

            {/* Download Option 2: Universal DAW Multi-Pack */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-[#9D4EDD]/50 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-mono font-bold tracking-wider uppercase border border-emerald-500/20">
                    {t.uniBadge}
                  </span>
                  <span className="text-[10px] font-mono text-white/40">610 KB ZIP</span>
                </div>
                <h4 className="font-modern text-xl font-bold text-white mb-2">
                  {t.uniTitle}
                </h4>
                <p className="text-xs font-mono text-white/50 mb-6 leading-relaxed">
                  {t.uniDesc}
                </p>
                <div className="space-y-1.5 mb-6 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.uniB1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t.uniB2}</span>
                  </div>
                </div>
              </div>

              {hasUnlockedUniversal ? (
                <a
                  href="/downloads/Napbak_Concert_Grand_Universal_VST_Pack.zip"
                  download="Napbak_Concert_Grand_Universal_VST_Pack.zip"
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  {lang === 'es' ? 'DESCARGAR PACK UNIVERSAL (DESBLOQUEADO)' : 'DOWNLOAD UNIVERSAL PACK (UNLOCKED)'}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="w-full py-3.5 px-5 rounded-xl bg-white/[0.08] hover:bg-white/20 border border-white/20 hover:border-white text-white font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  {lang === 'es' ? 'DESCARGAR GRATIS CON TU EMAIL' : 'FREE DOWNLOAD WITH EMAIL'}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── 4. INTERACTIVE DAW INSTALLATION & SETUP HUB ──────────────── */}
        <div className="mb-24">
          <div className="flex flex-col items-center text-center mb-10">
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-[#9D4EDD] font-bold mb-2">
              {t.sec3Tag}
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              {t.sec3Title}
            </h3>
            <p className="text-xs font-mono text-white/50 mt-2">
              {t.sec3Desc}
            </p>
          </div>

          {/* DAW Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {currentDawGuides.map(daw => (
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
                  {t.supportedWorkstation}
                </span>
                <h4 className="font-modern text-2xl font-bold text-white mt-0.5">
                  {activeDawData.name} <span className="text-sm font-normal text-white/40 font-mono">({activeDawData.version})</span>
                </h4>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{t.recommended} {activeDawData.recommendedMethod}</span>
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
                  <span className="text-[9px] font-mono uppercase text-white/40 block">{t.winPathLabel}</span>
                  <span className="font-mono text-xs text-white/80 truncate block">{activeDawData.pathWin}</span>
                </div>
                {activeDawData.pathWin !== 'N/A (macOS Exclusive)' && (
                  <button
                    onClick={() => handleCopy(activeDawData.pathWin, 'win')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                    title={t.copyTitle}
                  >
                    {copiedPath === 'win' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Mac Path */}
              <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[9px] font-mono uppercase text-white/40 block">{t.macPathLabel}</span>
                  <span className="font-mono text-xs text-white/80 truncate block">{activeDawData.pathMac}</span>
                </div>
                <button
                  onClick={() => handleCopy(activeDawData.pathMac, 'mac')}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title={t.copyTitle}
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
              {t.sec4Tag}
            </span>
            <h3 className="font-modern text-2xl md:text-4xl font-light tracking-tight text-white">
              {t.sec4Title}
            </h3>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="divide-y divide-white/5">
              {currentSpecsData.map((spec, idx) => (
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
              {t.sec5Tag}
            </span>
            <h3 className="font-modern text-2xl md:text-3xl font-light tracking-tight text-white">
              {t.sec5Title}
            </h3>
          </div>

          <div className="space-y-3">
            {currentFaqs.map((faq, idx) => {
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
            {t.footerNote}
          </p>
        </div>

      </div>

      {/* ── MODAL 1: LIFETIME UNLOCK / GUMROAD LICENSE KEY ── */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e0918] border border-[#9D4EDD]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(157,78,221,0.3)] relative text-left">
            <button
              onClick={() => setShowUnlockModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center text-[#E0AAFF] mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono tracking-widest text-[#E0AAFF] font-bold uppercase block mb-1">
              {lang === 'es' ? 'BENEFICIO EXCLUSIVO LIFETIME' : 'EXCLUSIVE LIFETIME BENEFIT'}
            </span>
            <h3 className="font-modern text-2xl font-bold text-white mb-2">
              {lang === 'es' ? 'Desbloquea el Plugin Nativo VST3' : 'Unlock Native VST3 Plugin'}
            </h3>
            <p className="text-xs font-mono text-white/60 leading-relaxed mb-6">
              {lang === 'es'
                ? 'El instalador nativo a 44.1 kHz / 32-bit float con latencia de 0 muestras está incluido exclusivamente para dueños del Pase Lifetime de CTRL.'
                : 'The native 44.1 kHz / 32-bit float installer with 0 samples latency is included exclusively for CTRL Lifetime Pass owners.'}
            </p>

            {/* Gumroad Buy CTA */}
            <a
              href="https://napoacademy.gumroad.com/l/ctrl-pro-lifetime?wanted=true&discount_code=VIP39"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#9D4EDD] to-[#ec4899] hover:from-[#E0AAFF] hover:to-[#fbcfe8] text-white hover:text-black font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(157,78,221,0.4)] mb-6 text-center cursor-pointer"
            >
              {lang === 'es' ? 'Obtener Pase Lifetime ($39 Oferta Secreta)' : 'Get Lifetime Pass ($39 Secret Deal)'} ➔
            </a>

            {/* License Activation Section */}
            <div className="pt-5 border-t border-white/10">
              <div className="text-[11px] font-mono text-white/70 mb-2 font-bold uppercase tracking-wider">
                {lang === 'es' ? '¿Ya tienes tu clave de Gumroad?' : 'Already have a Gumroad license?'}
              </div>

              {licenseStatus === 'success' ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{licenseMsg}</span>
                </div>
              ) : (
                <form onSubmit={handleVerifyLicense} className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 font-mono focus:outline-none focus:border-[#9D4EDD]"
                    />
                    <button
                      type="submit"
                      disabled={licenseStatus === 'loading'}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {licenseStatus === 'loading' ? (lang === 'es' ? 'Validando...' : 'Checking...') : (lang === 'es' ? 'Activar' : 'Activate')}
                    </button>
                  </div>

                  {licenseStatus === 'error' && (
                    <p className="text-[11px] font-mono text-red-400">
                      {licenseMsg}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EMAIL CAPTURE FOR UNIVERSAL PACK ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0f12] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(16,185,129,0.2)] relative text-left">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Download className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block mb-1">
              {lang === 'es' ? 'DESCARGA DIRECTA GRATUITA' : 'FREE DIRECT DOWNLOAD'}
            </span>
            <h3 className="font-modern text-2xl font-bold text-white mb-2">
              {lang === 'es' ? 'Pack Multi-DAW Universal (Mac & Win)' : 'Universal Multi-DAW Pack (Mac & Win)'}
            </h3>
            <p className="text-xs font-mono text-white/60 leading-relaxed mb-6">
              {lang === 'es'
                ? 'Ingresa tu correo de productor para descargar de inmediato el preset de Decent Sampler + archivo SFZ nativo para FL Studio DirectWave y Logic Pro.'
                : 'Enter your producer email to immediately download the Decent Sampler preset + native SFZ file for FL Studio DirectWave and Logic Pro.'}
            </p>

            {emailStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lang === 'es' ? '¡Descarga iniciada! Revisa tu carpeta de descargas.' : 'Download started! Check your downloads folder.'}</span>
              </div>
            ) : (
              <form onSubmit={handleUniversalEmailSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder={lang === 'es' ? 'tu.email.productor@gmail.com' : 'producer@gmail.com'}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 font-mono focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="submit"
                  disabled={emailStatus === 'loading'}
                  className="w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {emailStatus === 'loading'
                    ? (lang === 'es' ? 'Generando descarga...' : 'Generating download...')
                    : (lang === 'es' ? 'Descargar Pack Ahora ➔' : 'Download Pack Now ➔')}
                </button>

                <p className="text-[10px] font-mono text-white/40 text-center mt-2">
                  {lang === 'es'
                    ? '0 spam. Solo te avisaremos cuando liberemos nuevos samples o actualizaciones.'
                    : 'Zero spam. We will only notify you when releasing new samples or updates.'}
                </p>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
