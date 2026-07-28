'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export function PromoBar() {
  const { language, promo } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('promoDismissed')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('promoDismissed', 'true');
  };

  if (dismissed || !promo || !promo.active) return null;

  const message = language === 'en' ? promo.messageEn : promo.messageNo;

  return (
    <div className="relative min-h-[36px] py-1 bg-ink text-bg-primary flex items-center justify-center px-12 text-xs font-medium tracking-wide border-b border-gold/30">
      <div className="flex items-center justify-center gap-2 min-w-0">
        <span className="bg-gold text-white px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-bold flex-shrink-0">PROMO</span>
        <Link href={promo.link || '/contact'} className="hover:text-gold hover:underline transition-colors truncate text-[11px] sm:text-xs text-center">
          {message}
        </Link>
      </div>
      <button 
        onClick={handleDismiss} 
        className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}

