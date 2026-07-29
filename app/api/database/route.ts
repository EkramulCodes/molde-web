import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const settings = db.databaseSettings || {
    enabled: false,
    provider: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: 'moldeweb_db',
    user: 'postgres',
    password: '',
    ssl: true,
    connectionString: 'postgresql://postgres:password@localhost:5432/moldeweb_db'
  };

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();

    db.databaseSettings = {
      ...db.databaseSettings,
      ...body
    };

    saveDb(db);

    return NextResponse.json({ success: true, settings: db.databaseSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update database settings' }, { status: 400 });
  }
}
