'use client';

import { useLanguage } from '../../context/LanguageContext';
import { FiMonitor, FiTrendingUp, FiTarget, FiSearch, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function Home() {
  const { t, language } = useLanguage();

  const services = [
    { id: 'web', icon: FiMonitor, ...t.services.webDev },
    { id: 'marketing', icon: FiTrendingUp, ...t.services.marketing },
    { id: 'fb', icon: FiTarget, ...t.services.fbAds },
    { id: 'google', icon: FiSearch, ...t.services.googleAds },
  ];

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Hero Section with Topographic Motif */}
      <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-16 bg-contour topographic-bg">
        {/* Topographic Background SVG Line Decoration */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <path className="contour-line" d="M -100,500 C 100,400 300,600 500,500 S 900,400 1100,500" />
            <path className="contour-line" d="M -100,550 C 100,450 300,650 500,550 S 900,450 1100,550" />
            <path className="contour-line" d="M -100,600 C 100,500 300,700 500,600 S 900,500 1100,600" />
            <circle className="contour-line" cx="800" cy="200" r="120" />
            <circle className="contour-line" cx="800" cy="200" r="180" />
          </svg>
        </div>

        <div className="max-w-3xl relative z-10 text-left space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-teal/10 border border-teal/20 text-teal rounded-full">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse"></span>
            <span className="text-teal text-xs font-bold uppercase tracking-[0.2em] font-mono">
              {t.hero.tagline || 'Full-Service Digitalbyrå'}
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-ink break-words">
            {t.hero.headline}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate leading-relaxed max-w-xl font-body">
            {t.hero.subheadline}
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link 
              href="/contact" 
              className="delta-gold-btn px-8 py-4 font-bold uppercase tracking-widest text-xs sm:text-sm hover:scale-[1.02] shadow-xl shadow-gold/20 transition-all text-center rounded-sm min-h-[48px] flex items-center justify-center gap-2"
            >
              <span>{t.hero.ctaPrimary}</span>
              <FiArrowRight size={16} />
            </Link>
            <Link 
              href="/services" 
              className="border-2 border-teal bg-teal text-white px-8 py-4 font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-teal/90 shadow-md shadow-teal/20 transition-all text-center rounded-sm min-h-[48px] flex items-center justify-center"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid (Bento Cards Layout) */}
      <section className="py-16 sm:py-24 bg-bg-deep border-t border-slate/10 px-4 sm:px-6 lg:px-16 relative z-10" id="services">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-teal block mb-2">Nordic Precision & Flow</span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink uppercase tracking-wide">
                {t.services.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate mt-2 max-w-lg">
                {t.services.subtitle}
              </p>
            </div>
            <Link 
              href="/services" 
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal hover:text-gold transition-colors"
            >
              <span>{language === 'no' ? 'Se alle detaljer' : 'View All Details'}</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <div 
                  key={svc.id}
                  className="bento-card p-6 sm:p-8 rounded-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-5 group-hover:scale-110 transition-transform origin-left">
                      <Icon size={28} strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-bg-primary/80 px-2 py-0.5 rounded border border-slate/10 inline-block mb-3">
                      {svc.id.toUpperCase()}
                    </span>
                    <h3 className="font-display font-bold text-base sm:text-lg mb-2 uppercase tracking-wide text-ink">{svc.title}</h3>
                    <p className="text-xs text-slate leading-relaxed">{svc.description}</p>
                  </div>
                  <div className="pt-6 border-t border-slate/10 mt-6">
                    <Link href="/contact" className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal group-hover:text-gold transition-colors inline-flex items-center gap-1.5">
                      <span>{t.services.requestQuote}</span>
                      <FiArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-8 sm:py-12 bg-ink px-4 sm:px-6 lg:px-16 font-mono border-t border-slate/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 justify-center sm:justify-start p-4 bg-white/5 sm:bg-transparent rounded-lg sm:rounded-none">
            <span className="text-teal font-bold text-3xl sm:text-2xl md:text-3xl">4.2x</span>
            <span className="text-slate text-xs uppercase tracking-wider">{t.metrics.roas}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 justify-center sm:justify-start p-4 bg-white/5 sm:bg-transparent rounded-lg sm:rounded-none sm:border-l sm:border-slate/20 sm:pl-8">
            <span className="text-teal font-bold text-3xl sm:text-2xl md:text-3xl">420%</span>
            <span className="text-slate text-xs uppercase tracking-wider">{t.metrics.roi}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 justify-center sm:justify-start p-4 bg-white/5 sm:bg-transparent rounded-lg sm:rounded-none sm:border-l sm:border-slate/20 sm:pl-8">
            <span className="text-teal font-bold text-3xl sm:text-2xl md:text-3xl">&lt;14d</span>
            <span className="text-slate text-xs uppercase tracking-wider">{t.metrics.speed}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

