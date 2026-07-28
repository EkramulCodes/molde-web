import type { DesignData } from '@/lib/store';

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace('#', '');
  const full =
    normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgba(hex: string, alpha: number): string | null {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})` : null;
}

/**
 * Turns the palette saved in /admin/design into CSS custom properties that
 * override the defaults in globals.css. Only emitted when the admin has ticked
 * "apply custom colors", so the built-in theme stays intact by default.
 */
export function DesignTokens({ design }: { design: DesignData }) {
  if (!design?.applyCustomColors) return null;

  const declarations: string[] = [];
  const push = (token: string, value?: string) => {
    if (value && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())) {
      declarations.push(`${token}: ${value.trim()};`);
    }
  };

  push('--teal', design.primaryColor);
  push('--gold', design.accentColor);
  push('--bg-primary', design.bgPrimaryColor);
  push('--bg-deep', design.bgDeepColor);
  push('--ink', design.textColor);

  const contour = rgba(design.primaryColor, 0.08);
  if (contour) declarations.push(`--contour: ${contour};`);

  if (declarations.length === 0) return null;

  const block = declarations.join(' ');

  return (
    <style
      // Applied to both themes: the admin palette is an explicit brand override.
      dangerouslySetInnerHTML={{
        __html: `:root { ${block} } [data-theme="dark"] { ${block} }`,
      }}
    />
  );
}
