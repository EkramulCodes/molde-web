'use client';

import { useLanguage } from '@/context/LanguageContext';
import { FiLock, FiCreditCard, FiShield, FiArrowRight, FiCheckCircle, FiPackage, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const { t, language, formatPrice, packages, services } = useLanguage();
  const searchParams = useSearchParams();

  const typeParam = searchParams.get('type') || 'package'; // 'package' | 'service'
  const idParam = searchParams.get('id');
  const cycleParam = searchParams.get('cycle') as 'monthly' | 'yearly' || 'monthly';

  // Selection states
  const [selectedType, setSelectedType] = useState<'package' | 'service'>(typeParam === 'service' ? 'service' : 'package');
  const [selectedId, setSelectedId] = useState<string>(idParam || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(cycleParam);

  // Billing Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<{ gateway: string; apiKey?: string; isTestMode?: boolean }>({ gateway: 'none' });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');

  // Order processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  useEffect(() => {
    // Sync query parameters if available
    if (typeParam === 'service' || typeParam === 'package') {
      setSelectedType(typeParam);
    }
    if (idParam) {
      setSelectedId(idParam);
    }
  }, [typeParam, idParam]);

  useEffect(() => {
    // If no selectedId, default to first available package or service
    if (!selectedId) {
      if (selectedType === 'package' && packages.length > 0) {
        setSelectedId(packages[0].id);
      } else if (selectedType === 'service' && services.length > 0) {
        setSelectedId(services[0].id);
      }
    }
  }, [selectedType, packages, services, selectedId]);

  // Load Payment Gateway settings
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/payments');
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings(data);
          if (data.gateway === 'paypal') {
            setSelectedPaymentMethod('paypal');
          }
        }
      } catch (err) {
        console.error('Failed to load payment gateway settings:', err);
      }
    };
    fetchPayments();
  }, []);

  // Determine selected item data
  let selectedPackage = packages.find(p => p.id === selectedId);
  let selectedService = services.find(s => s.id === selectedId);

  // Fallbacks if not found
  if (selectedType === 'package' && !selectedPackage && packages.length > 0) {
    selectedPackage = packages[0];
  }
  if (selectedType === 'service' && !selectedService && services.length > 0) {
    selectedService = services[0];
  }

  // Calculate price
  let itemName = '';
  let numericPrice = 0;
  let features: string[] = [];

  if (selectedType === 'package' && selectedPackage) {
    itemName = language === 'en' ? selectedPackage.nameEn : selectedPackage.nameNo;
    const rawPrice = billingCycle === 'yearly' ? selectedPackage.priceYearly : selectedPackage.priceMonthly;
    numericPrice = parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;
    features = language === 'en' ? selectedPackage.featuresEn : selectedPackage.featuresNo;
  } else if (selectedType === 'service' && selectedService) {
    itemName = language === 'en' ? selectedService.titleEn : selectedService.titleNo;
    numericPrice = parseFloat(String(selectedService.price).replace(/[^0-9.]/g, '')) || 0;
    features = (language === 'en' ? selectedService.featuresEn : selectedService.featuresNo) || [];
  } else {
    // Default fallback
    itemName = language === 'en' ? 'Custom Service / Package' : 'Tilpasset Tjeneste / Pakke';
    numericPrice = 299;
  }

  const vatAmount = numericPrice * 0.25;
  const totalPrice = numericPrice + vatAmount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      alert(language === 'en' ? 'Please fill in your name and email address.' : 'Vennligst fyll inn navn og e-postadresse.');
      return;
    }

    setIsProcessing(true);

    try {
      // Persist the order and trigger the admin + client email pipeline
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: email,
          company: company || undefined,
          itemType: selectedType,
          itemId: selectedId,
          itemLabel: itemName,
          billingCycle: selectedType === 'package' ? billingCycle : undefined,
          // Package/service prices are stored in NOK; formatPrice() only converts for display.
          subtotal: numericPrice,
          amount: totalPrice,
          currency: 'NOK',
          paymentGateway: paymentSettings.gateway || 'standard',
        }),
      });

      if (!res.ok) {
        console.warn('Order submission returned non-ok status');
      }

      setTimeout(() => {
        setIsProcessing(false);
        const ref = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        setOrderRef(ref);
        setOrderComplete(true);
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert(language === 'en' ? 'An error occurred during payment. Please try again.' : 'Det oppstod en feil under betalingen. Vennligst prøv igjen.');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center max-w-lg mx-auto py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/10">
          <FiCheck size={40} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-teal uppercase tracking-widest">Order Ref: {orderRef}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink uppercase tracking-tight">
            {language === 'en' ? 'Payment Successful!' : 'Betaling Vellykket!'}
          </h1>
          <p className="text-slate text-sm leading-relaxed">
            {language === 'en'
              ? `Thank you, ${fullName}! Your order for "${itemName}" has been received and is being processed.`
              : `Takk, ${fullName}! Din bestilling på "${itemName}" er mottatt og behandles nå.`}
          </p>
        </div>
        <div className="bento-card p-6 rounded-xl w-full text-left text-xs space-y-2 bg-bg-primary">
          <div className="flex justify-between border-b border-slate/10 pb-2">
            <span className="text-slate font-medium">Item:</span>
            <span className="font-bold text-ink">{itemName}</span>
          </div>
          <div className="flex justify-between border-b border-slate/10 pb-2">
            <span className="text-slate font-medium">Customer:</span>
            <span className="font-bold text-ink">{email}</span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-sm">
            <span className="text-slate">Total Paid:</span>
            <span className="text-teal font-mono">{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <Link 
          href="/" 
          className="delta-gold-btn px-8 py-3.5 text-xs font-bold uppercase tracking-widest rounded-sm inline-flex items-center gap-2"
        >
          <span>{language === 'en' ? 'Return to Home' : 'Tilbake til Hovedsiden'}</span>
          <FiArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-8 sm:pt-16 pb-24 px-4 sm:px-6 lg:px-16 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">
          {t.checkout.title}
        </h1>
        <p className="text-slate text-sm sm:text-base">
          {language === 'en' 
            ? 'Complete your order securely using our encrypted payment gateway.' 
            : 'Fullfør din bestilling trygt ved hjelp av vår krypterte betalingsløsning.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Item Selection Toggle / Tabs */}
          <div className="bento-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-ink uppercase tracking-wide">
                    {language === 'en' ? 'Selected Order Item' : 'Valgt Bestilling'}
                  </h3>
                  <p className="text-xs text-slate">
                    {language === 'en' ? 'Select a package or service to customize your checkout.' : 'Velg en pakke eller tjeneste for å tilpasse betalingen.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-1 bg-bg-deep rounded-xl border border-slate/10">
              <button
                type="button"
                onClick={() => { setSelectedType('package'); if (packages.length > 0) setSelectedId(packages[0].id); }}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  selectedType === 'package' ? 'bg-teal text-white shadow' : 'text-slate hover:text-ink'
                }`}
              >
                <FiPackage size={16} />
                <span>{language === 'en' ? 'Packages' : 'Pakker'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setSelectedType('service'); if (services.length > 0) setSelectedId(services[0].id); }}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  selectedType === 'service' ? 'bg-teal text-white shadow' : 'text-slate hover:text-ink'
                }`}
              >
                <FiShoppingBag size={16} />
                <span>{language === 'en' ? 'Services' : 'Tjenester'}</span>
              </button>
            </div>

            {/* Dropdown / Selector for Package or Service */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                {selectedType === 'package' ? (language === 'en' ? 'Choose Package' : 'Velg Pakke') : (language === 'en' ? 'Choose Service' : 'Velg Tjeneste')}
              </label>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm font-bold text-ink focus:border-teal outline-none transition-colors"
              >
                {selectedType === 'package' ? (
                  packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {language === 'en' ? pkg.nameEn : pkg.nameNo} — {formatPrice(billingCycle === 'yearly' ? pkg.priceYearly : pkg.priceMonthly)}
                    </option>
                  ))
                ) : (
                  services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {language === 'en' ? svc.titleEn : svc.titleNo} — {formatPrice(svc.price || '0')}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedType === 'package' && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-slate font-bold uppercase tracking-wider">{language === 'en' ? 'Billing Cycle:' : 'Faktureringsperiode:'}</span>
                <div className="flex items-center gap-2 bg-bg-deep p-1 rounded-lg border border-slate/10">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${billingCycle === 'monthly' ? 'bg-teal text-white' : 'text-slate'}`}
                  >
                    {t.packages.monthly}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${billingCycle === 'yearly' ? 'bg-teal text-white' : 'text-slate'}`}
                  >
                    {t.packages.yearly}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Billing Form */}
          <div className="bento-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold">
                2
              </div>
              <h3 className="font-display font-bold text-xl text-ink uppercase tracking-wide">
                {t.checkout.billing}
              </h3>
            </div>
            
            <form onSubmit={handlePay} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                  {language === 'en' ? 'Full Name' : 'Fullt Navn'} *
                </label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                  {language === 'en' ? 'Email Address' : 'E-postadresse'} *
                </label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors" 
                  placeholder="john@example.com" 
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                  {language === 'en' ? 'Company Name (Optional)' : 'Firmanavn (Valgfritt)'}
                </label>
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors" 
                  placeholder="Acme Corp AS" 
                />
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="bento-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold">
                  3
                </div>
                <h3 className="font-display font-bold text-xl text-ink uppercase tracking-wide">
                  {t.checkout.payment}
                </h3>
              </div>
              {paymentSettings.gateway && paymentSettings.gateway !== 'none' && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-teal bg-teal/10 px-3 py-1 rounded">
                  Gateway: {paymentSettings.gateway}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setSelectedPaymentMethod('card')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedPaymentMethod === 'card' 
                    ? 'border-teal bg-teal/5 text-ink' 
                    : 'border-slate/10 bg-bg-primary text-slate'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FiCreditCard size={20} className={selectedPaymentMethod === 'card' ? 'text-teal' : 'text-slate'} />
                  <span className="text-sm font-bold">{language === 'en' ? 'Credit Card' : 'Kredittkort'}</span>
                </div>
                <div className={`w-4 h-4 rounded-full border-4 ${selectedPaymentMethod === 'card' ? 'border-teal' : 'border-slate/30'}`} />
              </button>

              <button 
                type="button"
                onClick={() => setSelectedPaymentMethod('paypal')}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedPaymentMethod === 'paypal' 
                    ? 'border-teal bg-teal/5 text-ink' 
                    : 'border-slate/10 bg-bg-primary text-slate'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-blue-500">PayPal</span>
                </div>
                <div className={`w-4 h-4 rounded-full border-4 ${selectedPaymentMethod === 'paypal' ? 'border-teal' : 'border-slate/30'}`} />
              </button>
            </div>

            {selectedPaymentMethod === 'card' ? (
              <div className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                    {language === 'en' ? 'Card Number' : 'Kortnummer'}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors pr-12 font-mono" 
                      placeholder="4532 •••• •••• 8892" 
                    />
                    <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/40" size={16} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                      {language === 'en' ? 'Expiry Date' : 'Utløpsdato'}
                    </label>
                    <input 
                      type="text" 
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors font-mono" 
                      placeholder="MM/YY" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
                      CVC / CVC2
                    </label>
                    <input 
                      type="text" 
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors font-mono" 
                      placeholder="123" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center space-y-2">
                <p className="text-xs font-bold text-ink">
                  {language === 'en' 
                    ? 'You will be redirected to PayPal to complete your payment after confirming.' 
                    : 'Du vil bli videresendt til PayPal for å fullføre betalingen etter bekreftelse.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bento-card p-6 sm:p-8 rounded-2xl sticky top-24 space-y-6">
            <h3 className="font-display font-bold text-xl text-ink uppercase tracking-wide border-b border-slate/10 pb-4">
              {t.checkout.summary}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal">
                    {selectedType === 'package' ? (language === 'en' ? 'Package' : 'Pakke') : (language === 'en' ? 'Service' : 'Tjeneste')}
                  </span>
                  <p className="text-sm font-bold text-ink">{itemName}</p>
                  {selectedType === 'package' && (
                    <p className="text-[10px] text-slate uppercase tracking-wider">
                      {billingCycle === 'yearly' ? (language === 'en' ? 'Annual Billing' : 'Årlig Fakturering') : (language === 'en' ? 'Monthly Billing' : 'Månedlig Fakturering')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-teal font-mono">{formatPrice(numericPrice)}</span>
              </div>

              {features.length > 0 && (
                <div className="pt-3 border-t border-slate/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate mb-2">
                    {language === 'en' ? 'Includes:' : 'Inkluderer:'}
                  </p>
                  <ul className="space-y-1.5">
                    {features.slice(0, 4).map((f, i) => (
                      <li key={i} className="text-[11px] text-ink flex items-center gap-2">
                        <FiCheckCircle size={12} className="text-teal flex-shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate/10 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate">Subtotal</span>
                <span className="text-sm font-medium text-ink font-mono">{formatPrice(numericPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate">VAT / MVA (25%)</span>
                <span className="text-sm font-medium text-ink font-mono">{formatPrice(vatAmount)}</span>
              </div>
              <div className="pt-4 border-t-2 border-teal/20 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest text-ink">{t.checkout.total}</span>
                <span className="text-xl font-black text-teal font-mono">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className={`w-full py-4 bg-teal text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-teal/20 hover:scale-[1.02] transition-all rounded-sm flex items-center justify-center gap-3 ${
                isProcessing ? 'opacity-80 grayscale cursor-wait' : ''
              }`}
            >
              {isProcessing ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>{t.checkout.pay} ({formatPrice(totalPrice)})</span>
                  <FiArrowRight size={18} />
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-4 text-slate/50">
              <FiShield size={24} />
              <p className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                Secure 256-bit<br />SSL Encrypted
              </p>
            </div>
          </div>
          
          <div className="px-4 text-center">
            <p className="text-[10px] text-slate leading-relaxed italic">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy. All payments are processed through secure channels.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate text-sm uppercase tracking-widest font-mono">Loading Checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
