'use client';

import Link from 'next/link';
import { FiArrowRight, FiPackage, FiInfo } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { PackageCard } from '../../../components/PackageCard';
import { loc } from '../../../lib/i18n';

export default function PackagesContent() {
  const { t, language, content, packages } = useLanguage();
  const page = content?.packagesPage;

  const title = loc(page, 'title', language, t.packages.title);
  const subtitle = loc(page, 'subtitle', language, t.packages.subtitle);
  const eyebrow = loc(page, 'eyebrow', language);
  const footnote = loc(page, 'footnote', language);
  const ctaLabel = loc(page, 'ctaLabel', language, t.packages.getStarted);

  // Keep highlighted tiers visually centered on wide grids
  const gridColumns =
    packages.length >= 3 ? 'lg:grid-cols-3' : packages.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Page header */}
      <section className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-16 overflow-hidden bg-contour topographic-bg">
        <div className="max-w-4xl relative z-10 space-y-4">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/20 text-teal rounded-full w-fit">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">{eyebrow}</span>
            </div>
          )}
          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-ink uppercase tracking-tight break-words">
            {title}
          </h1>
          <p className="text-base sm:text-xl text-slate max-w-2xl leading-relaxed font-body">{subtitle}</p>
        </div>
      </section>

      {/* Pricing grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 bg-bg-deep border-t border-slate/10">
        <div className="max-w-7xl mx-auto space-y-8">
          {packages.length === 0 ? (
            <div className="bento-card rounded-2xl py-16 px-6 text-center space-y-3">
              <FiPackage size={36} className="mx-auto text-teal/40" />
              <p className="text-sm text-slate">{t.packages.empty}</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColumns} gap-6 sm:gap-8 items-stretch`}>
              {packages.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  language={language}
                  includesLabel={t.packages.includes}
                  fallbackCtaLabel={ctaLabel}
                />
              ))}
            </div>
          )}

          {footnote && (
            <p className="flex items-start justify-center gap-2 text-[11px] text-slate font-mono text-center max-w-2xl mx-auto pt-4">
              <FiInfo size={14} className="flex-shrink-0 mt-0.5 text-teal" />
              <span>{footnote}</span>
            </p>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 border-t border-slate/10">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink uppercase tracking-wide">
            {loc(page, 'ctaTitle', language, 'Not sure which package fits?')}
          </h2>
          <p className="text-sm sm:text-base text-slate max-w-2xl mx-auto leading-relaxed">
            {loc(page, 'ctaSubtitle', language)}
          </p>
          <Link
            href="/contact"
            className="delta-gold-btn inline-flex items-center justify-center gap-2 px-8 py-4 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-gold/20 rounded-sm min-h-[48px]"
          >
            <span>{t.hero.ctaPrimary}</span>
            <FiArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
