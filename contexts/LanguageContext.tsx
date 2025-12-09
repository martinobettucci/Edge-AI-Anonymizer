
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, LANGUAGES } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const detectLanguage = () => {
      const browserLang = navigator.language.split('-')[0];
      const isSupported = LANGUAGES.some(l => l.code === browserLang);
      if (isSupported) {
        setLanguage(browserLang as Language);
      }
    };
    detectLanguage();
  }, []);

  const t = (path: string, params?: Record<string, any>) => {
    const keys = path.split('.');
    let value: any = translations[language];

    // Fallback to English if language key missing
    if (!value) value = translations['en'];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English for specific key
        let fallbackValue: any = translations['en'];
        for (const k of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
                fallbackValue = fallbackValue[k];
            } else {
                return path; // Key not found
            }
        }
        value = fallbackValue;
        break;
      }
    }

    if (typeof value === 'string' && params) {
      Object.keys(params).forEach(key => {
        value = value.replace(`{${key}}`, params[key]);
      });
    }

    return value as string;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
