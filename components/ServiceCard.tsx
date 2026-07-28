'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import type { ServiceItem } from '../lib/store';
import { loc, type Lang } from '../lib/i18n';
import { getServiceIcon } from '../lib/icons';

interface ServiceCardProps {
  service: ServiceItem;
  language: Lang;
  ctaLabel: string;
}

export function ServiceCard({ service, language, ctaLabel }: ServiceCardProps) {
  const Icon = getServiceIcon(service.icon);
  const title = loc(service, 'title', language, service.slug);
  const description = loc(service, 'description', language);

  return (
    <div className="bento-card p-6 sm:p-8 rounded-xl flex flex-col justify-between group">
      <div>
        <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-5 group-hover:scale-110 transition-transform origin-left">
          <Icon size={28} strokeWidth={1.8} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate bg-bg-primary/80 px-2 py-0.5 rounded border border-slate/10 inline-block mb-3">
          {service.id.slice(0, 8).toUpperCase()}
        </span>
        <h3 className="font-display font-bold text-base sm:text-lg mb-2 uppercase tracking-wide text-ink">
          {title}
        </h3>
        <p className="text-xs text-slate leading-relaxed">{description}</p>
        {service.price && (
          <p className="text-[11px] font-mono font-bold text-gold mt-3">{service.price}</p>
        )}
      </div>
      <div className="pt-6 border-t border-slate/10 mt-6">
        <Link
          href="/contact"
          className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal group-hover:text-gold transition-colors inline-flex items-center gap-1.5"
        >
          <span>{ctaLabel}</span>
          <FiArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
