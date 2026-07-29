# Project Roadmap: MoldeWeb Digital Agency

This document outlines the remaining tasks and improvements needed to make the MoldeWeb digital agency website production-ready. It covers frontend, backend, security, and deployment steps.


## 1. Backend & Database Persistence
Currently, the dynamic content (Promo bar data and Homepage text content) is handled via Next.js API routes (`/api/content` and `/api/promo`) but uses **in-memory variables**. This means any changes made in the Admin panel will be lost when the server restarts.
- **Task:** Integrate a real database (e.g., PostgreSQL via Cloud SQL, or Firebase Firestore).
- **Task:** Update the GET and PUT methods in the API routes to read from and write to the database.
- **Task:** Create schemas/models for `Content` and `Promo`.

## 2. Authentication & Security
The Admin panel (`/admin`) is protected by NextAuth, but it currently uses hardcoded credentials.
- **Task:** Move the admin credentials to environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) or, preferably, hash the password and store it in the database.
- **Task:** Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are properly set in your production environment variables.
- **Task:** Review the secure cookie configuration in `lib/auth.ts` to ensure it works seamlessly across your specific production domain.

## 3. Contact Form Integration
The contact form on the `/contact` page currently simulates a successful submission but does not actually send the message anywhere.
- **Task:** Create a new API route (e.g., `/api/contact`) to handle form submissions.
- **Task:** Integrate an email service provider (like Resend, SendGrid, or Nodemailer) to send the contact details to your agency's email address.
- **Task:** Optionally, save contact submissions to your database as "Leads" so they can be viewed in the Admin panel.

## 4. Frontend & Design
The "Professional Polish" design theme has been applied to the primary pages, but the site may need further expansion.
- **Task:** Build out the **Case Studies (Casestudier)** page and individual case study dynamic routes (`/case-studies/[slug]`).
- **Task:** Ensure all responsive breakpoints (mobile, tablet, desktop) are thoroughly tested, especially for complex layouts like the Services grid and the Hero section.
- **Task:** Review the `LanguageContext` (i18n). Currently, it uses static translations. If you plan to manage translations from the Admin panel, update the context to fetch dictionary data from your API.

## 5. Admin Panel Expansion
The `/admin` dashboard currently manages the promo bar and basic hero content.
- **Task:** Add a "Leads" or "Messages" tab to view contact form submissions.
- **Task:** Add a "Case Studies" CMS to allow the admin to create, edit, and delete portfolio items without touching the code.
- **Task:** Add SEO metadata management to the admin panel so you can update page titles and descriptions dynamically.

## 6. SEO & Performance (Production Readiness)
To ensure the agency ranks well on search engines and performs optimally:
- **Task:** Implement dynamic SEO meta tags using Next.js Metadata API in `layout.tsx` and `page.tsx` files.
- **Task:** Add a `sitemap.xml` and `robots.txt` generator.
- **Task:** Integrate analytics (e.g., Google Analytics 4 or Plausible) to track visitor behavior and conversion rates.
- **Task:** Run Lighthouse audits to ensure accessibility, performance, and best practices score in the 90s.

## 7. Deployment
- **Task:** Set up your hosting environment (e.g., Google Cloud Run, Vercel, etc.).
- **Task:** Add all necessary environment variables to your hosting provider:
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - Database connection strings
  - Email provider API keys
- **Task:** Connect a custom domain (e.g., `moldeweb.no`) and enforce HTTPS.
