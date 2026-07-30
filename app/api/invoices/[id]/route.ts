import { NextResponse } from 'next/server';
import { getDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { renderInvoiceHtml } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

// Returns the rendered invoice as a standalone HTML document — used by the
// admin "Download PDF" button, opened directly in a new tab. It auto-triggers
// the browser's native Print dialog (defaults to Save as PDF on virtually
// every OS/browser), plus a manual "Download PDF" button as a fallback in
// case the auto-print is blocked — no PDF-generation dependency needed.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const db = getDb();
  const invoice = (db.invoices || []).find((inv) => inv.id === id);

  if (!invoice) {
    return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
  }

  const html = renderInvoiceHtml(invoice, { autoPrint: true });
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
