'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCheckCircle, FiRefreshCw, FiDroplet, FiSliders, FiUpload } from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { compressImage } from '@/lib/utils';

export default function DesignManager() {
  const [design, setDesign] = useState({
    siteName: 'MoldeWeb',
    tagline: 'Full-Service Digitalbyrå',
    logoUrl: '',
    primaryColor: '#14B8A6',
    accentColor: '#D97706',
    bgDeepColor: '#090D16',
    bgPrimaryColor: '#0F172A',
    textColor: '#F8FAFC',
    fontFamily: 'Inter',
    enableContourBg: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/design')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.siteName) {
          setDesign(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load design settings', e);
        setLoading(false);
      });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploadingLogo(true);
    try {
      const file = await compressImage(rawFile, 600, 600, 0.9); // smaller bounds for logo
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDesign((prev) => ({ ...prev, logoUrl: data.data.url }));
        setToast('Logo uploaded! Click Save to apply.');
        setTimeout(() => setToast(''), 3000);
      } else {
        alert('Failed to upload logo.');
      }
    } catch (err) {
      alert('Error uploading logo image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast('');

    try {
      const res = await fetch('/api/design', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast('Design tokens and theme settings saved!');
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to save design tokens.');
      }
    } catch (e) {
      alert('Error updating design tokens.');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset: Partial<typeof design>) => {
    setDesign((prev) => ({ ...prev, ...preset }));
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading design tokens...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Design & Theme Token Manager</h1>
          <p className="text-slate text-sm">Customize colors, logo, typography, and brand identity settings.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Preset Color Palettes */}
      <div className="bg-bg-primary rounded-2xl p-6 border border-slate/10 space-y-3">
        <h3 className="font-display font-bold text-sm text-ink flex items-center space-x-2">
          <FiDroplet size={16} className="text-teal" />
          <span>Quick Theme Color Presets</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() =>
              applyPreset({
                primaryColor: '#14B8A6',
                accentColor: '#D97706',
                bgDeepColor: '#090D16',
                bgPrimaryColor: '#0F172A',
              })
            }
            className="p-3 bg-bg-deep border border-slate/20 rounded-xl hover:border-teal text-left transition-all"
          >
            <div className="flex space-x-1 mb-2">
              <span className="w-4 h-4 rounded-full bg-[#14B8A6]"></span>
              <span className="w-4 h-4 rounded-full bg-[#D97706]"></span>
              <span className="w-4 h-4 rounded-full bg-[#090D16]"></span>
            </div>
            <p className="text-xs font-bold text-ink">Nordic Teal & Gold</p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                primaryColor: '#3B82F6',
                accentColor: '#10B981',
                bgDeepColor: '#0F172A',
                bgPrimaryColor: '#1E293B',
              })
            }
            className="p-3 bg-bg-deep border border-slate/20 rounded-xl hover:border-teal text-left transition-all"
          >
            <div className="flex space-x-1 mb-2">
              <span className="w-4 h-4 rounded-full bg-[#3B82F6]"></span>
              <span className="w-4 h-4 rounded-full bg-[#10B981]"></span>
              <span className="w-4 h-4 rounded-full bg-[#0F172A]"></span>
            </div>
            <p className="text-xs font-bold text-ink">Modern Tech Blue</p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                primaryColor: '#8B5CF6',
                accentColor: '#EC4899',
                bgDeepColor: '#18181B',
                bgPrimaryColor: '#27272A',
              })
            }
            className="p-3 bg-bg-deep border border-slate/20 rounded-xl hover:border-teal text-left transition-all"
          >
            <div className="flex space-x-1 mb-2">
              <span className="w-4 h-4 rounded-full bg-[#8B5CF6]"></span>
              <span className="w-4 h-4 rounded-full bg-[#EC4899]"></span>
              <span className="w-4 h-4 rounded-full bg-[#18181B]"></span>
            </div>
            <p className="text-xs font-bold text-ink">Cyber Purple</p>
          </button>

          <button
            type="button"
            onClick={() =>
              applyPreset({
                primaryColor: '#059669',
                accentColor: '#EAB308',
                bgDeepColor: '#052E16',
                bgPrimaryColor: '#064E3B',
              })
            }
            className="p-3 bg-bg-deep border border-slate/20 rounded-xl hover:border-teal text-left transition-all"
          >
            <div className="flex space-x-1 mb-2">
              <span className="w-4 h-4 rounded-full bg-[#059669]"></span>
              <span className="w-4 h-4 rounded-full bg-[#EAB308]"></span>
              <span className="w-4 h-4 rounded-full bg-[#052E16]"></span>
            </div>
            <p className="text-xs font-bold text-ink">Emerald Forest</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
          <h2 className="font-display text-xl font-bold text-ink border-b border-slate/10 pb-4 flex items-center space-x-2">
            <FiSliders size={20} className="text-teal" />
            <span>Brand Identity & Tokens</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Site Name</label>
              <input
                type="text"
                required
                value={design.siteName}
                onChange={(e) => setDesign({ ...design, siteName: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Tagline / Eyebrow Text</label>
              <input
                type="text"
                value={design.tagline}
                onChange={(e) => setDesign({ ...design, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate">Logo Image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={design.logoUrl}
                  onChange={(e) => setDesign({ ...design, logoUrl: e.target.value })}
                  placeholder="Paste URL or upload image file below"
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
                />
                <label className="px-5 py-3 bg-teal/10 hover:bg-teal/20 text-teal border border-teal/30 rounded-lg text-xs font-bold uppercase cursor-pointer flex items-center justify-center space-x-2 shrink-0 transition-colors">
                  <FiUpload size={16} />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-teal/80 mt-1">
                Safe upload: Any size is safe. Logos are automatically resized and compressed to 600x600px max (JPEG) for optimal header fit and lightweight delivery.
              </p>
              {design.logoUrl && (
                <div className="mt-2 p-2 bg-bg-deep rounded border border-slate/10 inline-block">
                  <img src={design.logoUrl} alt="Logo preview" className="h-8 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Primary Brand Color (Teal/Accent 1)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate/20 p-1"
                />
                <input
                  type="text"
                  value={design.primaryColor}
                  onChange={(e) => setDesign({ ...design, primaryColor: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Accent Gold Color (CTA Accent 2)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={design.accentColor}
                  onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate/20 p-1"
                />
                <input
                  type="text"
                  value={design.accentColor}
                  onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Deep Background Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={design.bgDeepColor}
                  onChange={(e) => setDesign({ ...design, bgDeepColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate/20 p-1"
                />
                <input
                  type="text"
                  value={design.bgDeepColor}
                  onChange={(e) => setDesign({ ...design, bgDeepColor: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Card / Container Background Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={design.bgPrimaryColor}
                  onChange={(e) => setDesign({ ...design, bgPrimaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate/20 p-1"
                />
                <input
                  type="text"
                  value={design.bgPrimaryColor}
                  onChange={(e) => setDesign({ ...design, bgPrimaryColor: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate">Typography Font Family</label>
              <select
                value={design.fontFamily}
                onChange={(e) => setDesign({ ...design, fontFamily: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm focus:outline-none focus:border-teal"
              >
                <option value="Inter">Inter (Sans-serif)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Playfair Display">Playfair Display (Serif)</option>
              </select>
            </div>

            <div className="space-y-2 flex items-center justify-between pt-6">
              <div>
                <label className="block text-xs font-bold uppercase text-ink">Interactive Contour Canvas Background</label>
                <p className="text-xs text-slate">Enable animated topological contour background on hero section.</p>
              </div>
              <input
                type="checkbox"
                checked={design.enableContourBg}
                onChange={(e) => setDesign({ ...design, enableContourBg: e.target.checked })}
                className="w-6 h-6 accent-teal cursor-pointer"
              />
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
            <span>{saving ? 'Saving Tokens...' : 'Save Design Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
