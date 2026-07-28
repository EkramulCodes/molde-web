import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const settings = db.firebaseAuthSettings || {
    enabled: false,
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    enableEmailAuth: true,
    enableGoogleAuth: false
  };

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    db.firebaseAuthSettings = {
      ...db.firebaseAuthSettings,
      ...body
    };

    saveDb(db);

    return NextResponse.json({ success: true, settings: db.firebaseAuthSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update Firebase Auth settings' }, { status: 400 });
  }
}
