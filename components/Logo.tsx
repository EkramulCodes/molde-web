'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

interface LogoProps {
  className?: string;
  height?: number;
  width?: number;
  showBadge?: boolean;
}

export function Logo({ className = '', height = 36, width = 160, showBadge = false }: LogoProps) {
  const { design } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const logoSrc = design?.logoUrl && design.logoUrl.trim() !== '' ? design.logoUrl : '/logo.png';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {!imageError ? (
        <div className="relative flex items-center justify-center bg-transparent">
          <Image
            src={logoSrc}
            alt={design?.siteName || 'MoldeWeb'}
            width={width}
            height={height}
            priority
            onError={() => setImageError(true)}
            className="h-8 md:h-10 w-auto object-contain transition-all duration-300 logo-theme-adapt bg-transparent border-none outline-none"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        /* Crisp High-DPI Vector Fallback if logo PNG is unavailable */
        <div className="flex items-center gap-2 font-display font-bold tracking-tight text-ink text-xl md:text-2xl">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-teal to-gold flex items-center justify-center text-white text-xs font-mono font-black shadow-sm">
            M
          </div>
          <span className="uppercase tracking-tight">
            Molde<span className="text-teal font-extrabold">Web</span>
          </span>
        </div>
      )}
    </div>
  );
}
