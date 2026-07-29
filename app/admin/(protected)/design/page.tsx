'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiCheckCircle, FiRefreshCw, FiDroplet, FiSliders, FiUpload, FiSun, FiMoon, FiChevronDown } from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { compressLogoImage } from '@/lib/utils';
import type { DesignData, ThemeModeColors, ThemeColorSettings, ColorToken } from '@/lib/types';

type ThemeMode = 'light' | 'dark';

const LIGHT_TOKEN_DEFAULTS: ThemeModeColors = {
  primaryColor: { value: '#1F6F5C', enabled: false },
  bgDeepColor: { value: '#EAE4D6', enabled: false },
  accentColor: { value: '#C98A2E', enabled: false },
  cardBgColor: { value: '#EAE4D6', enabled: false },
  hoverTextColor: { value: '#C98A2E', enabled: false },
  hoverBgColor: { value: '#1F6F5C', enabled: false },
  bgColor: { value: '#F3F0E8', enabled: false },
  textColor: { value: '#16212F', enabled: false },
  ctaButtonColor: { value: '#C98A2E', enabled: false },
};

const DARK_TOKEN_DEFAULTS: ThemeModeColors = {
  primaryColor: { value: '#2E9280', enabled: false },
  bgDeepColor: { value: '#182230', enabled: false },
  accentColor: { value: '#DDA246', enabled: false },
  cardBgColor: { value: '#182230', enabled: false },
  hoverTextColor: { value: '#DDA246', enabled: false },
  hoverBgColor: { value: '#2E9280', enabled: false },
  bgColor: { value: '#10161F', enabled: false },
  textColor: { value: '#ECE8DE', enabled: false },
  ctaButtonColor: { value: '#DDA246', enabled: false },
};

// If a site already has a live primaryColor/accentColor (the pre-existing always-on
// brand colors), migrate them in as "enabled" so the new per-mode toggles reflect
// what's actually showing today instead of silently reverting to the stock palette.
function withLegacyMigration(defaults: ThemeModeColors, legacy: Pick<DesignData, 'primaryColor' | 'accentColor'>): ThemeModeColors {
  return {
    ...defaults,
    primaryColor: legacy.primaryColor ? { value: legacy.primaryColor, enabled: true } : defaults.primaryColor,
    accentColor: legacy.accentColor ? { value: legacy.accentColor, enabled: true } : defaults.accentColor,
  };
}

function ensureThemeColors(data: DesignData): ThemeColorSettings {
  if (data.themeColors) return data.themeColors;
  return {
    light: withLegacyMigration(LIGHT_TOKEN_DEFAULTS, data),
    dark: withLegacyMigration(DARK_TOKEN_DEFAULTS, data),
  };
}

