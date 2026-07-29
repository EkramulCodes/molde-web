'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiStar, FiRefreshCw, FiSave, FiFileText, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '@/context/ToastContext';
import { compressLogoImage } from '@/lib/utils';
import { InvoiceTemplate } from '@/lib/types';

type EditableTemplate = Omit<InvoiceTemplate, 'id'> & { id?: string };

const emptyTemplate = (): EditableTemplate => ({
  name: 'New Template',
  isDefault: false,
  companyName: '',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  taxIdLabel: 'Tax ID',
  taxIdValue: '',
  logoUrl: '',
  accentColor: '#14B8A6',
  invoiceNumberPrefix: 'INV-',
  nextInvoiceNumber: 1001,
  taxLabel: 'VAT (25%)',
  taxRate: 25,
  footerNote: '',
  termsText: '',
});

export default function InvoiceTemplatesManager() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<EditableTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/invoice-templates');
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    } catch (e) {
      console.error('Failed to load invoice templates', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const res = await fetch('/api/invoice-templates');
        const data = await res.json();
        if (active && Array.isArray(data)) setTemplates(data);
      } catch (e) {
        console.error('Failed to load invoice templates', e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      active = false;
    };
  }, []);

  const openAddModal = () => {
    setEditing(emptyTemplate());
    setIsModalOpen(true);
  };

  const openEditModal = (t: InvoiceTemplate) => {
    setEditing({ ...t });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch('/api/invoice-templates', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast(`Template ${isNew ? 'created' : 'updated'} successfully`, 'success');
        setIsModalOpen(false);
        setEditing(null);
        await loadTemplates();
      } else {
        showToast(data.error || 'Failed to save template', 'error');
      }
    } catch {
      showToast('Network error while saving template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (rawFile: File | undefined) => {
    if (!rawFile || !editing) return;

    setLogoUploading(true);
    try {
      const file = await compressLogoImage(rawFile, 600, 600, 0.92);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data?.data?.url) {
        setEditing((prev) => (prev ? { ...prev, logoUrl: data.data.url } : prev));
      } else {
        showToast('Failed to upload logo.', 'error');
      }
    } catch {
      showToast('Error uploading logo image.', 'error');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch('/api/invoice-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true }),
      });
      if (res.ok) {
        showToast('Default template updated', 'success');
        await loadTemplates();
      }
    } catch {
      showToast('Failed to set default template', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete invoice template "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/invoice-templates?id=${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showToast('Template deleted', 'success');
        await loadTemplates();
      } else {
        showToast(data.error || 'Failed to delete template', 'error');
      }
    } catch {
      showToast('Network error while deleting template', 'error');
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal';
  const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-slate';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiFileText className="text-teal" size={30} />
            <span>Invoice Templates</span>
          </h1>
          <p className="text-slate text-sm">Design the branding, numbering, and terms used on auto-generated purchase invoices.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg shadow-gold/20 self-start md:self-auto"
        >
          <FiPlus size={16} />
          <span>New Template</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
          <p>Loading invoice templates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`bg-bg-primary rounded-2xl border p-6 space-y-4 shadow-sm transition-all ${
                t.isDefault ? 'border-teal ring-1 ring-teal/30' : 'border-slate/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-lg text-ink">{t.name}</h3>
                  <p className="text-xs text-slate">{t.companyName}</p>
                </div>
                {t.isDefault && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wider rounded-full flex-shrink-0">
                    <FiStar size={10} /> Default
                  </span>
                )}
              </div>

              <div className="text-xs text-slate space-y-1 font-mono">
                <p>Prefix: <span className="text-ink">{t.invoiceNumberPrefix}</span></p>
                <p>Next #: <span className="text-ink">{t.nextInvoiceNumber}</span></p>
                <p>Tax: <span className="text-ink">{t.taxLabel} ({t.taxRate}%)</span></p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate/10">
                <button
                  onClick={() => openEditModal(t)}
                  className="flex-1 px-3 py-2 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FiEdit2 size={13} /> Edit
                </button>
                {!t.isDefault && (
                  <button
                    onClick={() => handleSetDefault(t.id)}
                    className="px-3 py-2 bg-slate/10 hover:bg-teal/20 text-slate hover:text-teal rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                    title="Set as Default"
                  >
                    <FiStar size={13} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  title="Delete Template"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-2xl w-full my-8 p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-start border-b border-slate/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">{editing.id ? 'Edit Invoice Template' : 'New Invoice Template'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditing(null); }} className="text-slate hover:text-ink p-1 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Template Name</label>
                <input
                  type="text"
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Company Name</label>
                  <input type="text" value={editing.companyName} onChange={(e) => setEditing({ ...editing, companyName: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Logo</label>
                  <div className="flex items-center gap-3">
                    {editing.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.logoUrl} alt="Logo preview" className="w-10 h-10 rounded-lg border border-slate/20 bg-bg-deep object-contain flex-shrink-0" />
                    )}
                    <input
                      type="text"
                      value={editing.logoUrl}
                      onChange={(e) => setEditing({ ...editing, logoUrl: e.target.value })}
                      className={inputClass}
                      placeholder="https://... or upload a file"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-bold text-teal hover:text-gold cursor-pointer transition-colors">
                    <FiUploadCloud size={14} />
                    <span>{logoUploading ? 'Uploading...' : 'Upload from your computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={logoUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        handleLogoUpload(file);
                      }}
                    />
                  </label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Company Address</label>
                  <input type="text" value={editing.companyAddress} onChange={(e) => setEditing({ ...editing, companyAddress: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Company Email</label>
                  <input type="email" value={editing.companyEmail} onChange={(e) => setEditing({ ...editing, companyEmail: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Company Phone</label>
                  <input type="text" value={editing.companyPhone} onChange={(e) => setEditing({ ...editing, companyPhone: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Tax ID Label</label>
                  <input type="text" value={editing.taxIdLabel} onChange={(e) => setEditing({ ...editing, taxIdLabel: e.target.value })} className={inputClass} placeholder="Org.nr / VAT No." />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Tax ID Value</label>
                  <input type="text" value={editing.taxIdValue} onChange={(e) => setEditing({ ...editing, taxIdValue: e.target.value })} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editing.accentColor} onChange={(e) => setEditing({ ...editing, accentColor: e.target.value })} className="w-11 h-10 rounded-lg border border-slate/20 bg-bg-deep cursor-pointer" />
                    <input type="text" value={editing.accentColor} onChange={(e) => setEditing({ ...editing, accentColor: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Invoice Number Prefix</label>
                  <input type="text" value={editing.invoiceNumberPrefix} onChange={(e) => setEditing({ ...editing, invoiceNumberPrefix: e.target.value })} className={inputClass} placeholder="INV-" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Next Invoice Number</label>
                  <input
                    type="number"
                    min={1}
                    value={editing.nextInvoiceNumber}
                    onChange={(e) => setEditing({ ...editing, nextInvoiceNumber: Number(e.target.value) || 1 })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Tax Label</label>
                  <input type="text" value={editing.taxLabel} onChange={(e) => setEditing({ ...editing, taxLabel: e.target.value })} className={inputClass} placeholder="VAT / MVA (25%)" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Tax Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={editing.taxRate}
                    onChange={(e) => setEditing({ ...editing, taxRate: Number(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Footer Note</label>
                  <textarea rows={2} value={editing.footerNote} onChange={(e) => setEditing({ ...editing, footerNote: e.target.value })} className={inputClass} placeholder="Thank you for your business. Payment is due within 14 days." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Terms Text (Optional)</label>
                  <textarea rows={2} value={editing.termsText} onChange={(e) => setEditing({ ...editing, termsText: e.target.value })} className={inputClass} />
                </div>
                <div className="flex items-center justify-between p-4 bg-bg-deep border border-slate/10 rounded-xl md:col-span-2">
                  <div>
                    <h4 className="text-sm font-bold text-ink">Set as Default Template</h4>
                    <p className="text-xs text-slate">New invoices are generated using the default template.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, isDefault: !editing.isDefault })}
                    className={`w-12 h-6 rounded-full p-1 transition-all flex-shrink-0 ${editing.isDefault ? 'bg-teal' : 'bg-slate/30'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${editing.isDefault ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate/10">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditing(null); }}
                  className="px-6 py-3 bg-slate/10 text-slate hover:text-ink rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave size={16} />
                  <span>{saving ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
