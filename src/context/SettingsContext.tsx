import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Language {
  code: string;
  name: string;
}

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: Language[];
  addLanguage: (lang: Language) => void;
  updateLanguage: (code: string, lang: Language) => void;
  deleteLanguage: (code: string) => void;

  currency: Currency;
  setCurrency: (curr: Currency) => void;
  currencies: Currency[];
  addCurrency: (curr: Currency) => void;
  updateCurrency: (code: string, curr: Currency) => void;
  deleteCurrency: (code: string) => void;

  tax: number;
  setTax: (tax: number) => void;

  timeZone: string;
  setTimeZone: (tz: string) => void;

  colorPalette: { text: string; background: string };
  setColorPalette: (palette: { text: string; background: string }) => void;

  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;

  systemInstruction: string;
  setSystemInstruction: (instruction: string) => void;
}

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

const defaultCurrencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>(() => {
    const saved = localStorage.getItem('languages');
    try {
      return saved ? JSON.parse(saved) : defaultLanguages;
    } catch (e) {
      localStorage.removeItem('languages');
      return defaultLanguages;
    }
  });
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    try {
      return saved ? JSON.parse(saved) : defaultLanguages[0];
    } catch (e) {
      localStorage.removeItem('language');
      return defaultLanguages[0];
    }
  });

  const [currencies, setCurrencies] = useState<Currency[]>(() => {
    const saved = localStorage.getItem('currencies');
    try {
      return saved ? JSON.parse(saved) : defaultCurrencies;
    } catch (e) {
      localStorage.removeItem('currencies');
      return defaultCurrencies;
    }
  });
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    try {
      return saved ? JSON.parse(saved) : defaultCurrencies[0];
    } catch (e) {
      localStorage.removeItem('currency');
      return defaultCurrencies[0];
    }
  });

  const [tax, setTaxState] = useState<number>(() => {
    const saved = localStorage.getItem('tax');
    return saved ? parseFloat(saved) : 10;
  });

  const [timeZone, setTimeZoneState] = useState<string>(() => {
    const saved = localStorage.getItem('timeZone');
    return saved || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const [colorPalette, setColorPaletteState] = useState<{ text: string; background: string }>(() => {
    const saved = localStorage.getItem('colorPalette');
    try {
      return saved ? JSON.parse(saved) : { text: '#000000', background: '#ffffff' };
    } catch (e) {
      localStorage.removeItem('colorPalette');
      return { text: '#000000', background: '#ffffff' };
    }
  });

  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>(() => {
    const saved = localStorage.getItem('timeFormat');
    return (saved as '12h' | '24h') || '12h';
  });

  const [systemInstruction, setSystemInstructionState] = useState<string>(() => {
    const saved = localStorage.getItem('systemInstruction');
    return saved || 'You are a helpful assistant.';
  });

  useEffect(() => {
    localStorage.setItem('languages', JSON.stringify(languages));
  }, [languages]);

  useEffect(() => {
    localStorage.setItem('language', JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem('currencies', JSON.stringify(currencies));
  }, [currencies]);

  useEffect(() => {
    localStorage.setItem('currency', JSON.stringify(currency));
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('tax', tax.toString());
  }, [tax]);

  useEffect(() => {
    localStorage.setItem('timeZone', timeZone);
  }, [timeZone]);

  useEffect(() => {
    localStorage.setItem('colorPalette', JSON.stringify(colorPalette));
  }, [colorPalette]);

  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat);
  }, [timeFormat]);

  useEffect(() => {
    localStorage.setItem('systemInstruction', systemInstruction);
  }, [systemInstruction]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const addLanguage = (lang: Language) => setLanguages(prev => [...prev, lang]);
  const updateLanguage = (code: string, lang: Language) => setLanguages(prev => prev.map(l => l.code === code ? lang : l));
  const deleteLanguage = (code: string) => setLanguages(prev => prev.filter(l => l.code !== code));

  const setCurrency = (curr: Currency) => setCurrencyState(curr);
  const addCurrency = (curr: Currency) => setCurrencies(prev => [...prev, curr]);
  const updateCurrency = (code: string, curr: Currency) => setCurrencies(prev => prev.map(c => c.code === code ? curr : c));
  const deleteCurrency = (code: string) => setCurrencies(prev => prev.filter(c => c.code !== code));

  const setTax = (newTax: number) => setTaxState(newTax);
  const setTimeZone = (tz: string) => setTimeZoneState(tz);
  const setColorPalette = (palette: { text: string; background: string }) => setColorPaletteState(palette);
  const setTimeFormat = (format: '12h' | '24h') => setTimeFormatState(format);
  const setSystemInstruction = (instruction: string) => setSystemInstructionState(instruction);

  return (
    <SettingsContext.Provider
      value={{
        language, setLanguage, languages, addLanguage, updateLanguage, deleteLanguage,
        currency, setCurrency, currencies, addCurrency, updateCurrency, deleteCurrency,
        tax, setTax,
        timeZone, setTimeZone,
        colorPalette, setColorPalette,
        timeFormat, setTimeFormat,
        systemInstruction, setSystemInstruction
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
