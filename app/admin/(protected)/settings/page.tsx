'use client';

import { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiLink, 
  FiMenu, 
  FiSettings, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiPlus, 
  FiTrash2, 
  FiCopy, 
  FiCheck,
  FiGlobe,
  FiDollarSign,
  FiMoon
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { NavItem } from '@/lib/types';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<'site' | 'navbar' | 'contact' | 'links'>('site');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/content');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToast('');

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        notifyCmsUpdated();
        setToast('Settings updated successfully!');
        setTimeout(() => setToast(''), 4000);
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Network error while saving.');
    } finally {
      setSaving(false);
    }
  };

  const addNavItem = () => {
    const newItem: NavItem = {
      id: `nav-${Date.now()}`,
      labelEn: 'New Page',
      labelNo: 'Ny Side',
      href: '/',
      order: (settings.navItems?.length || 0) + 1
    };
    setSettings({ ...settings, navItems: [...(settings.navItems || []), newItem] });
  };

  const removeNavItem = (id: string) => {
    setSettings({ ...settings, navItems: settings.navItems.filter((item: NavItem) => item.id !== id) });
  };

  const updateNavItem = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      navItems: settings.navItems.map((item: NavItem) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    const fullUrl = window.location.origin + text;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading settings...</p>
      </div>
    );
  }

  const deepLinks = [
    { label: 'Home Page', url: '/' },
    { label: 'About Page', url: '/about' },
    { label: 'Portfolio Page', url: '/portfolio' },
    { label: 'Packages Page', url: '/packages' },
    { label: 'Contact Page', url: '/contact' },
    { label: 'Checkout Page', url: '/checkout' },
    { label: 'Contact Form Section', url: '/#contact' },
    { label: 'Services Grid', url: '/#services' },
    { label: 'Portfolio Section', url: '/#portfolio' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Global Site Settings</h1>
          <p className="text-slate text-sm">Configure site-wide controls, navigation, and contact details.</p>
        </div>

        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-lg flex items-center space-x-2 animate-fade-in">
            <FiCheckCircle size={16} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2 border-b border-slate/10 overflow-x-auto pb-2">
        {[
          { id: 'site', label: 'Site Controls', icon: FiSettings },
          { id: 'navbar', label: 'Navigation', icon: FiMenu },
          { id: 'contact', label: 'Contact Info', icon: FiPhone },
          { id: 'links', label: 'Deep Links', icon: FiLink },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-teal text-white shadow-md'
                : 'text-slate hover:bg-slate/10 hover:text-ink'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SITE CONTROLS */}
        {activeTab === 'site' && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
            <div className="space-y-6">
               <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <FiGlobe size={20} className="text-teal" />
                Language & Currency Toggles
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-slate/10">
                   <div>
                     <p className="text-sm font-bold text-ink">Language Switcher</p>
                     <p className="text-[11px] text-slate">Enable EN/NO language toggle in header.</p>
                   </div>
                   <input 
                    type="checkbox" 
                    checked={settings.siteSettings.showLanguageSwitcher} 
                    onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, showLanguageSwitcher: e.target.checked}})}
                    className="w-5 h-5 accent-teal"
                   />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-slate/10">
                   <div>
                     <p className="text-sm font-bold text-ink">Currency Switcher</p>
                     <p className="text-[11px] text-slate">Enable NOK/USD currency toggle in header.</p>
                   </div>
                   <input 
                    type="checkbox" 
                    checked={settings.siteSettings.showCurrencySwitcher} 
                    onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, showCurrencySwitcher: e.target.checked}})}
                    className="w-5 h-5 accent-teal"
                   />
                 </div>
                 <div className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-slate/10">
                   <div>
                     <p className="text-sm font-bold text-ink">Theme Switcher</p>
                     <p className="text-[11px] text-slate">Enable Light/Dark mode toggle in header.</p>
                   </div>
                   <input 
                    type="checkbox" 
                    checked={settings.siteSettings.showThemeSwitcher} 
                    onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, showThemeSwitcher: e.target.checked}})}
                    className="w-5 h-5 accent-teal"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate/10">
               <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <FiDollarSign size={20} className="text-teal" />
                Currency Configuration
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Default Currency</label>
                    <select 
                      value={settings.siteSettings.defaultCurrency}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, defaultCurrency: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    >
                      <option value="NOK">NOK (Norway)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Exchange Rate (1 USD = ? NOK)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={settings.siteSettings.exchangeRate}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, exchangeRate: parseFloat(e.target.value)}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate/10">
               <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                <FiLink size={20} className="text-teal" />
                Book a Meeting CTA (Services Section)
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Label (EN)</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.bookMeetingCtaLabelEn}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, bookMeetingCtaLabelEn: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Label (NO)</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.bookMeetingCtaLabelNo}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, bookMeetingCtaLabelNo: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Link URL</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.bookMeetingCtaLink}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, bookMeetingCtaLink: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* NAVBAR TAB */}
        {activeTab === 'navbar' && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate/10 pb-4">
                <h3 className="font-display font-bold text-lg text-ink">Navbar Items</h3>
                <button 
                  type="button" 
                  onClick={addNavItem}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-teal hover:text-ink transition-colors"
                >
                  <FiPlus /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {settings.navItems.map((item: NavItem) => (
                  <div key={item.id} className="flex items-end gap-4 p-4 bg-bg-deep rounded-xl border border-slate/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">Label (EN)</label>
                        <input 
                          type="text" 
                          value={item.labelEn} 
                          onChange={(e) => updateNavItem(item.id, 'labelEn', e.target.value)}
                          className="w-full bg-bg-primary border border-slate/20 rounded-sm px-3 py-2 text-xs focus:border-teal outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">Label (NO)</label>
                        <input 
                          type="text" 
                          value={item.labelNo} 
                          onChange={(e) => updateNavItem(item.id, 'labelNo', e.target.value)}
                          className="w-full bg-bg-primary border border-slate/20 rounded-sm px-3 py-2 text-xs focus:border-teal outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">Link (e.g. /about)</label>
                        <input 
                          type="text" 
                          value={item.href} 
                          onChange={(e) => updateNavItem(item.id, 'href', e.target.value)}
                          className="w-full bg-bg-primary border border-slate/20 rounded-sm px-3 py-2 text-xs focus:border-teal outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeNavItem(item.id)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate/10">
               <h3 className="font-display font-bold text-lg text-ink">Navbar CTA Button</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Label (EN)</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.navCtaLabelEn}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, navCtaLabelEn: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Label (NO)</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.navCtaLabelNo}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, navCtaLabelNo: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
                 <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate">CTA Link URL</label>
                    <input 
                      type="text"
                      value={settings.siteSettings.navCtaLink}
                      onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, navCtaLink: e.target.value}})}
                      className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    />
                 </div>
               </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate/10">
               <h3 className="font-display font-bold text-lg text-ink">Site Logo</h3>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Logo Image URL</label>
                  <input 
                    type="text"
                    value={settings.siteSettings.logoUrl}
                    onChange={(e) => setSettings({...settings, siteSettings: {...settings.siteSettings, logoUrl: e.target.value}})}
                    className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                    placeholder="https://..."
                  />
               </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
            <div className="space-y-6">
              <h3 className="font-display font-bold text-lg text-ink">Global Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate flex items-center gap-2">
                    <FiMail size={14} /> Email Address
                  </label>
                  <input 
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) => setSettings({...settings, contactInfo: {...settings.contactInfo, email: e.target.value}})}
                    className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate flex items-center gap-2">
                    <FiPhone size={14} /> Phone Number
                  </label>
                  <input 
                    type="text"
                    value={settings.contactInfo.phone}
                    onChange={(e) => setSettings({...settings, contactInfo: {...settings.contactInfo, phone: e.target.value}})}
                    className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate flex items-center gap-2">
                    <FiMapPin size={14} /> Address (EN)
                  </label>
                  <input 
                    type="text"
                    value={settings.contactInfo.addressEn}
                    onChange={(e) => setSettings({...settings, contactInfo: {...settings.contactInfo, addressEn: e.target.value}})}
                    className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate flex items-center gap-2">
                    <FiMapPin size={14} /> Address (NO)
                  </label>
                  <input 
                    type="text"
                    value={settings.contactInfo.addressNo}
                    onChange={(e) => setSettings({...settings, contactInfo: {...settings.contactInfo, addressNo: e.target.value}})}
                    className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEEP LINKS TAB */}
        {activeTab === 'links' && (
          <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-ink">Deep Link Generator</h3>
              <p className="text-sm text-slate">Quickly copy links to specific pages or sections to share with clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deepLinks.map((link, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-bg-deep rounded-xl border border-slate/10 group">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-ink">{link.label}</p>
                    <p className="text-[10px] text-slate font-mono">{link.url}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(link.url, link.label)}
                    className={`p-2 rounded-lg transition-all ${copiedLink === link.label ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate group-hover:bg-teal/10 group-hover:text-teal'}`}
                  >
                    {copiedLink === link.label ? <FiCheck size={18} /> : <FiCopy size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
          >
            <FiSave size={18} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
