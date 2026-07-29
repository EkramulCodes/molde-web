import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ThemeColorApplier } from '../components/ThemeColorApplier';
import { ToastProvider } from '../context/ToastContext';
import { BookingModalProvider } from '../context/BookingModalContext';
import { BookingModal } from '../components/booking/BookingModal';

export const metadata: Metadata = {
  title: 'MoldeWeb - Web Development & Digital Marketing',
  description: 'MoldeWeb - A Norway-based agency specializing in Website Development, Digital Marketing, Facebook Ads, and Google Ads.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <BookingModalProvider>
                <ThemeColorApplier />
                {children}
                <BookingModal />
              </BookingModalProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
