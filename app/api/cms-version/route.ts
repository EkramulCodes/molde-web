import { NextResponse } from 'next/server';
import { getCmsVersion } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ version: getCmsVersion() });
}
