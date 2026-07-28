'use client';

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import Image from 'next/image';

export default function ServiceDetailsIndex() {
  const { services, language, formatPrice } = useLanguage();

  return (
    <div className="pt-8 sm:pt-16 pb-24 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-12">
      <div className="text-left space-y-4 max-w-3xl">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-teal">Standalone Catalog</span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">
          {language === 'en' ? 'Service Details' : 'Tjenestedetaljer'}
        </h1>
        <p className="text-slate text-base sm:text-lg leading-relaxed">
          {language === 'en' 
            ? 'Select a service below to view rich details, key features, pricing, and purchase options.' 
            : 'Velg en tjeneste nedenfor for å se detaljer, nøkkelfunksjoner, priser og kjøpsalternativer.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service) => {
          const title = language === 'en' ? service.titleEn : service.titleNo;
          const description = language === 'en' ? service.descriptionEn : service.descriptionNo;
          const features = language === 'en' ? service.featuresEn : service.featuresNo;

          return (
            <div key={service.id} className="bento-card p-8 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {service.imageUrl && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate/10 bg-bg-primary">
                    <Image 
                      src={service.imageUrl} 
                      alt={title} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-2xl text-ink uppercase tracking-wide">{title}</h2>
                  {service.price && (
                    <span className="text-sm font-bold text-teal bg-teal/10 px-3 py-1 rounded font-mono">
                      {formatPrice(service.price)}
                    </span>
                  )}
                </div>
                <p className="text-slate text-sm leading-relaxed">{description}</p>
                {features && features.length > 0 && (
                  <ul className="space-y-2 pt-2">
                    {features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-ink">
                        <FiCheck size={14} className="text-teal" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4 border-t border-slate/10 flex items-center justify-between">
                <Link 
                  href={`/service-details/${service.id}`}
                  className="delta-gold-btn px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm inline-flex items-center gap-2"
                >
                  <span>{language === 'en' ? 'View Details' : 'Se Detaljer'}</span>
                  <FiArrowRight size={14} />
                </Link>
                <Link 
                  href={service.purchaseLink || '/checkout'}
                  className="text-xs font-mono font-bold text-teal hover:text-gold uppercase tracking-wider"
                >
                  {language === 'en' ? (service.purchaseLabelEn || 'Purchase') : (service.purchaseLabelNo || 'Kjøp')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
