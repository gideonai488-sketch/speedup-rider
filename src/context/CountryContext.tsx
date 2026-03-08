import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CountryCode, CountryConfig, countries, LanguageCode } from '@/config/countries';
import { Translations, translations } from '@/i18n/translations';

interface CountryContextType {
  country: CountryConfig;
  countryCode: CountryCode;
  language: LanguageCode;
  t: Translations;
  setCountry: (code: CountryCode) => void;
  setLanguage: (lang: LanguageCode) => void;
  formatPrice: (amount: number) => string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCode] = useState<CountryCode>(() => {
    const saved = localStorage.getItem('speedup_country');
    return (saved as CountryCode) || 'GH';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('speedup_language');
    return (saved as LanguageCode) || 'en';
  });

  const country = countries[countryCode];
  const t = translations[language] || translations.en;

  const setCountry = useCallback((code: CountryCode) => {
    setCountryCode(code);
    localStorage.setItem('speedup_country', code);
    const newCountry = countries[code];
    setLanguageState(newCountry.defaultLanguage);
    localStorage.setItem('speedup_language', newCountry.defaultLanguage);
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('speedup_language', lang);
  }, []);

  const formatPrice = useCallback((amount: number) => {
    return `${country.currencySymbol} ${amount.toFixed(2)}`;
  }, [country.currencySymbol]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <CountryContext.Provider value={{ country, countryCode, language, t, setCountry, setLanguage, formatPrice }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) throw new Error('useCountry must be used within CountryProvider');
  return context;
};
