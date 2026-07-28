'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export function Header() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 bg-bg-primary/90 backdrop-blur-md border-b border-slate/10 px-4 sm:px-6 lg:px-10 flex items-center justify-between">
      <Link href="/" className="flex items-center focus:outline-none">
        <Logo />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold uppercase tracking-widest font-mono">
        <Link href="/services" className="hover:text-gold transition-colors">{t.header.services}</Link>
        <Link href="/about" className="hover:text-gold transition-colors">{t.header.about}</Link>
        <Link href="/contact" className="hover:text-gold transition-colors">{t.header.contact}</Link>
        <div className="flex items-center gap-3 border-l border-slate/20 pl-6">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <Link 
          href="/contact" 
          className="delta-gold-btn px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all inline-block"
        >
          {t.header.startProject || t.header.contact}
        </Link>
      </nav>

      {/* Mobile Controls */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <button 
          className="p-2.5 min-w-[44px] min-h-[44px] text-ink flex items-center justify-center rounded-lg hover:bg-slate/10 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Full Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-bg-primary/98 border-b border-slate/20 shadow-2xl p-6 md:hidden flex flex-col gap-6 z-50 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/services" 
              className="text-lg font-bold uppercase tracking-wide text-ink hover:text-teal py-2 border-b border-slate/10" 
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.services}
            </Link>
            <Link 
              href="/about" 
              className="text-lg font-bold uppercase tracking-wide text-ink hover:text-teal py-2 border-b border-slate/10" 
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.about}
            </Link>
            <Link 
              href="/contact" 
              className="text-lg font-bold uppercase tracking-wide text-ink hover:text-teal py-2 border-b border-slate/10" 
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.header.contact}
            </Link>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate/10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate">Språk / Language:</span>
            <LanguageToggle />
          </div>

          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-gold/20"
          >
            {t.header.startProject || t.header.contact}
          </Link>
        </div>
      )}
    </header>
  );
}

