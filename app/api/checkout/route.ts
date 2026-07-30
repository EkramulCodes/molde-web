import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { sendAdminNotification, sendInvoiceEmail } from '@/lib/mailer';
import { saveNewInvoiceForOrder, recordInvoiceEmailResult } from '@/lib/invoice';
import { OrderItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const db = getDb();
  return NextResponse.json(db.orders || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, itemType, itemId, itemLabel, billingCycle, amount, subtotal, currency, paymentGateway } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'A valid full name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }
    if (!itemLabel || typeof itemLabel !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing order item details' }, { status: 400 });
    }

    const db = getDb();
    if (!db.orders) db.orders = [];

    const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
    const numericSubtotal = typeof subtotal === 'number' ? subtotal : parseFloat(subtotal);

    const newOrder: OrderItem = {
      id: `order-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      company: company && typeof company === 'string' ? company.trim() : undefined,
      itemType: itemType === 'service' ? 'service' : 'package',
      itemId: itemId || '',
      itemLabel,
      billingCycle: billingCycle === 'yearly' ? 'yearly' : billingCycle === 'monthly' ? 'monthly' : undefined,
      subtotal: Number.isFinite(numericSubtotal) ? numericSubtotal : undefined,
      amount: Number.isFinite(numericAmount) ? numericAmount : 0,
      currency: currency === 'USD' ? 'USD' : 'NOK',
      paymentGateway: paymentGateway || 'standard',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDb(db);

    const invoice = saveNewInvoiceForOrder(newOrder);

    const amountLabel = `${newOrder.amount.toLocaleString()} ${newOrder.currency}`;
    const adminEmailData = {
      name: newOrder.name,
      email: newOrder.email,
      company: newOrder.company,
      itemLabel: newOrder.itemLabel,
      billingCycle: newOrder.billingCycle,
      amount: amountLabel,
      paymentGateway: newOrder.paymentGateway,
    };

    try {
      const [, invoiceEmailResult] = await Promise.all([
        sendAdminNotification('purchase', adminEmailData),
        invoice ? sendInvoiceEmail(newOrder.email, invoice) : Promise.resolve(null),
      ]);
      if (invoice && invoiceEmailResult) {
        recordInvoiceEmailResult(invoice.id, invoiceEmailResult);
      }
    } catch {
      // sendAdminNotification/sendInvoiceEmail already catch their own errors
      // internally; this is just an extra safety net so a mail failure never
      // fails the checkout response.
    }

    return NextResponse.json({ success: true, data: newOrder, invoice });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit order' }, { status: 400 });
  }
}
