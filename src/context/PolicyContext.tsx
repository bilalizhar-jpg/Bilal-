import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface CompanyPolicy {
  id: string;
  location: string;
  title: string;
  description: string;
  methodType: 'upload' | 'create';
  content?: string;
  fileName?: string;
  dateAdded: string;
  companyId?: string;
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
  const { user, isAuthReady } = useAuth();
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  useEffect(() => {
    if (!isAuthReady || !user || !activeCompanyId) {
      setPolicies([]);
      return;
    }
    api
      .get<CompanyPolicy[]>('policies', { companyId: activeCompanyId })
      .then((data) => setPolicies(Array.isArray(data) ? data : []))
      .catch(() => setPolicies([]));
  }, [user?.id, isAuthReady, activeCompanyId]);

  const addPolicy = async (policy: Omit<CompanyPolicy, 'id' | 'dateAdded'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newPolicy: CompanyPolicy = {
      ...policy,
      id,
      dateAdded: new Date().toISOString().split('T')[0],
      companyId: activeCompanyId,
    };
    try {
      await api.post('policies', newPolicy);
      setPolicies((prev) => [...prev, newPolicy]);
    } catch (error) {
      console.error('Error adding policy:', error);
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      await api.delete('policies', id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  return (
    <PolicyContext.Provider value={{ policies, addPolicy, deletePolicy }}>
      {children}
    </PolicyContext.Provider>
  );
};
