import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { sendTestEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json().catch(() => ({}));
    const to = typeof body?.to === 'string' ? body.to.trim() : '';

    if (!to) {
      return NextResponse.json({ success: false, error: 'Provide a recipient email address' }, { status: 400 });
    }

    const result = await sendTestEmail(to);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to send test email' }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: `Test email sent to ${to}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 400 });
  }
}
