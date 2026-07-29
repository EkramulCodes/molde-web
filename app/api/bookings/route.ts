import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { sendAdminNotification, sendClientReceipt } from '@/lib/mailer';
import { BookingItem, BookingStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const db = getDb();
  return NextResponse.json(db.bookings || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, whatsapp, contextType, contextId, contextLabel, date, time, notes } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'A valid full name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
    }
    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.replace(/\D/g, '').length < 6) {
      return NextResponse.json({ success: false, error: 'A valid WhatsApp number is required' }, { status: 400 });
    }
    if (!date || typeof date !== 'string' || !DATE_RE.test(date)) {
      return NextResponse.json({ success: false, error: 'Please select a valid date' }, { status: 400 });
    }
    if (!time || typeof time !== 'string' || !TIME_RE.test(time)) {
      return NextResponse.json({ success: false, error: 'Please select a valid time slot' }, { status: 400 });
    }

    const db = getDb();
    if (!db.bookings) db.bookings = [];

    const alreadyTaken = db.bookings.some((b) => b.date === date && b.time === time && b.status !== 'cancelled');
    if (alreadyTaken) {
      return NextResponse.json({ success: false, error: 'That time slot was just taken. Please choose another.' }, { status: 409 });
    }

    const newBooking: BookingItem = {
      id: `booking-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      contextType: contextType === 'service' || contextType === 'package' ? contextType : 'general',
      contextId: contextId || undefined,
      contextLabel: contextLabel || 'General Inquiry',
      date,
      time,
      notes: notes && typeof notes === 'string' ? notes.trim() : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.bookings.unshift(newBooking);
    saveDb(db);

    const emailData = {
      name: newBooking.name,
      email: newBooking.email,
      whatsapp: newBooking.whatsapp,
      contextLabel: newBooking.contextLabel || 'General Inquiry',
      date: newBooking.date,
      time: newBooking.time,
      notes: newBooking.notes,
    };

    await Promise.all([
      sendAdminNotification('booking', emailData),
      sendClientReceipt('booking', newBooking.email, emailData),
    ]).catch(() => {});

    return NextResponse.json({ success: true, data: newBooking });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit booking request' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: BookingStatus };

    const db = getDb();
    if (!db.bookings) db.bookings = [];

    const index = db.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    db.bookings[index].status = status;
    db.bookings[index].updatedAt = new Date().toISOString();
    saveDb(db);

    return NextResponse.json({ success: true, data: db.bookings[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing booking id' }, { status: 400 });
    }

    const db = getDb();
    if (!db.bookings) db.bookings = [];
    db.bookings = db.bookings.filter((b) => b.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 400 });
  }
}
