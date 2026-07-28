'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCheckCircle, FiRefreshCw, FiLayout, FiEye } from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';

export default function PromoManager() {
  const [promo, setPromo] = useState({
    active: true,
    messageEn: 'Get a free SEO audit today!',
    messageNo: 'Få en gratis SEO-analyse i dag!',
    link: '/contact',
    slidingEnabled: true,
    dismissible: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/promo')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPromo(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load promo', e);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast('');

    try {
      const res = await fetch('/api/promo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promo),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast('Promo bar settings updated!');
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to update promo bar.');
      }
    } catch (e) {
      alert('Error updating promo bar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading promo bar settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Promo & Announcement Bar Manager</h1>
          <p className="text-slate text-sm">Control the top promotional banner visible across the entire website.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Live Banner Preview */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 space-y-3">
        <h3 className="font-display font-bold text-sm text-ink flex items-center space-x-2">
          <FiEye size={16} className="text-teal" />
          <span>Live Banner Preview</span>
        </h3>

        {promo.active ? (
          <div className="bg-gold/20 text-ink py-3 px-6 rounded-xl border border-gold/40 flex items-center justify-between text-sm">
            <p className="font-medium">
              <span className="text-xs uppercase tracking-widest text-gold font-bold mr-2">[EN]:</span>
              {promo.messageEn}
            </p>
            <a href={promo.link} className="text-xs font-bold uppercase underline text-gold hover:text-white">
              Learn More &rarr;
            </a>
          </div>
        ) : (
          <div className="bg-slate/10 text-slate p-4 rounded-xl text-xs text-center">
            Promo bar is currently <strong>DISABLED</strong> and hidden from the website.
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate/10 pb-4">
            <h2 className="font-display text-xl font-bold text-ink flex items-center space-x-2">
              <FiLayout size={20} className="text-teal" />
              <span>Promo Settings</span>
            </h2>

            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                {promo.active ? 'Status: Active' : 'Status: Disabled'}
              </span>
              <input
                type="checkbox"
                checked={promo.active}
                onChange={(e) => setPromo({ ...promo, active: e.target.checked })}
                className="w-6 h-6 accent-teal cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Announcement Text (English)</label>
              <input
                type="text"
                required
                value={promo.messageEn}
                onChange={(e) => setPromo({ ...promo, messageEn: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Announcement Text (Norwegian)</label>
              <input
                type="text"
                required
                value={promo.messageNo}
                onChange={(e) => setPromo({ ...promo, messageNo: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate">Action Link URL</label>
              <input
                type="text"
                required
                value={promo.link}
                onChange={(e) => setPromo({ ...promo, link: e.target.value })}
                placeholder="/contact or https://..."
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              />
            </div>

            <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate/10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">Enable Sliding Animation</h4>
                  <p className="text-[11px] text-slate">Allow the promo text to slide from right to left (marquee effect).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromo({ ...promo, slidingEnabled: !promo.slidingEnabled })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${promo.slidingEnabled ? 'bg-teal' : 'bg-slate/30'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${promo.slidingEnabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">Allow Dismissal</h4>
                  <p className="text-[11px] text-slate">Allow users to close the promo bar temporarily.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPromo({ ...promo, dismissible: !promo.dismissible })}
                  className={`w-10 h-5 rounded-full transition-colors relative ${promo.dismissible ? 'bg-teal' : 'bg-slate/30'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${promo.dismissible ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <FiSave size={18} />
            <span>{saving ? 'Saving...' : 'Save Promo Bar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