function ColorTokenField({
  label,
  hint,
  token,
  onValueChange,
  onToggle,
}: {
  label: string;
  hint?: string;
  token: ColorToken;
  onValueChange: (value: string) => void;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className={`space-y-3 p-4 rounded-xl border transition-colors ${token.enabled ? 'border-teal/40 bg-teal/5' : 'border-slate/15 bg-bg-deep/40'}`}>
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-bold uppercase text-slate">{label}</label>
        <button
          type="button"
          role="switch"
          aria-checked={token.enabled}
          aria-label={`Toggle ${label}`}
          onClick={() => onToggle(!token.enabled)}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${token.enabled ? 'bg-teal' : 'bg-slate/30'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${token.enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate/70 -mt-2">{hint}</p>}
      <div className={`flex items-center space-x-3 ${token.enabled ? '' : 'opacity-50'}`}>
        <input
          type="color"
          value={token.value}
          disabled={!token.enabled}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-slate/20 p-1 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={token.value}
          disabled={!token.enabled}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink font-mono text-sm focus:outline-none focus:border-teal disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export default function DesignManager() {
  const [design, setDesign] = useState<DesignData>({
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
    themeColors: { light: LIGHT_TOKEN_DEFAULTS, dark: DARK_TOKEN_DEFAULTS },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState('');
  const [editMode, setEditMode] = useState<ThemeMode>('light');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    fetch('/api/design')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.siteName) {
          setDesign({ ...data, themeColors: ensureThemeColors(data) });
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error('Failed to load design settings', e);
        setLoading(false);
      });
  }, []);

  const updateToken = (mode: ThemeMode, key: keyof ThemeModeColors, patch: Partial<ColorToken>) => {
    setDesign((prev) => {
      const current = ensureThemeColors(prev);
      return {
        ...prev,
        themeColors: {
          ...current,
          [mode]: {
            ...current[mode],
            [key]: { ...current[mode][key], ...patch },
          },
        },
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploadingLogo(true);
    try {
      const file = await compressLogoImage(rawFile, 600, 600, 0.92); // smaller bounds for logo; preserves PNG/WebP alpha, passes SVG through untouched
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
                    accept="image/png,image/svg+xml,image/webp,image/jpeg"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-teal/80 mt-1">
                Supports transparent PNG, SVG, and WebP (alpha channel preserved — never flattened to JPEG). Raster logos are resized to 600x600px max; SVGs are uploaded as-is.
              </p>
              {design.logoUrl && (
                <div className="mt-2 p-3 checkerboard-bg rounded border border-slate/10 inline-block">
                  <img src={design.logoUrl} alt="Logo preview" className="h-8 w-auto object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-6 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate/10 pt-6">
                <h3 className="font-display font-bold text-sm text-ink flex items-center space-x-2">
                  <FiDroplet size={16} className="text-teal" />
                  <span>Color Specifications & Theme Management</span>
                </h3>
                <div className="flex items-center gap-2 p-1 bg-bg-deep rounded-xl border border-slate/10 w-fit">
                  <button
                    type="button"
                    onClick={() => setEditMode('light')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${editMode === 'light' ? 'bg-teal text-white shadow-sm' : 'text-slate hover:text-teal'}`}
                  >
                    <FiSun size={14} />
                    <span>Light Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('dark')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${editMode === 'dark' ? 'bg-teal text-white shadow-sm' : 'text-slate hover:text-teal'}`}
                  >
                    <FiMoon size={14} />
                    <span>Dark Mode</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate">Primary Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ColorTokenField
                    label="Primary Brand Color (Teal / Accent 1)"
                    token={design.themeColors![editMode].primaryColor}
                    onValueChange={(v) => updateToken(editMode, 'primaryColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'primaryColor', { enabled: v })}
                  />
                  <ColorTokenField
                    label="Deep Background Color"
                    token={design.themeColors![editMode].bgDeepColor}
                    onValueChange={(v) => updateToken(editMode, 'bgDeepColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'bgDeepColor', { enabled: v })}
                  />
                  <ColorTokenField
                    label="Accent Gold Color (CTA Accent 2)"
                    token={design.themeColors![editMode].accentColor}
                    onValueChange={(v) => updateToken(editMode, 'accentColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'accentColor', { enabled: v })}
                  />
                  <ColorTokenField
                    label="Card / Container Background Color"
                    token={design.themeColors![editMode].cardBgColor}
                    onValueChange={(v) => updateToken(editMode, 'cardBgColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'cardBgColor', { enabled: v })}
                  />
                  <ColorTokenField
                    label="Hover Text Color"
                    token={design.themeColors![editMode].hoverTextColor}
                    onValueChange={(v) => updateToken(editMode, 'hoverTextColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'hoverTextColor', { enabled: v })}
                  />
                  <ColorTokenField
                    label="Hover Background Color"
                    token={design.themeColors![editMode].hoverBgColor}
                    onValueChange={(v) => updateToken(editMode, 'hoverBgColor', { value: v })}
                    onToggle={(v) => updateToken(editMode, 'hoverBgColor', { enabled: v })}
                  />
                </div>
              </div>

              <div className="border border-slate/15 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(!advancedOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-bg-deep/60 hover:bg-bg-deep transition-colors"
                >
                  <span className="font-display font-bold text-sm text-ink flex items-center gap-2">
                    <FiSliders size={16} className="text-teal" />
                    Advanced Options
                  </span>
                  <FiChevronDown size={18} className={`text-slate transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                </button>
                {advancedOpen && (
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate/10">
                    <ColorTokenField
                      label="Primary Brand Color"
                      token={design.themeColors![editMode].primaryColor}
                      onValueChange={(v) => updateToken(editMode, 'primaryColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'primaryColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="Background Color"
                      token={design.themeColors![editMode].bgColor}
                      onValueChange={(v) => updateToken(editMode, 'bgColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'bgColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="Text Color"
                      token={design.themeColors![editMode].textColor}
                      onValueChange={(v) => updateToken(editMode, 'textColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'textColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="CTA Button Color"
                      token={design.themeColors![editMode].ctaButtonColor}
                      onValueChange={(v) => updateToken(editMode, 'ctaButtonColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'ctaButtonColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="Card / Container Background Color"
                      token={design.themeColors![editMode].cardBgColor}
                      onValueChange={(v) => updateToken(editMode, 'cardBgColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'cardBgColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="Hover Text Color"
                      token={design.themeColors![editMode].hoverTextColor}
                      onValueChange={(v) => updateToken(editMode, 'hoverTextColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'hoverTextColor', { enabled: v })}
                    />
                    <ColorTokenField
                      label="Hover Background Color"
                      token={design.themeColors![editMode].hoverBgColor}
                      onValueChange={(v) => updateToken(editMode, 'hoverBgColor', { value: v })}
                      onToggle={(v) => updateToken(editMode, 'hoverBgColor', { enabled: v })}
                    />
                  </div>
                )}
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
