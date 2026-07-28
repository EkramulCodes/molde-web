'use client';

import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-slate/10 rounded-full p-1 border border-slate/20">
      <button 
        onClick={() => language !== 'no' && toggleLanguage()}
        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
          language === 'no' 
            ? 'bg-bg-primary text-ink shadow-sm' 
            : 'text-slate hover:text-ink hover:bg-slate/5'
        }`}
      >
        NOR
      </button>
      <button 
        onClick={() => language !== 'en' && toggleLanguage()}
        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
          language === 'en' 
            ? 'bg-bg-primary text-ink shadow-sm' 
            : 'text-slate hover:text-ink hover:bg-slate/5'
        }`}
      >
        ENG
      </button>
    </div>
  );
}
