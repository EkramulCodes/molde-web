'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { FiArrowLeft, FiCheck, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { CtaButton } from '@/components/CtaButton';

export default function ServiceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { services, language, formatPrice } = useLanguage();
  
  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-ink uppercase">Service Not Found</h1>
        <button onClick={() => router.back()} className="text-teal font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const title = language === 'en' ? service.titleEn : service.titleNo;
  const description = language === 'en' ? service.descriptionEn : service.descriptionNo;
  const features = language === 'en' ? service.featuresEn : service.featuresNo;

  return (
    <div className="pt-8 sm:pt-16 pb-24 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
      <button 
        onClick={() => router.back()} 
        className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate hover:text-teal transition-colors"
      >
        <FiArrowLeft size={16} />
        {language === 'en' ? 'Back' : 'Tilbake'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-teal">Service Details</span>
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="text-slate text-base sm:text-lg leading-relaxed max-w-xl">
              {description}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="font-display font-bold text-lg text-ink uppercase tracking-wide">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-ink group">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center text-teal group-hover:bg-teal group-hover:text-white transition-colors">
                    <FiCheck size={12} strokeWidth={3} />
                  </div>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 border-t border-slate/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate">Investment</span>
              <div className="text-3xl font-bold text-teal">{formatPrice(service.price || '0')}</div>
            </div>
            
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <Link 
                href={
                  service.purchaseLink && service.purchaseLink !== '/checkout'
                    ? service.purchaseLink 
                    : `/checkout?type=service&id=${service.id}`
                }
                className="flex-1 bg-gold text-white px-8 py-4 font-bold uppercase tracking-widest text-xs sm:text-sm text-center shadow-xl shadow-gold/20 hover:scale-[1.02] transition-all rounded-sm flex items-center justify-center gap-2"
              >
                {language === 'en' ? (service.purchaseLabelEn || 'Purchase Service') : (service.purchaseLabelNo || 'Kjøp tjeneste')}
                <FiArrowRight size={16} />
              </Link>
              <CtaButton
                ctaKey="service_details_book_meeting"
                fallbackHref="/contact"
                serviceContext={{ id: service.id, label: `${title} (${language === 'no' ? 'Tjeneste' : 'Service'})` }}
                className="flex-1 border-2 border-teal text-teal px-8 py-4 font-bold uppercase tracking-widest text-xs sm:text-sm text-center hover:bg-teal hover:text-white transition-all rounded-sm flex items-center justify-center"
              >
                {language === 'en' ? 'Book a Meeting' : 'Book et møte'}
              </CtaButton>
            </div>
          </div>
        </div>

        <div className="relative aspect-square sm:aspect-video lg:aspect-auto rounded-3xl overflow-hidden shadow-2xl border border-slate/10 bg-bg-deep">
          {service.imageUrl ? (
            <Image 
              src={service.imageUrl} 
              alt={title} 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-teal/5">
               <FiPackage size={120} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function FiPackage({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      viewBox="0 0 24 24" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      height={size} 
      width={size} 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );
}
