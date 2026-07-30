import { NextResponse } from 'next/server';
import { getDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { sendInvoiceEmail } from '@/lib/mailer';
import { recordInvoiceEmailResult } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const db = getDb();
  const invoice = (db.invoices || []).find((inv) => inv.id === id);

  if (!invoice) {
    return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
  }

  const result = await sendInvoiceEmail(invoice.clientEmail, invoice);
  const updated = recordInvoiceEmailResult(invoice.id, result);

  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error, data: updated }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: `Invoice re-sent to ${invoice.clientEmail}`, data: updated });
}
