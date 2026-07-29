import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

/**
 * Guards a mutating API route handler. Call at the top of every admin-only
 * POST/PUT/DELETE handler and return its result immediately if non-null.
 *
 * Not for GET handlers that serve public site content, and not for the
 * visitor-facing POST /api/contact (anonymous lead submission is intentional).
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
