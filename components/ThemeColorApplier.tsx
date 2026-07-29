'use client';

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import type { ThemeModeColors } from '../lib/types';

const TOKEN_VAR_MAP: Record<keyof ThemeModeColors, string> = {
  primaryColor: '--teal',
  bgDeepColor: '--bg-deep',
  accentColor: '--gold',
  cardBgColor: '--card-bg',
  hoverTextColor: '--hover-text',
  hoverBgColor: '--hover-bg',
  bgColor: '--bg-primary',
  textColor: '--ink',
  ctaButtonColor: '--cta-button',
};

/**
 * Applies admin-configured Design & Theme colors as CSS custom properties for
 * the active light/dark mode. Tokens that are disabled (or not yet configured)
 * fall through to whatever is already driving that variable today:
 * primaryColor/accentColor keep the existing unconditional design.primaryColor /
 * design.accentColor behavior from LanguageContext; every other token simply
 * reverts to its stylesheet default in globals.css.
 */
export function ThemeColorApplier() {
  const { design } = useLanguage();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const modeColors = design?.themeColors?.[theme];

    (Object.keys(TOKEN_VAR_MAP) as (keyof ThemeModeColors)[]).forEach((key) => {
      const cssVar = TOKEN_VAR_MAP[key];
      const token = modeColors?.[key];

      if (token?.enabled && token.value) {
        root.style.setProperty(cssVar, token.value);
        return;
      }

      if (key === 'primaryColor' && design?.primaryColor) {
        root.style.setProperty(cssVar, design.primaryColor);
        return;
      }

      if (key === 'accentColor' && design?.accentColor) {
        root.style.setProperty(cssVar, design.accentColor);
        return;
      }

      root.style.removeProperty(cssVar);
    });
  }, [design, theme]);

  return null;
}
