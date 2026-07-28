'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';

export default function Contact() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Website Development');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const serviceOptions = language === 'no' 
    ? ['Nettsideutvikling', 'Digital Markedsføring', 'Facebook Ads', 'Google Ads', 'Annet']
    : ['Website Development', 'Digital Marketing', 'Facebook Ads', 'Google Ads', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, service, message }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(language === 'no' ? 'Kunne ikke sende melding. Vennligst prøv igjen.' : 'Failed to send message. Please try again.');
        setStatus('idle');
      }
    } catch (err) {
      setError(language === 'no' ? 'Nettverksfeil. Vennligst prøv igjen.' : 'Network error. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="pt-10 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-16 max-w-3xl mx-auto space-y-10">
      <div className="text-left space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal/10 border border-teal/20 text-teal rounded-full w-fit">
          <span className="font-mono text-xs uppercase tracking-widest font-bold">Connect With Us</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-ink uppercase tracking-tight">{t.contact.title}</h1>
        <p className="text-base sm:text-lg text-slate leading-relaxed font-body">{t.contact.subtitle}</p>
      </div>

      <div className="bento-card p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        {status === 'success' ? (
          <div className="text-center py-8 sm:py-12 space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-ink">{t.contact.successTitle}</h2>
            <p className="text-sm sm:text-base text-slate font-body">{t.contact.successDesc}</p>
            <button 
              onClick={() => setStatus('idle')} 
              className="mt-6 px-6 sm:px-8 py-3.5 border-2 border-teal text-teal font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-teal hover:text-white transition-all rounded-sm min-h-[44px]"
            >
              {t.contact.sendAnother}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-ink">{t.contact.name}</label>
                <input 
                  required 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-slate/20 text-ink text-base sm:text-sm focus:outline-none focus:border-gold transition-colors rounded-lg min-h-[44px]" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-ink">{t.contact.email}</label>
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-slate/20 text-ink text-base sm:text-sm focus:outline-none focus:border-gold transition-colors rounded-lg min-h-[44px]" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-ink">{t.contact.serviceInterest}</label>
              <select 
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary/80 border border-slate/20 text-ink text-base sm:text-sm focus:outline-none focus:border-gold transition-colors appearance-none rounded-lg min-h-[44px]"
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-widest text-ink">{t.contact.message}</label>
              <textarea 
                required 
                rows={5} 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-bg-primary/80 border border-slate/20 text-ink text-base sm:text-sm focus:outline-none focus:border-gold transition-colors resize-none rounded-lg" 
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="delta-gold-btn w-full py-4 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-gold/20 hover:scale-[1.01] transition-all disabled:opacity-50 rounded-lg min-h-[48px]"
            >
              {status === 'submitting' ? t.contact.sending : t.contact.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

