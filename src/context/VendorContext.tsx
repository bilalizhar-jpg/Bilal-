import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorContextType {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
  addVendor: (data: Omit<Vendor, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.companyId) {
      setVendors([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'vendors'),
      where('companyId', '==', user.companyId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vendorsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Vendor[];
      
      vendorsData.sort((a, b) => a.name.localeCompare(b.name));
      
      setVendors(vendorsData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching vendors:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.companyId]);

  const addVendor = async (data: Omit<Vendor, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.companyId) throw new Error('No company ID found');

    const id = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    const newVendor: Vendor = {
      ...data,
      id,
      companyId: user.companyId,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'vendors', id), newVendor);
    return id;
  };

  const updateVendor = async (id: string, data: Partial<Vendor>) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, 'vendors', id), updateData);
  };

  const deleteVendor = async (id: string) => {
    if (!user?.companyId) throw new Error('No company ID found');
    
    await deleteDoc(doc(db, 'vendors', id));
  };

  return (
    <VendorContext.Provider value={{
      vendors,
      loading,
      error,
      addVendor,
      updateVendor,
      deleteVendor
    }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendor must be used within a VendorProvider');
  }
  return context;
}
