'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center topographic-bg">
      <div className="space-y-4 max-w-md p-8 bg-bg-deep border border-slate/10 rounded-xl shadow-lg">
        <h1 className="font-display text-7xl font-black text-teal">Error</h1>
        <h2 className="font-display text-2xl font-bold text-ink">Noe gikk galt</h2>
        <p className="text-slate text-sm font-body">
          Det oppstod en uventet feil. Vennligst prøv igjen.
        </p>
        <p className="text-slate/60 text-xs font-body">
          An unexpected error occurred. Please try again.
        </p>
        <div className="pt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-teal text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal/90 transition-colors shadow-md cursor-pointer"
          >
            Prøv igjen / Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
