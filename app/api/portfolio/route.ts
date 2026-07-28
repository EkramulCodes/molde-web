import { NextResponse } from 'next/server';
import { getDb, saveDb, PortfolioItem } from '@/lib/store';
import { requireAdmin } from '@/lib/apiAuth';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  return [];
}

export async function GET() {
  const db = getDb();
  const sorted = [...db.portfolio].sort((a, b) => (a.order || 0) - (b.order || 0));
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const db = getDb();

    const newId = body.id || `pf-${Date.now()}`;
    const newItem: PortfolioItem = {
      id: newId,
      slug: body.slug || newId,
      titleEn: body.titleEn || 'New Project',
      titleNo: body.titleNo || 'Nytt Prosjekt',
      clientName: body.clientName || '',
      categoryEn: body.categoryEn || '',
      categoryNo: body.categoryNo || '',
      descriptionEn: body.descriptionEn || '',
      descriptionNo: body.descriptionNo || '',
      imageUrl: body.imageUrl || '',
      projectUrl: body.projectUrl || '',
      year: body.year || String(new Date().getFullYear()),
      tags: toStringArray(body.tags),
      resultsEn: toStringArray(body.resultsEn),
      resultsNo: toStringArray(body.resultsNo),
      featured: Boolean(body.featured),
      status: body.status === 'hidden' ? 'hidden' : 'active',
      order: db.portfolio.length + 1,
    };

    db.portfolio.push(newItem);
    saveDb(db);

    return NextResponse.json({ success: true, data: newItem });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create portfolio item' }, { status: 400 });
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
      db.portfolio = body;
      saveDb(db);
      return NextResponse.json({ success: true, data: db.portfolio });
    }

    const index = db.portfolio.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Portfolio item not found' }, { status: 404 });
    }

    db.portfolio[index] = { ...db.portfolio[index], ...body };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.portfolio[index] });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update portfolio item' }, { status: 400 });
  }
}
