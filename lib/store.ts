import fs from 'fs';
import path from 'path';

export interface ContentData {
  hero: {
    headlineEn: string;
    headlineNo: string;
    subheadlineEn: string;
    subheadlineNo: string;
    ctaPrimaryEn: string;
    ctaPrimaryNo: string;
    ctaSecondaryEn: string;
    ctaSecondaryNo: string;
  };
  about: {
    titleEn: string;
    titleNo: string;
    descEn: string;
    descNo: string;
    approachTitleEn: string;
    approachTitleNo: string;
    approachP1En: string;
    approachP1No: string;
    approachP2En: string;
    approachP2No: string;
  };
  contact: {
    titleEn: string;
    titleNo: string;
    subtitleEn: string;
    subtitleNo: string;
  };
  footer: {
    rightsEn: string;
    rightsNo: string;
  };
}

export interface DesignData {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string; // e.g. #14B8A6
  accentColor: string;  // e.g. #D97706
  bgDeepColor: string;
  bgPrimaryColor: string;
  textColor: string;
  fontFamily: string;
  enableContourBg: boolean;
}

export interface ServiceItem {
  id: string;
  slug: string;
  icon: string; // icon name or SVG
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
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface SeoItem {
  pagePath: string; // e.g. "/", "/about", "/services", "/contact"
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  keywords: string;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'archived';
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface PromoData {
  active: boolean;
  messageEn: string;
  messageNo: string;
  link: string;
}

export interface DatabaseSchema {
  content: ContentData;
  design: DesignData;
  services: ServiceItem[];
  seo: SeoItem[];
  leads: LeadItem[];
  media: MediaItem[];
  promo: PromoData;
}

const DEFAULT_DB: DatabaseSchema = {
  content: {
    hero: {
      headlineEn: 'MoldeWeb',
      headlineNo: 'MoldeWeb',
      subheadlineEn: 'Crafting exceptional digital experiences through web development and data-driven ad growth.',
      subheadlineNo: 'Vi skaper eksepsjonelle digitale opplevelser gjennom webutvikling og datadrevet annonsevekst.',
      ctaPrimaryEn: 'Start a Project',
      ctaPrimaryNo: 'Start et Prosjekt',
      ctaSecondaryEn: 'View Services',
      ctaSecondaryNo: 'Se Tjenester',
    },
    about: {
      titleEn: 'Building Digital Excellence from Norway',
      titleNo: 'Bygger Digital Ekspertise fra Norge',
      descEn: 'MoldeWeb was founded on a simple principle: digital experiences should be beautiful, fast, and measurable.',
      descNo: 'MoldeWeb ble grunnlagt på et enkelt prinsipp: digitale opplevelser skal være vakre, raske og målbare.',
      approachTitleEn: 'Our Approach',
      approachTitleNo: 'Vår Tilnærming',
      approachP1En: 'We bridge the gap between stunning design and data-driven marketing. A beautiful website is only half the equation.',
      approachP1No: 'Vi bygger bro mellom fantastisk design og datadrevet markedsføring. En vakker nettside er bare halvparten av likningen.',
      approachP2En: 'Based in Norway, our team combines minimalist Scandinavian design principles with aggressive global growth strategies.',
      approachP2No: 'Med base i Norge kombinerer teamet vårt minimalistiske skandinaviske designprinsipper med aggressive globale vekststrategier.',
    },
    contact: {
      titleEn: 'Get in Touch',
      titleNo: 'Ta Kontakt',
      subtitleEn: "Ready to scale your business? Let's discuss your next project.",
      subtitleNo: 'Klar til å skalere bedriften din? La oss diskutere ditt neste prosjekt.',
    },
    footer: {
      rightsEn: 'All rights reserved.',
      rightsNo: 'Alle rettigheter forbeholdt.',
    },
  },
  design: {
    siteName: 'MoldeWeb',
    tagline: 'Full-Service Digitalbyrå',
    logoUrl: '',
    primaryColor: '#14B8A6',
    accentColor: '#D97706',
    bgDeepColor: '#090D16',
    bgPrimaryColor: '#0F172A',
    textColor: '#F8FAFC',
    fontFamily: 'Inter',
    enableContourBg: true,
  },
  services: [
    {
      id: 'web',
      slug: 'website-development',
      icon: 'FiMonitor',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      titleEn: 'Website Development',
      titleNo: 'Nettsideutvikling',
      descriptionEn: 'Custom, high-performance web applications built for scale and conversion.',
      descriptionNo: 'Skreddersydde, høytytende nettapplikasjoner bygget for skalering og konvertering.',
      featuresEn: ['Custom UI/UX Design', 'Next.js / React Development', 'CMS Integration', 'Performance Optimization'],
      featuresNo: ['Skreddersydd UI/UX Design', 'Next.js / React Utvikling', 'CMS Integrasjon', 'Ytelsesoptimalisering'],
      price: 'From $2,500',
      status: 'active',
      order: 1,
      metaTitle: 'Website Development | MoldeWeb',
      metaDescription: 'High performance Next.js and React web development services in Norway.',
    },
    {
      id: 'marketing',
      slug: 'digital-marketing',
      icon: 'FiTrendingUp',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
      titleEn: 'Digital Marketing',
      titleNo: 'Digital Markedsføring',
      descriptionEn: 'Comprehensive strategies to elevate your brand presence online.',
      descriptionNo: 'Helhetlige strategier for å løfte din merkevareposisjon på nett.',
      featuresEn: ['SEO Strategy', 'Content Marketing', 'Email Campaigns', 'Analytics & Reporting'],
      featuresNo: ['SEO-strategi', 'Innholdsmarkedsføring', 'E-postkampanjer', 'Analyse & Rapportering'],
      price: 'From $1,200/mo',
      status: 'active',
      order: 2,
      metaTitle: 'Digital Marketing Services | MoldeWeb',
      metaDescription: 'Data-driven digital marketing and growth strategy for businesses.',
    },
    {
      id: 'fb',
      slug: 'facebook-ads',
      icon: 'FiTarget',
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
      titleEn: 'Facebook & Meta Ads',
      titleNo: 'Facebook & Meta Annonser',
      descriptionEn: 'Targeted campaigns designed to maximize engagement and ROI.',
      descriptionNo: 'Målrettede kampanjer designet for å maksimere engasjement og ROI.',
      featuresEn: ['Audience Targeting', 'Creative A/B Testing', 'Retargeting Campaigns', 'ROAS Optimization'],
      featuresNo: ['Målgruppesegmentering', 'Kreativ A/B Testing', 'Retargeting-kampanjer', 'ROAS-optimalisering'],
      price: 'From $1,000/mo',
      status: 'active',
      order: 3,
      metaTitle: 'Facebook Ads Agency | MoldeWeb',
      metaDescription: 'High converting Meta and Facebook ad campaigns with targeted ROI.',
    },
    {
      id: 'google',
      slug: 'google-ads',
      icon: 'FiSearch',
      imageUrl: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
      titleEn: 'Google Ads Management',
      titleNo: 'Google Ads Håndtering',
      descriptionEn: 'Search and display network strategies to capture high-intent leads.',
      descriptionNo: 'Søke- og displaynettverk-strategier for å fange opp høy-intente kunder.',
      featuresEn: ['Search Network Ads', 'Display Network', 'Keyword Optimization', 'Conversion Tracking'],
      featuresNo: ['Søkenettverk-annonser', 'Displaynettverk', 'Søkeord-optimalisering', 'Konverteringssporing'],
      price: 'From $1,500/mo',
      status: 'active',
      order: 4,
      metaTitle: 'Google Ads Experts | MoldeWeb',
      metaDescription: 'Capture high-intent search leads with expert Google Ads campaign management.',
    }
  ],
  seo: [
    {
      pagePath: '/',
      pageName: 'Home Page',
      metaTitle: 'MoldeWeb - Digital Agency & Web Development',
      metaDescription: 'Crafting exceptional digital experiences through web development and data-driven ad growth.',
      ogImage: '',
      canonicalUrl: 'https://moldeweb.no',
      keywords: 'digital agency, web development, nextjs, google ads, facebook ads, norway',
    },
    {
      pagePath: '/about',
      pageName: 'About Page',
      metaTitle: 'About Us | MoldeWeb Digital Agency',
      metaDescription: 'Learn about MoldeWeb - building digital excellence and growth from Norway.',
      ogImage: '',
      canonicalUrl: 'https://moldeweb.no/about',
      keywords: 'about moldeweb, digital agency norway, web design team',
    },
    {
      pagePath: '/services',
      pageName: 'Services Page',
      metaTitle: 'Our Digital Services | MoldeWeb',
      metaDescription: 'Custom Web Development, Digital Marketing, Facebook Ads, and Google Ads management.',
      ogImage: '',
      canonicalUrl: 'https://moldeweb.no/services',
      keywords: 'web development, facebook ads, google ads, seo, digital marketing',
    },
    {
      pagePath: '/contact',
      pageName: 'Contact Page',
      metaTitle: 'Contact MoldeWeb | Get a Free Quote',
      metaDescription: 'Get in touch with MoldeWeb to scale your digital presence and web applications.',
      ogImage: '',
      canonicalUrl: 'https://moldeweb.no/contact',
      keywords: 'contact agency, quote web development, agency inquiry',
    }
  ],
  leads: [
    {
      id: 'lead-1',
      name: 'Lars Erik',
      email: 'lars@example.no',
      service: 'Website Development',
      message: 'Hi! We need a new e-commerce web application with custom Next.js frontend.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'new',
    },
    {
      id: 'lead-2',
      name: 'Sofia Hansen',
      email: 'sofia@techbrand.com',
      service: 'Google Ads',
      message: 'Looking for assistance with our quarterly search campaign audit and ROAS optimization.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'read',
    }
  ],
  media: [],
  promo: {
    active: true,
    messageEn: 'Get a free SEO audit today!',
    messageNo: 'Få en gratis SEO-analyse i dag!',
    link: '/contact'
  }
};

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

let memoryDb: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const fileData = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(fileData);
      memoryDb = { ...DEFAULT_DB, ...parsed };
      return memoryDb!;
    }
  } catch (err) {
    console.error('Error reading DB file, using fallback', err);
  }

  memoryDb = DEFAULT_DB;
  saveDb(memoryDb);
  return memoryDb;
}

export function saveDb(data: DatabaseSchema): boolean {
  memoryDb = data;
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB file', err);
    return false;
  }
}
