import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center topographic-bg">
      <div className="space-y-4 max-w-md p-8 bg-bg-deep border border-slate/10 rounded-xl shadow-lg">
        <h1 className="font-display text-7xl font-black text-teal">404</h1>
        <h2 className="font-display text-2xl font-bold text-ink">Siden ble ikke funnet</h2>
        <p className="text-slate text-sm font-body">
          Siden du leter etter eksisterer ikke, eller har blitt flyttet.
        </p>
        <p className="text-slate/60 text-xs font-body">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-teal text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal/90 transition-colors shadow-md"
          >
            Gå Til Hjemmesiden / Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
