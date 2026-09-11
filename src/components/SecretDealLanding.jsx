import React, { useState } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../utils/translations';
import { supabase } from '../lib/supabase';

export default function SecretDealLanding({ onNavigateToStudio }) {
  const { lang, toggleLanguage } = useLanguageStore();
  const t = translations[lang].secretDeal;

  // Email capture state
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [activeFaq, setActiveFaq] = useState(null);

  // Simulated interactive A/B preview fader for engagement
  const [faderPos, setFaderPos] = useState(50);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setEmailStatus('loading');
    try {
      if (supabase) {
        // Try saving lead to supabase
        await supabase
          .from('leads')
          .insert([{ email, source: 'secret-deal-vip', created_at: new Date().toISOString() }]);
      }
    } catch (err) {
      console.warn('Supabase lead insert notice:', err);
    }

    // Save lead locally as fallback
    try {
      const savedLeads = JSON.parse(localStorage.getItem('napbak_vip_leads') || '[]');
      savedLeads.push({ email, timestamp: Date.now() });
      localStorage.setItem('napbak_vip_leads', JSON.stringify(savedLeads));
    } catch (e) {
      // silent
    }

    setTimeout(() => {
      setEmailStatus('success');
    }, 600);
  };

  const gumroadUrl = "https://napoacademy.gumroad.com/l/ctrl-pro-lifetime?wanted=true&discount_code=VIP39";

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans antialiased selection:bg-[#9D4EDD] selection:text-white pb-24 relative overflow-hidden">
      {/* Background ambient neon glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#9D4EDD]/20 via-[#5A189A]/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-[#9D4EDD]/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[-10%] w-[350px] h-[350px] bg-[#5A189A]/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/[0.06] bg-[#070709]/80 backdrop-blur-xl sticky top-0 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onNavigateToStudio}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9D4EDD] to-[#5A189A] flex items-center justify-center shadow-[0_0_15px_rgba(157,78,221,0.4)]">
              <span className="font-mono font-black text-white text-xs tracking-tighter">NB</span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider uppercase font-modern text-white block leading-none">
                CTRL <span className="text-[#E0AAFF] font-normal text-xs">by Napbak</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#E0AAFF]/50 uppercase block mt-0.5">
                SECRET CREATOR ACCESS
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-mono tracking-wider text-[#E0AAFF] hover:border-[#9D4EDD]/50 hover:bg-[#9D4EDD]/10 transition-colors"
              title="Cambiar idioma / Change language"
            >
              [ {lang.toUpperCase()} ]
            </button>

            <button
              onClick={onNavigateToStudio}
              className="text-[11px] font-mono tracking-wider text-white/60 hover:text-white transition-colors hidden sm:inline-block"
            >
              {t.backToStudio}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 pt-8 sm:pt-14">
        
        {/* Urgent Creator Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#9D4EDD]/40 bg-[#9D4EDD]/10 shadow-[0_0_20px_rgba(157,78,221,0.25)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#E0AAFF] shadow-[0_0_8px_#E0AAFF]" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#E0AAFF] uppercase">
              {t.badge}
            </span>
          </div>
        </div>

        {/* Hero Headline */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            {t.heroTitle}{' '}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E0AAFF] via-[#C77DFF] to-[#9D4EDD] mt-1">
              {t.heroTitleAccent}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed font-sans">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Interactive Micro-Preview: Live A/B Crossfader Simulation */}
        <div className="mb-10 p-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-md shadow-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-emerald-300 font-bold uppercase">
                {t.previewBadge}
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider text-[#E0AAFF]/70">
              {faderPos < 45 ? '◄ 100% UNMASTERED MIX' : faderPos > 55 ? '100% NAPBAK MASTER ►' : 'A/B SMOOTH BLEND'}
            </div>
          </div>

          {/* Dual Waveform & Fader Demo */}
          <div className="relative py-4">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className={`px-2.5 py-1 rounded transition-colors ${faderPos <= 50 ? 'bg-[#9D4EDD]/30 text-white font-bold border border-[#9D4EDD]/50' : 'text-white/40'}`}>
                TRACK A: RAW MIX (-18.2 LUFS)
              </span>
              <span className={`px-2.5 py-1 rounded transition-colors ${faderPos >= 50 ? 'bg-[#9D4EDD]/30 text-white font-bold border border-[#9D4EDD]/50' : 'text-white/40'}`}>
                TRACK B: MASTERED (-8.4 LUFS)
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={faderPos}
              onChange={(e) => setFaderPos(Number(e.target.value))}
              className="w-full h-3 bg-black/60 border border-white/20 rounded-lg appearance-none cursor-pointer accent-[#9D4EDD]"
            />

            <div className="flex justify-between text-[9px] font-mono text-white/40 mt-1.5">
              <span>◄ SOLO MIX</span>
              <span className="text-[#E0AAFF]/60">DRAG TO AUDITION DIFFERENCE</span>
              <span>SOLO MASTER ►</span>
            </div>
          </div>

          {/* Quick Realtime Metrics Card */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-center font-mono">
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-[9px] text-white/40 tracking-wider">INTEGRATED LUFS</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {faderPos <= 50 ? '-18.2 LUFS' : '-8.4 LUFS'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-[9px] text-white/40 tracking-wider">TRUE PEAK</div>
              <div className={`text-sm font-bold mt-0.5 ${faderPos <= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {faderPos <= 50 ? '+0.4 dBTP' : '-0.8 dBTP'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04]">
              <div className="text-[9px] text-white/40 tracking-wider">SPOTIFY PENALTY</div>
              <div className="text-sm font-bold text-[#E0AAFF] mt-0.5">
                {faderPos <= 50 ? '+4.2 dB' : '-5.6 dB'}
              </div>
            </div>
          </div>
        </div>

        {/* ── THE ANCHOR PRICING CARD ($79 vs $39) ── */}
        <div className="mb-12 rounded-3xl border-2 border-[#9D4EDD]/60 bg-gradient-to-b from-[#140b1e] via-[#0a0710] to-[#050505] p-6 sm:p-9 shadow-[0_0_50px_rgba(157,78,221,0.25)] relative overflow-hidden">
          
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#9D4EDD] to-[#5A189A] text-white text-[10px] sm:text-xs font-mono font-bold tracking-widest px-4 py-1 rounded-bl-xl shadow-md uppercase">
            {t.savingsBadge}
          </div>

          <div className="text-xs font-mono font-bold tracking-widest text-[#E0AAFF] uppercase mb-2">
            {t.featuresTitle}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            CTRL Lifetime Producer Pass
          </h2>

          {/* Included Breakdown with Individual Value */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-start gap-3">
                <span className="text-base text-emerald-400 mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.item1Title}</h3>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{t.item1Desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#E0AAFF]/70 whitespace-nowrap">{t.item1Value}</span>
            </div>

            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-start gap-3">
                <span className="text-base text-emerald-400 mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.item2Title}</h3>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{t.item2Desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#E0AAFF]/70 whitespace-nowrap">{t.item2Value}</span>
            </div>

            <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-start gap-3">
                <span className="text-base text-emerald-400 mt-0.5">✓</span>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.item3Title}</h3>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{t.item3Desc}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#E0AAFF]/70 whitespace-nowrap">{t.item3Value}</span>
            </div>
          </div>

          {/* Value Anchor Calculation */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/[0.08] mb-6">
            <div className="flex justify-between items-center text-xs font-mono text-white/50 mb-2">
              <span>{t.totalValueLabel}</span>
              <span className="line-through text-white/40">{t.totalValueAmount}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono text-white/60 mb-3">
              <span>{t.officialPriceLabel}</span>
              <span className="line-through text-white/50 text-sm">{t.officialPriceAmount}</span>
            </div>

            <div className="h-px bg-white/10 my-3" />

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-[#E0AAFF] font-bold uppercase tracking-wider block">
                  {t.secretPriceLabel}
                </span>
                <span className="text-[11px] text-white/50 font-mono">
                  {t.secretPricePeriod}
                </span>
              </div>
              <div className="text-right">
                <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E0AAFF] to-[#C77DFF]">
                  {t.secretPriceAmount}
                </span>
                <span className="text-xs font-mono text-white/50 ml-1">USD</span>
              </div>
            </div>
          </div>

          {/* Gumroad Checkout CTA */}
          <a
            href={gumroadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#9D4EDD] via-[#8338EC] to-[#5A189A] hover:from-[#A855F7] hover:to-[#7E22CE] text-white font-bold text-base tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(157,78,221,0.5)] hover:shadow-[0_0_40px_rgba(157,78,221,0.7)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            {t.ctaBtn}
          </a>

          <div className="text-center mt-3">
            <p className="text-[11px] font-mono text-white/50">
              {t.ctaSub}
            </p>
            <p className="text-[10px] font-mono text-emerald-400/80 mt-1">
              ✓ {t.guarantee}
            </p>
          </div>
        </div>

        {/* ── THE MOBILE DILEMMA LEAD CAPTURE ── */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#0c0914]/70 backdrop-blur-md relative overflow-hidden">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-10 h-10 rounded-full bg-[#9D4EDD]/20 border border-[#9D4EDD]/40 flex items-center justify-center mx-auto mb-3 text-lg">
              💻
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {t.mobileTitle}
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6 font-sans">
              {t.mobileSubtitle}
            </p>

            {emailStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                <div className="font-bold text-sm mb-1">{t.successTitle}</div>
                <div>{t.successDesc}</div>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#9D4EDD] focus:ring-1 focus:ring-[#9D4EDD] font-mono"
                />
                <button
                  type="submit"
                  disabled={emailStatus === 'loading'}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap"
                >
                  {emailStatus === 'loading' ? t.sendingBtn : t.sendBtn}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── FAQ ACCORDION ── */}
        <div className="mb-14">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase font-mono text-center mb-6">
            {t.faqTitle}
          </h3>

          <div className="space-y-3">
            {[
              { q: t.faq1Q, a: t.faq1A, id: 'faq-1' },
              { q: t.faq2Q, a: t.faq2A, id: 'faq-2' },
              { q: t.faq3Q, a: t.faq3A, id: 'faq-3' }
            ].map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white/90">
                      {faq.q}
                    </span>
                    <span className="text-sm font-mono text-[#E0AAFF] shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/[0.04]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom studio navigation */}
        <div className="text-center pt-4 border-t border-white/[0.06]">
          <button
            onClick={onNavigateToStudio}
            className="text-xs font-mono text-white/40 hover:text-white transition-colors"
          >
            {t.backToStudio}
          </button>
        </div>
      </main>
    </div>
  );
}
