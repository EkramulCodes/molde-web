'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiBriefcase } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { PortfolioCard } from '../../../components/PortfolioCard';
import { loc } from '../../../lib/i18n';

export default function PortfolioContent() {
  const { t, language, content, portfolio } = useLanguage();
  const page = content?.portfolioPage;
  const [activeCategory, setActiveCategory] = useState('__all');

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    portfolio.forEach((item) => {
      const label = loc(item, 'category', language);
      if (label) seen.set(label.toLowerCase(), label);
    });
    return Array.from(seen.values());
  }, [portfolio, language]);

  const visibleItems = useMemo(() => {
    if (activeCategory === '__all') return portfolio;
    return portfolio.filter((item) => loc(item, 'category', language) === activeCategory);
  }, [portfolio, activeCategory, language]);

  const title = loc(page, 'title', language, t.portfolio.title);
  const subtitle = loc(page, 'subtitle', language, t.portfolio.subtitle);
  const eyebrow = loc(page, 'eyebrow', language);
  const viewLabel = loc(page, 'ctaLabel', language, t.portfolio.viewProject);

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

      {/* Project grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 bg-bg-deep border-t border-slate/10">
        <div className="max-w-7xl mx-auto space-y-10">
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory('__all')}
                className={`px-4 py-2 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                  activeCategory === '__all'
                    ? 'bg-teal text-white shadow-md'
                    : 'bg-bg-primary text-slate border border-slate/15 hover:text-ink hover:border-teal/40'
                }`}
              >
                {t.portfolio.allCategories}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                    activeCategory === category
                      ? 'bg-teal text-white shadow-md'
                      : 'bg-bg-primary text-slate border border-slate/15 hover:text-ink hover:border-teal/40'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {visibleItems.length === 0 ? (
            <div className="bento-card rounded-2xl py-16 px-6 text-center space-y-3">
              <FiBriefcase size={36} className="mx-auto text-teal/40" />
              <p className="text-sm text-slate">{t.portfolio.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleItems.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  language={language}
                  resultsLabel={t.portfolio.results}
                  viewLabel={viewLabel}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-16 border-t border-slate/10">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink uppercase tracking-wide">
            {loc(page, 'ctaTitle', language, 'Want results like these?')}
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
