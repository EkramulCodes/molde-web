'use client';

import Link from 'next/link';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import type { PackageItem } from '../lib/store';
import { loc, locList, type Lang } from '../lib/i18n';

interface PackageCardProps {
  item: PackageItem;
  language: Lang;
  includesLabel: string;
  fallbackCtaLabel: string;
}

export function PackageCard({ item, language, includesLabel, fallbackCtaLabel }: PackageCardProps) {
  const name = loc(item, 'name', language, item.slug);
  const tagline = loc(item, 'tagline', language);
  const period = loc(item, 'period', language);
  const badge = loc(item, 'badge', language);
  const ctaLabel = loc(item, 'ctaLabel', language, fallbackCtaLabel);
  const features = locList(item, 'features', language);

  return (
    <div
      className={`bento-card rounded-2xl p-6 sm:p-8 flex flex-col relative ${
        item.highlighted ? 'package-card-featured' : ''
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md whitespace-nowrap">
          {badge}
        </span>
      )}

      <div className="space-y-3 pb-6 border-b border-slate/10">
        <h3 className="font-display font-bold text-xl sm:text-2xl text-ink uppercase tracking-wide">
          {name}
        </h3>
        {tagline && <p className="text-xs sm:text-sm text-slate leading-relaxed">{tagline}</p>}

        <div className="flex items-baseline gap-2 pt-2 flex-wrap">
          <span className="font-display font-bold text-2xl sm:text-3xl text-teal">{item.price}</span>
          {period && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate">{period}</span>
          )}
        </div>
      </div>

      <div className="py-6 space-y-3 flex-grow">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate">
          {includesLabel}
        </span>
        <ul className="space-y-2.5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-ink">
              <FiCheck className="text-gold flex-shrink-0 mt-0.5" size={16} />
              <span className="font-medium">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={item.ctaLink || '/contact'}
        className={`mt-auto inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 font-bold uppercase tracking-widest text-xs rounded-sm min-h-[48px] transition-all ${
          item.highlighted
            ? 'delta-gold-btn shadow-lg shadow-gold/20'
            : 'border-2 border-teal text-teal hover:bg-teal hover:text-white'
        }`}
      >
        <span>{ctaLabel}</span>
        <FiArrowRight size={14} />
      </Link>
    </div>
  );
}
