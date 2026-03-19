import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { logAuditAction } from '../services/auditService';

export interface Language {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface FinancialSettings {
  id: string;
  companyId: string;
  currency: { code: string; symbol: string; name: string };
  defaultAccounts: Record<string, string>;
  updatedAt: string;
}

export interface TaxSetting {
  id: string;
  companyId: string;
  name: string;
  rate: number;
  type: 'Sales' | 'Purchase' | 'Both';
  accountId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NumberSequence {
  id: string;
  companyId: string;
  module: 'Invoice' | 'Bill' | 'Journal' | 'Payment' | 'Expense';
  prefix: string;
  suffix?: string;
  nextNumber: number;
  padding: number;
  updatedAt: string;
}

interface SettingsContextType {
  financialSettings: FinancialSettings | null;
  taxSettings: TaxSetting[];
  numberSequences: NumberSequence[];
  loading: boolean;
  updateFinancialSettings: (data: Partial<FinancialSettings>) => Promise<void>;
  addTaxSetting: (data: Omit<TaxSetting, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTaxSetting: (id: string, data: Partial<TaxSetting>) => Promise<void>;
  deleteTaxSetting: (id: string) => Promise<void>;
  updateNumberSequence: (id: string, data: Partial<NumberSequence>) => Promise<void>;
  getNextNumber: (module: NumberSequence['module']) => string;
  incrementNumber: (module: NumberSequence['module']) => Promise<void>;
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
  timeFormat: string;
  setTimeFormat: (format: string) => void;
  colorPalette: { primary: string; secondary: string; background: string; text: string };
  setColorPalette: (palette: any) => void;
  formatCurrency: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([]);
  const [numberSequences, setNumberSequences] = useState<NumberSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthReady } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const [language, setLanguage] = useState<Language>({ code: 'en', name: 'English' });
  const [languages, setLanguages] = useState<Language[]>([
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
  ]);
  const [currency, setCurrency] = useState<Currency>({ code: 'USD', symbol: '$', name: 'US Dollar' });
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
  ]);
  const [tax, setTax] = useState(10);
  const [timeZone, setTimeZone] = useState('UTC');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [colorPalette, setColorPalette] = useState({
    primary: '#6366f1',
    secondary: '#a855f7',
    background: '#ffffff',
    text: '#1e293b',
  });

  const addLanguage = (lang: Language) => setLanguages([...languages, lang]);
  const updateLanguage = (code: string, lang: Language) => setLanguages(languages.map((l) => (l.code === code ? lang : l)));
  const deleteLanguage = (code: string) => setLanguages(languages.filter((l) => l.code !== code));
  const addCurrency = (curr: Currency) => setCurrencies([...currencies, curr]);
  const updateCurrency = (code: string, curr: Currency) => setCurrencies(currencies.map((c) => (c.code === code ? curr : c)));
  const deleteCurrency = (code: string) => setCurrencies(currencies.filter((c) => c.code !== code));

