import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  align = 'left',
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <div
      className={
        centered
          ? 'flex flex-col items-center text-center gap-3 max-w-3xl mx-auto'
          : 'flex flex-col sm:flex-row sm:items-end justify-between gap-4'
      }
    >
      <div className={centered ? 'space-y-3' : ''}>
        {eyebrow && <span className="section-eyebrow block mb-2">{eyebrow}</span>}
        <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink uppercase tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className={`text-xs sm:text-sm text-slate mt-2 ${centered ? 'mx-auto max-w-2xl' : 'max-w-lg'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-teal hover:text-gold transition-colors flex-shrink-0"
        >
          <span>{ctaLabel}</span>
          <FiArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
