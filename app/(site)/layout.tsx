import { PromoBar } from '../../components/PromoBar';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { CmsVersionPoller } from '../../components/CmsVersionPoller';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CmsVersionPoller />
      <PromoBar />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
