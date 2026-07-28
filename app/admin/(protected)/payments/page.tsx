'use client';

import { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiRefreshCw,
  FiCreditCard,
  FiSave,
  FiAlertCircle,
  FiGlobe,
  FiKey,
  FiLock,
  FiLink,
  FiFileText,
  FiZap
} from 'react-icons/fi';
import { notifyCmsUpdated } from '@/context/LanguageContext';
import { PaymentSettings } from '@/lib/types';

export default function PaymentSettingsManager() {
  const [settings, setSettings] = useState<PaymentSettings>({ 
    gateway: 'none', 
    apiKey: '', 
    isTestMode: true,
    otherGatewayName: 'Vipps / Custom Gateway',
    otherClientId: '',
    otherSecretKey: '',
    otherWebhookSecret: '',
    otherInstructions: '',
    otherCustomUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data) {
          setSettings({
            gateway: data.gateway || 'none',
            apiKey: data.apiKey || '',
            isTestMode: data.isTestMode !== undefined ? data.isTestMode : true,
            otherGatewayName: data.otherGatewayName || 'Vipps / Custom Gateway',
            otherClientId: data.otherClientId || '',
            otherSecretKey: data.otherSecretKey || '',
            otherWebhookSecret: data.otherWebhookSecret || '',
            otherInstructions: data.otherInstructions || '',
            otherCustomUrl: data.otherCustomUrl || ''
          });
        }
      })
      .catch((e) => console.error(e))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        notifyCmsUpdated();
        setToast('Payment settings updated successfully!');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setSaving(false); 
    }
  };

  const applyOtherPreset = (name: string, defaultUrl: string = '', instructions: string = '') => {
    setSettings(prev => ({
      ...prev,
      gateway: 'other',
      otherGatewayName: name,
      otherCustomUrl: defaultUrl || prev.otherCustomUrl || '',
      otherInstructions: instructions || prev.otherInstructions || ''
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-3">
            <FiCreditCard className="text-teal" size={32} />
            <span>Payment Integration</span>
          </h1>
          <p className="text-slate text-sm">Configure Stripe, PayPal, or custom payment gateways for transactions.</p>
        </div>
        {toast && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-xl flex items-center space-x-1 animate-fade-in">
            <FiCheckCircle size={14} />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate">
          <FiRefreshCw className="animate-spin mx-auto mb-2 text-teal" size={24} />
          <p className="font-mono text-xs">Loading payment settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-bg-primary rounded-2xl border border-slate/15 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Gateway Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-teal font-bold text-sm">
                <FiZap size={18} />
                <h3 className="text-ink">Primary Payment Gateway</h3>
              </div>
              <span className="text-[11px] font-mono text-slate bg-bg-deep px-2.5 py-1 rounded-lg border border-slate/10 uppercase">
                Active: <strong className="text-teal">{settings.gateway}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'none', label: 'Disabled / None', icon: '🚫' },
                { id: 'stripe', label: 'Stripe', icon: '💳' },
                { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                { id: 'other', label: 'Other Gateways', icon: '🌐' },
              ].map((gw) => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, gateway: gw.id as any })}
                  className={`py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 text-center ${
                    settings.gateway === gw.id 
                      ? 'bg-teal/10 border-teal text-teal shadow-sm font-black' 
                      : 'border-slate/10 text-slate hover:border-slate/30 bg-bg-deep'
                  }`}
                >
                  <span className="text-lg">{gw.icon}</span>
                  <span>{gw.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stripe / PayPal Settings */}
          {(settings.gateway === 'stripe' || settings.gateway === 'paypal') && (
            <div className="space-y-6 animate-fade-in border-t border-slate/10 pt-6">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-slate tracking-widest flex items-center gap-1.5">
                  <FiKey size={14} className="text-teal" />
                  <span>Secret API Key ({settings.gateway.toUpperCase()})</span>
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                  className="w-full px-4 py-3 bg-bg-deep border border-slate/20 rounded-xl text-ink focus:border-teal outline-none transition-all font-mono text-sm"
                  placeholder={`Enter your ${settings.gateway} secret key (e.g. sk_live_... or client_secret)`}
                />
                <p className="text-[11px] text-slate/70 flex items-center space-x-1">
                  <FiAlertCircle size={12} className="text-gold" />
                  <span>Never share your secret API key publicly.</span>
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-bg-deep border border-slate/10 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-ink">Sandbox / Test Mode</h4>
                  <p className="text-xs text-slate">Use test API keys for safe local or development transactions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isTestMode: !settings.isTestMode })}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${settings.isTestMode ? 'bg-teal' : 'bg-slate/30'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.isTestMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Other Payment Gateways Settings */}
          {settings.gateway === 'other' && (
            <div className="space-y-6 animate-fade-in border-t border-slate/10 pt-6">
              <div className="p-4 bg-teal/5 border border-teal/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-teal font-bold text-sm">
                  <FiGlobe size={18} />
                  <span>Other Payment Gateways & Presets</span>
                </div>
                <p className="text-xs text-slate leading-relaxed">
                  Select a popular gateway preset (Vipps, Klarna, Razorpay, Square, Bank Transfer) or enter custom credentials for any payment processor.
                </p>

                {/* Presets buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { name: 'Vipps MobilePay', url: 'https://vipps.no', note: 'Enter Vipps merchant agreement details.' },
                    { name: 'Klarna Checkout', url: 'https://klarna.com', note: 'Pay later and installment options.' },
                    { name: 'Razorpay', url: 'https://razorpay.com', note: 'Razorpay Key ID & Key Secret.' },
                    { name: 'Square Payments', url: 'https://squareup.com', note: 'Square Application ID & Access Token.' },
                    { name: 'Bank Wire / Invoice', url: '', note: 'Provide IBAN, SWIFT/BIC, and invoice reference instructions.' },
                    { name: 'Custom Webhook Gateway', url: '', note: 'Custom checkout redirect endpoint.' },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => applyOtherPreset(p.name, p.url, p.note)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                        settings.otherGatewayName === p.name 
                          ? 'bg-teal text-white border-teal font-bold' 
                          : 'bg-bg-deep border-slate/20 text-slate hover:text-ink hover:border-slate/40'
                      }`}
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Grid for Other Gateway */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiGlobe size={14} className="text-teal" />
                    <span>Gateway Provider Name</span>
                  </label>
                  <input
                    type="text"
                    value={settings.otherGatewayName || ''}
                    onChange={e => setSettings({ ...settings, otherGatewayName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink focus:border-teal outline-none transition-all text-sm"
                    placeholder="e.g. Vipps MobilePay, Klarna, Razorpay, Square, Bank Transfer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiKey size={14} className="text-teal" />
                    <span>Client ID / Merchant ID</span>
                  </label>
                  <input
                    type="text"
                    value={settings.otherClientId || ''}
                    onChange={e => setSettings({ ...settings, otherClientId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink font-mono focus:border-teal outline-none transition-all text-sm"
                    placeholder="e.g. client_id / merchant_serial_number"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiLock size={14} className="text-gold" />
                    <span>Secret API Key / Token</span>
                  </label>
                  <input
                    type="password"
                    value={settings.otherSecretKey || ''}
                    onChange={e => setSettings({ ...settings, otherSecretKey: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink font-mono focus:border-teal outline-none transition-all text-sm"
                    placeholder="e.g. secret_key / access_token"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiKey size={14} className="text-slate" />
                    <span>Webhook Secret / Callback Signature</span>
                  </label>
                  <input
                    type="password"
                    value={settings.otherWebhookSecret || ''}
                    onChange={e => setSettings({ ...settings, otherWebhookSecret: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink font-mono focus:border-teal outline-none transition-all text-sm"
                    placeholder="e.g. whsec_... / signing_secret"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiLink size={14} className="text-teal" />
                    <span>Custom Checkout / Redirect Link (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={settings.otherCustomUrl || ''}
                    onChange={e => setSettings({ ...settings, otherCustomUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink font-mono focus:border-teal outline-none transition-all text-sm"
                    placeholder="https://pay.example.com/checkout"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-mono font-bold uppercase text-slate tracking-wider flex items-center gap-1.5">
                    <FiFileText size={14} className="text-teal" />
                    <span>Customer Instructions & Payment Notes</span>
                  </label>
                  <textarea
                    rows={3}
                    value={settings.otherInstructions || ''}
                    onChange={e => setSettings({ ...settings, otherInstructions: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-deep border border-slate/20 rounded-xl text-ink focus:border-teal outline-none transition-all text-sm"
                    placeholder="Enter instructions for customer payments (e.g. Bank Account IBAN, BIC/SWIFT, invoice reference format, or Vipps phone number)."
                  />
                </div>
              </div>

              {/* Sandbox mode toggle for Other Gateway */}
              <div className="flex items-center justify-between p-4 bg-bg-deep border border-slate/10 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-ink">Sandbox / Test Mode</h4>
                  <p className="text-xs text-slate">Use test environment endpoints or mock transactions for development.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isTestMode: !settings.isTestMode })}
                  className={`w-12 h-6 rounded-full p-1 transition-all ${settings.isTestMode ? 'bg-teal' : 'bg-slate/30'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${settings.isTestMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-slate/10">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-teal hover:bg-teal-hover text-white font-mono text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-teal/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? <FiRefreshCw className="animate-spin" size={18} /> : <FiSave size={18} />}
              <span>{saving ? 'Saving...' : 'Save Payment Configuration'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
