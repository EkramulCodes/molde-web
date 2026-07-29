'use client';

import { useState, useEffect } from 'react';
import { FiFileText, FiSearch, FiExternalLink, FiTrash2, FiRefreshCw, FiMail } from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';
import { InvoiceItem } from '@/lib/types';

export default function InvoicesManager() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
    } catch (e) {
      console.error('Failed to load invoices', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        if (active && Array.isArray(data)) setInvoices(data);
      } catch (e) {
        console.error('Failed to load invoices', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/invoices?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Invoice deleted', 'success');
        await loadInvoices();
      } else {
        showToast('Failed to delete invoice', 'error');
      }
    } catch {
      showToast('Network error while deleting invoice', 'error');
    }
  };

  const filtered = invoices.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return inv.invoiceNumber.toLowerCase().includes(q) || inv.clientName.toLowerCase().includes(q) || inv.clientEmail.toLowerCase().includes(q);
  });

  const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'no-NO', { style: 'currency', currency }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiFileText className="text-teal" size={30} />
            <span>Invoices</span>
          </h1>
          <p className="text-slate text-sm">Every invoice auto-generated from a package or service purchase.</p>
        </div>
        <button
          onClick={loadInvoices}
          className="px-4 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <FiRefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by invoice #, name, or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-bg-primary border border-slate/20 rounded-lg text-sm text-ink outline-none focus:border-teal"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">Loading invoices...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10 space-y-2">
          <FiFileText size={36} className="mx-auto text-slate/30" />
          <p className="text-slate text-sm">No invoices yet — one is generated automatically for every checkout order.</p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-2xl border border-slate/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-slate/10 bg-bg-deep/50 text-xs uppercase tracking-wider text-slate font-mono">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Issued</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bg-deep/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium">{inv.clientName}</div>
                      <div className="text-xs text-slate flex items-center gap-1">
                        <FiMail size={11} /> {inv.clientEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate/10 text-teal rounded text-xs font-mono">{inv.itemLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">{formatMoney(inv.total, inv.currency)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate font-mono">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={`/api/invoices/${inv.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex p-1.5 text-slate hover:text-teal rounded hover:bg-slate/10"
                        title="View / Print Invoice"
                      >
                        <FiExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                        className="p-1.5 text-slate hover:text-red-400 rounded hover:bg-slate/10"
                        title="Delete Invoice"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
