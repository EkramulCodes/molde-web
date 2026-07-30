import { getDb } from './store';
import type { MailProviderSettings, InvoiceItem } from './types';
import { renderInvoiceHtml } from './invoice';

export type NotificationEventType = 'booking' | 'purchase' | 'contact';

export interface DispatchResult {
  ok: boolean;
  error?: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface BookingEmailData {
  name: string;
  email: string;
  whatsapp: string;
  contextLabel: string;
  date: string;
  time: string;
  notes?: string;
}

export interface PurchaseEmailData {
  name: string;
  email: string;
  itemLabel: string;
  amount: string;
  billingCycle?: string;
  company?: string;
  paymentGateway: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  service: string;
  message: string;
}

type EmailData = BookingEmailData | PurchaseEmailData | ContactEmailData;

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function baseTemplate(title: string, rows: { label: string; value: string }[], note: string): string {
  const rowsHtml = rows
    .filter((r) => r.value)
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;line-height:1.5;">${escapeHtml(r.value).replace(/\n/g, '<br/>')}</td>
      </tr>`
    )
    .join('');

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f1f5f9;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0f172a;padding:24px 32px;">
        <span style="color:#14B8A6;font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;">MoldeWeb</span>
        <h1 style="color:#ffffff;font-size:20px;margin:8px 0 0;font-family:inherit;">${escapeHtml(title)}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
        <tbody>${rowsHtml}</tbody>
      </table>
      <div style="padding:20px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;line-height:1.5;">${escapeHtml(note)}</div>
    </div>
  </div>`;
}

async function dispatch(settings: MailProviderSettings, payload: EmailPayload): Promise<DispatchResult> {
  if (!payload.to) return { ok: false, error: 'Missing recipient email address' };

  try {
    switch (settings.provider) {
      case 'resend': {
        if (!settings.resendApiKey) return { ok: false, error: 'Resend API key is not configured' };
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${settings.fromName || 'MoldeWeb'} <${settings.fromEmail || 'noreply@moldeweb.no'}>`,
            to: [payload.to],
            subject: payload.subject,
            html: payload.html,
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          return { ok: false, error: `Resend error (${res.status}): ${text.slice(0, 300)}` };
        }
        return { ok: true };
      }
      case 'sendgrid': {
        if (!settings.sendgridApiKey) return { ok: false, error: 'SendGrid API key is not configured' };
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: payload.to }] }],
            from: { email: settings.fromEmail || 'noreply@moldeweb.no', name: settings.fromName || 'MoldeWeb' },
            subject: payload.subject,
            content: [{ type: 'text/html', value: payload.html }],
          }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          return { ok: false, error: `SendGrid error (${res.status}): ${text.slice(0, 300)}` };
        }
        return { ok: true };
      }
      case 'smtp': {
        if (!settings.smtpHost || !settings.smtpUser) {
          return { ok: false, error: 'SMTP host and username are not configured' };
        }
        const nodemailer = await import('nodemailer');
        const transport = nodemailer.default.createTransport({
          host: settings.smtpHost,
          port: Number(settings.smtpPort) || 587,
          secure: !!settings.smtpSecure,
          auth: { user: settings.smtpUser, pass: settings.smtpPassword || '' },
        });
        await transport.sendMail({
          from: `${settings.fromName || 'MoldeWeb'} <${settings.fromEmail || settings.smtpUser}>`,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        });
        return { ok: true };
      }
      case 'none':
      default:
        return { ok: false, error: 'No email provider is configured in Settings → Mail & Notifications' };
    }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown email dispatch error' };
  }
}

function buildAdminContent(type: NotificationEventType, data: EmailData): { title: string; subject: string; rows: { label: string; value: string }[] } {
  if (type === 'booking') {
    const d = data as BookingEmailData;
    return {
      title: 'New Meeting Booking Request',
      subject: `New Booking Request: ${d.name} — ${d.date} at ${d.time}`,
      rows: [
        { label: 'Client Name', value: d.name },
        { label: 'Email', value: d.email },
        { label: 'WhatsApp', value: d.whatsapp },
        { label: 'Requested For', value: d.contextLabel },
        { label: 'Date', value: d.date },
        { label: 'Time', value: d.time },
        { label: 'Notes', value: d.notes || '—' },
      ],
    };
  }
  if (type === 'purchase') {
    const d = data as PurchaseEmailData;
    return {
      title: 'New Package / Service Order',
      subject: `New Order: ${d.name} — ${d.itemLabel}`,
      rows: [
        { label: 'Client Name', value: d.name },
        { label: 'Email', value: d.email },
        { label: 'Company', value: d.company || '—' },
        { label: 'Item', value: d.itemLabel },
        { label: 'Billing Cycle', value: d.billingCycle || 'One-time' },
        { label: 'Amount', value: d.amount },
        { label: 'Payment Gateway', value: d.paymentGateway },
      ],
    };
  }
  const d = data as ContactEmailData;
  return {
    title: 'New Contact / Service Inquiry',
    subject: `New Inquiry: ${d.name} — ${d.service}`,
    rows: [
      { label: 'Client Name', value: d.name },
      { label: 'Email', value: d.email },
      { label: 'Interested In', value: d.service },
      { label: 'Message', value: d.message },
    ],
  };
}

function buildClientContent(type: NotificationEventType, data: EmailData): { title: string; subject: string; rows: { label: string; value: string }[] } {
  if (type === 'booking') {
    const d = data as BookingEmailData;
    return {
      title: `Thanks, ${d.name}! Your Meeting Request Was Received`,
      subject: 'We received your meeting request — MoldeWeb',
      rows: [
        { label: 'Requested For', value: d.contextLabel },
        { label: 'Date', value: d.date },
        { label: 'Time', value: d.time },
        { label: 'Status', value: 'Pending confirmation — we will reach out shortly.' },
      ],
    };
  }
  if (type === 'purchase') {
    const d = data as PurchaseEmailData;
    return {
      title: `Thanks, ${d.name}! Your Order Was Received`,
      subject: 'Order confirmation — MoldeWeb',
      rows: [
        { label: 'Item', value: d.itemLabel },
        { label: 'Billing Cycle', value: d.billingCycle || 'One-time' },
        { label: 'Amount', value: d.amount },
        { label: 'Status', value: 'Your order is being processed.' },
      ],
    };
  }
  const d = data as ContactEmailData;
  return {
    title: `Thanks, ${d.name}! We Received Your Message`,
    subject: 'We received your message — MoldeWeb',
    rows: [
      { label: 'Interested In', value: d.service },
      { label: 'Status', value: 'Our team will reply within 1 business day.' },
    ],
  };
}

function alertKeyFor(type: NotificationEventType): 'bookings' | 'purchases' | 'contactLeads' {
  if (type === 'booking') return 'bookings';
  if (type === 'purchase') return 'purchases';
  return 'contactLeads';
}

/**
 * Sends the admin summary email for a new conversion event. Never throws —
 * failures are logged so a misconfigured mail provider can't break a
 * visitor-facing submission.
 */
export async function sendAdminNotification(type: NotificationEventType, data: EmailData): Promise<void> {
  const settings = getDb().mailSettings;
  if (!settings || settings.provider === 'none') return;
  if (!settings.alerts?.[alertKeyFor(type)]) return;
  if (!settings.primaryNotificationEmail) return;

  const { title, subject, rows } = buildAdminContent(type, data);
  const html = baseTemplate(title, rows, 'This is an automated notification from your MoldeWeb admin panel. Manage alert preferences under Settings → Mail & Notifications.');
  const result = await dispatch(settings, { to: settings.primaryNotificationEmail, subject, html });
  if (!result.ok) {
    console.warn(`[mailer] Failed to send admin ${type} notification:`, result.error);
  }
}

/**
 * Sends the instant confirmation receipt to the client. Never throws — same
 * best-effort contract as sendAdminNotification.
 */
export async function sendClientReceipt(type: NotificationEventType, toEmail: string, data: EmailData): Promise<void> {
  const settings = getDb().mailSettings;
  if (!settings || settings.provider === 'none') return;
  if (!toEmail) return;

  const { title, subject, rows } = buildClientContent(type, data);
  const html = baseTemplate(title, rows, 'Thank you for reaching out to MoldeWeb. This is an automated confirmation — a member of our team will follow up shortly.');
  const result = await dispatch(settings, { to: toEmail, subject, html });
  if (!result.ok) {
    console.warn(`[mailer] Failed to send client ${type} receipt:`, result.error);
  }
}

/**
 * Sends the branded invoice itself as the client's purchase confirmation
 * email (replaces the generic sendClientReceipt('purchase', ...) call for
 * checkout orders — the invoice already contains a full "thank you" framing
 * plus complete line-item detail, so sending both would be redundant).
 *
 * Returns the dispatch result (rather than swallowing it like the other
 * send* helpers) so callers can persist delivery status on the invoice
 * record and admins have a way to notice + retry failed deliveries.
 */
export async function sendInvoiceEmail(toEmail: string, invoice: InvoiceItem): Promise<DispatchResult> {
  const settings = getDb().mailSettings;
  if (!settings || settings.provider === 'none') {
    return { ok: false, error: 'No email provider is configured in Settings → Mail & Notifications' };
  }
  if (!toEmail) return { ok: false, error: 'Missing recipient email address' };

  const html = renderInvoiceHtml(invoice);
  const result = await dispatch(settings, { to: toEmail, subject: `Invoice ${invoice.invoiceNumber} — ${invoice.branding.companyName}`, html });
  if (!result.ok) {
    console.warn('[mailer] Failed to send invoice email:', result.error);
  }
  return result;
}

/** Sends a real test email using the currently saved provider config. */
export async function sendTestEmail(toEmail: string): Promise<DispatchResult> {
  const settings = getDb().mailSettings;
  if (!settings) return { ok: false, error: 'Mail settings are not configured' };

  const html = baseTemplate(
    'Test Email',
    [
      { label: 'Status', value: 'Your email configuration is working correctly.' },
      { label: 'Provider', value: settings.provider },
      { label: 'Sent At', value: new Date().toLocaleString() },
    ],
    'This is a test email sent from MoldeWeb Admin Panel → Settings → Mail & Notifications.'
  );
  return dispatch(settings, { to: toEmail, subject: 'MoldeWeb — Test Email', html });
}
