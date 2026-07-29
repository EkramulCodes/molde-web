import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const db = getDb();
  return NextResponse.json(db.invoices || []);
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing invoice id' }, { status: 400 });
    }

    const db = getDb();
    if (!db.invoices) db.invoices = [];
    db.invoices = db.invoices.filter((inv) => inv.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete invoice' }, { status: 400 });
  }
}
