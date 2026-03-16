import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

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

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customers'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Customer[];
      
      // Sort by name
      customersData.sort((a, b) => a.name.localeCompare(b.name));
      
      setCustomers(customersData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching customers:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.companyId]);

  const addCustomer = async (data: Omit<Customer, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newCustomer: Customer = {
      ...data,
      id,
      companyId: user.companyId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'customers', id), newCustomer);
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'customers', id), updateData);
  };

  const deleteCustomer = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    await deleteDoc(doc(db, 'customers', id));
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
