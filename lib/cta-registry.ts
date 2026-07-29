export interface CtaRegistryEntry {
  key: string;
  label: string;
  description: string;
}

// Single source of truth for every admin-managed CTA button on the public site.
// Both the admin "Button & CTA Action Manager" UI and the <CtaButton> component
// key off this list.
export const CTA_REGISTRY: CtaRegistryEntry[] = [
  {
    key: 'header_nav_cta',
    label: 'Header Navigation Button',
    description: 'The button on the right side of the site header, visible on every page.',
  },
  {
    key: 'hero_primary_cta',
    label: 'Homepage Hero Primary Button',
    description: 'The main call-to-action button in the homepage hero section.',
  },
  {
    key: 'services_book_meeting_cta',
    label: '"Ready to Start?" Band',
    description: 'The teal banner button below the Services grid on the homepage.',
  },
  {
    key: 'service_details_book_meeting',
    label: 'Service Details — Book a Meeting Button',
    description: 'The secondary button on each service details page.',
  },
  {
    key: 'package_card_inquiry_cta',
    label: 'Package Card — Book a Call',
    description: 'The secondary "Book a Call" link shown on every pricing card (homepage and Packages page).',
  },
];

export const CTA_KEYS = CTA_REGISTRY.map((c) => c.key);
