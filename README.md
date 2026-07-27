# MoldeWeb — Digital Agency Web Application

MoldeWeb is a modern, high-performance web platform for a modern digital agency offering web development, design, and digital transformation solutions. Built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, it features a fully dynamic client experience alongside a secure administrative back-office.

---

## ✨ Features

- 🇳🇴 **Bilingual Support (i18n)**: Built-in context provider offering seamless toggle between Norwegian (Norsk) and English.
- 🎨 **Responsive & Theme-Adaptive Design**: High-contrast, accessibility-focused UI supporting light and dark modes with fine-tuned typography and fluid layouts.
- 🔒 **Secure Administrative Portal**: NextAuth.js authenticated admin section (`/admin`) for content management, promotional announcements, services, and lead tracking.
- ⚡ **Dynamic Content Management**: Control hero copy, banner messaging, services offerings, and agency branding on the fly.
- 📩 **Lead & Contact Management**: Integrated inquiry forms capturing prospect messages directly into the administrative back-office.
- 🚀 **Performance Optimized**: Server Components by default, fast static asset loading, and smooth entry animations powered by `motion/react`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org)
- **UI & Components**: [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com)
- **State & Animations**: [Motion](https://motion.dev) (formerly Framer Motion), Lucide Icons
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org)
- **Language & Types**: TypeScript, PostCSS

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router routes
│   ├── (site)/           # Public-facing agency pages (Home, Services, Contact, etc.)
│   ├── admin/            # Secure admin area & authentication pages
│   ├── api/              # API routes (Auth, Content, Leads, Promo, Services)
│   ├── globals.css       # Global styles & Tailwind CSS configuration
│   └── layout.tsx        # Root application layout
├── components/           # Reusable UI components (Header, Footer, Logo, PromoBar, etc.)
├── context/              # Context providers (LanguageContext, ThemeContext)
├── hooks/                # Custom React hooks
├── lib/                  # Auth configuration & helper utility functions
├── public/               # Static assets & graphics
└── metadata.json         # Project metadata
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18.x or newer) and `npm` installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/moldeweb.git
   cd moldeweb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:

   ```env
   # NextAuth Security Secret
   NEXTAUTH_SECRET="your-secure-random-secret-key"

   # Application Base URL
   APP_URL="http://localhost:3000"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔐 Administrative Access

To access the back-office management panel, navigate to `/admin/login`.

- **Default Username**: `admin@moldeweb.no`
- **Default Password**: `admin`

*(Note: In production deployments, configure standard environment variables to secure admin authentication).*

---

## 🏗️ Available Scripts

- `npm run dev` — Starts the Next.js development server on port 3000.
- `npm run build` — Compiles the production build.
- `npm run start` — Runs the compiled Next.js production server.
- `npm run lint` — Runs ESLint code quality and syntax checks.

---

## 📄 License

This project is proprietary software developed for MoldeWeb Digital Agency. All rights reserved.
