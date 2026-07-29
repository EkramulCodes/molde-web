# MoldeWeb — Full-Stack Integration & QA Audit Report

**Scope:** Every API route (`app/api/**`), every admin panel page (`app/admin/**`) and its sidebar
wiring, every public site page (`app/(site)/**`), the shared CMS state layer
(`context/LanguageContext.tsx`), the JSON-file data store (`lib/store.ts`), and the auth layer
(`lib/auth.ts`, `app/admin/(protected)/layout.tsx`). All findings below were read directly from
source and, for the highest-severity items, independently re-verified line-by-line before being
included in this report.

---

## 📊 Executive Summary

### Overall Score: **76 / 100 — Core CMS Solid & Now Secured; Integration Facades Still Outstanding**

*(Updated after the P0 security remediation below — was 64/100 at initial audit.)*

| Subsystem | Score | Verdict |
|---|---|---|
| Core content CMS (hero, services, portfolio, packages, promo, nav, footer, design/theme) | 90/100 | Genuinely wired end-to-end: admin → API → JSON store → public site |
| Admin panel structure & navigation | 95/100 | All 14 sidebar links resolve to real, working pages; real server-side auth gate |
| Lead capture / dashboard | 90/100 | Real CRUD, real dashboard stats — but "contact form" never actually emails anyone |
| "Integrations" (SQL Database, Payments, Firebase Auth) | 10/100 | All three are settings-storage facades with **zero** real external connection — **unchanged, not in scope of this update** |
| SEO admin panel | 0/100 | Fully disconnected — saved data never reaches a rendered `<head>` tag anywhere — **unchanged, not in scope of this update** |
| API authorization | ~~0/100~~ → **92/100** | ✅ **Fixed** — every mutating route now requires a valid admin session (see 🔒 below); one intentional, correct exception documented; a residual low-severity gap (unauthenticated `GET /api/contact` still returns lead PII) remains, out of this round's scope |
| Content localization / i18n completeness | 70/100 | Most visitor-facing copy is bilingual and CMS-aware; several chrome strings are English-only or fully static |

**Headline verdict:** The core content-management loop (the thing a client would actually use day
to day — editing hero copy, services, portfolio, packages, promo bar, nav, and theme colors) is
**real, working, and correctly wired** from the admin UI through to the live site. The **critical
security gap** flagged in the initial audit — an unauthenticated API write-surface plus a hardcoded
login backdoor — has now been **fixed and verified** (see below). The three **integration pages
that look functional but do nothing** (SQL Database, Payments, Firebase Auth) and the disconnected
SEO panel remain unresolved and were **not** part of this update's scope.

---

## 🔒 Security Fixes Applied (This Update)

Three P0 items from the initial audit were remediated and verified in this pass:

### 1. Every mutating API route now requires a valid admin session
Added a shared guard, `requireAdminSession()` in **`lib/api-auth.ts`**, that calls
`getServerSession(authOptions)` and returns a `401 Unauthorized` JSON response if there's no
session. It's now called at the top of every `POST`/`PUT`/`DELETE` handler across all 16 route
files: `account` (PUT), `content` (PUT), `contact` (PUT, DELETE), `design` (PUT), `firebase-auth`
(PUT), `media` (POST, DELETE), `packages` (POST, PUT, DELETE), `payments` (PUT), `portfolio`
(POST, PUT, DELETE), `promo` (PUT), `seo` (PUT), `services` (POST, PUT), `services/[id]` (PUT,
DELETE), `database` (PUT).

**One deliberate exception:** `POST /api/contact` remains unauthenticated. This is the visitor-
facing "Contact Us" form submission endpoint (also used by the checkout flow to log an order as a
lead) — it's meant to be called by anonymous site visitors, and gating it would break a real
public feature rather than fix a vulnerability. Only the *management* of leads (`PUT`/`DELETE` —
marking read/archived, deleting) now requires an admin session.

