'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FiArrowRight, FiExternalLink, FiBriefcase } from 'react-icons/fi';
import Link from 'next/link';

export default function Portfolio() {
  const { portfolio, language, t } = useLanguage();

  return (
    <div className="pt-8 sm:pt-12 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto space-y-12 sm:space-y-16">
      <div className="text-left max-w-3xl space-y-4">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">
          {t.portfolio.title}
        </h1>
        <p className="text-base sm:text-lg text-slate leading-relaxed">
          {language === 'no' 
            ? 'Utforsk våre nylige prosjekter og se hvordan vi hjelper bedrifter med å vokse digitalt.' 
            : 'Explore our recent projects and see how we help businesses grow digitally.'}
        </p>
      </div>

      {portfolio.length === 0 ? (
        <div className="py-20 text-center bg-bg-deep rounded-2xl border border-slate/10">
          <FiBriefcase size={48} className="mx-auto text-slate/20 mb-4" />
          <p className="text-slate italic">
            {language === 'no' ? 'Ingen prosjekter lagt til ennå.' : 'No projects added yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {portfolio.map((item) => (
            <div key={item.id} className="group space-y-6">
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-bg-deep border border-slate/10 relative">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={language === 'en' ? item.titleEn : item.titleNo} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal/20">
                    <FiBriefcase size={60} />
                  </div>
                )}
                
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 p-3 bg-bg-primary/90 backdrop-blur-sm rounded-full text-teal shadow-xl border border-slate/10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-teal hover:text-white"
                  >
                    <FiExternalLink size={18} />
                  </a>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal px-2 py-0.5 bg-teal/5 rounded border border-teal/10">
                    {language === 'en' ? item.categoryEn : item.categoryNo}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-ink uppercase tracking-wide group-hover:text-teal transition-colors">
                  {language === 'en' ? item.titleEn : item.titleNo}
                </h2>
                <p className="text-slate text-sm leading-relaxed line-clamp-3">
                  {language === 'en' ? item.descriptionEn : item.descriptionNo}
                </p>
                <div className="pt-2">
                  <Link 
                    href="/contact" 
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal hover:text-gold transition-colors"
                  >
                    <span>{language === 'no' ? 'Diskuter lignende prosjekt' : 'Discuss Similar Project'}</span>
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
