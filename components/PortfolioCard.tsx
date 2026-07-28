'use client';

import Link from 'next/link';
import { FiArrowUpRight, FiTrendingUp } from 'react-icons/fi';
import type { PortfolioItem } from '../lib/store';
import { loc, locList, type Lang } from '../lib/i18n';

interface PortfolioCardProps {
  item: PortfolioItem;
  language: Lang;
  resultsLabel: string;
  viewLabel: string;
}

export function PortfolioCard({ item, language, resultsLabel, viewLabel }: PortfolioCardProps) {
  const title = loc(item, 'title', language, item.slug);
  const category = loc(item, 'category', language);
  const description = loc(item, 'description', language);
  const results = locList(item, 'results', language);

  return (
    <article className="bento-card rounded-2xl overflow-hidden flex flex-col group">
      <div className="relative aspect-[16/10] overflow-hidden media-placeholder flex items-center justify-center">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="font-display font-bold text-2xl text-teal/30 uppercase tracking-widest px-6 text-center">
            {item.clientName || title}
          </span>
        )}

        {item.year && (
          <span className="absolute top-3 right-3 bg-ink/80 text-bg-primary text-[10px] font-mono font-bold px-2 py-1 rounded">
            {item.year}
          </span>
        )}
      </div>

      <div className="p-6 sm:p-7 flex flex-col flex-grow gap-4">
        <div className="space-y-2">
          {category && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-teal bg-teal/10 border border-teal/20 px-2 py-0.5 rounded inline-block">
              {category}
            </span>
          )}
          <h3 className="font-display font-bold text-lg sm:text-xl text-ink uppercase tracking-wide">
            {title}
          </h3>
          {item.clientName && (
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate">{item.clientName}</p>
          )}
          {description && <p className="text-xs sm:text-sm text-slate leading-relaxed">{description}</p>}
        </div>

        {results.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate">
              {resultsLabel}
            </span>
            <ul className="space-y-1.5">
              {results.map((result, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-ink">
                  <FiTrendingUp className="text-gold flex-shrink-0 mt-0.5" size={14} />
                  <span className="font-medium">{result}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-wider text-slate bg-bg-primary/70 border border-slate/10 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate/10">
          {item.projectUrl ? (
            <a
              href={item.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal hover:text-gold transition-colors inline-flex items-center gap-1.5"
            >
              <span>{viewLabel}</span>
              <FiArrowUpRight size={14} />
            </a>
          ) : (
            <Link
              href="/contact"
              className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal hover:text-gold transition-colors inline-flex items-center gap-1.5"
            >
              <span>{viewLabel}</span>
              <FiArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
