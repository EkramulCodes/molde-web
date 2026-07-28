import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const item = db.packages.find((p) => p.id === id || p.slug === id);
  if (!item) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 });
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
    const index = db.packages.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    db.packages[index] = { ...db.packages[index], ...body, id };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.packages[index] });
  } catch {
    return NextResponse.json({ error: 'Failed to update package' }, { status: 400 });
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
    db.packages = db.packages.filter((p) => p.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Package deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 400 });
  }
}
