'use client';

import { useLanguage } from '../context/LanguageContext';

export function CurrencySwitcher() {
  const { currency, setCurrency, siteSettings } = useLanguage();

  if (!siteSettings?.showCurrencySwitcher) return null;

  return (
    <div className="flex items-center gap-1 text-[10px] font-bold tracking-tighter">
      <button
        onClick={() => setCurrency('NOK')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          currency === 'NOK' ? 'bg-teal text-white' : 'text-slate hover:bg-slate/10'
        }`}
      >
        NOK
      </button>
      <span className="text-slate/30">|</span>
      <button
        onClick={() => setCurrency('USD')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          currency === 'USD' ? 'bg-teal text-white' : 'text-slate hover:bg-slate/10'
        }`}
      >
        USD
      </button>
    </div>
  );
}
