import React, { createContext, useContext, useState, useEffect} from 'react';
import { useAuth} from './AuthContext';
import { api } from '../services/api';

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

export function VendorProvider({ children}: { children: React.ReactNode}) {
 const [vendors, setVendors] = useState<Vendor[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const activeCompanyId = user?.currentCompanyId || user?.companyId;

  const fetchVendors = async () => {
    if (!activeCompanyId) {
      setVendors([]);
      setLoading(false);
      return;
    }

    try {
      const data = await api.get<Vendor[]>(`/api/vendors?companyId=${activeCompanyId}`);
      data.sort((a, b) => a.name.localeCompare(b.name));
      setVendors(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching vendors:', err);
      setError(err.message || 'Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    const interval = setInterval(fetchVendors, 30000);
    return () => clearInterval(interval);
  }, [activeCompanyId]);

 const addVendor = async (data: Omit<Vendor, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
 if (!activeCompanyId) throw new Error('No company ID found');

 const id = Math.random().toString(36).substr(2, 9);
 const now = new Date().toISOString();
 
 const newVendor: Vendor = {
 ...data,
 id,
 companyId: activeCompanyId,
 createdAt: now,
 updatedAt: now,
};

 await api.post('/api/vendors', newVendor);
 await fetchVendors();
 return id;
};

 const updateVendor = async (id: string, data: Partial<Vendor>) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 const updateData = {
 ...data,
 updatedAt: new Date().toISOString(),
};

 await api.put(`/api/vendors/${id}`, updateData);
 await fetchVendors();
};

 const deleteVendor = async (id: string) => {
 if (!activeCompanyId) throw new Error('No company ID found');
 
 await api.delete(`/api/vendors/${id}`);
 await fetchVendors();
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
