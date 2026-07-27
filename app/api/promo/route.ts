import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.promo);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    db.promo = { ...db.promo, ...body };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.promo });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update promo' }, { status: 400 });
  }
}
