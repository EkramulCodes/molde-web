import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { InvoiceTemplate } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const db = getDb();
  return NextResponse.json(db.invoiceTemplates || []);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();
    if (!db.invoiceTemplates) db.invoiceTemplates = [];

    const makeDefault = db.invoiceTemplates.length === 0 || !!body.isDefault;

    const newTemplate: InvoiceTemplate = {
      id: `invtpl-${Date.now()}`,
      name: body.name || 'New Invoice Template',
      isDefault: makeDefault,
      companyName: body.companyName || 'Your Company',
      companyAddress: body.companyAddress || '',
      companyEmail: body.companyEmail || '',
      companyPhone: body.companyPhone || '',
      taxIdLabel: body.taxIdLabel || 'Tax ID',
      taxIdValue: body.taxIdValue || '',
      logoUrl: body.logoUrl || '',
      accentColor: body.accentColor || '#14B8A6',
      invoiceNumberPrefix: body.invoiceNumberPrefix || 'INV-',
      nextInvoiceNumber: Number(body.nextInvoiceNumber) || 1001,
      taxLabel: body.taxLabel || 'VAT (25%)',
      taxRate: Number.isFinite(Number(body.taxRate)) ? Number(body.taxRate) : 25,
      footerNote: body.footerNote || '',
      termsText: body.termsText || '',
    };

    if (makeDefault) {
      db.invoiceTemplates = db.invoiceTemplates.map((t) => ({ ...t, isDefault: false }));
    }
    db.invoiceTemplates.push(newTemplate);
    saveDb(db);

    return NextResponse.json({ success: true, data: newTemplate });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create invoice template' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const db = getDb();
    if (!db.invoiceTemplates) db.invoiceTemplates = [];

    const index = db.invoiceTemplates.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Invoice template not found' }, { status: 404 });
    }

    if (updates.isDefault === true) {
      db.invoiceTemplates = db.invoiceTemplates.map((t) => ({ ...t, isDefault: false }));
    }

    const current = db.invoiceTemplates.findIndex((t) => t.id === id);
    db.invoiceTemplates[current] = { ...db.invoiceTemplates[current], ...updates, id };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.invoiceTemplates[current] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update invoice template' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing template id' }, { status: 400 });
    }

    const db = getDb();
    if (!db.invoiceTemplates) db.invoiceTemplates = [];

    if (db.invoiceTemplates.length <= 1) {
      return NextResponse.json({ success: false, error: 'At least one invoice template must remain.' }, { status: 400 });
    }

    const wasDefault = db.invoiceTemplates.find((t) => t.id === id)?.isDefault;
    db.invoiceTemplates = db.invoiceTemplates.filter((t) => t.id !== id);

    if (wasDefault && db.invoiceTemplates.length > 0) {
      db.invoiceTemplates[0].isDefault = true;
    }

    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete invoice template' }, { status: 400 });
  }
}
