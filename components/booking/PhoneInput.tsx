'use client';

import { useEffect, useState } from 'react';

interface Country {
  code: string;
  dial: string;
  flag: string;
}

// Curated list of common dial codes — kept dependency-free rather than
// pulling in a full international phone-number library for one field.
const COUNTRIES: Country[] = [
  { code: 'NO', dial: '+47', flag: '🇳🇴' },
  { code: 'SE', dial: '+46', flag: '🇸🇪' },
  { code: 'DK', dial: '+45', flag: '🇩🇰' },
  { code: 'FI', dial: '+358', flag: '🇫🇮' },
  { code: 'IS', dial: '+354', flag: '🇮🇸' },
  { code: 'GB', dial: '+44', flag: '🇬🇧' },
  { code: 'IE', dial: '+353', flag: '🇮🇪' },
  { code: 'DE', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', dial: '+33', flag: '🇫🇷' },
  { code: 'ES', dial: '+34', flag: '🇪🇸' },
  { code: 'PT', dial: '+351', flag: '🇵🇹' },
  { code: 'IT', dial: '+39', flag: '🇮🇹' },
  { code: 'NL', dial: '+31', flag: '🇳🇱' },
  { code: 'BE', dial: '+32', flag: '🇧🇪' },
  { code: 'CH', dial: '+41', flag: '🇨🇭' },
  { code: 'AT', dial: '+43', flag: '🇦🇹' },
  { code: 'PL', dial: '+48', flag: '🇵🇱' },
  { code: 'US', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', dial: '+1', flag: '🇨🇦' },
  { code: 'BR', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', dial: '+52', flag: '🇲🇽' },
  { code: 'IN', dial: '+91', flag: '🇮🇳' },
  { code: 'PK', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', dial: '+880', flag: '🇧🇩' },
  { code: 'CN', dial: '+86', flag: '🇨🇳' },
  { code: 'JP', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', dial: '+82', flag: '🇰🇷' },
  { code: 'SG', dial: '+65', flag: '🇸🇬' },
  { code: 'AE', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', dial: '+966', flag: '🇸🇦' },
  { code: 'ZA', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', dial: '+234', flag: '🇳🇬' },
  { code: 'AU', dial: '+61', flag: '🇦🇺' },
  { code: 'NZ', dial: '+64', flag: '🇳🇿' },
];

interface PhoneInputProps {
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({ onChange, className }: PhoneInputProps) {
  const [dial, setDial] = useState('+47');
  const [local, setLocal] = useState('');

  useEffect(() => {
    onChange(local.trim() ? `${dial} ${local.trim()}` : '');
  }, [dial, local, onChange]);

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <select
        value={dial}
        onChange={(e) => setDial(e.target.value)}
        aria-label="Country dial code"
        className="w-[104px] flex-shrink-0 bg-bg-primary border border-slate/20 rounded-sm px-2 py-3 text-sm focus:border-teal outline-none transition-colors"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.dial}>
            {c.flag} {c.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        required
        value={local}
        onChange={(e) => setLocal(e.target.value.replace(/[^\d\s]/g, ''))}
        placeholder="98765432"
        aria-label="WhatsApp phone number"
        className="flex-1 min-w-0 bg-bg-primary border border-slate/20 rounded-sm px-4 py-3 text-sm focus:border-teal outline-none transition-colors"
      />
    </div>
  );
}
