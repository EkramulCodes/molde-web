import { getDb, saveDb } from './store';
import { InvoiceTemplate, InvoiceItem, OrderItem } from './types';

/** Default/first template is used to generate every new invoice. */
export function getActiveTemplate(templates: InvoiceTemplate[]): InvoiceTemplate | null {
  if (!templates || templates.length === 0) return null;
  return templates.find((t) => t.isDefault) || templates[0];
}

function escapeHtml(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMoney(amount: number, currency: 'USD' | 'NOK'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'no-NO', { style: 'currency', currency }).format(amount);
}

/**
 * Builds an InvoiceItem for a freshly-created order using the account's
 * active template, and advances that template's invoice number counter.
 * Caller is responsible for persisting the returned invoice + calling
 * saveDb() (this only mutates the template counter in-memory on `db`).
 */
export function buildInvoiceForOrder(order: OrderItem, db: ReturnType<typeof getDb>): InvoiceItem | null {
  const template = getActiveTemplate(db.invoiceTemplates);
  if (!template) return null;

  const invoiceNumber = `${template.invoiceNumberPrefix}${String(template.nextInvoiceNumber).padStart(4, '0')}`;
  template.nextInvoiceNumber += 1;

  const total = order.amount;
  const subtotal = typeof order.subtotal === 'number' ? order.subtotal : total / (1 + template.taxRate / 100);
  const taxAmount = total - subtotal;

  const invoice: InvoiceItem = {
    id: `inv-${Date.now()}`,
    invoiceNumber,
    orderId: order.id,
    templateId: template.id,
    clientName: order.name,
    clientEmail: order.email,
    clientCompany: order.company,
    itemLabel: order.itemLabel,
    itemType: order.itemType,
    billingCycle: order.billingCycle,
    quantity: 1,
    unitPrice: subtotal,
    currency: order.currency,
    taxLabel: template.taxLabel,
    taxRate: template.taxRate,
    taxAmount,
    subtotal,
    total,
    issuedAt: new Date().toISOString(),
    status: 'issued',
    branding: {
      companyName: template.companyName,
      companyAddress: template.companyAddress,
      companyEmail: template.companyEmail,
      companyPhone: template.companyPhone,
      taxIdLabel: template.taxIdLabel,
      taxIdValue: template.taxIdValue,
      logoUrl: template.logoUrl,
      accentColor: template.accentColor,
      footerNote: template.footerNote,
      termsText: template.termsText,
    },
  };

  return invoice;
}

/** Renders a full, self-contained, printable/emailable HTML invoice document. */
export function renderInvoiceHtml(invoice: InvoiceItem): string {
  const b = invoice.branding;
  const accent = b.accentColor || '#14B8A6';
  const issuedDate = new Date(invoice.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const billingCycleLabel = invoice.billingCycle ? ` / ${invoice.billingCycle}` : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
<style>
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f1f5f9; margin:0; padding:32px 16px; color:#0f172a; }
  .sheet { max-width:720px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; }
  .header { padding:32px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:4px solid ${accent}; }
  .company { font-size:20px; font-weight:800; color:#0f172a; }
  .muted { color:#64748b; font-size:12px; line-height:1.6; }
  .invoice-meta { text-align:right; }
  .invoice-meta .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; }
  .invoice-meta .num { font-size:22px; font-weight:800; margin:4px 0; }
  .section { padding:0 32px; }
  .bill-to { padding:24px 32px; display:flex; justify-content:space-between; gap:24px; flex-wrap:wrap; }
  .bill-to h4 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; margin:0 0 8px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; padding:10px 32px; border-top:1px solid #e2e8f0; border-bottom:1px solid #e2e8f0; background:#f8fafc; }
  th.num, td.num { text-align:right; }
  td { padding:16px 32px; font-size:14px; border-bottom:1px solid #f1f5f9; }
  .totals { padding:20px 32px 32px; display:flex; justify-content:flex-end; }
  .totals table { width:280px; margin:0; }
  .totals td { padding:6px 0; border:none; font-size:13px; }
  .totals .grand td { font-size:18px; font-weight:800; border-top:2px solid ${accent}; padding-top:12px; color:${accent}; }
  .footer { padding:24px 32px; background:#f8fafc; color:#64748b; font-size:11px; line-height:1.6; }
  @media print { body { background:#fff; padding:0; } .sheet { border:none; border-radius:0; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        ${b.logoUrl ? `<img src="${escapeHtml(b.logoUrl)}" alt="${escapeHtml(b.companyName)}" style="max-height:40px;max-width:200px;object-fit:contain;margin-bottom:10px;" />` : `<div class="company">${escapeHtml(b.companyName)}</div>`}
        <div class="muted">
          ${escapeHtml(b.companyAddress)}<br/>
          ${escapeHtml(b.companyEmail)} ${b.companyPhone ? `&middot; ${escapeHtml(b.companyPhone)}` : ''}
          ${b.taxIdValue ? `<br/>${escapeHtml(b.taxIdLabel)}: ${escapeHtml(b.taxIdValue)}` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <div class="label">Invoice</div>
        <div class="num">${escapeHtml(invoice.invoiceNumber)}</div>
        <div class="muted">Issued ${escapeHtml(issuedDate)}</div>
      </div>
    </div>

    <div class="bill-to">
      <div>
        <h4>Bill To</h4>
        <div style="font-weight:700;font-size:14px;">${escapeHtml(invoice.clientName)}</div>
        <div class="muted">${escapeHtml(invoice.clientEmail)}${invoice.clientCompany ? `<br/>${escapeHtml(invoice.clientCompany)}` : ''}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="num">Qty</th>
          <th class="num">Unit Price</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(invoice.itemLabel)}${billingCycleLabel ? `<div class="muted">${escapeHtml(invoice.itemType === 'package' ? 'Package' : 'Service')}${escapeHtml(billingCycleLabel)}</div>` : `<div class="muted">${escapeHtml(invoice.itemType === 'package' ? 'Package' : 'Service')}</div>`}</td>
          <td class="num">${invoice.quantity}</td>
          <td class="num">${formatMoney(invoice.unitPrice, invoice.currency)}</td>
          <td class="num">${formatMoney(invoice.unitPrice * invoice.quantity, invoice.currency)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr><td>Subtotal</td><td class="num">${formatMoney(invoice.subtotal, invoice.currency)}</td></tr>
        <tr><td>${escapeHtml(invoice.taxLabel)}</td><td class="num">${formatMoney(invoice.taxAmount, invoice.currency)}</td></tr>
        <tr class="grand"><td>Total</td><td class="num">${formatMoney(invoice.total, invoice.currency)}</td></tr>
      </table>
    </div>

    <div class="footer">
      ${escapeHtml(b.footerNote)}
      ${b.termsText ? `<br/><br/>${escapeHtml(b.termsText)}` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function saveNewInvoiceForOrder(order: OrderItem): InvoiceItem | null {
  const db = getDb();
  const invoice = buildInvoiceForOrder(order, db);
  if (!invoice) return null;

  if (!db.invoices) db.invoices = [];
  db.invoices.unshift(invoice);
  saveDb(db);

  return invoice;
}
