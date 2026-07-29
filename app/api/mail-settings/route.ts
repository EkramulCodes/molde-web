import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Admin-only in both directions: unlike other public config endpoints, this
// payload can contain provider API keys / SMTP credentials.
export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const db = getDb();
  return NextResponse.json(db.mailSettings);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();
    db.mailSettings = {
      ...db.mailSettings,
      ...body,
      alerts: { ...db.mailSettings.alerts, ...(body.alerts || {}) },
    };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.mailSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update mail settings' }, { status: 400 });
  }
}
