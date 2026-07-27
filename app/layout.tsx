import type { Metadata } from 'next';
import { Space_Grotesk, Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-public-sans' });
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--font-ibm-plex-mono' });

export const metadata: Metadata = {
  title: 'MoldeWeb - Web Development & Digital Marketing',
  description: 'MoldeWeb - A Norway-based agency specializing in Website Development, Digital Marketing, Facebook Ads, and Google Ads.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${publicSans.variable} ${ibmPlexMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
