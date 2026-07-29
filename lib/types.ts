export type Language = 'en' | 'no';

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
  portfolio: {
    titleEn: string;
    titleNo: string;
  };
  packages: {
    titleEn: string;
    titleNo: string;
  };
}

export interface ColorToken {
  value: string;
  enabled: boolean;
}

export interface ThemeModeColors {
  primaryColor: ColorToken;
  bgDeepColor: ColorToken;
  accentColor: ColorToken;
  cardBgColor: ColorToken;
  hoverTextColor: ColorToken;
  hoverBgColor: ColorToken;
  bgColor: ColorToken;
  textColor: ColorToken;
  ctaButtonColor: ColorToken;
}

export interface ThemeColorSettings {
  light: ThemeModeColors;
  dark: ThemeModeColors;
}

export interface DesignData {
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
  themeColors?: ThemeColorSettings;
}

export interface ServiceItem {
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
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  detailsLabelEn?: string;
  detailsLabelNo?: string;
  purchaseLabelEn?: string;
  purchaseLabelNo?: string;
  purchaseLink?: string;
}

export interface SeoItem {
  pagePath: string;
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
  slidingEnabled: boolean;
  dismissible: boolean;
}

export interface PortfolioItem {
  id: string;
  titleEn: string;
  titleNo: string;
  categoryEn: string;
  categoryNo: string;
  imageUrl: string;
  descriptionEn: string;
  descriptionNo: string;
  link?: string;
  order: number;
}

export interface PackageItem {
  id: string;
  nameEn: string;
  nameNo: string;
  priceMonthly: string;
  priceYearly: string;
  yearlyDiscountEn: string;
  yearlyDiscountNo: string;
  durationEn: string;
  durationNo: string;
  featuresEn: string[];
  featuresNo: string[];
  isPopular: boolean;
  order: number;
}

export interface PaymentSettings {
  gateway: 'stripe' | 'paypal' | 'other' | 'none';
  apiKey: string;
  isTestMode: boolean;
  otherGatewayName?: string;
  otherClientId?: string;
  otherSecretKey?: string;
  otherWebhookSecret?: string;
  otherInstructions?: string;
  otherCustomUrl?: string;
}

export interface NavItem {
  id: string;
  labelEn: string;
  labelNo: string;
  href: string;
  order: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  addressEn: string;
  addressNo: string;
}

export interface SiteSettings {
  logoUrl: string;
  showLanguageSwitcher: boolean;
  showCurrencySwitcher: boolean;
  showThemeSwitcher: boolean;
  defaultCurrency: 'USD' | 'NOK';
  exchangeRate: number;
  navCtaLabelEn: string;
  navCtaLabelNo: string;
  navCtaLink: string;
  heroCtaLabelEn: string;
  heroCtaLabelNo: string;
  heroCtaLink: string;
  bookMeetingCtaLabelEn: string;
  bookMeetingCtaLabelNo: string;
  bookMeetingCtaLink: string;
}

export interface PortfolioSettings {
  titleEn: string;
  titleNo: string;
  recommendedDimensions: string;
}

export interface PackageSettings {
  titleEn: string;
  titleNo: string;
  showYearlyToggle: boolean;
  yearlyDiscountPercentage: number;
}

export interface FooterSettings {
  aboutEn: string;
  aboutNo: string;
  copyrightEn: string;
  copyrightNo: string;
}

export interface AdminAccount {
  email: string;
  username: string;
  password: string;
  updatedAt?: string;
}

export interface SqlDatabaseSettings {
  enabled: boolean;
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'supabase' | 'neon' | 'cloudsql';
  host: string;
  port: string;
  database: string;
  user: string;
  password?: string;
  ssl: boolean;
  connectionString?: string;
}

export interface FirebaseAuthSettings {
  enabled: boolean;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enableEmailAuth: boolean;
  enableGoogleAuth: boolean;
}

export interface DatabaseSchema {
  content: ContentData;
  design: DesignData;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  portfolioSettings: PortfolioSettings;
  packages: PackageItem[];
  packageSettings: PackageSettings;
  paymentSettings: PaymentSettings;
  seo: SeoItem[];
  leads: LeadItem[];
  media: MediaItem[];
  promo: PromoData;
  navItems: NavItem[];
  contactInfo: ContactInfo;
  siteSettings: SiteSettings;
  footerSettings: FooterSettings;
  account?: AdminAccount;
  databaseSettings?: SqlDatabaseSettings;
  firebaseAuthSettings?: FirebaseAuthSettings;
}
