import { NextResponse } from 'next/server';
import { getDb, saveDb, ServiceItem } from '@/lib/store';

export async function GET() {
  const db = getDb();
  // Sort by order ascending
  const sorted = [...db.services].sort((a, b) => (a.order || 0) - (b.order || 0));
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const newId = body.id || `svc-${Date.now()}`;
    const newService: ServiceItem = {
      id: newId,
      slug: body.slug || newId,
      icon: body.icon || 'FiMonitor',
      imageUrl: body.imageUrl || '',
      titleEn: body.titleEn || 'New Service',
      titleNo: body.titleNo || 'Ny Tjeneste',
      descriptionEn: body.descriptionEn || '',
      descriptionNo: body.descriptionNo || '',
      featuresEn: body.featuresEn || [],
      featuresNo: body.featuresNo || [],
      price: body.price || '',
      status: body.status || 'active',
      order: db.services.length + 1,
      metaTitle: body.metaTitle || '',
      metaDescription: body.metaDescription || '',
      ogImage: body.ogImage || '',
    };

    db.services.push(newService);
    saveDb(db);

    return NextResponse.json({ success: true, data: newService });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create service' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (Array.isArray(body)) {
      // Mass order update
      db.services = body;
      saveDb(db);
      return NextResponse.json({ success: true, data: db.services });
    }

    const index = db.services.findIndex((s) => s.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    db.services[index] = { ...db.services[index], ...body };
    saveDb(db);

    return NextResponse.json({ success: true, data: db.services[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update service' }, { status: 400 });
  }
}
