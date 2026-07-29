# Deploying MoldeWeb to Vercel — Step-by-Step Guide

This guide is written against this repository's actual configuration (Next.js 15 / React 19,
Tailwind v4 CSS-first setup, NextAuth credentials login, a custom JSON-file CMS store). Follow it
in order the first time you deploy.

---

## 1. Prerequisites & Build Command

### Repo checklist before you connect Vercel

- [ ] **Commit a lockfile.** This repo currently has no `package-lock.json` / `yarn.lock` /
      `pnpm-lock.yaml` committed. Without one, every Vercel build resolves dependency versions
      fresh, which can silently ship a different dependency tree than what you tested locally.
      Run `npm install` locally once, then commit the generated `package-lock.json`.
- [ ] Confirm `next.config.ts`, `data/db.json`, and `public/` are committed (the JSON CMS store
      ships as part of the deployment — see the persistence warning in §4).
- [ ] `.env` is (correctly) git-ignored — you will re-enter its values in the Vercel dashboard,
      not commit it.

### Vercel project settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Next.js` (auto-detected — do not override) |
| **Build Command** | `next build` (the default `npm run build` works as-is) |
| **Output Directory** | leave blank / default (`.next`) — do **not** set this to `out`, this app is not statically exported |
| **Install Command** | `npm install` (switch to `npm ci` once a lockfile is committed, for reproducible installs) |
| **Node.js Version** | **20.x** (Project Settings → General → Node.js Version). Next.js 15 requires Node ≥ 18.18; 20.x LTS is the safest match for React 19 / Next 15.4 |
| **Root Directory** | repo root (this `package.json` is already at the root) |

`next.config.ts` also sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors:
true` — Vercel's build will succeed even with lint/type errors present. That's intentional for
this project, but it means CI-style safety nets are off; consider running `npx tsc --noEmit` and
`npm run lint` locally (or in a separate GitHub Action) before merging to `main`.

---

## 2. Environment Variables Setup

Set these in **Vercel → Project → Settings → Environment Variables** for both the `Production`
and `Preview` environments (they're scoped separately — a var added to Production only will not
exist in preview-branch deployments).

| Variable | Required? | Purpose | Notes |
|---|---|---|---|
| `NEXTAUTH_SECRET` | **Required** | Signs/encrypts NextAuth JWT session cookies (`lib/auth.ts`) | `next.config.ts` currently falls back to a **hardcoded string** (`"moldeweb-norway-fixed-secret-key-2026-v1"`) if this is unset. That fallback is fine for local dev but must **not** be relied on in production — anyone who reads the repo knows the secret. Generate a real one: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | **Required** | Canonical URL NextAuth uses for callbacks/redirects | Set to your production URL, e.g. `https://your-project.vercel.app` (or your custom domain). |
| `APP_URL` | Recommended | This repo's `next.config.ts` maps `APP_URL` → `NEXTAUTH_URL` as a fallback | Set the same value as `NEXTAUTH_URL` for consistency, or just set `NEXTAUTH_URL` directly and skip this. |
| `DATABASE_URL` / connection string | Only if you wire up a real database | Not currently read anywhere in code | See §4 — the "SQL Database Integration" admin page only *stores* connection settings today; it does not open a real connection. If you implement that, this is where the pooled connection string goes. |
| `NEXT_PUBLIC_FIREBASE_*` (API key, auth domain, project ID, storage bucket, sender ID, app ID) | Only if you wire up Firebase Auth | The `/admin/firebase-auth` page only generates an example code snippet referencing these — they are not consumed by the running app yet | Add them only once you actually create `lib/firebase.ts` per that page's generated snippet. |
| `DISABLE_HMR` | Do not set in production | Dev-only flag read in `next.config.ts` to freeze file watching during local agent-assisted editing | Irrelevant to `next build`/Vercel; leave unset. |

**After adding or changing any environment variable, trigger a redeploy.** Vercel does not hot-
reload running functions when you edit env vars in the dashboard — see §4 for why.

---

## 3. Tailwind & Asset Optimization Checklist

