import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Public: <CtaButton> instances across the site need this to decide behavior.
// Contains no secrets.
export async function GET() {
  const db = getDb();
  return NextResponse.json(db.ctaButtons || []);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Expected an array of CTA button configs' }, { status: 400 });
    }
    const db = getDb();
    db.ctaButtons = body;
    saveDb(db);
    return NextResponse.json({ success: true, data: db.ctaButtons });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update CTA settings' }, { status: 400 });
  }
}
