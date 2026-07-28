import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const item = db.portfolio.find((p) => p.id === id || p.slug === id);
  if (!item) {
    return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const index = db.portfolio.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    db.portfolio[index] = { ...db.portfolio[index], ...body, id };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.portfolio[index] });
  } catch {
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const db = getDb();
    db.portfolio = db.portfolio.filter((p) => p.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Portfolio item deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 400 });
  }
}
