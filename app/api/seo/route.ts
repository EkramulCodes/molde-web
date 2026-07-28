import { NextResponse } from 'next/server';
import { getDb, saveDb, SeoItem } from '@/lib/store';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.seo);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (Array.isArray(body)) {
      db.seo = body;
    } else if (body.pagePath) {
      const index = db.seo.findIndex((s) => s.pagePath === body.pagePath);
      if (index !== -1) {
        db.seo[index] = { ...db.seo[index], ...body };
      } else {
        db.seo.push(body as SeoItem);
      }
    }

    saveDb(db);
    return NextResponse.json({ success: true, data: db.seo });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update SEO settings' }, { status: 400 });
  }
}
