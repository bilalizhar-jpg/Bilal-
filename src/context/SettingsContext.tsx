import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

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
  const { user } = useAuth();
  const [languages, setLanguages] = useState<Language[]>(defaultLanguages);
  const [language, setLanguageState] = useState<Language>(defaultLanguages[0]);
  const [currencies, setCurrencies] = useState<Currency[]>(defaultCurrencies);
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrencies[0]);
  const [tax, setTaxState] = useState<number>(10);
  const [timeZone, setTimeZoneState] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [colorPalette, setColorPaletteState] = useState<{ text: string; background: string }>({ text: '#000000', background: '#ffffff' });
  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>('12h');
  const [systemInstruction, setSystemInstructionState] = useState<string>('You are a helpful assistant.');
  const [loading, setLoading] = useState(true);

  const safeParse = (item: string | null, fallback: any) => {
    if (!item) return fallback;
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error("Error parsing JSON from localStorage:", e);
      return fallback;
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const settingsId = user.companyId || user.id;
    const docRef = doc(db, 'settings', settingsId);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.languages) setLanguages(data.languages);
        if (data.language) setLanguageState(data.language);
        if (data.currencies) setCurrencies(data.currencies);
        if (data.currency) setCurrencyState(data.currency);
        if (data.tax !== undefined) setTaxState(data.tax);
        if (data.timeZone) setTimeZoneState(data.timeZone);
        if (data.colorPalette) setColorPaletteState(data.colorPalette);
        if (data.timeFormat) setTimeFormatState(data.timeFormat);
        if (data.systemInstruction) setSystemInstructionState(data.systemInstruction);
      } else {
        // Migration from localStorage if Firestore document doesn't exist
        const migrate = async () => {
          const savedLanguages = localStorage.getItem('languages');
          const savedLanguage = localStorage.getItem('language');
          const savedCurrencies = localStorage.getItem('currencies');
          const savedCurrency = localStorage.getItem('currency');
          const savedTax = localStorage.getItem('tax');
          const savedTimeZone = localStorage.getItem('timeZone');
          const savedColorPalette = localStorage.getItem('colorPalette');
          const savedTimeFormat = localStorage.getItem('timeFormat');
          const savedSystemInstruction = localStorage.getItem('systemInstruction');

          const initialSettings = {
            languages: safeParse(savedLanguages, defaultLanguages),
            language: safeParse(savedLanguage, defaultLanguages[0]),
            currencies: safeParse(savedCurrencies, defaultCurrencies),
            currency: safeParse(savedCurrency, defaultCurrencies[0]),
            tax: savedTax ? parseFloat(savedTax) : 10,
            timeZone: savedTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            colorPalette: safeParse(savedColorPalette, { text: '#000000', background: '#ffffff' }),
            timeFormat: (savedTimeFormat as any) || '12h',
            systemInstruction: savedSystemInstruction || 'You are a helpful assistant.',
            companyId: user.companyId || null,
            userId: user.id
          };

          try {
            await setDoc(docRef, initialSettings);
          } catch (error) {
            console.error("Error migrating settings:", error);
          }
        };
        migrate();
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateSettings = async (updates: any) => {
    if (!user) return;
    const settingsId = user.companyId || user.id;
    try {
      await setDoc(doc(db, 'settings', settingsId), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings');
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updateSettings({ language: lang });
  };

  const addLanguage = (lang: Language) => {
    const newLanguages = [...languages, lang];
    setLanguages(newLanguages);
    updateSettings({ languages: newLanguages });
  };

  const updateLanguage = (code: string, lang: Language) => {
    const newLanguages = languages.map(l => l.code === code ? lang : l);
    setLanguages(newLanguages);
    updateSettings({ languages: newLanguages });
  };

  const deleteLanguage = (code: string) => {
    const newLanguages = languages.filter(l => l.code !== code);
    setLanguages(newLanguages);
    updateSettings({ languages: newLanguages });
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    updateSettings({ currency: curr });
  };

  const addCurrency = (curr: Currency) => {
    const newCurrencies = [...currencies, curr];
    setCurrencies(newCurrencies);
    updateSettings({ currencies: newCurrencies });
  };

  const updateCurrency = (code: string, curr: Currency) => {
    const newCurrencies = currencies.map(c => c.code === code ? curr : c);
    setCurrencies(newCurrencies);
    updateSettings({ currencies: newCurrencies });
  };

  const deleteCurrency = (code: string) => {
    const newCurrencies = currencies.filter(c => c.code !== code);
    setCurrencies(newCurrencies);
    updateSettings({ currencies: newCurrencies });
  };

  const setTax = (newTax: number) => {
    setTaxState(newTax);
    updateSettings({ tax: newTax });
  };

  const setTimeZone = (tz: string) => {
    setTimeZoneState(tz);
    updateSettings({ timeZone: tz });
  };

  const setColorPalette = (palette: { text: string; background: string }) => {
    setColorPaletteState(palette);
    updateSettings({ colorPalette: palette });
  };

  const setTimeFormat = (format: '12h' | '24h') => {
    setTimeFormatState(format);
    updateSettings({ timeFormat: format });
  };

  const setSystemInstruction = (instruction: string) => {
    setSystemInstructionState(instruction);
    updateSettings({ systemInstruction: instruction });
  };

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
