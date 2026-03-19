import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export const ALL_MENU_ITEMS = [
  'Dashboard', 'Time Track', 'Org Chart', 'Attendance', 'Award', 'Department',
  'Employee', 'Onboarding', 'Offboarding', 'Leaves', 'Notice Board', 'Payroll',
  'Invoice', 'Performance', 'Assets', 'Project Management', 'Marketing',
  'Reports', 'Reward Points', 'Setup Rules', 'Message', 'Supply Chain Management',
  'Procurement', 'Accounts', 'CRM', 'Purchase Dep', 'Settings'
];

export interface CompanyAddress {
  id: string;
  label: string;
  address: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  subscriptionPlan: string;
  blockedMenus: string[];
  uniqueCode: string;
  logo?: string;
  subsidiary?: string;
  headOffice?: string;
  factoryLocation?: string;
  adminUsername?: string;
  adminPassword?: string;
  isActive?: boolean;
  website?: string;
  phone?: string;
  address?: string;
  aboutUs?: string;
  addresses?: CompanyAddress[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
  template: 'basic' | 'pro' | 'enterprise';
  notes?: string;
  terms?: string;
}

interface SuperAdminContextType {
  companies: Company[];
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  addCompany: (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'isActive'>) => Promise<void>;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  toggleMenuAccess: (companyId: string, menuName: string) => void;
  updateCompanyStatus: (id: string, status: 'active' | 'inactive') => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (invoice: Invoice) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};

export const SuperAdminProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthReady } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const data = await api.get<Company[]>('companies');
      const list = Array.isArray(data) ? data : [];
      // Include companies that have admin credentials (for login and superadmin list)
      setCompanies(list.map((c: any) => ({
        ...c,
        status: c.status || 'active',
        isActive: (c.status || c.isActive) !== 'inactive',
      })).filter((c: any) => c.adminUsername));
      setError(null);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please check your permissions.');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    if (user?.role !== 'superadmin') {
      setInvoices([]);
      return;
    }
    try {
      const data = await api.get<Invoice[]>('invoices');
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
    }
  };

  useEffect(() => {
    if (!isAuthReady) return;
    // Always fetch companies (needed for login page to validate admin credentials)
    fetchCompanies();
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }
    fetchInvoices();
  }, [user?.id, user?.role, isAuthReady]);

  useEffect(() => {
    if (user?.role === 'superadmin') fetchInvoices();
  }, [user?.role]);

  const addCompany = async (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'isActive'>) => {
    const companyId = Date.now().toString();
    const newCompany: Company = {
      ...company,
      id: companyId,
      status: 'active',
      blockedMenus: [],
      isActive: true,
    };
    await api.post('companies', newCompany);

    const plan = company.subscriptionPlan || 'Basic';
    const rate = plan === 'Enterprise' ? 1000 : plan === 'Pro' ? 500 : 100;
    const newInvoice: Invoice = {
      id: Date.now().toString() + '_inv',
      companyId,
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ id: '1', description: `Subscription Fee - ${plan}`, quantity: 1, rate, amount: rate }],
      total: rate,
      status: 'unpaid',
      template: plan.toLowerCase() as any,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days.',
    };
    await api.post('invoices', newInvoice);
    await fetchCompanies();
    await fetchInvoices();
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const id = Date.now().toString();
    await api.post('invoices', { ...invoice, id });
    await fetchInvoices();
  };

  const updateInvoice = async (invoice: Invoice) => {
    await api.put('invoices', invoice.id, invoice);
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? invoice : i)));
  };

  const updateCompany = async (company: Company) => {
    const isActive = company.status === 'active' || company.isActive === true;
    const status = isActive ? 'active' : 'inactive';
    await api.put('companies', company.id, { ...company, status, isActive });
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...company, status, isActive } : c)));
  };

  const deleteCompany = async (id: string) => {
    await api.delete('companies', id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleMenuAccess = async (companyId: string, menuName: string) => {
    const company = companies.find((c) => c.id === companyId);
    if (!company) return;
    const isBlocked = company.blockedMenus.includes(menuName);
    const newBlockedMenus = isBlocked
      ? company.blockedMenus.filter((m) => m !== menuName)
      : [...company.blockedMenus, menuName];
    await api.put('companies', companyId, { blockedMenus: newBlockedMenus });
    setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, blockedMenus: newBlockedMenus } : c)));
  };

  const updateCompanyStatus = async (id: string, status: 'active' | 'inactive') => {
    const isActive = status === 'active';
    await api.put('companies', id, { status, isActive });
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status, isActive } : c)));
  };

  return (
    <SuperAdminContext.Provider
      value={{
        companies,
        invoices,
        loading,
        error,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleMenuAccess,
        updateCompanyStatus,
        addInvoice,
        updateInvoice,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
