import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, saveDb, DEFAULT_ADMIN_PASSWORD_HASH } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const account = db.account || {
    email: 'admin@moldeweb.no',
    username: 'admin',
    password: DEFAULT_ADMIN_PASSWORD_HASH,
    updatedAt: new Date().toISOString()
  };

  return NextResponse.json({
    email: account.email,
    username: account.username,
    updatedAt: account.updatedAt
  });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();

    if (!db.account) {
      db.account = {
        email: 'admin@moldeweb.no',
        username: 'admin',
        password: DEFAULT_ADMIN_PASSWORD_HASH,
        updatedAt: new Date().toISOString()
      };
    }

    if (body.username && body.username.trim()) {
      db.account.username = body.username.trim();
    }

    if (body.email && body.email.trim()) {
      db.account.email = body.email.trim();
    }

    if (body.password && body.password.trim()) {
      db.account.password = await bcrypt.hash(body.password.trim(), 10);
    }

    db.account.updatedAt = new Date().toISOString();

    saveDb(db);

    return NextResponse.json({
      success: true,
      message: 'Account credentials updated successfully',
      account: {
        email: db.account.email,
        username: db.account.username,
        updatedAt: db.account.updatedAt
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update account' }, { status: 400 });
  }
}
