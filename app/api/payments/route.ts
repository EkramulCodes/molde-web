import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.paymentSettings || { gateway: 'none', apiKey: '', isTestMode: true });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    db.paymentSettings = { ...db.paymentSettings, ...body };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.paymentSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update payment settings' }, { status: 400 });
  }
}
