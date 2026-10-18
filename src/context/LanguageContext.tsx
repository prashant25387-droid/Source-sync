import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
  getCropName: (name: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fasalsetu_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'hi'; // Default Hindi per requirements
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fasalsetu_lang', lang);
  };

  const t = language === 'hi' ? hi : en;

  const getCropName = (name: string): string => {
    if (language !== 'hi') return name;
    // Check direct match or substring in cropNames
    for (const [key, val] of Object.entries(hi.cropNames)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return val;
      }
    }
    return name;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getCropName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
