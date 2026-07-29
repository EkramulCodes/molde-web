import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

// Public: the booking modal's date/time picker needs this to render available
// slots. Optionally pass ?date=YYYY-MM-DD to also get that day's taken slots.
export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let takenSlots: string[] = [];
  if (date) {
    takenSlots = (db.bookings || [])
      .filter((b) => b.date === date && b.status !== 'cancelled')
      .map((b) => b.time);
  }

  return NextResponse.json({ schedule: db.bookingSchedule, takenSlots });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const db = getDb();
    db.bookingSchedule = { ...db.bookingSchedule, ...body };
    saveDb(db);
    return NextResponse.json({ success: true, data: db.bookingSchedule });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update booking schedule' }, { status: 400 });
  }
}
