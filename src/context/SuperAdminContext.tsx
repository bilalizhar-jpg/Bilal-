import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

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
  website?: string;
  phone?: string;
  address?: string;
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
  const { user } = useAuth(); // Import useAuth
  const [companies, setCompanies] = useState<Company[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Companies are needed for login, so fetch them always (assuming public read rule)
    const qCompanies = query(collection(db, 'companies'));
    const unsubscribeCompanies = onSnapshot(qCompanies, (snapshot) => {
      const companiesData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Use status as source of truth, default to active if missing
        const status = data.status || 'active';
        const isActive = status === 'active';
        
        return { ...data, id: doc.id, status, isActive } as Company;
      });
      setCompanies(companiesData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching companies:", err);
      // Only set error if it's critical for login (which it is)
      // But maybe suppress it if it's just a permission error on initial load?
      // No, if companies fail, login fails.
      setError("Failed to load companies. Please check your permissions.");
      handleFirestoreError(err, OperationType.LIST, 'companies');
    });

    let unsubscribeInvoices = () => {};

    // Only fetch invoices if user is superadmin
    if (user?.role === 'superadmin') {
      const qInvoices = query(collection(db, 'invoices'));
      unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
        const invoicesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice));
        setInvoices(invoicesData);
      }, (err) => {
        console.error("Error fetching invoices:", err);
        handleFirestoreError(err, OperationType.LIST, 'invoices');
      });
    } else {
      setInvoices([]);
    }

    return () => {
      unsubscribeCompanies();
      unsubscribeInvoices();
    };
  }, [user]); // Re-run when user changes

  const addCompany = async (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'isActive'>) => {
    const companyId = Date.now().toString();
    const newCompany: Company = {
      ...company,
      id: companyId,
      status: 'active',
      blockedMenus: [],
      isActive: true,
    };
    
    try {
      await setDoc(doc(db, 'companies', companyId), newCompany);
      
      // Auto-generate invoice
      const plan = company.subscriptionPlan || 'Basic';
      const rate = plan === 'Enterprise' ? 1000 : plan === 'Pro' ? 500 : 100;
      const invoiceId = Date.now().toString() + '_inv';
      const newInvoice: Invoice = {
        id: invoiceId,
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
      await setDoc(doc(db, 'invoices', invoiceId), newInvoice);
    } catch (error) {
      console.error("Error adding company:", error);
      throw error; // Re-throw to let caller handle it
    }
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const id = Date.now().toString();
    try {
      await setDoc(doc(db, 'invoices', id), { ...invoice, id });
    } catch (error) {
      console.error("Error adding invoice:", error);
    }
  };

  const updateInvoice = async (invoice: Invoice) => {
    try {
      await updateDoc(doc(db, 'invoices', invoice.id), { ...invoice } as any);
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  };

  const updateCompany = async (company: Company) => {
    try {
      const isActive = company.status === 'active' || company.isActive === true;
      const status = isActive ? 'active' : 'inactive';
      const companyToUpdate = { ...company, status, isActive };
      
      await updateDoc(doc(db, 'companies', company.id), companyToUpdate as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'companies');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'companies');
    }
  };

  const toggleMenuAccess = async (companyId: string, menuName: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    const isBlocked = company.blockedMenus.includes(menuName);
    const newBlockedMenus = isBlocked 
      ? company.blockedMenus.filter(m => m !== menuName)
      : [...company.blockedMenus, menuName];

    try {
      await updateDoc(doc(db, 'companies', companyId), { blockedMenus: newBlockedMenus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'companies');
    }
  };

  const updateCompanyStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      const isActive = status === 'active';
      await updateDoc(doc(db, 'companies', id), { 
        status: status,
        isActive: isActive
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'companies');
    }
  };

  return (
    <SuperAdminContext.Provider value={{ 
      companies, 
      invoices,
      error,
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
