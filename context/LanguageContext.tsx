'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { en } from '../lib/dictionary/en';
import { no } from '../lib/dictionary/no';

export type Language = 'en' | 'no';
type Dictionary = typeof en;

export interface PromoState {
  active: boolean;
  messageEn: string;
  messageNo: string;
  link: string;
}

export interface DesignState {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  bgDeepColor: string;
  bgPrimaryColor: string;
  textColor: string;
  fontFamily: string;
  enableContourBg: boolean;
}

export interface ServiceStateItem {
  id: string;
  slug: string;
  icon: string;
  imageUrl?: string;
  titleEn: string;
  titleNo: string;
  descriptionEn: string;
  descriptionNo: string;
  featuresEn: string[];
  featuresNo: string[];
  price?: string;
  status: 'active' | 'hidden';
  order: number;
}

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: Dictionary;
  promo: PromoState | null;
  design: DesignState | null;
  services: ServiceStateItem[];
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
  const [promo, setPromo] = useState<PromoState | null>(null);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [services, setServices] = useState<ServiceStateItem[]>([]);

  const loadDynamicData = useCallback(async () => {
    try {
      const t = Date.now();
      const [contentRes, promoRes, designRes, servicesRes] = await Promise.all([
        fetch(`/api/content?t=${t}`, { cache: 'no-store' }),
        fetch(`/api/promo?t=${t}`, { cache: 'no-store' }),
        fetch(`/api/design?t=${t}`, { cache: 'no-store' }),
        fetch(`/api/services?t=${t}`, { cache: 'no-store' }),
      ]);

      if (contentRes.ok) setDynamicContent(await contentRes.json());
      if (promoRes.ok) setPromo(await promoRes.json());
      if (designRes.ok) {
        const d = await designRes.json();
        setDesign(d);
        if (d) {
          if (d.primaryColor) document.documentElement.style.setProperty('--teal', d.primaryColor);
          if (d.accentColor) document.documentElement.style.setProperty('--gold', d.accentColor);
        }
      }
      if (servicesRes.ok) {
        const svcs = await servicesRes.json();
        if (Array.isArray(svcs)) {
          setServices(svcs.filter((s: ServiceStateItem) => s.status === 'active'));
        }
      }
    } catch (e) {
      console.error('Error loading dynamic site data', e);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      await loadDynamicData();
    };
    initData();

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

    // Poll every 3 seconds for instant real-time sync across sessions
    const interval = setInterval(() => {
      loadDynamicData();
    }, 3000);

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
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        t: mergedDictionary,
        promo,
        design,
        services,
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
