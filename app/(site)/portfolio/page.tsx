import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import PortfolioContent from './PortfolioContent';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('/portfolio');
}

export default function PortfolioPage() {
  return <PortfolioContent />;
}
