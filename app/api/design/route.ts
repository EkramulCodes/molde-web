import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.design);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    db.design = { ...db.design, ...body };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.design });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update design settings' }, { status: 400 });
  }
}
