import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Guards write access to the CMS API routes. Returns a 401 response when the
 * caller has no admin session, or `null` when the request may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) return null;
  } catch (err) {
    console.error('Session check failed', err);
  }

  return NextResponse.json(
    { success: false, error: 'Unauthorized. Admin sign-in required.' },
    { status: 401 }
  );
}
