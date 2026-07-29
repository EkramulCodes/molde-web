import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const service = db.services.find((s) => s.id === id || s.slug === id);
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  }
  return NextResponse.json(service);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const index = db.services.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    db.services[index] = { ...db.services[index], ...body };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.services[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const db = getDb();
    db.services = db.services.filter((s) => s.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 400 });
  }
}
