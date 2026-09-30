'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { en } from '@/i18n/en';
import { am } from '@/i18n/am';
import { om } from '@/i18n/om';

export type Language = 'en' | 'am' | 'om';

const dictionaries: Record<Language, typeof en> = {
  en,
  am,
  om,
};

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (path: string) => string;
  dict: typeof en;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('mymall_locale') as Language;
    if (saved && ['en', 'am', 'om'].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (lang: Language) => {
    setLocaleState(lang);
    localStorage.setItem('mymall_locale', lang);
  };

  const dict = dictionaries[locale] || dictionaries.en;

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English
        let fallback: any = dictionaries.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
