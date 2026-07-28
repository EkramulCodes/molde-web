import { NextResponse } from 'next/server';
import { getDb, saveDb, PackageItem } from '@/lib/store';
import { requireAdmin } from '@/lib/apiAuth';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value.split(/\r?\n|,/).map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

export async function GET() {
  const db = getDb();
  const sorted = [...db.packages].sort((a, b) => (a.order || 0) - (b.order || 0));
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const db = getDb();

    const newId = body.id || `pkg-${Date.now()}`;
    const newItem: PackageItem = {
      id: newId,
      slug: body.slug || newId,
      nameEn: body.nameEn || 'New Package',
      nameNo: body.nameNo || 'Ny Pakke',
      taglineEn: body.taglineEn || '',
      taglineNo: body.taglineNo || '',
      price: body.price || '',
      periodEn: body.periodEn || 'one-time',
      periodNo: body.periodNo || 'engangs',
      featuresEn: toStringArray(body.featuresEn),
      featuresNo: toStringArray(body.featuresNo),
      badgeEn: body.badgeEn || '',
      badgeNo: body.badgeNo || '',
      ctaLabelEn: body.ctaLabelEn || 'Get Started',
      ctaLabelNo: body.ctaLabelNo || 'Kom i gang',
      ctaLink: body.ctaLink || '/contact',
      highlighted: Boolean(body.highlighted),
      status: body.status === 'hidden' ? 'hidden' : 'active',
      order: db.packages.length + 1,
    };

    db.packages.push(newItem);
    saveDb(db);

    return NextResponse.json({ success: true, data: newItem });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create package' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const db = getDb();

    // Array payload = bulk reorder
    if (Array.isArray(body)) {
      db.packages = body;
      saveDb(db);
      return NextResponse.json({ success: true, data: db.packages });
    }

    const index = db.packages.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    db.packages[index] = { ...db.packages[index], ...body };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.packages[index] });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update package' }, { status: 400 });
  }
}
