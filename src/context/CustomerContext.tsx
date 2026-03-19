import React, { createContext, useContext, useState, useEffect} from 'react';
import { api} from '../services/api';
import { useAuth} from './AuthContext';

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  addCustomer: (data: Omit<Customer, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children}: { children: React.ReactNode}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchCustomers = async () => {
    if (!activeCompanyId) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get('customers', { companyId: activeCompanyId });
      const customersData = data as Customer[];
      
      // Sort by name
      customersData.sort((a, b) => a.name.localeCompare(b.name));
      
      setCustomers(customersData);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [activeCompanyId]);

  const addCustomer = async (data: Omit<Customer, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!activeCompanyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newCustomer: Customer = {
      ...data,
      id,
      companyId: activeCompanyId,
      createdAt: now,
      updatedAt: now,
    };

    await api.post('customers', newCustomer);
    fetchCustomers();
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    if (!activeCompanyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await api.put('customers', id, updateData);
    fetchCustomers();
  };

  const deleteCustomer = async (id: string) => {
    if (!activeCompanyId) throw new Error('No company ID found');
    
    await api.delete('customers', id);
    fetchCustomers();
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      loading,
      error,
      addCustomer,
      updateCustomer,
      deleteCustomer
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
