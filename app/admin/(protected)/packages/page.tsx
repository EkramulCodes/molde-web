'use client';

import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowUp, 
  FiArrowDown, 
  FiCheckCircle, 
  FiX, 
  FiRefreshCw,
  FiPackage,
  FiStar,
  FiSettings
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';

interface PackageItem {
  id: string;
  nameEn: string;
  nameNo: string;
  priceMonthly: number;
  priceYearly: number;
  durationEn: string;
  durationNo: string;
  featuresEn: string[];
  featuresNo: string[];
  isPopular: boolean;
  yearlyDiscountEn: string;
  yearlyDiscountNo: string;
  order: number;
}

interface PackageSettings {
  titleEn: string;
  titleNo: string;
  showYearlyToggle: boolean;
  yearlyDiscountPercentage: number;
}

export default function PackagesManager() {
  const [items, setItems] = useState<PackageItem[]>([]);
  const [packageSettings, setPackageSettings] = useState<PackageSettings>({
    titleEn: 'Packages & Pricing',
    titleNo: 'Pakker & Priser',
    showYearlyToggle: true,
    yearlyDiscountPercentage: 17
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<PackageItem> | null>(null);

  const loadItems = async () => {
    try {
      const res = await fetch('/api/packages');
      const data = await res.json();
      if (data.packages) {
        setItems(data.packages);
        if (data.settings) setPackageSettings(data.settings);
      } else if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    const init = async () => {
      await loadItems(); 
    };
    init();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem({
      id: `pkg-${Date.now()}`,
      nameEn: '',
      nameNo: '',
      priceMonthly: 0,
      priceYearly: 0,
      durationEn: 'per month',
      durationNo: 'per måned',
      featuresEn: [],
      featuresNo: [],
      isPopular: false,
      yearlyDiscountEn: 'Save 17%',
      yearlyDiscountNo: 'Spar 17%',
      order: items.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PackageItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !items.some((s) => s.id === editingItem?.id);
      const res = await fetch('/api/packages', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: editingItem, settings: packageSettings }),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast(`Changes saved successfully!`);
        setIsModalOpen(false);
        await loadItems();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: packageSettings }),
      });
      if (res.ok) {
        notifyCmsUpdated();
        setToast('Global settings updated!');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        notifyCmsUpdated();
        setToast('Package deleted.');
        await loadItems();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (e) { console.error(e); }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((s, idx) => s.order = idx + 1);
    setItems(newItems);
    try {
      const res = await fetch('/api/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems),
      });
      if (res.ok) notifyCmsUpdated();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Packages & Pricing Manager</h1>
          <p className="text-slate text-sm">Manage your service packages and global pricing settings.</p>
        </div>

        <div className="flex items-center space-x-3">
          {toast && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg flex items-center space-x-1">
              <FiCheckCircle size={14} />
              <span>{toast}</span>
            </div>
          )}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-gold text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:brightness-110 transition-all flex items-center space-x-2 shadow-lg shadow-gold/20"
          >
            <FiPlus size={16} />
            <span>Add Package</span>
          </button>
        </div>
      </div>

      {/* Global Settings Panel */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/15 shadow-sm space-y-6">
        <h3 className="font-display font-bold text-sm text-ink flex items-center gap-2">
          <FiSettings size={16} className="text-teal" />
          Global Pricing Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Title (EN)</label>
            <input type="text" value={packageSettings.titleEn} onChange={e => setPackageSettings({...packageSettings, titleEn: e.target.value})} className="w-full bg-bg-deep border border-slate/20 rounded-lg px-3 py-2 text-xs focus:border-teal outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Title (NO)</label>
            <input type="text" value={packageSettings.titleNo} onChange={e => setPackageSettings({...packageSettings, titleNo: e.target.value})} className="w-full bg-bg-deep border border-slate/20 rounded-lg px-3 py-2 text-xs focus:border-teal outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Discount %</label>
            <input type="number" value={packageSettings.yearlyDiscountPercentage} onChange={e => setPackageSettings({...packageSettings, yearlyDiscountPercentage: parseInt(e.target.value)})} className="w-full bg-bg-deep border border-slate/20 rounded-lg px-3 py-2 text-xs focus:border-teal outline-none" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSaveSettings} disabled={saving} className="w-full py-2 bg-teal text-white font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/10">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
          <p>Loading packages...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-bg-primary rounded-2xl p-12 text-center border border-slate/10">
          <p className="text-slate">No packages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={item.id} className={`bg-bg-primary rounded-2xl border ${item.isPopular ? 'border-teal shadow-lg shadow-teal/5' : 'border-slate/15 shadow-sm'} p-6 relative group transition-all hover:border-teal/30`}>
              {item.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-teal text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Most Popular
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-ink">{item.nameEn}</h3>
                  <p className="text-slate text-xs uppercase tracking-wider font-mono">{item.nameNo}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <button onClick={() => handleMoveOrder(index, 'up')} disabled={index === 0} className="p-1 text-slate hover:text-teal disabled:opacity-20"><FiArrowUp size={14} /></button>
                  <button onClick={() => handleMoveOrder(index, 'down')} disabled={index === items.length - 1} className="p-1 text-slate hover:text-teal disabled:opacity-20"><FiArrowDown size={14} /></button>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate">Monthly:</span>
                  <span className="text-teal font-bold">${item.priceMonthly}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate">Yearly (total):</span>
                  <span className="text-gold font-bold">${item.priceYearly}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-8 h-32 overflow-y-auto custom-scrollbar pr-2">
                {item.featuresEn.map((f, i) => (
                  <li key={i} className="flex items-center text-xs text-slate space-x-2">
                    <FiCheckCircle className="text-teal flex-shrink-0" size={14} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-2 pt-4 border-t border-slate/10">
                 <button onClick={() => handleOpenEditModal(item)} className="flex-1 py-2.5 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-2">
                    <FiEdit2 size={14} /> <span>Edit</span>
                  </button>
                  <button onClick={() => handleDeleteItem(item.id, item.nameEn)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                    <FiTrash2 size={16} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-bg-primary border border-slate/20 rounded-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate/10 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">{editingItem.id?.includes('new') ? 'Add Package' : 'Edit Package'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate hover:text-ink"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Name (EN)</label>
                  <input type="text" value={editingItem.nameEn || ''} onChange={e => setEditingItem({...editingItem, nameEn: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Name (NO)</label>
                  <input type="text" value={editingItem.nameNo || ''} onChange={e => setEditingItem({...editingItem, nameNo: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Monthly Price ($)</label>
                  <input type="number" value={editingItem.priceMonthly || 0} onChange={e => setEditingItem({...editingItem, priceMonthly: parseFloat(e.target.value)})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Yearly Price (Total $)</label>
                  <input type="number" value={editingItem.priceYearly || 0} onChange={e => setEditingItem({...editingItem, priceYearly: parseFloat(e.target.value)})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Duration Label (EN)</label>
                  <input type="text" value={editingItem.durationEn || ''} onChange={e => setEditingItem({...editingItem, durationEn: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" placeholder="per month" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Duration Label (NO)</label>
                  <input type="text" value={editingItem.durationNo || ''} onChange={e => setEditingItem({...editingItem, durationNo: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" placeholder="per måned" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Yearly Discount Badge (EN)</label>
                  <input type="text" value={editingItem.yearlyDiscountEn || ''} onChange={e => setEditingItem({...editingItem, yearlyDiscountEn: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" placeholder="Save 17%" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-slate">Yearly Discount Badge (NO)</label>
                  <input type="text" value={editingItem.yearlyDiscountNo || ''} onChange={e => setEditingItem({...editingItem, yearlyDiscountNo: e.target.value})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none" placeholder="Spar 17%" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 py-2">
                <input type="checkbox" id="popular" checked={editingItem.isPopular || false} onChange={e => setEditingItem({...editingItem, isPopular: e.target.checked})} className="w-4 h-4 rounded border-slate/30 text-teal focus:ring-teal bg-bg-deep" />
                <label htmlFor="popular" className="text-sm text-ink flex items-center space-x-1 cursor-pointer font-medium">
                  <FiStar className={editingItem.isPopular ? 'text-gold fill-gold' : 'text-slate'} />
                  <span>Mark as Popular Package</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate">Features (EN) - Comma Separated</label>
                <textarea value={editingItem.featuresEn?.join(', ') || ''} onChange={e => setEditingItem({...editingItem, featuresEn: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none h-24" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate">Features (NO) - Comma Separated</label>
                <textarea value={editingItem.featuresNo?.join(', ') || ''} onChange={e => setEditingItem({...editingItem, featuresNo: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} className="w-full px-4 py-2 bg-bg-deep border border-slate/20 rounded-lg text-sm text-ink focus:border-teal outline-none h-24" />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-slate/10 text-slate rounded-lg text-xs font-bold uppercase">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-teal text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-teal/90 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
