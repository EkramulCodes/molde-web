import { NextResponse } from 'next/server';
import { getDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { renderInvoiceHtml } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

// Returns the rendered invoice as a standalone HTML document — used by the
// admin "View / Print Invoice" button, opened directly in a new tab so the
// browser's native Print → Save as PDF handles PDF export without a new
// dependency.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const db = getDb();
  const invoice = (db.invoices || []).find((inv) => inv.id === id);

  if (!invoice) {
    return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
  }

  const html = renderInvoiceHtml(invoice);
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
