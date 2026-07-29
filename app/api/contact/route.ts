import { NextResponse } from 'next/server';
import { getDb, saveDb, LeadItem } from '@/lib/store';
import { requireAdminSession } from '@/lib/api-auth';
import { sendAdminNotification, sendClientReceipt } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.leads || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const newLead: LeadItem = {
      id: `lead-${Date.now()}`,
      name,
      email,
      service: service || 'General Inquiry',
      message,
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    if (!db.leads) {
      db.leads = [];
    }

    db.leads.unshift(newLead);
    saveDb(db);

    const emailData = { name: newLead.name, email: newLead.email, service: newLead.service, message: newLead.message };
    await Promise.all([
      sendAdminNotification('contact', emailData),
      sendClientReceipt('contact', newLead.email, emailData),
    ]).catch(() => {});

    return NextResponse.json({ success: true, data: newLead });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit contact request' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, status } = body;
    const db = getDb();

    if (!db.leads) db.leads = [];

    const index = db.leads.findIndex((l) => l.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    db.leads[index].status = status;
    saveDb(db);

    return NextResponse.json({ success: true, data: db.leads[index] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing lead id' }, { status: 400 });
    }

    const db = getDb();
    if (!db.leads) db.leads = [];

    db.leads = db.leads.filter((l) => l.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 400 });
  }
}
