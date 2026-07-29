import fs from 'fs';
import path from 'path';
import {
  DatabaseSchema,
  ContentData,
  DesignData,
  ServiceItem,
  SeoItem,
  LeadItem,
  MediaItem,
  PromoData,
  PortfolioItem,
  PackageItem,
  PaymentSettings,
  NavItem,
  ContactInfo,
  SiteSettings,
  PortfolioSettings,
  PackageSettings,
  FooterSettings
} from './types';

// Re-exported so existing API routes can keep importing item types directly
// from '@/lib/store' alongside getDb/saveDb.
export type {
  ServiceItem,
  SeoItem,
  LeadItem,
  MediaItem,
  PortfolioItem,
  PackageItem,
} from './types';

// bcrypt hash of the first-run default password 'admin' (cost factor 10).
// Change this account's password via /admin/account immediately after first login.
export const DEFAULT_ADMIN_PASSWORD_HASH = '$2b$10$sj/Pk4.vPl7vsVJXchteDejAwktmpFlfkSFFVpk0Q7u12eQVKrnPm';

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
    portfolio: {
      titleEn: 'Our Work',
      titleNo: 'Vårt Arbeid',
    },
    packages: {
      titleEn: 'Packages & Pricing',
      titleNo: 'Pakker & Priser',
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
    themeColors: {
      light: {
        primaryColor: { value: '#1F6F5C', enabled: false },
        bgDeepColor: { value: '#EAE4D6', enabled: false },
        accentColor: { value: '#C98A2E', enabled: false },
        cardBgColor: { value: '#EAE4D6', enabled: false },
        hoverTextColor: { value: '#C98A2E', enabled: false },
        hoverBgColor: { value: '#1F6F5C', enabled: false },
        bgColor: { value: '#F3F0E8', enabled: false },
        textColor: { value: '#16212F', enabled: false },
        ctaButtonColor: { value: '#C98A2E', enabled: false },
      },
      dark: {
        primaryColor: { value: '#2E9280', enabled: false },
        bgDeepColor: { value: '#182230', enabled: false },
        accentColor: { value: '#DDA246', enabled: false },
        cardBgColor: { value: '#182230', enabled: false },
        hoverTextColor: { value: '#DDA246', enabled: false },
        hoverBgColor: { value: '#2E9280', enabled: false },
        bgColor: { value: '#10161F', enabled: false },
        textColor: { value: '#ECE8DE', enabled: false },
        ctaButtonColor: { value: '#DDA246', enabled: false },
      },
    },
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
  portfolio: [
    {
      id: 'p1',
      titleEn: 'LuxeTime E-commerce Platform',
      titleNo: 'LuxeTime E-handelsplattform',
      categoryEn: 'Web Development',
      categoryNo: 'Webutvikling',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'A luxury watch marketplace built with Next.js 15, custom product customizers, and high-conversion Stripe checkout.',
      descriptionNo: 'En markedsplass for luksusklokker bygget med Next.js 15, tilpassede produktvelgere og Stripe-betaling.',
      link: 'https://moldeweb.no/portfolio',
      order: 1
    },
    {
      id: 'p2',
      titleEn: 'Fjord Explorer Tourism App',
      titleNo: 'Fjord Explorer Booking-app',
      categoryEn: 'Mobile & Web App',
      categoryNo: 'Mobil & Nettapp',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'Interactive Norwegian tourism reservation platform with live weather tracking, interactive maps, and instant digital tickets.',
      descriptionNo: 'Interaktivt norsk turistreservasjonssystem med levende værmeldinger, opplevelseskart og umiddelbare billetter.',
      link: 'https://moldeweb.no/portfolio',
      order: 2
    },
    {
      id: 'p3',
      titleEn: 'Nordic B2B SaaS Growth',
      titleNo: 'Nordisk B2B SaaS-vekst',
      categoryEn: 'Google Ads & Marketing',
      categoryNo: 'Google Ads & Markedsføring',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'High-intent search keyword strategies driving a 340% ROAS increase for Scandinavian tech companies.',
      descriptionNo: 'Strategier for søkeord med høy kjøpshensikt som ga 340 % økning i ROAS for skandinaviske teknologibedrifter.',
      link: 'https://moldeweb.no/portfolio',
      order: 3
    },
    {
      id: 'p4',
      titleEn: 'Nordic Roast Coffee Rebrand',
      titleNo: 'Nordic Roast Kaffe Rebranding',
      categoryEn: 'Meta & Facebook Ads',
      categoryNo: 'Meta & Facebook Annonser',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'Dynamic Meta video ad creative campaigns generating 4.2x ROAS for subscription coffee boxes across the Nordics.',
      descriptionNo: 'Dynamiske Meta-videoannonser som genererte 4,2x ROAS for abonnementsbasert kaffe i hele Norden.',
      link: 'https://moldeweb.no/portfolio',
      order: 4
    },
    {
      id: 'p5',
      titleEn: 'FinTech Analytics Dashboard',
      titleNo: 'FinTech Analyse-dashbord',
      categoryEn: 'UI/UX & Web Dev',
      categoryNo: 'UI/UX & Webutvikling',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'Real-time financial management platform built for institutional wealth managers with high density data visualization.',
      descriptionNo: 'Sanntids plattform for finansiell styring bygget for institusjonelle forvaltere med datatett visualisering.',
      link: 'https://moldeweb.no/portfolio',
      order: 5
    },
    {
      id: 'p6',
      titleEn: 'EcoStay Hotels Organic Growth',
      titleNo: 'EcoStay Hoteller Organisk Vekst',
      categoryEn: 'SEO Strategy',
      categoryNo: 'SEO-strategi',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      descriptionEn: 'Comprehensive technical SEO overhaul and multilingual content strategy resulting in top 3 search positions.',
      descriptionNo: 'Omfattende teknisk SEO-overhaling og flerspråklig innholdsstrategi som ga topp 3-plasseringer i søk.',
      link: 'https://moldeweb.no/portfolio',
      order: 6
    }
  ],
  portfolioSettings: {
    titleEn: 'Our Work',
    titleNo: 'Vårt Arbeid',
    recommendedDimensions: '1200 x 800 px'
  },
  packages: [
    {
      id: 'pkg1',
      nameEn: 'Starter',
      nameNo: 'Oppstart',
      priceMonthly: '199',
      priceYearly: '1990',
      yearlyDiscountEn: 'Save 17%',
      yearlyDiscountNo: 'Spar 17%',
      durationEn: 'month',
      durationNo: 'måned',
      featuresEn: ['5 Custom Pages', 'Basic Technical SEO', 'Mobile & Tablet Responsive', 'Contact Form Integration'],
      featuresNo: ['5 Sider', 'Grunnleggende Teknisk SEO', 'Mobil- og Nettbrettresponsiv', 'Kontaktskjema-integrasjon'],
      isPopular: false,
      order: 1
    },
    {
      id: 'pkg2',
      nameEn: 'Professional Growth',
      nameNo: 'Profesjonell Vekst',
      priceMonthly: '499',
      priceYearly: '4990',
      yearlyDiscountEn: 'Save 17%',
      yearlyDiscountNo: 'Spar 17%',
      durationEn: 'month',
      durationNo: 'måned',
      featuresEn: ['Up to 15 Custom Pages', 'Advanced Technical SEO & Schema', 'Next.js & CMS Integration', 'Social Media Ads Setup', 'Priority Email & Chat Support'],
      featuresNo: ['Opptil 15 Sider', 'Avansert Teknisk SEO & Schema', 'Next.js & CMS Integrasjon', 'Oppsett av Social Media Annonser', 'Prioritert E-post & Chat Support'],
      isPopular: true,
      order: 2
    },
    {
      id: 'pkg3',
      nameEn: 'Enterprise Scale',
      nameNo: 'Bedrift Skalering',
      priceMonthly: '999',
      priceYearly: '9990',
      yearlyDiscountEn: 'Save 17%',
      yearlyDiscountNo: 'Spar 17%',
      durationEn: 'month',
      durationNo: 'måned',
      featuresEn: ['Unlimited Custom Pages', 'Full Marketing Suite & Ad Campaigns', 'Dedicated Growth Manager', 'Custom API & Database Integrations', '24/7 SLA & Direct Phone Support'],
      featuresNo: ['Ubegrenset Skreddersydde Sider', 'Full Markedsføringspakke & Annonser', 'Dedikert Vekstrådgiver', 'Tilpassede API & DB Integrasjoner', '24/7 SLA & Direkte Telefonsupport'],
      isPopular: false,
      order: 3
    }
  ],
  packageSettings: {
    titleEn: 'Packages & Pricing',
    titleNo: 'Pakker & Priser',
    showYearlyToggle: true,
    yearlyDiscountPercentage: 17
  },
  paymentSettings: {
    gateway: 'none',
    apiKey: '',
    isTestMode: true
  },
  navItems: [
    { id: 'n1', labelEn: 'Services', labelNo: 'Tjenester', href: '/services', order: 1 },
    { id: 'n2', labelEn: 'Portfolio', labelNo: 'Portfolio', href: '/portfolio', order: 2 },
    { id: 'n3', labelEn: 'Packages', labelNo: 'Pakker', href: '/packages', order: 3 },
    { id: 'n4', labelEn: 'About', labelNo: 'Om oss', href: '/about', order: 4 },
    { id: 'n5', labelEn: 'Contact', labelNo: 'Kontakt', href: '/contact', order: 5 },
  ],
  contactInfo: {
    phone: '+47 123 45 678',
    email: 'hello@moldeweb.no',
    addressEn: 'Storgata 1, 6413 Molde, Norway',
    addressNo: 'Storgata 1, 6413 Molde, Norge',
  },
  siteSettings: {
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
    bookMeetingCtaLink: '/contact',
  },
  footerSettings: {
    aboutEn: 'Building high-performance web applications and growth strategies from Norway.',
    aboutNo: 'Bygger høytytende nettapplikasjoner og vekststrategier fra Norge.',
    copyrightEn: 'All rights reserved.',
    copyrightNo: 'Alle rettigheter forbeholdt.',
  },
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
    link: '/contact',
    slidingEnabled: false,
    dismissible: true
  },
  account: {
    email: 'admin@moldeweb.no',
    username: 'admin',
    password: DEFAULT_ADMIN_PASSWORD_HASH,
    updatedAt: new Date().toISOString()
  },
  databaseSettings: {
    enabled: false,
    provider: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: 'moldeweb_db',
    user: 'postgres',
    password: '',
    ssl: true,
    connectionString: 'postgresql://postgres:password@localhost:5432/moldeweb_db'
  },
  firebaseAuthSettings: {
    enabled: true,
    apiKey: 'AIzaSyBv5CDEmjTkKkm1Dww-tVqzoT9Of5s9NSA',
    authDomain: 'molde-web-3dc3e.firebaseapp.com',
    projectId: 'molde-web-3dc3e',
    storageBucket: 'molde-web-3dc3e.firebasestorage.app',
    messagingSenderId: '930998002896',
    appId: '1:930998002896:web:7e8406f8849c0a86a4ead5',
    enableEmailAuth: true,
    enableGoogleAuth: true
  },
  bookings: [],
  bookingSchedule: {
    workingDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 60,
    blockedDates: [],
    blockedSlots: [],
    minNoticeHours: 12,
    timezoneLabel: 'Europe/Oslo',
  },
  orders: [],
  mailSettings: {
    primaryNotificationEmail: 'hello@moldeweb.no',
    fromName: 'MoldeWeb',
    fromEmail: 'noreply@moldeweb.no',
    provider: 'none',
    resendApiKey: '',
    sendgridApiKey: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    alerts: {
      bookings: true,
      purchases: true,
      contactLeads: true,
    },
  },
  ctaButtons: [
    { key: 'header_nav_cta', label: 'Header Navigation Button', actionType: 'booking', customUrl: '/contact', enabled: true },
    { key: 'hero_primary_cta', label: 'Homepage Hero Primary Button', actionType: 'booking', customUrl: '/contact', enabled: true },
    { key: 'services_book_meeting_cta', label: '"Ready to Start?" Band', actionType: 'booking', customUrl: '/contact', enabled: true },
    { key: 'service_details_book_meeting', label: 'Service Details — Book a Meeting Button', actionType: 'booking', customUrl: '/contact', enabled: true },
    { key: 'package_card_inquiry_cta', label: 'Package Card — Book a Call', actionType: 'package', customUrl: '/contact', enabled: true },
  ],
};

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

let memoryDb: DatabaseSchema | null = null;
let lastUpdatedTime: number = Date.now();

export function getCmsVersion(): number {
  try {
    if (fs.existsSync(DB_PATH)) {
      const stats = fs.statSync(DB_PATH);
      return Math.max(stats.mtimeMs, lastUpdatedTime);
    }
  } catch (err) {
    // ignore
  }
  return lastUpdatedTime;
}

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
  lastUpdatedTime = Date.now();
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Filesystem read-only or error writing DB file, persisting in memory:', err);
    return true;
  }
}
