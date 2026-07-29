'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { CurrencySwitcher } from './CurrencySwitcher';
import { Logo } from './Logo';
import { CtaButton } from './CtaButton';
import { FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export function Header() {
  const { t, language, navItems, siteSettings } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavItems = navItems.length > 0 ? navItems : [
    { id: 'n0', labelEn: 'Home', labelNo: 'Hjem', href: '/', order: 0 },
    { id: 'n1', labelEn: 'Services', labelNo: 'Tjenester', href: '/services', order: 1 },
    { id: 'n2', labelEn: 'Portfolio', labelNo: 'Portfolio', href: '/portfolio', order: 2 },
    { id: 'n3', labelEn: 'Packages', labelNo: 'Pakker', href: '/packages', order: 3 },
    { id: 'n4', labelEn: 'About', labelNo: 'Om oss', href: '/about', order: 4 },
    { id: 'n5', labelEn: 'Contact', labelNo: 'Kontakt', href: '/contact', order: 5 },
  ];

  const hasHomeItem = baseNavItems.some(item => item.href === '/');
  const navItemsWithHome = hasHomeItem
    ? baseNavItems
    : [{ id: 'n0', labelEn: 'Home', labelNo: 'Hjem', href: '/', order: 0 }, ...baseNavItems];

  const displayNavItems = [...navItemsWithHome].sort((a, b) => a.order - b.order);

  const ctaLabel = language === 'en' ? siteSettings?.navCtaLabelEn : siteSettings?.navCtaLabelNo;
  const ctaLink = siteSettings?.navCtaLink || '/contact';

  return (
    <header className="sticky top-0 z-50 h-16 bg-bg-primary/90 backdrop-blur-md border-b border-slate/10 px-4 sm:px-6 lg:px-10 flex items-center justify-between">
      <Link href="/" className="flex items-center focus:outline-none">
        <Logo />
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold uppercase tracking-widest font-mono">
        {displayNavItems.map(item => (
          <Link key={item.id} href={item.href} className="hover:text-gold transition-colors">
            {language === 'en' ? item.labelEn : item.labelNo}
          </Link>
        ))}
        <div className="flex items-center gap-3 border-l border-slate/20 pl-6">
          {siteSettings?.showLanguageSwitcher && <LanguageToggle />}
          {siteSettings?.showCurrencySwitcher && <CurrencySwitcher />}
          {siteSettings?.showThemeSwitcher && <ThemeToggle />}
        </div>
        <CtaButton
          ctaKey="header_nav_cta"
          fallbackHref={ctaLink}
          className="delta-gold-btn px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all inline-block"
        >
          {ctaLabel || (language === 'en' ? 'Get Started' : 'Kom i gang')}
        </CtaButton>
      </nav>

      {/* Mobile Controls */}
      <div className="md:hidden flex items-center gap-2">
        {siteSettings?.showThemeSwitcher && <ThemeToggle />}
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
            {displayNavItems.map(item => (
              <Link 
                key={item.id}
                href={item.href} 
                className="text-lg font-bold uppercase tracking-wide text-ink hover:text-teal py-2 border-b border-slate/10" 
                onClick={() => setMobileMenuOpen(false)}
              >
                {language === 'en' ? item.labelEn : item.labelNo}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-4 pt-2 border-t border-slate/10">
            {siteSettings?.showLanguageSwitcher && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">Språk / Language:</span>
                <LanguageToggle />
              </div>
            )}
            {siteSettings?.showCurrencySwitcher && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">Valuta / Currency:</span>
                <CurrencySwitcher />
              </div>
            )}
          </div>

          <CtaButton
            ctaKey="header_nav_cta"
            fallbackHref={ctaLink}
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-4 bg-gold text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-gold/20 block"
          >
            {ctaLabel || (language === 'en' ? 'Get Started' : 'Kom i gang')}
          </CtaButton>
        </div>
      )}
    </header>
  );
}

