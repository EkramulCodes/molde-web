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
  FiMoon,
  FiSend,
  FiAlertCircle,
  FiToggleRight
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { NavItem, MailProviderSettings, CtaButtonConfig } from '@/lib/types';
import { CTA_REGISTRY } from '@/lib/cta-registry';
import { useToast } from '@/context/ToastContext';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<'site' | 'navbar' | 'contact' | 'links' | 'mail' | 'cta'>('site');
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
          { id: 'mail', label: 'Mail & Notifications', icon: FiMail },
          { id: 'cta', label: 'Button Actions', icon: FiToggleRight },
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

      {(activeTab === 'site' || activeTab === 'navbar' || activeTab === 'contact' || activeTab === 'links') && (
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
      )}

      {activeTab === 'mail' && <MailSettingsTab />}
      {activeTab === 'cta' && <CtaSettingsTab />}
    </div>
  );
}

function MailSettingsTab() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<MailProviderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/mail-settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setTestEmail(data?.primaryNotificationEmail || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/mail-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Mail settings saved', 'success');
      } else {
        showToast('Failed to save mail settings', 'error');
      }
    } catch {
      showToast('Network error while saving mail settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showToast('Enter a recipient email first', 'error');
      return;
    }
    setTesting(true);
    try {
      const res = await fetch('/api/mail-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast(data.message || 'Test email sent', 'success');
      } else {
        showToast(data.error || 'Failed to send test email', 'error');
      }
    } catch {
      showToast('Network error while sending test email', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading mail settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-8">
      <div className="space-y-6">
        <h3 className="font-display font-bold text-lg text-ink flex items-center gap-2">
          <FiMail size={20} className="text-teal" />
          Notification Recipient
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Primary Admin Notification Email</label>
            <input
              type="email"
              value={settings.primaryNotificationEmail}
              onChange={(e) => setSettings({ ...settings, primaryNotificationEmail: e.target.value })}
              className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
              placeholder="hello@moldeweb.no"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">&quot;From&quot; Name</label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
              className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">&quot;From&quot; Email Address</label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-slate/10">
        <h3 className="font-display font-bold text-lg text-ink">Email Provider</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'none', label: 'Disabled', icon: '🚫' },
            { id: 'resend', label: 'Resend', icon: '📮' },
            { id: 'sendgrid', label: 'SendGrid', icon: '✉️' },
            { id: 'smtp', label: 'SMTP', icon: '🔌' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSettings({ ...settings, provider: p.id as MailProviderSettings['provider'] })}
              className={`py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
                settings.provider === p.id ? 'bg-teal/10 border-teal text-teal shadow-sm font-black' : 'border-slate/10 text-slate hover:border-slate/30 bg-bg-deep'
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {settings.provider === 'resend' && (
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">Resend API Key</label>
            <input
              type="password"
              value={settings.resendApiKey || ''}
              onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
              className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
              placeholder="re_..."
            />
          </div>
        )}

        {settings.provider === 'sendgrid' && (
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate">SendGrid API Key</label>
            <input
              type="password"
              value={settings.sendgridApiKey || ''}
              onChange={(e) => setSettings({ ...settings, sendgridApiKey: e.target.value })}
              className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
              placeholder="SG...."
            />
          </div>
        )}

        {settings.provider === 'smtp' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate">SMTP Host</label>
              <input
                type="text"
                value={settings.smtpHost || ''}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
                placeholder="smtp.mailprovider.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate">SMTP Port</label>
              <input
                type="text"
                value={settings.smtpPort || ''}
                onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
                placeholder="587"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate">SMTP Username</label>
              <input
                type="text"
                value={settings.smtpUser || ''}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate">SMTP Password</label>
              <input
                type="password"
                value={settings.smtpPassword || ''}
                onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm font-mono outline-none focus:border-teal"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-bg-deep border border-slate/10 rounded-xl md:col-span-2">
              <div>
                <h4 className="text-sm font-bold text-ink">Use TLS/SSL (Secure)</h4>
                <p className="text-xs text-slate">Enable for port 465, disable for STARTTLS on port 587.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, smtpSecure: !settings.smtpSecure })}
                className={`w-12 h-6 rounded-full p-1 transition-all ${settings.smtpSecure ? 'bg-teal' : 'bg-slate/30'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.smtpSecure ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8 border-t border-slate/10">
        <h3 className="font-display font-bold text-lg text-ink">Alert Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            { key: 'bookings', label: 'Meeting Bookings' },
            { key: 'purchases', label: 'Package/Service Purchases' },
            { key: 'contactLeads', label: 'Contact Form Leads' },
          ] as const).map((alert) => (
            <div key={alert.key} className="flex items-center justify-between p-4 bg-bg-deep border border-slate/10 rounded-xl">
              <span className="text-sm font-bold text-ink">{alert.label}</span>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, alerts: { ...settings.alerts, [alert.key]: !settings.alerts[alert.key] } })}
                className={`w-12 h-6 rounded-full p-1 transition-all flex-shrink-0 ${settings.alerts[alert.key] ? 'bg-teal' : 'bg-slate/30'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.alerts[alert.key] ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-8 border-t border-slate/10">
        <h3 className="font-display font-bold text-lg text-ink">Send Test Email</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-bg-deep border border-slate/20 rounded-lg text-ink text-sm outline-none focus:border-teal"
            placeholder="you@example.com"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={testing || settings.provider === 'none'}
            className="px-6 py-3 bg-slate/10 hover:bg-teal/20 text-teal rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {testing ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSend size={16} />}
            <span>{testing ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </div>
        {settings.provider === 'none' && (
          <p className="text-[11px] text-gold flex items-center gap-1.5">
            <FiAlertCircle size={12} /> Select an email provider above to enable sending.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
        >
          <FiSave size={18} />
          <span>{saving ? 'Saving...' : 'Save Mail Settings'}</span>
        </button>
      </div>
    </div>
  );
}

function CtaSettingsTab() {
  const { showToast } = useToast();
  const [configs, setConfigs] = useState<CtaButtonConfig[]>([]);
  const [packages, setPackages] = useState<{ id: string; nameEn: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetch('/api/cta-settings').then((res) => res.json()), fetch('/api/packages').then((res) => res.json())])
      .then(([ctaData, pkgData]) => {
        setConfigs(Array.isArray(ctaData) ? ctaData : []);
        setPackages(Array.isArray(pkgData?.packages) ? pkgData.packages : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = (key: string, patch: Partial<CtaButtonConfig>) => {
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cta-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs),
      });
      if (res.ok) {
        showToast('Button actions saved — live on the site immediately.', 'success');
      } else {
        showToast('Failed to save button actions', 'error');
      }
    } catch {
      showToast('Network error while saving button actions', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate">
        <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
        <p>Loading button actions...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary rounded-2xl p-8 border border-slate/10 shadow-sm space-y-6">
      <div>
        <h3 className="font-display font-bold text-lg text-ink">Button & CTA Action Manager</h3>
        <p className="text-xs text-slate mt-1">
          Control what happens when a visitor clicks each of the site&apos;s main call-to-action buttons — no rebuild required.
        </p>
      </div>

      <div className="space-y-4">
        {CTA_REGISTRY.map((entry) => {
          const config: CtaButtonConfig =
            configs.find((c) => c.key === entry.key) || { key: entry.key, label: entry.label, actionType: 'booking', enabled: true };
          return (
            <div key={entry.key} className="p-5 bg-bg-deep border border-slate/10 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-ink">{entry.label}</h4>
                  <p className="text-[11px] text-slate mt-0.5">{entry.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig(entry.key, { enabled: !config.enabled })}
                  className={`w-12 h-6 rounded-full p-1 transition-all flex-shrink-0 ${config.enabled ? 'bg-teal' : 'bg-slate/30'}`}
                  aria-label={`Toggle ${entry.label}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={config.actionType}
                  onChange={(e) => updateConfig(entry.key, { actionType: e.target.value as CtaButtonConfig['actionType'] })}
                  className="w-full px-3 py-2.5 bg-bg-primary border border-slate/20 rounded-lg text-ink text-xs font-bold outline-none focus:border-teal"
                >
                  <option value="booking">Open Meeting Booking Form (Default)</option>
                  <option value="contact">Open Contact Form</option>
                  <option value="custom">Custom URL / WhatsApp Link</option>
                  <option value="package">Open Specific Package Form</option>
                </select>

                {config.actionType === 'custom' && (
                  <input
                    type="text"
                    value={config.customUrl || ''}
                    onChange={(e) => updateConfig(entry.key, { customUrl: e.target.value })}
                    placeholder="https://wa.me/47XXXXXXXX or /contact"
                    className="w-full px-3 py-2.5 bg-bg-primary border border-slate/20 rounded-lg text-ink text-xs font-mono outline-none focus:border-teal"
                  />
                )}

                {config.actionType === 'package' && (
                  <select
                    value={config.packageId || ''}
                    onChange={(e) => updateConfig(entry.key, { packageId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-bg-primary border border-slate/20 rounded-lg text-ink text-xs font-bold outline-none focus:border-teal"
                  >
                    <option value="">Use the package the button was clicked on (if any)</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameEn}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-teal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-teal/90 transition-colors shadow-lg shadow-teal/20 flex items-center space-x-2 disabled:opacity-50"
        >
          <FiSave size={18} />
          <span>{saving ? 'Saving...' : 'Save Button Actions'}</span>
        </button>
      </div>
    </div>
  );
}