This project uses **Tailwind v4's CSS-first configuration** (`@import "tailwindcss"` + `@theme {}`
inside `app/globals.css` — there is no `tailwind.config.js`/`content` array to maintain). That
means the classic "PurgeCSS removed my classes in production" failure mode mostly doesn't apply
here, but a few Tailwind-v4-specific things still matter:

- [ ] **Never nest `@keyframes`, `@font-face`, or `@page` inside a normal selector block** in
      `globals.css` (e.g. inside `[data-theme="dark"] { ... }`). This is invalid CSS nesting.
      Browsers parsing an unminified dev build tend to recover gracefully; Tailwind v4's
      production minifier (Lightning CSS) does not — it drops the entire enclosing rule. This
      exact bug broke Dark Mode in production before this guide was written (see `report.md`).
      Keep `@keyframes` at the stylesheet root, and register any `--animate-*` token inside the
      `@theme { ... }` block, not inside a theme-scoped selector.
- [ ] Any new dynamically-composed Tailwind class name (e.g. `` `bg-${color}-500` ``) is invisible
      to Tailwind's scanner and won't ship any CSS. Only use complete class strings, or add a
      `safelist`-equivalent via an explicit `@source inline(...)` if you truly need dynamic
      classes (Tailwind v4 syntax) — this repo currently avoids the pattern, keep it that way.
- [ ] Run `next build` locally at least once before every deploy and grep
      `.next/static/css/*.css` for any color token you expect (e.g. your dark-mode hex values) if
      you touch `globals.css` again — this is the fastest way to catch a repeat of the bug above
      before it reaches Vercel.

### Asset loading

- [ ] `next.config.ts` already whitelists `picsum.photos`, `images.unsplash.com`,
      `plus.unsplash.com`, and a wildcard `**` HTTPS hostname for `next/image`. The wildcard means
      any HTTPS image URL will be optimized — convenient for a CMS-driven site, but note Vercel's
      **Image Optimization has a metered quota** (Hobby plan: 1,000 source images/month). If the
      admin panel is used to add many unique external image URLs, monitor usage under
      Vercel → Project → Usage.
- [ ] Uploaded media (`app/api/media/route.ts`) is written to `public/uploads/` via
      `fs.writeFileSync`. **This directory is not writable at all in Vercel's production runtime**
      (see §4) — uploads there will silently fall back to inline base64 data URLs, which bloats
      `data/db.json`/API responses and is not a long-term asset strategy. Budget time to move this
      to Vercel Blob, S3, or Cloudinary before relying on the media library in production.

### Serverless API route limits (Vercel defaults, Hobby plan)

- Request body size: **4.5 MB** per invocation. The base64 upload fallback above can hit this on
  larger images — `lib/utils.ts`'s `compressImage`/`compressLogoImage` help, but there's no hard
  enforcement.
- Execution timeout: **10s** (Hobby) / **60s+** configurable (Pro, via `maxDuration` in a route's
  config or `vercel.json`). None of this repo's API routes currently do slow work (they're all
  synchronous JSON file reads/writes), so this isn't a current risk — keep it that way if you add
  real database calls; use `export const maxDuration = ...` per-route if a query is ever slow.

---

## 4. Common Pitfalls & Fixes

### ⚠️ The most important one for this codebase: ephemeral filesystem persistence

`lib/store.ts` persists the entire CMS (content, services, portfolio, packages, leads, design
theme settings, account credentials) to `data/db.json` via `fs.writeFileSync`, and
`app/api/media/route.ts` saves uploaded files to `public/uploads/` the same way. **Vercel's
serverless functions run on a read-only filesystem in production** (writes outside `/tmp` throw
`EROFS`, and even `/tmp` is wiped between invocations and not shared across instances).

`saveDb()` already catches the write error and falls back to an **in-memory** copy
(`memoryDb`), so the app won't crash — but:

- Admin edits will appear to save successfully (you'll see the "saved!" toast) but **will not
  survive** the next cold start / different serverless instance handling a request. Two users
  hitting different instances can see different data at the same time.
- Every new deployment re-ships the `data/db.json` that was committed to git at build time,
  discarding any changes made through the live admin panel since the last deploy.

**Fix / mitigation options, in order of effort:**
1. **Acceptable for demos**: know this limitation exists, and re-export/commit `data/db.json`
   periodically if you want admin changes to "stick" across deploys.
2. **Recommended for real use**: wire the existing `/admin/database` (SQL Database Integration)
   settings up to an actually-connected database (Vercel Postgres, Supabase, or Neon all work well
   serverless — see pooling note below) and change `lib/store.ts`'s `getDb`/`saveDb` to read/write
   there instead of the local JSON file. Do the same for uploads → Vercel Blob/S3/Cloudinary.

### Hydration mismatch errors

`app/layout.tsx` already sets `suppressHydrationWarning` on `<html>` and `<body>`, which is
correct here because `ThemeProvider` and `LanguageProvider` both read `localStorage` in a
`useEffect` (client-only) and mutate the DOM attribute *after* the initial server-rendered HTML is
sent — the server has no way to know the visitor's saved theme/language, so a light-mode/`en`
shell is always sent first, then corrected client-side. If you add more client-only
personalization later, follow the same pattern: read the persisted value inside `useEffect`, not
during render, and don't be tempted to remove `suppressHydrationWarning` "to be safe" — it's
suppressing an expected, harmless mismatch, not masking a real bug.

### Environment variable caching / stale values after a change

- `NEXT_PUBLIC_*` variables are **inlined into the client JS bundle at build time**. Changing one
  in the Vercel dashboard does nothing until you **redeploy** (a dashboard save alone does not
  rebuild).
- Server-only variables (like `NEXTAUTH_SECRET`) are read at runtime per invocation, but Vercel
  still recommends a redeploy after changing them so all warm function instances pick up the new
  value consistently rather than mixing old/new across instances during the rollover.
- Use `vercel env pull .env.local` (Vercel CLI) to keep your local `.env` in sync with what's
  actually configured for a given environment, instead of hand-copying values.

### CORS / API routing issues

All of this app's `app/api/*` routes are same-origin calls from the site/admin UI on the same
domain, so CORS headers are not currently needed and none are set. This only becomes relevant if
you later call these routes from a different origin (e.g., a separate marketing site, or the admin
panel embedded in an iframe on another domain). Note that `lib/auth.ts` already configures NextAuth
cookies with `sameSite: 'none'` and `secure: true` (`__Secure-`/`__Host-` prefixed names) — those
**require HTTPS**, which Vercel provides by default, but they will silently fail to be set if you
ever test the production build over plain HTTP (e.g., some local `next start` setups) or embed the
admin login in a cross-site iframe where third-party cookies are blocked by the browser.

### Database connection pooling (once you wire up a real DB)

Serverless functions spin up fresh per invocation (or reuse a warm instance briefly) — each one
that opens its own raw Postgres/MySQL connection can quickly exhaust your database's max
connection limit under real traffic. When you implement the `/admin/database` integration for
real:

- **Supabase / Neon**: use the **pooled** connection string variant they provide (Supabase:
  port `6543`, "Transaction" pooling mode; Neon: the `-pooler` host suffix), not the direct
  connection string, for anything used from serverless functions.
- **Vercel Postgres**: pooling is handled for you automatically — use the provided
  `POSTGRES_URL` as-is.
- If you introduce an ORM like Prisma, cache the client instance on `globalThis` in dev to avoid
  creating a new client per hot-reload, and use its Data Proxy / pooled URL in production.
- Never open a connection per-request without pooling in a route handler that could see concurrent
  traffic — it's the single most common cause of "works fine locally, falls over under load on
  Vercel" for apps with a real database.

---

## Quick pre-flight checklist

- [ ] `package-lock.json` committed
- [ ] Node.js version set to 20.x in Vercel project settings
- [ ] `NEXTAUTH_SECRET` and `NEXTAUTH_URL` set in both Production and Preview environments
- [ ] Ran `next build` locally with zero unexpected errors and spot-checked `.next/static/css`
- [ ] Understand that `data/db.json` and `public/uploads/` are not durable production storage
      until migrated to a real database/blob store
- [ ] Redeployed after any environment variable change