  useEffect(() => {
    if (!isAuthReady || !activeCompanyId) {
      setFinancialSettings(null);
      setTaxSettings([]);
      setNumberSequences([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [finRes, taxRes, seqRes] = await Promise.all([
          api.getById<FinancialSettings>('financialSettings', activeCompanyId).catch(() => null),
          api.get<TaxSetting[]>('taxSettings', { companyId: activeCompanyId }),
          api.get<NumberSequence[]>('numberSequences', { companyId: activeCompanyId }),
        ]);

        if (cancelled) return;

        if (finRes) {
          setFinancialSettings(finRes);
          if (finRes.currency) setCurrency(finRes.currency);
        } else {
          const defaultSettings: FinancialSettings = {
            id: activeCompanyId,
            companyId: activeCompanyId,
            currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
            defaultAccounts: {},
            updatedAt: new Date().toISOString(),
          };
          await api.put('financialSettings', activeCompanyId, defaultSettings);
          setFinancialSettings(defaultSettings);
          setCurrency(defaultSettings.currency);
        }

        setTaxSettings(Array.isArray(taxRes) ? taxRes : []);

        let sequences = Array.isArray(seqRes) ? seqRes : [];
        const modules: NumberSequence['module'][] = ['Invoice', 'Bill', 'Journal', 'Payment', 'Expense'];
        for (const mod of modules) {
          if (!sequences.find((s) => s.module === mod)) {
            const id = `${activeCompanyId}_${mod.toLowerCase()}`;
            await api.put('numberSequences', id, {
              id,
              companyId: activeCompanyId,
              module: mod,
              prefix: mod.substring(0, 3).toUpperCase(),
              nextNumber: 1,
              padding: 5,
              updatedAt: new Date().toISOString(),
            });
            sequences = [...sequences, { id, companyId: activeCompanyId, module: mod, prefix: mod.substring(0, 3).toUpperCase(), nextNumber: 1, padding: 5, updatedAt: new Date().toISOString() } as NumberSequence];
          }
        }
        setNumberSequences(sequences);
      } catch (e) {
        if (!cancelled) {
          setFinancialSettings(null);
          setTaxSettings([]);
          setNumberSequences([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeCompanyId, isAuthReady]);

  const updateFinancialSettings = async (data: Partial<FinancialSettings>) => {
    if (!activeCompanyId) return;
    const updatedAt = new Date().toISOString();
    const payload: FinancialSettings = {
      id: activeCompanyId,
      companyId: activeCompanyId,
      currency: financialSettings?.currency || { code: 'USD', symbol: '$', name: 'US Dollar' },
      defaultAccounts: financialSettings?.defaultAccounts || {},
      updatedAt,
      ...data,
    };
    const updated = await api.put<FinancialSettings>('financialSettings', activeCompanyId, payload);
    setFinancialSettings(updated);
    if (user) {
      logAuditAction({ companyId: activeCompanyId, userId: user.id, userName: user.name, action: 'Update Financial Settings', module: 'Settings', description: 'Updated general financial configurations' });
    }
  };

  const addTaxSetting = async (data: Omit<TaxSetting, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!activeCompanyId) return;
    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    await api.post('taxSettings', { ...data, id, companyId: activeCompanyId, createdAt: now, updatedAt: now });
    setTaxSettings((prev) => [...prev, { ...data, id, companyId: activeCompanyId, createdAt: now, updatedAt: now } as TaxSetting]);
  };

  const updateTaxSetting = async (id: string, data: Partial<TaxSetting>) => {
    await api.put('taxSettings', id, { ...data, updatedAt: new Date().toISOString() });
    setTaxSettings((prev) => prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t)));
  };

  const deleteTaxSetting = async (id: string) => {
    await api.delete('taxSettings', id);
    setTaxSettings((prev) => prev.filter((t) => t.id !== id));
  };

  const updateNumberSequence = async (id: string, data: Partial<NumberSequence>) => {
    await api.put('numberSequences', id, { ...data, updatedAt: new Date().toISOString() });
    setNumberSequences((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const getNextNumber = (module: NumberSequence['module']) => {
    const seq = numberSequences.find((s) => s.module === module);
    if (!seq) return '';
    return `${seq.prefix}${seq.nextNumber.toString().padStart(seq.padding, '0')}${seq.suffix || ''}`;
  };

  const incrementNumber = async (module: NumberSequence['module']) => {
    const seq = numberSequences.find((s) => s.module === module);
    if (!seq) return;
    await api.put('numberSequences', seq.id, { nextNumber: seq.nextNumber + 1, updatedAt: new Date().toISOString() });
    setNumberSequences((prev) => prev.map((s) => (s.id === seq.id ? { ...s, nextNumber: s.nextNumber + 1 } : s)));
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code || 'USD' }).format(amount);

  return (
    <SettingsContext.Provider
      value={{
        financialSettings,
        taxSettings,
        numberSequences,
        loading,
        updateFinancialSettings,
        addTaxSetting,
        updateTaxSetting,
        deleteTaxSetting,
        updateNumberSequence,
        getNextNumber,
        incrementNumber,
        language,
        setLanguage,
        languages,
        addLanguage,
        updateLanguage,
        deleteLanguage,
        currency,
        setCurrency,
        currencies,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        tax,
        setTax,
        timeZone,
        setTimeZone,
        timeFormat,
        setTimeFormat,
        colorPalette,
        setColorPalette,
        formatCurrency,
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
