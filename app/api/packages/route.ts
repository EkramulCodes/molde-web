import { NextResponse } from 'next/server';
import { getDb, saveDb, PackageItem } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const sorted = [...(db.packages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  return NextResponse.json({
    packages: sorted,
    settings: db.packageSettings
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    if (!db.packages) db.packages = [];

    const newId = body.id || `pkg-${Date.now()}`;
    const newItem: PackageItem = {
      id: newId,
      nameEn: body.nameEn || 'New Package',
      nameNo: body.nameNo || 'Ny Pakke',
      priceMonthly: body.priceMonthly || 0,
      priceYearly: body.priceYearly || 0,
      yearlyDiscountEn: body.yearlyDiscountEn || 'Save 17%',
      yearlyDiscountNo: body.yearlyDiscountNo || 'Spar 17%',
      durationEn: body.durationEn || 'per month',
      durationNo: body.durationNo || 'per måned',
      featuresEn: body.featuresEn || [],
      featuresNo: body.featuresNo || [],
      isPopular: body.isPopular || false,
      order: db.packages.length + 1,
    };

    db.packages.push(newItem);
    saveDb(db);

    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create package' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    // Handle global settings update
    if (body.settings) {
      db.packageSettings = { ...db.packageSettings, ...body.settings };
      if (!body.package) {
        saveDb(db);
        return NextResponse.json({ success: true, settings: db.packageSettings });
      }
    }

    // Handle single package update
    if (body.package) {
      const index = db.packages.findIndex((s) => s.id === body.package.id);
      if (index !== -1) {
        db.packages[index] = { ...db.packages[index], ...body.package };
      }
    } else if (Array.isArray(body)) {
      db.packages = body;
    }

    saveDb(db);
    return NextResponse.json({ success: true, packages: db.packages, settings: db.packageSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update packages' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    const db = getDb();
    db.packages = db.packages.filter(item => item.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
