import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import PackagesContent from './PackagesContent';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('/packages');
}

export default function PackagesPage() {
  return <PackagesContent />;
}
