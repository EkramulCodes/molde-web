import type { Metadata } from 'next';
import { getDb } from './store';

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

/**
 * Builds Next.js metadata for a public route from the SEO entries managed in
 * /admin/seo, falling back to sensible site-wide defaults.
 */
export function buildPageMetadata(pagePath: string): Metadata {
  const db = getDb();
  const entry = db.seo.find((s) => s.pagePath === pagePath);
  const siteName = db.design.siteName || 'MoldeWeb';
  const siteUrl = getSiteUrl();

  const title = entry?.metaTitle?.trim() || `${siteName}${pagePath === '/' ? '' : ` | ${pagePath.replace('/', '')}`}`;
  const description =
    entry?.metaDescription?.trim() ||
    'MoldeWeb - a Norway-based agency specializing in website development, digital marketing and paid advertising.';
  const canonical = entry?.canonicalUrl?.trim() || `${siteUrl}${pagePath === '/' ? '' : pagePath}`;
  const keywords = entry?.keywords
    ? entry.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : undefined;
  const ogImage = entry?.ogImage?.trim();

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
