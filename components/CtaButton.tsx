'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useBookingModal, BookingModalTarget } from '@/context/BookingModalContext';
import { CtaActionType } from '@/lib/types';

interface RuntimeContext {
  id: string;
  label: string;
}

interface CtaButtonProps {
  /** Key from lib/cta-registry.ts identifying which admin-managed CTA this is. */
  ctaKey: string;
  /** Used for 'custom' action type if no customUrl is configured yet. */
  fallbackHref?: string;
  className?: string;
  children: React.ReactNode;
  /** Passed by package cards so a 'booking'/'package' action pre-fills the right context. */
  packageContext?: RuntimeContext;
  /** Passed by service pages so a 'booking'/'package' action pre-fills the right context. */
  serviceContext?: RuntimeContext;
  /** Extra side effect to run alongside the CTA action, e.g. closing a mobile menu. */
  onClick?: () => void;
}

export function CtaButton({ ctaKey, fallbackHref = '/contact', className, children, packageContext, serviceContext, onClick }: CtaButtonProps) {
  const { ctaButtons } = useLanguage();
  const { openBookingModal } = useBookingModal();

  const config = ctaButtons.find((c) => c.key === ctaKey);

  if (config && config.enabled === false) {
    return null;
  }

  // Default to opening the booking modal (the spec's stated default action)
  // if config hasn't loaded yet or isn't registered — never a dead button.
  const actionType: CtaActionType = config?.actionType || 'booking';

  const buildRuntimeTarget = (): BookingModalTarget => {
    if (packageContext) return { type: 'package', id: packageContext.id, label: packageContext.label };
    if (serviceContext) return { type: 'service', id: serviceContext.id, label: serviceContext.label };
    return { type: 'general' };
  };

  if (actionType === 'contact') {
    return (
      <Link href="/contact" className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (actionType === 'custom') {
    const url = config?.customUrl || fallbackHref;
    const isExternal = /^https?:\/\//.test(url) || url.startsWith('wa.me') || url.startsWith('whatsapp:');
    if (isExternal) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link href={url} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (actionType === 'package') {
    const id = config?.packageId || packageContext?.id;
    const label = packageContext?.label;
    return (
      <button
        type="button"
        onClick={() => {
          openBookingModal(id ? { type: 'package', id, label } : buildRuntimeTarget());
          onClick?.();
        }}
        className={className}
      >
        {children}
      </button>
    );
  }

  // 'booking'
  return (
    <button
      type="button"
      onClick={() => {
        openBookingModal(buildRuntimeTarget());
        onClick?.();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
