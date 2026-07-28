'use client';

import { useLanguage } from '../../../context/LanguageContext';
import { FiMonitor, FiTrendingUp, FiTarget, FiSearch, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function Services() {
  const { t, language, services: dynamicServices } = useLanguage();

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'FiTrendingUp':
        return FiTrendingUp;
      case 'FiTarget':
        return FiTarget;
      case 'FiSearch':
        return FiSearch;
      default:
        return FiMonitor;
    }
  };

  const defaultServices = [
    { 
      id: 'web', 
      icon: FiMonitor, 
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      title: t.services.webDev.title, 
      description: t.services.webDev.description,
      price: 'From $2,500',
      features: language === 'no' 
        ? ['Skreddersydd UI/UX Design', 'Next.js / React Utvikling', 'CMS Integrasjon', 'Ytelsesoptimalisering']
        : ['Custom UI/UX Design', 'Next.js / React Development', 'CMS Integration', 'Performance Optimization']
    },
    { 
      id: 'marketing', 
      icon: FiTrendingUp, 
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      title: t.services.marketing.title, 
      description: t.services.marketing.description,
      price: 'From $1,200/mo',
      features: language === 'no'
        ? ['SEO-strategi', 'Innholdsmarkedsføring', 'E-postkampanjer', 'Analyse & Rapportering']
        : ['SEO Strategy', 'Content Marketing', 'Email Campaigns', 'Analytics & Reporting']
    },
    { 
      id: 'fb', 
      icon: FiTarget, 
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
      title: t.services.fbAds.title, 
      description: t.services.fbAds.description,
      price: 'From $1,000/mo',
      features: language === 'no'
        ? ['Målgruppesegmentering', 'Kreativ A/B Testing', 'Retargeting-kampanjer', 'ROAS-optimalisering']
        : ['Audience Targeting', 'Creative A/B Testing', 'Retargeting Campaigns', 'ROAS Optimization']
    },
    { 
      id: 'google', 
      icon: FiSearch, 
      imageUrl: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
      title: t.services.googleAds.title, 
      description: t.services.googleAds.description,
      price: 'From $1,500/mo',
      features: language === 'no'
        ? ['Søkenettverk-annonser', 'Displaynettverk', 'Søkeord-optimalisering', 'Konverteringssporing']
        : ['Search Network Ads', 'Display Network', 'Keyword Optimization', 'Conversion Tracking']
    },
  ];

  const allServices = dynamicServices.length > 0
    ? dynamicServices.map((s) => ({
        id: s.id,
        icon: getIcon(s.icon),
        imageUrl: s.imageUrl,
        title: language === 'en' ? s.titleEn : s.titleNo,
        description: language === 'en' ? s.descriptionEn : s.descriptionNo,
        price: s.price,
        features: (language === 'en' ? s.featuresEn : s.featuresNo) || [],
      }))
    : defaultServices;

  return (
    <div className="pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      <div className="text-left max-w-3xl space-y-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">{t.services.title}</h1>
        <p className="text-base sm:text-lg text-slate leading-relaxed">
          {t.services.subtitle}
        </p>
      </div>

      <div className="space-y-8 sm:space-y-12">
        {allServices.map((svc, index) => {
          const Icon = svc.icon;
          return (
            <div 
              key={svc.id} 
              className={`flex flex-col lg:flex-row gap-8 items-stretch bento-card p-6 sm:p-8 lg:p-12 rounded-2xl ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
                      <Icon size={30} />
                    </div>
                    {svc.price && (
                      <span className="font-mono text-sm font-bold text-gold bg-gold/10 px-3 py-1 rounded border border-gold/20">
                        {svc.price}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-bg-primary/80 px-2 py-0.5 rounded border border-slate/10 inline-block">
                    {svc.id.toUpperCase()}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-ink">{svc.title}</h2>
                  <p className="text-slate text-sm sm:text-base leading-relaxed font-body">{svc.description}</p>
                  {svc.features && svc.features.length > 0 && (
                    <ul className="space-y-2.5 pt-2">
                      {svc.features.map((feature, i) => (
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
                  <img
                    src={svc.imageUrl}
                    alt={svc.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
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
    </div>
  );
}

