import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.content);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    db.content = { ...db.content, ...body };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.content });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update content' }, { status: 400 });
  }
}
