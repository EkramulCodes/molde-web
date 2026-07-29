'use client';

import { useEffect } from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';
import { useBookingModal } from '@/context/BookingModalContext';
import { useLanguage } from '@/context/LanguageContext';
import { BookingForm } from './BookingForm';

export function BookingModal() {
  const { isOpen, target, closeBookingModal } = useBookingModal();
  const { language } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBookingModal();
    };
    document.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, closeBookingModal]);

  if (!isOpen || !target) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBookingModal();
      }}
    >
      <div className="bg-bg-primary border border-slate/20 sm:rounded-2xl max-w-xl w-full min-h-screen sm:min-h-0 p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in my-0 sm:my-8">
        <div className="flex justify-between items-start border-b border-slate/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal">
              <FiCalendar size={18} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-ink uppercase tracking-wide">
                {language === 'no' ? 'Book et Møte' : 'Book a Meeting'}
              </h2>
              <p className="text-xs text-slate">{language === 'no' ? 'Velg tid som passer deg' : 'Pick a time that works for you'}</p>
            </div>
          </div>
          <button onClick={closeBookingModal} className="text-slate hover:text-ink p-1 rounded-lg flex-shrink-0" aria-label="Close">
            <FiX size={22} />
          </button>
        </div>

        <BookingForm target={target} onClose={closeBookingModal} />
      </div>
    </div>
  );
}