**Residual, lower-severity item (not in this round's scope):** `GET /api/contact` still returns
the full lead list, including visitor PII, to any unauthenticated caller — the task specifically
scoped this fix to `POST`/`PUT`/`DELETE`, so this GET was left as-is. Recommended as a fast
follow-up (see Recommended Fixes).

### 2. Hardcoded login backdoor removed
`lib/auth.ts`'s `authorize()` previously accepted the literal strings `admin@moldeweb.no`/`admin`
as username and `admin` as password **regardless of what was actually stored** in `db.account`.
Those hardcoded OR-branches have been deleted entirely. Login now validates **only** against
`db.account`'s real, stored email/username and password — changing the password via the Account
page now genuinely invalidates the old one, with no bypass.

### 3. Passwords are now hashed with bcrypt
- `app/api/account/route.ts`'s `PUT` handler now hashes any new password with `bcrypt.hash(...,
  10)` (via the `bcryptjs` package) before writing it to `db.account.password`, instead of storing
  it as plaintext.
- `lib/auth.ts` verifies credentials with a bcrypt-aware `verifyPassword()` helper that calls
  `bcrypt.compare()` whenever the stored value looks like a bcrypt hash.
- **Migration handled safely:** any pre-existing plaintext password already sitting in a live
  `data/db.json` (from before this fix) is detected (it won't match the `$2a$`/`$2b$`/`$2y$` hash
  prefix) and compared directly as a one-time fallback, so existing installs aren't locked out —
  the moment that password is next changed via the Account page, it's stored properly hashed. The
  default seed account in `lib/store.ts` (`DEFAULT_ADMIN_PASSWORD_HASH`) now ships as a bcrypt hash
  of the default password rather than plaintext, so even a brand-new install starts hashed.

**Verification:** `npx tsc --noEmit` was run after all changes — zero new type errors were
introduced (the same 18 pre-existing, unrelated errors from the initial audit are still present in
untouched files like `checkout/page.tsx` and `admin/portfolio/page.tsx`; none appear in any file
touched by this fix).

---

## ✅ What Is Working Perfectly

### Frontend ↔ Backend connectivity
- **`context/LanguageContext.tsx`** is the real data backbone: on mount (and every ~10s, plus on a
  `cms-updated` event) it fetches `/api/content`, `/api/promo`, `/api/design`, `/api/services`,
  `/api/portfolio`, `/api/packages` in parallel and exposes the merged result to every client
  component via `useLanguage()`.
- **Homepage, Services, Portfolio, Service Details, Header, Footer, PromoBar** all render live
  data from that context — services/portfolio/packages grids map directly over CMS arrays.
- **Admin dashboard** (`app/admin/(protected)/page.tsx`) shows real, live-computed stats
  (active services count, total/new leads, media count) pulled from `/api/services`,
  `/api/contact`, `/api/media` — not hardcoded numbers.
- **Leads pipeline**: public Contact form → `POST /api/contact` → `db.leads` → Admin **Leads**
  page (list, mark read/archived, delete) — full round trip confirmed.
- **Media uploads**: Design logo upload, Portfolio images, Service images all POST to
  `/api/media`, which writes to `public/uploads/` (with a graceful base64 fallback if the
  filesystem is read-only) and returns a URL that's immediately usable.

### Admin panel
- **All 14 sidebar links** (`components/AdminSidebar.tsx`) resolve to a real page file — no dead
  navigation entries: Overview, Leads, Account, Content (Home Page), Portfolio, Packages,
  Services, Promo Bar, SEO, SQL Database, Firebase Auth, Payments, Design & Theme, Settings.
- **Real server-side auth guard**: `app/admin/(protected)/layout.tsx` is a server component that
  calls `getServerSession(authOptions)` and `redirect()`s to `/admin/login` before any protected
  markup is ever sent — this is a proper guard, not a client-side flash-then-redirect.
- **Design & Theme page**: Light/Dark mode-aware color tokens, per-token enable/disable toggles,
  logo upload with transparency preview — confirmed fully wired to live CSS custom properties via
  `components/ThemeColorApplier.tsx` (see Appendix below for the related dark-mode CSS fix).
- **Promo Bar, Content (Hero/Contact/Footer tabs), Packages, Portfolio, Services, Settings
  (nav/contact-info/site-settings)** — every one of these confirmed to fetch on load, PUT/POST on
  save, show a success toast, and have their saved data actually consumed by the live public site.
- **Account page** correctly omits the password field from its GET response.

### Data layer
- `lib/store.ts`'s `getDb()`/`saveDb()` provides a consistent, in-memory-cached read/write layer
  used identically by all 16 API route files — no route reinvents its own storage logic.
- Most collection routes (`services`, `portfolio`, `packages`, `seo`) support **both** bulk-array
  replace and single-record upsert-by-id, which is a thoughtful, flexible API design.

---

## ⚠️ Partial Connections / Hardcoded Gaps

These are places where a CMS path exists in principle but the actual wiring is incomplete, or where a
hardcoded fallback is used and is unlikely to cause real problems, but should be tracked:

| Location | Issue |
|---|---|
| `app/(site)/page.tsx` — "Metrics Section" (4.2x ROAS, 420% ROI, <14d) | 100% hardcoded JSX, no CMS field, no admin control at all |
| `app/(site)/about/page.tsx` — "Our Values" list (4 value cards) | Text exists only in `lib/dictionary/*.ts`; not in `ContentData`, not merged by `LanguageContext`, no admin field — permanently static |
| `app/admin/(protected)/content/page.tsx` — About tab | Schema (`approachTitleEn/No`, `approachP2En/No`) and CMS-merge logic exist and real data is in `db.json`, but **no input fields exist to edit them** — effectively uneditable despite being "CMS-driven" at the data layer |
| `app/(site)/services/page.tsx` — `defaultServices` fallback | Only used when the CMS services array is empty; hardcoded USD prices that bypass `formatPrice()`/NOK formatting (inconsistent with the rest of the app if it ever renders) |
| `app/(site)/contact/page.tsx` — `serviceOptions` dropdown | Static 5-item list per language; does not reflect the real, admin-editable Services list and will drift over time |
| `app/(site)/contact/page.tsx` | Never renders `contactInfo` (phone/email/address) even though that data is admin-editable and already rendered correctly in the Footer — the one page that most needs it doesn't show it |
| Pill badges: "Nordic Digital Growth" (About), "Connect With Us" (Contact) | Raw hardcoded English strings, ignore the language toggle entirely |
| `app/(site)/service-details/[id]/page.tsx` — "Key Features" / "Investment" labels | English-only, no Norwegian variant, inconsistent with every other string on the same page |
| `lib/dictionary/en.ts` / `no.ts` | ~50 total text fields; only ~14 have any CMS override path. The rest (contact form labels, checkout labels, package toggle labels, footer tagline, etc.) are permanent hardcodes by design — reasonable for UI chrome, but worth knowing this is the reality when a client asks "can I change X text?" |
| `app/(site)/checkout/page.tsx` — VAT | Hardcoded at a flat 25% (Norwegian MVA), no admin field |
| `app/(site)/service-details/[id]/page.tsx` | Missing null/empty guard before `.map()`-ing `features` (the sibling non-`[id]` page has this guard) — will throw if an admin saves a service with empty features |
| `app/api/services/route.ts` POST | `order: db.services.length + 1` can produce duplicate order values after any deletion (not a stable max+1) |
| `app/api/portfolio/route.ts` / `packages/route.ts` PUT | Single-item update silently no-ops (`success:true`, nothing changed) if the given `id` doesn't match anything — should be a 404 |

---

## ❌ Broken or Missing Connections

### 1. SEO Admin Panel — has zero effect on the live site (confirmed)
`app/admin/(protected)/seo/page.tsx` fetches/saves real data to `db.seo` via `/api/seo` — the save
button genuinely works and data really persists. **But nothing in the app ever reads it.**
- `app/layout.tsx` contains the **only** `metadata` export in the entire codebase — one static,
  hardcoded title/description for every single page and locale.
- Grep confirms **zero** occurrences of `generateMetadata` anywhere in `app/(site)`.
- Every `app/(site)/**/page.tsx` is a `'use client'` component, which **cannot** export
  `generateMetadata`/`metadata` under Next.js's rules — this isn't a missing line of code, it's an
  architectural mismatch that needs a real refactor to fix (see Recommended Fixes).
- The same dead-field pattern exists on **each Service's** `metaTitle`/`metaDescription` fields in
  the Services admin — collected, saved, never read.
- **Net effect:** an admin can fill in per-page titles, descriptions, canonical URLs, and OG tags,
  save successfully, and nothing will ever change on the actual rendered page `<head>`.

### ~~2. Critical: the entire API write-surface has no server-side authorization check~~ — ✅ RESOLVED
~~The admin pages are protected by a real server-side session guard — but the underlying API
routes they call are not.~~ **Fixed — see "🔒 Security Fixes Applied" above.** Every mutating route
now requires a valid admin session, with one correct, intentional exception (`POST /api/contact`,
the public form/checkout lead submission).

### ~~3. Hardcoded credential backdoor in the login logic~~ — ✅ RESOLVED
~~`lib/auth.ts`'s `authorize()` accepted the literal strings `admin@moldeweb.no`/`admin` as a valid
login regardless of what was actually stored in `db.account`.~~ **Fixed — see "🔒 Security Fixes
Applied" above.** The hardcoded bypass has been removed; login now validates only against the real
stored account, with passwords hashed via bcrypt.

### 4. Payments — no real payment gateway anywhere
`app/api/payments/route.ts` only stores `{ gateway, apiKey, isTestMode }`. There is no Stripe,
PayPal, or any payment SDK installed (`package.json` confirmed to have none), no checkout-session
creation, no webhook handler, no charge logic anywhere in the repo.
- `app/(site)/checkout/page.tsx` collects card number/expiry/CVC into React state but **never
  sends them anywhere** — not to `/api/payments`, not to any gateway.
- `handlePay()` posts a fabricated "order" to `/api/contact` (as a lead), waits on a hardcoded
  `setTimeout(1200ms)`, generates a random `ORD-XXXXXX` reference, and shows an **unconditional**
  "Payment Successful!" screen — no money ever moves, and the outcome is faked regardless of any
  input.

### 5. SQL Database Integration — no real database connection
`app/api/database/route.ts` and the admin Database page only read/write a settings object
(`host`, `port`, `database`, `user`, `password`, `connectionString`, etc.). There is no `pg`,
`mysql2`, or any DB driver installed or imported anywhere. "Test Connection" in the admin UI is a
client-side `setTimeout` simulation, not a real network call. The app's actual data store remains
`data/db.json` regardless of what's configured here.

### 6. Firebase Auth Integration — fully disconnected, and duplicated inconsistently
The Firebase Auth admin page saves settings to `db.firebaseAuthSettings` via `/api/firebase-auth`,
but **no other file in the repo reads that data**. Separately, `app/admin/login/page.tsx` embeds
its own **hardcoded, unrelated** Firebase config directly in an inline `<Script>` tag (a real
project ID and API key checked into source), used only to initialize Firebase **Analytics** — not
authentication, and not connected to whatever an admin enters on the Firebase Auth settings page.
This is confusing and misleading: two independent "Firebase configs" exist in the codebase, one
that does nothing (the admin-editable one) and one hardcoded into the login page for an unrelated
purpose.

### 7. Contact form does not send an email or notification anywhere
From a visitor's point of view, submitting the Contact form looks identical to "emailing the
agency." In reality, `POST /api/contact` only appends the submission to `db.leads`, visible in the
admin Leads page. No email, SMS, or webhook integration exists (`package.json` has no
nodemailer/SendGrid/Resend/etc.). If nobody checks the admin panel, the message is never seen.

---

## 🛠️ Recommended Fixes (Prioritized)

### P0 — Critical, fix before any public/production exposure
1. ~~**Add a server-side auth check to every mutating API route**~~ — ✅ **DONE.** Shared
   `requireAdminSession()` helper (`lib/api-auth.ts`) now guards every `POST`/`PUT`/`DELETE`
   handler across all 16 route files (public `POST /api/contact` intentionally excluded — see
   above).
2. ~~**Remove the hardcoded `admin`/`admin` bypass**~~ — ✅ **DONE.** `lib/auth.ts` now
   authenticates solely against `db.account`.
3. ~~**Hash passwords**~~ — ✅ **DONE.** `bcryptjs` added; passwords hashed on save in
   `app/api/account/route.ts`, verified via bcrypt-aware comparison in `lib/auth.ts`, with a safe
   one-time migration path for any pre-existing plaintext password.
4. **Fail the build/boot if `NEXTAUTH_SECRET` is missing** in production rather than silently
   falling back to the hardcoded string baked into `next.config.ts`. *(Still open — not part of
   this update.)*

### P1 — High priority, integration honesty & completeness
5. **SEO admin panel**: either (a) do the real work — convert the relevant pages to Server
   Components (or wrap them in a server-rendered parent layout) and implement `generateMetadata`
   reading from `/api/seo`/`db.seo`, or (b) if that's too large a refactor right now, clearly label
   the SEO page in the UI as "not yet connected to page output" so nobody wastes time on it
   believing it works.
6. **Payments**: either implement a real gateway (Stripe Checkout is the fastest path) or visibly
   label the checkout flow as a demo/simulation so it can't be mistaken for processing real orders.
7. **Database Integration**: either wire a real driver behind these settings (and migrate
   `lib/store.ts` off the JSON file — see the persistence risk already documented in
   `vercel-deploy.md` regarding Vercel's read-only filesystem) or relabel the page as a
   roadmap/future feature.
8. **Firebase Auth**: connect the admin-saved settings to an actual `lib/firebase.ts` used by a
   real auth flow, or remove/relabel the page; also remove the unrelated hardcoded Firebase
   Analytics script from the login page or explain why it's separate.
9. **Contact form**: wire a real notification (transactional email via Resend/SendGrid, or at
   minimum a Slack/Discord webhook) so submissions don't rely on someone remembering to check the
   admin Leads page.

### P2 — Medium priority, data integrity & content gaps
10. Add the missing About-tab admin inputs for `approachTitleEn/No` and `approachP2En/No` (data
    and CMS-merge already exist — this is a one-page form fix).
11. Fix the silent no-op in `portfolio`/`packages` PUT (return 404 when `id` isn't found).
12. Fix `services` POST's order assignment to `Math.max(...orders, 0) + 1` instead of
    `length + 1`.
13. Add a null/empty guard before `.map()`-ing `features` in
    `app/(site)/service-details/[id]/page.tsx` (matches the guard already present on the sibling
    non-dynamic page).
14. Normalize `export const dynamic = 'force-dynamic'` across the few routes missing it
    (`contact`, `media`, `seo`, `services/[id]`) for consistency with the other 12 routes.

### P3 — Low priority, polish
15. Localize the remaining English-only strings ("Key Features", "Investment", pill badges) or
    consciously document them as static UI chrome that isn't meant to be translated.
16. Make the checkout VAT rate an admin-configurable field if invoicing is ever meant to be real.
17. Redact `password`/`apiKey`/`connectionString` fields from `GET` responses on the
    `database`/`payments`/`firebase-auth` routes, matching the pattern already used correctly on
    `account`.
18. Wire the Contact page to render `contactInfo` (phone/email/address) alongside the form, since
    that data already exists and is only currently shown in the Footer.

### Residual item surfaced by the P0 security fix (not yet addressed)
19. `GET /api/contact` still returns the full lead list — names, emails, messages — to any
    unauthenticated caller. This round's fix was explicitly scoped to `POST`/`PUT`/`DELETE`, so this
    GET was intentionally left untouched; recommend adding the same `requireAdminSession()` guard
    here as a fast follow-up, since it's the one remaining PII exposure of note.

---

## Appendix — Previously Resolved Issue

## 🌓 Theme Toggling (Light / Dark Mode) Audit

**Status:** ✅ Fixed and verified (see below). Kept here for historical record.

**Root cause:** A `@keyframes marquee { ... }` block was invalidly nested inside the
`[data-theme="dark"] { ... }` selector in `app/globals.css`. `@keyframes` cannot be nested inside a
plain selector — browsers parsing the unminified dev CSS tolerated it, but Tailwind v4's
production minifier (Lightning CSS) discarded the **entire enclosing rule**, silently dropping
every dark-mode color variable from the production CSS bundle. This reproduced reliably on a real
`next build` (confirmed by grepping the compiled CSS for the missing dark hex values) and explains
why Dark Mode worked in `next dev` but not on Vercel.

**Fix:** Moved `@keyframes marquee` to the stylesheet root and relocated `--animate-marquee` into
the `@theme { ... }` block. Re-verified with a fresh production build — the full dark-mode variable
block now survives minification intact.

**Current status:** Working correctly in both development and production builds.
