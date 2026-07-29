'use client';

import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { BookingModalTarget } from '@/context/BookingModalContext';
import { BookingContextType } from '@/lib/types';
import { PhoneInput } from './PhoneInput';
import { DateTimePicker } from './DateTimePicker';

interface BookingFormProps {
  target: BookingModalTarget;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingForm({ target, onClose }: BookingFormProps) {
  const { language, services, packages } = useLanguage();
  const { showToast } = useToast();

  const hasFixedContext = target.type !== 'general' && !!target.id;

  const [contextType, setContextType] = useState<BookingContextType>(target.type);
  const [contextId, setContextId] = useState(target.id || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const resolveContextLabel = (): string => {
    if (hasFixedContext && target.label) return target.label;
    if (contextType === 'service') {
      const svc = services.find((s) => s.id === contextId);
      if (svc) return `${language === 'en' ? svc.titleEn : svc.titleNo} (${language === 'no' ? 'Tjeneste' : 'Service'})`;
    }
    if (contextType === 'package') {
      const pkg = packages.find((p) => p.id === contextId);
      if (pkg) return `${language === 'en' ? pkg.nameEn : pkg.nameNo} (${language === 'no' ? 'Pakke' : 'Package'})`;
    }
    return language === 'no' ? 'Generell Henvendelse' : 'General Inquiry';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.trim().length < 2) {
      setError(language === 'no' ? 'Vennligst oppgi ditt fulle navn.' : 'Please enter your full name.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError(language === 'no' ? 'Vennligst oppgi en gyldig e-postadresse.' : 'Please enter a valid email address.');
      return;
    }
    if (whatsapp.replace(/\D/g, '').length < 6) {
      setError(language === 'no' ? 'Vennligst oppgi et gyldig WhatsApp-nummer.' : 'Please enter a valid WhatsApp number.');
      return;
    }
    if (!date || !time) {
      setError(language === 'no' ? 'Vennligst velg en dato og et tidspunkt.' : 'Please select a date and time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp,
          contextType,
          contextId: contextId || undefined,
          contextLabel: resolveContextLabel(),
          date,
          time,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSuccess(true);
        showToast(language === 'no' ? 'Møteforespørsel sendt!' : 'Meeting request sent!', 'success');
      } else {
        const msg = data.error || (language === 'no' ? 'Kunne ikke sende forespørsel. Prøv igjen.' : 'Failed to submit request. Please try again.');
        setError(msg);
        showToast(msg, 'error');
      }
    } catch {
      const msg = language === 'no' ? 'Nettverksfeil. Vennligst prøv igjen.' : 'Network error. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 px-4 space-y-4">
        <div className="w-16 h-16 bg-teal/10 text-teal rounded-full flex items-center justify-center mx-auto">
          <FiCheck size={30} />
        </div>
        <h3 className="font-display text-xl font-bold text-ink uppercase tracking-wide">
          {language === 'no' ? 'Forespørsel Mottatt!' : 'Request Received!'}
        </h3>
        <p className="text-sm text-slate max-w-sm mx-auto">
          {language === 'no'
            ? `Takk, ${name}! Vi tar kontakt for å bekrefte møtet ${date} kl. ${time}.`
            : `Thanks, ${name}! We'll be in touch to confirm your meeting on ${date} at ${time}.`}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-6 py-3 bg-teal text-white font-bold uppercase tracking-widest text-xs rounded-sm hover:bg-teal/90 transition-colors"
        >
          {language === 'no' ? 'Lukk' : 'Close'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
            {language === 'no' ? 'Fullt Navn' : 'Full Name'} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
            {language === 'no' ? 'E-postadresse' : 'Email Address'} *
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
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
          WhatsApp {language === 'no' ? 'Nummer' : 'Number'} *
        </label>
        <PhoneInput onChange={setWhatsapp} />
      </div>

      {hasFixedContext ? (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
            {language === 'no' ? 'Gjelder' : 'Regarding'}
          </label>
          <div className="px-4 py-3 bg-teal/5 border border-teal/20 rounded-sm text-sm font-bold text-teal">{resolveContextLabel()}</div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
            {language === 'no' ? 'Gjelder' : 'Regarding'}
          </label>
          <select
            value={`${contextType}:${contextId}`}
            onChange={(e) => {
              const [selType, selId] = e.target.value.split(':');
              setContextType(selType as BookingContextType);
              setContextId(selId || '');
            }}
            className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors"
          >
            <option value="general:">{language === 'no' ? 'Generell Henvendelse' : 'General Inquiry'}</option>
            {services.map((s) => (
              <option key={s.id} value={`service:${s.id}`}>
                {language === 'en' ? s.titleEn : s.titleNo}
              </option>
            ))}
            {packages.map((p) => (
              <option key={p.id} value={`package:${p.id}`}>
                {language === 'en' ? p.nameEn : p.nameNo}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
          {language === 'no' ? 'Velg Dato & Tidspunkt' : 'Select Date & Time'} *
        </label>
        <DateTimePicker date={date} time={time} onSelect={(d, t) => { setDate(d); setTime(t); }} />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate px-1">
          {language === 'no' ? 'Notater (Valgfritt)' : 'Notes (Optional)'}
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors resize-none"
          placeholder={language === 'no' ? 'Noe spesielt du vil at vi skal vite?' : 'Anything specific you want us to know?'}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="delta-gold-btn w-full py-4 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-gold/20 hover:scale-[1.01] transition-all disabled:opacity-50 rounded-sm flex items-center justify-center gap-2"
      >
        {submitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span>{language === 'no' ? 'Send Møteforespørsel' : 'Request Meeting'}</span>
        )}
      </button>
    </form>
  );
}
