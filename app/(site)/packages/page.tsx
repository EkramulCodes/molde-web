'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FiCheckCircle, FiArrowRight, FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';

export default function Packages() {
  const { packages, language, t, formatPrice, packageSettings } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const yearlyDiscount = packageSettings?.yearlyDiscountPercentage || 17;

  return (
    <div className="pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">
          {language === 'en' ? (packageSettings?.titleEn || t.packages.title) : (packageSettings?.titleNo || t.packages.title)}
        </h1>
        
        {packageSettings?.showYearlyToggle && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-teal' : 'text-slate'}`}>
              {t.packages.monthly}
            </span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-slate/20 transition-colors focus:outline-none"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-teal transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-teal' : 'text-slate'}`}>
                {t.packages.yearly}
              </span>
              <span className="bg-gold/20 text-gold text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                {t.packages.save} {yearlyDiscount}%
              </span>
            </div>
          </div>
        )}

        <p className="text-base sm:text-lg text-slate leading-relaxed">
          {language === 'no' 
            ? 'Velg den perfekte pakken for dine forretningsmål. Transparent prising uten skjulte kostnader.' 
            : 'Choose the perfect package for your business goals. Transparent pricing with no hidden fees.'}
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="py-20 text-center bg-bg-deep rounded-2xl border border-slate/10">
          <FiPackage size={48} className="mx-auto text-slate/20 mb-4" />
          <p className="text-slate italic">
            {language === 'no' ? 'Ingen pakker tilgjengelig for øyeblikket.' : 'No packages available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.sort((a, b) => a.order - b.order).map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bento-card p-8 sm:p-10 rounded-2xl flex flex-col relative ${pkg.isPopular ? 'border-teal ring-1 ring-teal shadow-xl' : ''}`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                  {language === 'no' ? 'Mest Populær' : 'Most Popular'}
                </div>
              )}
              
                <div className="mb-8">
                  <h3 className="font-display font-bold text-2xl text-ink uppercase tracking-wide mb-2">
                    {language === 'en' ? pkg.nameEn : pkg.nameNo}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-teal">
                      {formatPrice(billingCycle === 'monthly' ? pkg.priceMonthly : pkg.priceYearly)}
                    </span>
                    <span className="text-slate text-sm font-medium">
                      /{language === 'en' ? pkg.durationEn : pkg.durationNo}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-[10px] font-bold text-gold mt-1 uppercase tracking-widest">
                      {language === 'en' ? pkg.yearlyDiscountEn : pkg.yearlyDiscountNo}
                    </p>
                  )}
                </div>

              <ul className="space-y-4 mb-10 flex-1">
                {(language === 'en' ? pkg.featuresEn : pkg.featuresNo).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink font-medium">
                    <FiCheckCircle className="text-teal flex-shrink-0 mt-0.5" size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={`/checkout?type=package&id=${pkg.id}&cycle=${billingCycle}`} 
                className={`w-full py-4 font-bold uppercase tracking-widest text-xs rounded-sm transition-all flex items-center justify-center gap-2 ${
                  pkg.isPopular 
                    ? 'bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90' 
                    : 'bg-bg-deep text-ink border border-slate/10 hover:border-teal hover:text-teal'
                }`}
              >
                <span>{language === 'no' ? 'Velg Pakke' : 'Get Started'}</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="bg-ink p-12 rounded-3xl text-center space-y-6">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">
          {language === 'no' ? 'Trenger du noe skreddersydd?' : 'Need something custom?'}
        </h2>
        <p className="text-slate text-sm sm:text-base max-w-xl mx-auto">
          {language === 'no'
            ? 'Vi kan sette sammen en unik pakke som passer perfekt til dine spesifikke behov og budsjett.'
            : 'We can put together a unique package that perfectly fits your specific needs and budget.'}
        </p>
        <Link 
          href="/contact" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all rounded-sm"
        >
          <span>{language === 'no' ? 'Kontakt oss for tilbud' : 'Contact for custom quote'}</span>
          <FiArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
