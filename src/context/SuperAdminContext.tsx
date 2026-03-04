import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export const ALL_MENU_ITEMS = [
  'Dashboard', 'Time Track', 'Org Chart', 'Attendance', 'Award', 'Department', 
  'Employee', 'Onboarding', 'Offboarding', 'Leaves', 'Notice Board', 'Payroll', 
  'Invoice', 'Performance', 'Assets', 'Project Management', 'Marketing', 
  'Reports', 'Reward Points', 'Setup Rules', 'Message', 'Supply Chain Management',
  'Procurement', 'Accounts', 'CRM', 'Purchase Dep', 'Settings'
];

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
  addCompany: (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'isActive'>) => void;
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
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('superAdminCompanies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          adminUsername: c.adminUsername || `admin_${c.name.toLowerCase().replace(/\s+/g, '')}`,
          adminPassword: c.adminPassword || Math.random().toString(36).substring(2, 10),
          isActive: c.isActive !== undefined ? c.isActive : true,
        }));
      } catch (e) {
        console.error("Failed to parse companies", e);
        return [];
      }
    }
    return [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('superAdminInvoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse invoices", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('superAdminInvoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    console.log("SuperAdminProvider mounted");
    // Temporary recovery for Cure MD
    const saved = localStorage.getItem('superAdminCompanies');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.find((c: any) => c.name === 'Cure MD')) {
        console.log("Restoring Cure MD...");
        const cureMd = {
          id: '1741045200000', // Example ID
          name: 'Cure MD',
          email: 'admin@curemd.com',
          mobile: '1234567890',
          status: 'active',
          subscriptionPlan: 'Basic',
          blockedMenus: [],
          uniqueCode: 'SH4KYU8',
          adminUsername: 'admin_curemd',
          adminPassword: 'b3416n4m',
          isActive: true,
        };
        setCompanies([...parsed, cureMd]);
      }
    }
  }, []);

  useEffect(() => {
    console.log("Saving companies to localStorage:", companies);
    localStorage.setItem('superAdminCompanies', JSON.stringify(companies));
  }, [companies]);

  const addCompany = (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'isActive'>) => {
    const companyId = Date.now().toString();
    const newCompany: Company = {
      ...company,
      id: companyId,
      status: 'active',
      blockedMenus: [],
      isActive: true,
    };
    
    // Auto-generate invoice
    const plan = company.subscriptionPlan || 'Basic';
    const rate = plan === 'Enterprise' ? 1000 : plan === 'Pro' ? 500 : 100;
    const newInvoice: Invoice = {
      id: Date.now().toString() + '_inv',
      companyId: companyId,
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        { id: '1', description: `Subscription Fee - ${plan}`, quantity: 1, rate: rate, amount: rate }
      ],
      total: rate,
      status: 'unpaid',
      template: plan.toLowerCase() as any,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days.'
    };

    setCompanies(prevCompanies => [...prevCompanies, newCompany]);
    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    setInvoices(prev => [...prev, { ...invoice, id: Date.now().toString() }]);
  };

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
  };

  const updateCompany = (company: Company) => {
    setCompanies(prevCompanies => prevCompanies.map(c => c.id === company.id ? company : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prevCompanies => prevCompanies.filter(c => c.id !== id));
  };

  const toggleMenuAccess = (companyId: string, menuName: string) => {
    setCompanies(prevCompanies => prevCompanies.map(c => {
      if (c.id === companyId) {
        const isBlocked = c.blockedMenus.includes(menuName);
        return {
          ...c,
          blockedMenus: isBlocked 
            ? c.blockedMenus.filter(m => m !== menuName)
            : [...c.blockedMenus, menuName]
        };
      }
      return c;
    }));
  };

  const updateCompanyStatus = (id: string, status: 'active' | 'inactive') => {
    setCompanies(prevCompanies => prevCompanies.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <SuperAdminContext.Provider value={{ 
      companies, 
      invoices,
      addCompany, 
      updateCompany, 
      deleteCompany, 
      toggleMenuAccess, 
      updateCompanyStatus,
      addInvoice,
      updateInvoice
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
};
