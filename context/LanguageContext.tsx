'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { en } from '../lib/dictionary/en';
import { no } from '../lib/dictionary/no';
import { 
  Language, 
  PromoData, 
  DesignData, 
  ServiceItem, 
  PortfolioItem, 
  PackageItem, 
  NavItem, 
  ContactInfo, 
  SiteSettings, 
  PortfolioSettings, 
  PackageSettings, 
  FooterSettings 
} from '../lib/types';
import { CtaButtonConfig } from '../lib/types';

type Dictionary = typeof en;

interface LanguageContextProps {
  language: Language;
  setLanguage: (l: Language) => void;
  toggleLanguage: () => void;
  t: Dictionary;
  promo: PromoData | null;
  design: DesignData | null;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  portfolioSettings: PortfolioSettings;
  packages: PackageItem[];
  packageSettings: PackageSettings;
  navItems: NavItem[];
  contactInfo: ContactInfo;
  siteSettings: SiteSettings;
  footerSettings: FooterSettings;
  ctaButtons: CtaButtonConfig[];
  currency: 'NOK' | 'USD';
  setCurrency: (c: 'NOK' | 'USD') => void;
  formatPrice: (price: number | string) => string;
  refreshDynamicData: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function notifyCmsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cms-updated'));
    try {
      localStorage.setItem('cms_last_updated', Date.now().toString());
    } catch (e) {
      // ignore
    }
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('no');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage === 'en' || savedLanguage === 'no') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(savedLanguage);
    }
  }, []);

  const [dynamicContent, setDynamicContent] = useState<any>(null);
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [design, setDesign] = useState<DesignData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portfolioSettings, setPortfolioSettings] = useState<PortfolioSettings | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [packageSettings, setPackageSettings] = useState<PackageSettings | null>(null);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [ctaButtons, setCtaButtons] = useState<CtaButtonConfig[]>([]);
  const [currency, setCurrency] = useState<'NOK' | 'USD'>('NOK');

  const isFetching = React.useRef(false);

  const loadDynamicData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const t = Date.now();
      const fetchWithTimeout = async (url: string) => {
        try {
          const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
          if (res.ok) return await res.json();
        } catch (err) {
          console.warn(`Fetch failed for ${url}:`, err);
        }
        return null;
      };

      const [contentData, promoData, designData, servicesData, portfolioData, packagesData, ctaData] = await Promise.all([
        fetchWithTimeout(`/api/content?t=${t}`),
        fetchWithTimeout(`/api/promo?t=${t}`),
        fetchWithTimeout(`/api/design?t=${t}`),
        fetchWithTimeout(`/api/services?t=${t}`),
        fetchWithTimeout(`/api/portfolio?t=${t}`),
        fetchWithTimeout(`/api/packages?t=${t}`),
        fetchWithTimeout(`/api/cta-settings?t=${t}`),
      ]);

      if (contentData) {
        setDynamicContent(contentData);
        if (contentData.navItems) setNavItems(contentData.navItems);
        if (contentData.contactInfo) setContactInfo(contentData.contactInfo);
        if (contentData.siteSettings) setSiteSettings(contentData.siteSettings);
        if (contentData.footerSettings) setFooterSettings(contentData.footerSettings);
      }
      
      if (promoData) setPromo(promoData);
      if (designData) {
        setDesign(designData);
        if (designData.primaryColor) document.documentElement.style.setProperty('--teal', designData.primaryColor);
        if (designData.accentColor) document.documentElement.style.setProperty('--gold', designData.accentColor);
      }
      if (Array.isArray(servicesData)) {
        setServices(servicesData.filter((s: ServiceItem) => s.status === 'active'));
      }
      if (Array.isArray(portfolioData)) {
        setPortfolio(portfolioData);
      } else if (portfolioData && Array.isArray(portfolioData.portfolio)) {
        setPortfolio(portfolioData.portfolio);
      }
      if (portfolioData?.settings) setPortfolioSettings(portfolioData.settings);
      
      if (Array.isArray(packagesData)) {
        setPackages(packagesData);
      } else if (packagesData && Array.isArray(packagesData.packages)) {
        setPackages(packagesData.packages);
      }
      if (packagesData?.settings) setPackageSettings(packagesData.settings);

      if (Array.isArray(ctaData)) setCtaButtons(ctaData);
    } catch (e) {
      console.error('Critical error in dynamic site data loader', e);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadDynamicData();
    };
    init();

    // Listen for custom cms-updated event
    const handleCmsEvent = () => {
      loadDynamicData();
    };

    // Listen for cross-tab storage changes
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'cms_last_updated') {
        loadDynamicData();
      }
    };

    window.addEventListener('cms-updated', handleCmsEvent);
    window.addEventListener('storage', handleStorageEvent);

    // Polling as fallback, but less frequent (10s)
    const interval = setInterval(() => {
      loadDynamicData();
    }, 10000);

    return () => {
      window.removeEventListener('cms-updated', handleCmsEvent);
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(interval);
    };
  }, [loadDynamicData]);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'no' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const baseDictionary = language === 'en' ? en : no;

  // Merge dynamic content over dictionary defaults if available
  const mergedDictionary: Dictionary = JSON.parse(JSON.stringify(baseDictionary));

  if (dynamicContent) {
    if (dynamicContent.hero) {
      mergedDictionary.hero.headline =
        language === 'en' ? (dynamicContent.hero.headlineEn || baseDictionary.hero.headline) : (dynamicContent.hero.headlineNo || baseDictionary.hero.headline);
      mergedDictionary.hero.subheadline =
        language === 'en' ? (dynamicContent.hero.subheadlineEn || baseDictionary.hero.subheadline) : (dynamicContent.hero.subheadlineNo || baseDictionary.hero.subheadline);
      mergedDictionary.hero.ctaPrimary =
        language === 'en' ? (dynamicContent.hero.ctaPrimaryEn || baseDictionary.hero.ctaPrimary) : (dynamicContent.hero.ctaPrimaryNo || baseDictionary.hero.ctaPrimary);
      mergedDictionary.hero.ctaSecondary =
        language === 'en' ? (dynamicContent.hero.ctaSecondaryEn || baseDictionary.hero.ctaSecondary) : (dynamicContent.hero.ctaSecondaryNo || baseDictionary.hero.ctaSecondary);
    }

    if (dynamicContent.about) {
      mergedDictionary.about.title =
        language === 'en' ? (dynamicContent.about.titleEn || baseDictionary.about.title) : (dynamicContent.about.titleNo || baseDictionary.about.title);
      mergedDictionary.about.subheadline =
        language === 'en' ? (dynamicContent.about.descEn || baseDictionary.about.subheadline) : (dynamicContent.about.descNo || baseDictionary.about.subheadline);
      mergedDictionary.about.approachTitle =
        language === 'en' ? (dynamicContent.about.approachTitleEn || baseDictionary.about.approachTitle) : (dynamicContent.about.approachTitleNo || baseDictionary.about.approachTitle);
      mergedDictionary.about.approachP1 =
        language === 'en' ? (dynamicContent.about.approachP1En || baseDictionary.about.approachP1) : (dynamicContent.about.approachP1No || baseDictionary.about.approachP1);
      mergedDictionary.about.approachP2 =
        language === 'en' ? (dynamicContent.about.approachP2En || baseDictionary.about.approachP2) : (dynamicContent.about.approachP2No || baseDictionary.about.approachP2);
    }

    if (dynamicContent.contact) {
      mergedDictionary.contact.title =
        language === 'en' ? (dynamicContent.contact.titleEn || baseDictionary.contact.title) : (dynamicContent.contact.titleNo || baseDictionary.contact.title);
      mergedDictionary.contact.subtitle =
        language === 'en' ? (dynamicContent.contact.subtitleEn || baseDictionary.contact.subtitle) : (dynamicContent.contact.subtitleNo || baseDictionary.contact.subtitle);
    }

    if (dynamicContent.footer) {
      mergedDictionary.footer.rights =
        language === 'en' ? (dynamicContent.footer.rightsEn || baseDictionary.footer.rights) : (dynamicContent.footer.rightsNo || baseDictionary.footer.rights);
    }

    if (dynamicContent.portfolio) {
      mergedDictionary.portfolio.title =
        language === 'en' ? (dynamicContent.portfolio.titleEn || baseDictionary.portfolio.title) : (dynamicContent.portfolio.titleNo || baseDictionary.portfolio.title);
    }

    if (dynamicContent.packages) {
      mergedDictionary.packages.title =
        language === 'en' ? (dynamicContent.packages.titleEn || baseDictionary.packages.title) : (dynamicContent.packages.titleNo || baseDictionary.packages.title);
    }
  }

  const formatPrice = useCallback((price: number | string) => {
    const val = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(val)) return price.toString();

    if (currency === 'USD' && siteSettings?.exchangeRate) {
      const usdVal = val / siteSettings.exchangeRate;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdVal);
    }

    return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(val);
  }, [currency, siteSettings]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: (l: Language) => {
          setLanguage(l);
          localStorage.setItem('language', l);
        },
        toggleLanguage,
        t: mergedDictionary,
        promo,
        design,
        services,
        portfolio,
        portfolioSettings: portfolioSettings || { titleEn: 'Our Work', titleNo: 'Vårt Arbeid', recommendedDimensions: '1200 x 800 px' },
        packages,
        packageSettings: packageSettings || { titleEn: 'Packages & Pricing', titleNo: 'Pakker & Priser', showYearlyToggle: true, yearlyDiscountPercentage: 17 },
        navItems,
        contactInfo: contactInfo || { phone: '', email: '', addressEn: '', addressNo: '' },
        siteSettings: siteSettings || { 
        logoUrl: '', 
        showLanguageSwitcher: true, 
        showCurrencySwitcher: true, 
        showThemeSwitcher: true, 
        defaultCurrency: 'NOK', 
        exchangeRate: 10.5, 
        navCtaLabelEn: 'Get Started', 
        navCtaLabelNo: 'Kom i gang', 
        navCtaLink: '/contact', 
        heroCtaLabelEn: 'Start a Project', 
        heroCtaLabelNo: 'Start et Prosjekt', 
        heroCtaLink: '/contact',
        bookMeetingCtaLabelEn: 'Book a Meeting',
        bookMeetingCtaLabelNo: 'Book et Møte',
        bookMeetingCtaLink: '/contact'
      },
        footerSettings: footerSettings || { aboutEn: '', aboutNo: '', copyrightEn: '', copyrightNo: '' },
        ctaButtons,
        currency,
        setCurrency,
        formatPrice,
        refreshDynamicData: loadDynamicData,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
