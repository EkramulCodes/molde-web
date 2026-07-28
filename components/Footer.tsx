'use client';

import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

export function Footer() {
  const { t, language, footerSettings, contactInfo } = useLanguage();
  
  const about = language === 'en' ? footerSettings?.aboutEn : footerSettings?.aboutNo;
  const copyright = language === 'en' ? footerSettings?.copyrightEn : footerSettings?.copyrightNo;
  const address = language === 'en' ? contactInfo?.addressEn : contactInfo?.addressNo;

  return (
    <footer className="border-t border-slate/10 bg-bg-deep/40 py-12 md:py-16 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-slate leading-relaxed max-w-sm">
              {about || t.footer.tagline}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-ink">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate">
              <li><Link href="/services" className="hover:text-gold transition-colors">{t.header.services}</Link></li>
              <li><Link href="/about" className="hover:text-gold transition-colors">{t.header.about}</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">{t.header.contact}</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-ink">{t.contact.title}</h4>
            {address && (
              <p className="text-xs text-slate font-mono">
                {address}
              </p>
            )}
            {contactInfo?.email && (
              <p className="text-xs text-teal font-mono">
                {contactInfo.email}
              </p>
            )}
            {contactInfo?.phone && (
              <p className="text-xs text-teal font-mono">
                {contactInfo.phone}
              </p>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-slate">
          <p>© {new Date().getFullYear()} {copyright || `MoldeWeb. ${t.footer.rights}`}</p>
          <div className="flex items-center space-x-6">
            <Link href="/admin/login" className="hover:text-teal transition-colors">
              {t.header.admin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

