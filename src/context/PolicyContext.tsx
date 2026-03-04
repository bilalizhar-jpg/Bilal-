import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CompanyPolicy {
  id: string;
  location: string;
  title: string;
  description: string;
  methodType: 'upload' | 'create';
  content?: string; // For created text or base64 uploaded file
  fileName?: string;
  dateAdded: string;
}

interface PolicyContextType {
  policies: CompanyPolicy[];
  addPolicy: (policy: Omit<CompanyPolicy, 'id' | 'dateAdded'>) => void;
  deletePolicy: (id: string) => void;
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined);

export const usePolicies = () => {
  const context = useContext(PolicyContext);
  if (!context) {
    throw new Error('usePolicies must be used within a PolicyProvider');
  }
  return context;
};

export const PolicyProvider = ({ children }: { children: ReactNode }) => {
  const [policies, setPolicies] = useState<CompanyPolicy[]>(() => {
    const saved = localStorage.getItem('companyPolicies');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: '1',
        location: 'Head Office',
        title: 'Office Tour Agreement March 2026',
        description: 'Office Tour Agreement',
        methodType: 'create',
        content: 'This is the official office tour agreement for March 2026. All employees must adhere to the guidelines specified herein.',
        dateAdded: '2026-03-01'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('companyPolicies', JSON.stringify(policies));
  }, [policies]);

  const addPolicy = (policy: Omit<CompanyPolicy, 'id' | 'dateAdded'>) => {
    const newPolicy: CompanyPolicy = {
      ...policy,
      id: Math.random().toString(36).substr(2, 9),
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setPolicies(prev => [newPolicy, ...prev]);
  };

  const deletePolicy = (id: string) => {
    setPolicies(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PolicyContext.Provider value={{ policies, addPolicy, deletePolicy }}>
      {children}
    </PolicyContext.Provider>
  );
};
