'use client';

import Link from 'next/link';
import { FiCheckCircle, FiArrowRight, FiLayers } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { loc, locList } from '../../../lib/i18n';
import { getServiceIcon } from '../../../lib/icons';

export default function ServicesContent() {
  const { t, language, content, services } = useLanguage();
  const section = content?.home?.servicesSection;

  const title = loc(section, 'title', language, t.services.title);
  const subtitle = loc(section, 'subtitle', language, t.services.subtitle);

  return (
    <div className="pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      <div className="text-left max-w-3xl space-y-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">{title}</h1>
        <p className="text-base sm:text-lg text-slate leading-relaxed">{subtitle}</p>
      </div>

      {services.length === 0 ? (
        <div className="bento-card rounded-2xl py-16 px-6 text-center space-y-3">
          <FiLayers size={36} className="mx-auto text-teal/40" />
          <p className="text-sm text-slate">
            {language === 'no'
              ? 'Tjenestene oppdateres. Ta kontakt for detaljer.'
              : 'Services are being updated. Get in touch for details.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {services.map((svc, index) => {
            const Icon = getServiceIcon(svc.icon);
            const features = locList(svc, 'features', language);

            return (
              <div
                key={svc.id}
                className={`flex flex-col lg:flex-row gap-8 items-stretch bento-card p-6 sm:p-8 lg:p-12 rounded-2xl ${
                  index % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
                      <Icon size={30} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-bg-primary/80 px-2 py-0.5 rounded border border-slate/10 inline-block">
                      {svc.id.slice(0, 8).toUpperCase()}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-ink">
                      {loc(svc, 'title', language, svc.slug)}
                    </h2>
                    <p className="text-slate text-sm sm:text-base leading-relaxed font-body">
                      {loc(svc, 'description', language)}
                    </p>

                    {svc.price && (
                      <p className="font-mono text-sm font-bold text-gold">{svc.price}</p>
                    )}

                    {features.length > 0 && (
                      <ul className="space-y-2.5 pt-2">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-center space-x-3 text-ink text-xs sm:text-sm">
                            <FiCheckCircle className="text-gold flex-shrink-0" size={18} />
                            <span className="font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/contact"
                      className="delta-gold-btn inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-gold/20 hover:scale-[1.02] transition-all rounded-sm w-full sm:w-auto"
                    >
                      <span>{t.services.requestQuote}</span>
                      <FiArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="flex-1 w-full bg-bg-primary/40 min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center justify-center border border-slate/10 overflow-hidden relative rounded-xl">
                  {svc.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={svc.imageUrl}
                      alt={loc(svc, 'title', language, svc.slug)}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--color-teal)_0%,_transparent_70%)]" />
                      <Icon size={100} className="text-teal/20" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
