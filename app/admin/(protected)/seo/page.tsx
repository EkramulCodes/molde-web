'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCheckCircle, FiRefreshCw, FiSearch, FiGlobe } from 'react-icons/fi';

interface SeoItem {
  pagePath: string;
  pageName: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  canonicalUrl: string;
  keywords: string;
}

export default function SeoManager() {
  const [seoList, setSeoList] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/seo')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSeoList(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load SEO', e);
        setLoading(false);
      });
  }, []);

  const handleChange = (index: number, field: keyof SeoItem, value: string) => {
    const updated = [...seoList];
    updated[index] = { ...updated[index], [field]: value };
    setSeoList(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast('');

    try {
      const res = await fetch('/api/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoList),
      });

      if (res.ok) {
        setToast('SEO meta tags saved successfully!');
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to save SEO meta tags.');
      }
    } catch (e) {
      alert('Error updating SEO tags.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading SEO metadata...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">SEO & OpenGraph Meta Tag Manager</h1>
          <p className="text-slate text-sm">Control page titles, search descriptions, social sharing images, and canonical tags.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-6">
          {seoList.map((item, index) => (
            <div key={item.pagePath} className="bg-bg-primary rounded-2xl p-6 border border-slate/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate/10 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal/10 text-teal rounded-lg flex items-center justify-center font-bold">
                    <FiGlobe size={16} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-ink">{item.pageName}</h2>
                    <span className="text-xs text-slate font-mono">Route: {item.pagePath}</span>
                  </div>
                </div>
              </div>

              {/* Google Search Snippet Live Preview */}
              <div className="bg-bg-deep p-4 rounded-xl border border-slate/10 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Google Search Snippet Preview</p>
                <p className="text-xs text-teal truncate font-mono">{item.canonicalUrl || `https://moldeweb.no${item.pagePath}`}</p>
                <p className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer truncate">
                  {item.metaTitle || item.pageName}
                </p>
                <p className="text-xs text-slate line-clamp-2">
                  {item.metaDescription || 'No description set. Google will generate a snippet from page content.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Meta Title (50-60 chars)</label>
                  <input
                    type="text"
                    value={item.metaTitle || ''}
                    onChange={(e) => handleChange(index, 'metaTitle', e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Canonical URL</label>
                  <input
                    type="text"
                    value={item.canonicalUrl || ''}
                    onChange={(e) => handleChange(index, 'canonicalUrl', e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate">Meta Description (150-160 chars)</label>
                  <textarea
                    rows={2}
                    value={item.metaDescription || ''}
                    onChange={(e) => handleChange(index, 'metaDescription', e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">OpenGraph / Social Image URL</label>
                  <input
                    type="text"
                    value={item.ogImage || ''}
                    onChange={(e) => handleChange(index, 'ogImage', e.target.value)}
                    placeholder="https://... or /uploads/..."
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate">Target Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={item.keywords || ''}
                    onChange={(e) => handleChange(index, 'keywords', e.target.value)}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <FiSave size={18} />
            <span>{saving ? 'Saving SEO Meta...' : 'Save All SEO Meta Tags'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
