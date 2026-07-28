'use client';

import Link from 'next/link';
import { FiArrowRight, FiBriefcase, FiPackage } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeading } from '../../components/SectionHeading';
import { ServiceCard } from '../../components/ServiceCard';
import { PortfolioCard } from '../../components/PortfolioCard';
import { PackageCard } from '../../components/PackageCard';
import { loc } from '../../lib/i18n';

export default function HomeContent() {
  const { t, language, content, services, portfolio, packages } = useLanguage();

  const home = content?.home;
  const metrics = home?.metrics ?? [];

  // Featured items first, then fill up to the configured limit with the rest.
  const maxPortfolio = home?.portfolioSection?.maxItems ?? 3;
  const featuredPortfolio = [
    ...portfolio.filter((p) => p.featured),
    ...portfolio.filter((p) => !p.featured),
  ].slice(0, Math.max(1, maxPortfolio));

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
      {services.length > 0 && (
        <section
          className="py-16 sm:py-24 bg-bg-deep border-t border-slate/10 px-4 sm:px-6 lg:px-16 relative z-10"
          id="services"
        >
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            <SectionHeading
              eyebrow={loc(home?.servicesSection, 'eyebrow', language)}
              title={loc(home?.servicesSection, 'title', language, t.services.title)}
              subtitle={loc(home?.servicesSection, 'subtitle', language, t.services.subtitle)}
              ctaLabel={loc(home?.servicesSection, 'ctaLabel', language, 'View All Details')}
              ctaHref="/services"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {services.slice(0, 4).map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  language={language}
                  ctaLabel={t.services.requestQuote}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Showcase */}
      {featuredPortfolio.length > 0 && (
        <section
          className="py-16 sm:py-24 border-t border-slate/10 px-4 sm:px-6 lg:px-16 relative z-10"
          id="portfolio"
        >
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            <SectionHeading
              eyebrow={loc(home?.portfolioSection, 'eyebrow', language)}
              title={loc(home?.portfolioSection, 'title', language, t.portfolio.title)}
              subtitle={loc(home?.portfolioSection, 'subtitle', language, t.portfolio.subtitle)}
              ctaLabel={loc(home?.portfolioSection, 'ctaLabel', language, 'View Full Portfolio')}
              ctaHref="/portfolio"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredPortfolio.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  language={language}
                  resultsLabel={t.portfolio.results}
                  viewLabel={t.portfolio.viewProject}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal text-teal hover:bg-teal hover:text-white transition-all rounded-sm font-bold uppercase tracking-widest text-xs min-h-[44px]"
              >
                <FiBriefcase size={14} />
                <span>{loc(home?.portfolioSection, 'ctaLabel', language, 'View Full Portfolio')}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Packages Showcase */}
      {packages.length > 0 && (
        <section
          className="py-16 sm:py-24 bg-bg-deep border-t border-slate/10 px-4 sm:px-6 lg:px-16 relative z-10"
          id="packages"
        >
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            <SectionHeading
              eyebrow={loc(home?.packagesSection, 'eyebrow', language)}
              title={loc(home?.packagesSection, 'title', language, t.packages.title)}
              subtitle={loc(home?.packagesSection, 'subtitle', language, t.packages.subtitle)}
              align="center"
            />

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                packages.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
              } gap-6 sm:gap-8 items-stretch`}
            >
              {packages.slice(0, 3).map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  language={language}
                  includesLabel={t.packages.includes}
                  fallbackCtaLabel={t.packages.getStarted}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal text-teal hover:bg-teal hover:text-white transition-all rounded-sm font-bold uppercase tracking-widest text-xs min-h-[44px]"
              >
                <FiPackage size={14} />
                <span>{loc(home?.packagesSection, 'ctaLabel', language, 'Compare All Packages')}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Metrics Section */}
      {metrics.length > 0 && (
        <section className="py-8 sm:py-12 bg-ink px-4 sm:px-6 lg:px-16 font-mono border-t border-slate/10">
          <div
            className={`max-w-7xl mx-auto grid grid-cols-1 gap-6 sm:gap-4 text-center sm:text-left ${
              metrics.length === 1 ? 'sm:grid-cols-1' : metrics.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
            }`}
          >
            {metrics.map((metric, index) => (
              <div
                key={metric.id}
                className={`flex flex-col sm:flex-row items-center sm:items-baseline gap-2 justify-center sm:justify-start p-4 bg-white/5 sm:bg-transparent rounded-lg sm:rounded-none ${
                  index > 0 ? 'sm:border-l sm:border-slate/20 sm:pl-8' : ''
                }`}
              >
                <span className="text-teal font-bold text-3xl sm:text-2xl md:text-3xl">{metric.value}</span>
                <span className="text-slate text-xs uppercase tracking-wider">
                  {language === 'en' ? metric.labelEn : metric.labelNo || metric.labelEn}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
