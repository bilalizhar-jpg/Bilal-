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

interface SuperAdminContextType {
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'adminUsername' | 'adminPassword' | 'isActive'>) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
  toggleMenuAccess: (companyId: string, menuName: string) => void;
  updateCompanyStatus: (id: string, status: 'active' | 'inactive') => void;
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
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('superAdminCompanies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: ensure new fields exist
        const migrated = parsed.map((c: any) => ({
          ...c,
          adminUsername: c.adminUsername || `admin_${c.name.toLowerCase().replace(/\s+/g, '')}`,
          adminPassword: c.adminPassword || Math.random().toString(36).substring(2, 10),
          isActive: c.isActive !== undefined ? c.isActive : true,
        }));
        setCompanies(migrated);
      } catch (e) {
        console.error("Failed to parse companies", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('superAdminCompanies', JSON.stringify(companies));
  }, [companies]);

  const addCompany = (company: Omit<Company, 'id' | 'status' | 'blockedMenus' | 'adminUsername' | 'adminPassword' | 'isActive'>) => {
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      status: 'active',
      blockedMenus: [],
      adminUsername: `admin_${company.name.toLowerCase().replace(/\s+/g, '')}`,
      adminPassword: Math.random().toString(36).substring(2, 10),
      isActive: true,
    };
    setCompanies([...companies, newCompany]);
  };

  const updateCompany = (company: Company) => {
    setCompanies(companies.map(c => c.id === company.id ? company : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  const toggleMenuAccess = (companyId: string, menuName: string) => {
    setCompanies(companies.map(c => {
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
    setCompanies(companies.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <SuperAdminContext.Provider value={{ companies, addCompany, updateCompany, deleteCompany, toggleMenuAccess, updateCompanyStatus }}>
      {children}
    </SuperAdminContext.Provider>
  );
};
