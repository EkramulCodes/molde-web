import { NextResponse } from 'next/server';
import { getDb, saveDb, PortfolioItem } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const sorted = [...(db.portfolio || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  return NextResponse.json({
    portfolio: sorted,
    settings: db.portfolioSettings
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();

    if (!db.portfolio) db.portfolio = [];

    const newId = body.id || `port-${Date.now()}`;
    const newItem: PortfolioItem = {
      id: newId,
      titleEn: body.titleEn || 'New Portfolio Project',
      titleNo: body.titleNo || 'Nytt Porteføljeprosjekt',
      categoryEn: body.categoryEn || 'Uncategorized',
      categoryNo: body.categoryNo || 'Ukategorisert',
      imageUrl: body.imageUrl || '',
      dimensions: body.dimensions || '',
      descriptionEn: body.descriptionEn || '',
      descriptionNo: body.descriptionNo || '',
      link: body.link || '',
      order: db.portfolio.length + 1,
    };

    db.portfolio.push(newItem);
    saveDb(db);

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create portfolio item' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();

    // Handle global settings update
    if (body.settings) {
      db.portfolioSettings = { ...db.portfolioSettings, ...body.settings };
      if (!body.portfolio) {
        saveDb(db);
        return NextResponse.json({ success: true, settings: db.portfolioSettings });
      }
    }

    if (Array.isArray(body)) {
      db.portfolio = body;
    } else if (body.portfolio) {
       const index = db.portfolio.findIndex((s) => s.id === body.portfolio.id);
       if (index !== -1) {
         db.portfolio[index] = { ...db.portfolio[index], ...body.portfolio };
       }
    }

    saveDb(db);
    return NextResponse.json({ success: true, portfolio: db.portfolio, settings: db.portfolioSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update portfolio' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    const db = getDb();
    db.portfolio = db.portfolio.filter(item => item.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
