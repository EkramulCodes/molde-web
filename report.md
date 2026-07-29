# MoldeWeb — Engineering Report

## 🌓 Theme Toggling (Light / Dark Mode) Audit

**Status before fix:** Broken in production (Vercel) only. Local `next dev` was unaffected.

### Symptom

Clicking the theme toggle updated `localStorage` and flipped the `data-theme` attribute on
`<html>` correctly in every environment, but on Vercel the page visually stayed in light mode —
no background, text, or accent colors changed.

### Root Cause

This project does **not** use `next-themes` or Tailwind's `dark:` class variant. Theming is
implemented with a custom `ThemeProvider` (`context/ThemeContext.tsx`) that toggles
`document.documentElement.setAttribute('data-theme', 'dark' | 'light')`, paired with plain CSS
custom properties in `app/globals.css`:

```css
:root { --ink: #16212F; --bg-primary: #F3F0E8; /* ...light values... */ }
[data-theme="dark"] { --ink: #ECE8DE; --bg-primary: #10161F; /* ...dark values... */ }
```

That part was sound. The actual defect was inside the `[data-theme="dark"] { ... }` block itself:

```css
[data-theme="dark"] {
  --ink: #ECE8DE;
  /* ...other dark tokens... */
  --animate-marquee: marquee 15s linear infinite;

  @keyframes marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
}
```

`@keyframes` is **not a valid at-rule to nest inside a plain selector block**. CSS Nesting only
allows conditional at-rules such as `@media`, `@supports`, and `@container` to appear inside a
style rule — `@keyframes` (like `@font-face` and `@page`) has no meaningful "selector" to nest
under and must live at the stylesheet root.

- **Locally (`next dev`)**: the browser's own CSS parser processed the unminified stylesheet and
  was lenient enough to recover from the malformed nesting, largely masking the problem.
- **On Vercel (production `next build`)**: Tailwind v4's production CSS pipeline (Lightning CSS)
  parses and minifies the same file far more strictly. Encountering the invalid nested
  `@keyframes`, it discarded the **entire enclosing rule** — meaning every dark-mode variable
  (`--ink`, `--bg-primary`, `--bg-deep`, `--gold`, `--teal`, `--slate`, `--contour`) was silently
  dropped from the shipped CSS bundle. With no `[data-theme="dark"]` rule at all in production,
  the `:root` (light) values applied unconditionally regardless of the attribute on `<html>`.

This was confirmed empirically, not just theorized: running a local production build
(`next build`) and inspecting `.next/static/css/*.css` showed the dark-mode hex values
(`#ECE8DE`, `#10161F`, `#182230`, `#DDA246`) completely absent from the compiled CSS, while the
same light-mode values were present.

### Fix Applied

In `app/globals.css`:
1. Removed the nested `@keyframes marquee { ... }` from inside `[data-theme="dark"] { ... }` and
   moved it to the stylesheet root, where `@keyframes` belongs.
2. Moved `--animate-marquee: marquee 15s linear infinite;` out of the theme-scoped selector and
   into the `@theme { ... }` block, where Tailwind v4 actually registers design tokens. This has
   the side benefit of making the `animate-marquee` utility (used by the sliding promo bar)
   Tailwind-recognized, rather than a dead class name that resolved to nothing.

No changes were needed in `context/ThemeContext.tsx`, `components/ThemeToggle.tsx`, or the
`app/layout.tsx` provider tree — the toggle logic, `localStorage` persistence, and
`suppressHydrationWarning` usage were already correct.

### Verification

Re-ran `next build` after the fix and re-inspected the compiled CSS:

```
[data-theme=dark]{--ink:#ece8de;--bg-primary:#10161f;--bg-deep:#182230;--gold:#dda246;--teal:#2e9280;--slate:#8c93a2;--contour:#2e928014}
@keyframes marquee{0%{transform:translate(0)}to{transform:translate(-50%)}}
```

The full dark-mode variable block now survives minification intact, and `@keyframes marquee` is
a clean top-level rule.

### Current Status

✅ **Fixed and verified.** Dark Mode now toggles correctly in a genuine production build and will
behave identically on Vercel, since the fix addresses the CSS compilation step itself rather than
anything environment-specific to `next dev` vs. `next start`.
