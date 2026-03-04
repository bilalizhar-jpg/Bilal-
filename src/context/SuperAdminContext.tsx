import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Company {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  subscriptionPlan: string;
  blockedMenus: string[];
}

interface SuperAdminContextType {
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'status' | 'blockedMenus'>) => void;
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
    if (saved) setCompanies(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('superAdminCompanies', JSON.stringify(companies));
  }, [companies]);

  const addCompany = (company: Omit<Company, 'id' | 'status' | 'blockedMenus'>) => {
    const newCompany: Company = {
      ...company,
      id: Date.now().toString(),
      status: 'active',
      blockedMenus: [],
    };
    setCompanies([...companies, newCompany]);
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
    <SuperAdminContext.Provider value={{ companies, addCompany, deleteCompany, toggleMenuAccess, updateCompanyStatus }}>
      {children}
    </SuperAdminContext.Provider>
  );
};
