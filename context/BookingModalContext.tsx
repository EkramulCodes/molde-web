'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { BookingContextType } from '@/lib/types';

export interface BookingModalTarget {
  type: BookingContextType;
  id?: string;
  label?: string;
}

interface BookingModalContextProps {
  isOpen: boolean;
  target: BookingModalTarget | null;
  openBookingModal: (target?: BookingModalTarget) => void;
  closeBookingModal: () => void;
}

const BookingModalContext = createContext<BookingModalContextProps | undefined>(undefined);

export function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<BookingModalTarget | null>(null);

  const openBookingModal = useCallback((newTarget?: BookingModalTarget) => {
    setTarget(newTarget || { type: 'general' });
    setIsOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <BookingModalContext.Provider value={{ isOpen, target, openBookingModal, closeBookingModal }}>
      {children}
    </BookingModalContext.Provider>
  );
}

export function useBookingModal(): BookingModalContextProps {
  const ctx = useContext(BookingModalContext);
  if (!ctx) {
    throw new Error('useBookingModal must be used within a BookingModalProvider');
  }
  return ctx;
}
