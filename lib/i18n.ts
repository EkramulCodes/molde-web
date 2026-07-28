export type Lang = 'en' | 'no';

/**
 * Reads a bilingual field pair off a record, e.g. loc(hero, 'headline', 'no')
 * resolves `headlineNo` and falls back to `headlineEn` when it is empty.
 */
export function loc(
  source: Record<string, any> | null | undefined,
  field: string,
  language: Lang,
  fallback = ''
): string {
  if (!source) return fallback;
  const primary = source[`${field}${language === 'en' ? 'En' : 'No'}`];
  if (typeof primary === 'string' && primary.trim() !== '') return primary;

  const secondary = source[`${field}${language === 'en' ? 'No' : 'En'}`];
  if (typeof secondary === 'string' && secondary.trim() !== '') return secondary;

  return fallback;
}

/** Same as `loc` but for string arrays (featuresEn / featuresNo etc.). */
export function locList(
  source: Record<string, any> | null | undefined,
  field: string,
  language: Lang
): string[] {
  if (!source) return [];
  const primary = source[`${field}${language === 'en' ? 'En' : 'No'}`];
  if (Array.isArray(primary) && primary.length > 0) return primary;

  const secondary = source[`${field}${language === 'en' ? 'No' : 'En'}`];
  return Array.isArray(secondary) ? secondary : [];
}
